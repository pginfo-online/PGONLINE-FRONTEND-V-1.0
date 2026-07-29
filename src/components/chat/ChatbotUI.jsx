import { useState, useRef, useEffect } from 'react';
import { Send, ImagePlus, X, Loader2, CheckCircle, AlertTriangle, Sparkles, Zap } from 'lucide-react';
import { chatbotService } from '../../services/chatbot.service';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const welcomeMessage = '👋 Hi! I\'m your AI listing assistant. Tell me about your PG property and I\'ll help you create a polished, complete listing. You can describe it naturally—just as you would to a friend!';

export default function ChatbotUI({ onListingCreated }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: welcomeMessage, timestamp: new Date().toISOString() }]);
  const [input, setInput] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [listingData, setListingData] = useState({});
  const [missingFields, setMissingFields] = useState([]);
  const [step, setStep] = useState('init');
  const fileRef = useRef(null);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const conv = await chatbotService.getActiveConversation();
        if (conv) {
          setConversationId(conv._id);
          setMessages(conv.messages?.length ? conv.messages : [{ role: 'assistant', content: welcomeMessage, timestamp: new Date().toISOString() }]);
          setListingData(conv.listingData || {});
          setStep(conv.currentStep || 'init');
          setMissingFields([]);
        }
      } catch {
        // Ignore and fall back to the welcome state
      }
    };

    loadConversation();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetConversation = async () => {
    setLoading(true);
    try {
      const conv = await chatbotService.startNewConversation();
      setConversationId(conv?._id || null);
      setMessages([{ role: 'assistant', content: '✨ Fresh start! Let\'s create a new listing. Tell me about your PG and I\'ll guide you through it.', timestamp: new Date().toISOString() }]);
      setListingData({});
      setMissingFields([]);
      setStep('init');
      setImages([]);
      setInput('');
      if (fileRef.current) fileRef.current.value = '';
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (err) {
      toast.error(err.message || 'Failed to start a new chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() && images.length === 0) return;

    const userMessage = input.trim() || (images.length ? '📷 Uploaded images' : '');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }]);
    setLoading(true);

    try {
      const res = await chatbotService.sendMessage(userMessage, images);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.message, timestamp: new Date().toISOString() }]);
      setListingData(res.listingData || {});
      setMissingFields(res.missingFields || []);
      setStep(res.currentStep || 'init');
      setInput('');
      setImages([]);
      if (fileRef.current) fileRef.current.value = '';
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      if (res.conversationId) setConversationId(res.conversationId);
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      toast.error(err.message || 'Unable to send the message');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      toast.error('Please select image files only');
    }

    const combined = [...images, ...validFiles];
    if (combined.length > 10) {
      toast.error('You can upload up to 10 photos');
      return;
    }

    setImages(combined);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinalize = async () => {
    if (!conversationId) {
      toast.error('Start a chat first');
      return;
    }

    setLoading(true);
    try {
      const pg = await chatbotService.finalizeListing(conversationId);
      toast.success('PG listing created successfully!');
      if (onListingCreated) onListingCreated(pg);
    } catch (err) {
      toast.error(err.message || 'Unable to submit the listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-toolbar">
        <div className="toolbar-title">
          <h3><Zap size={20} /> AI Listing Assistant</h3>
          <p>Describe your PG • Upload photos • Submit & publish</p>
        </div>
        <button type="button" className="ghost-btn" onClick={() => navigate('/owner/listings/add')} disabled={loading}>
        <Sparkles size={16} /> Manual Form
        </button>
                <button type="button" className="ghost-btn" onClick={() => navigate('/owner/listings')} disabled={loading}>
          <Sparkles size={16} /> Back To Listings
        </button>
                        <button type="button" className="ghost-btn" onClick={resetConversation} disabled={loading}>
          <Sparkles size={16} /> New Chat
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={`${msg.role}-${i}`} className={`chat-bubble ${msg.role}`}>
            <div className="bubble-content">{msg.content}</div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {images.length > 0 && (
        <div className="image-preview-bar">
          {images.map((file, i) => (
            <div key={`${file.name}-${i}`} className="preview-thumb">
              <img src={URL.createObjectURL(file)} alt="" />
              <button type="button" onClick={() => removeImage(i)}><X size={12} /></button>
            </div>
          ))}
        </div>
      )}

      {Object.keys(listingData).length > 0 && (
        <div className="listing-summary">
          <h4>Extracted Details</h4>
          <ul>
            {listingData.name && <li><strong>Name:</strong> {listingData.name}</li>}
            {listingData.city && <li><strong>City:</strong> {listingData.city}</li>}
            {listingData.area && <li><strong>Area:</strong> {listingData.area}</li>}
            {listingData.address && <li><strong>Address:</strong> {listingData.address}</li>}
            {(listingData.roomTypes?.length > 0 || listingData.rent) && (
              <li><strong>Rents:</strong> {listingData.roomTypes?.map((r) => `${r.sharing} ₹${r.rent}`).join(', ') || `${listingData.rent?.single ? `single ₹${listingData.rent.single}` : ''}`}</li>
            )}
            {(listingData.amenities?.length > 0 || listingData.facilities?.length > 0) && (
              <li><strong>Amenities:</strong> {(listingData.amenities || listingData.facilities || []).join(', ')}</li>
            )}
          </ul>
          {missingFields.length > 0 && (
            <p className="missing-fields"><AlertTriangle size={14} /> Missing: {missingFields.join(', ')}</p>
          )}
        </div>
      )}

      {step === 'confirm_submission' && (
        <div className="submit-row">
          <button className="submit-btn" onClick={handleFinalize} disabled={loading}>
            {loading ? <Loader2 className="spin" /> : <CheckCircle size={16} />} Submit Listing
          </button>
        </div>
      )}

      <form className="chat-input-area" onSubmit={handleSend}>
        <button type="button" className="attach-btn" onClick={() => fileRef.current?.click()} disabled={loading} title="Attach photos">
          <ImagePlus size={20} />
        </button>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Describe your PG... (Shift+Enter for new line)"
          disabled={loading}
          className="chat-textarea"
        />
        <button type="submit" className="send-btn" disabled={(loading || (!input.trim() && images.length === 0))} title="Send message">
          {loading ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleImageSelect} hidden />
      </form>

      <style jsx>{`
        .chatbot-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 380px);
          min-height: 720px;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
          overflow: hidden;
          border: 1px solid #f0f0f0;
        }
        .chat-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .toolbar-title {
          flex: 1;
        }
        .chat-toolbar h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          letter-spacing: -0.5px;
        }
        .chat-toolbar p {
          margin: 0.5rem 0 0;
          font-size: 0.9rem;
          opacity: 0.92;
          letter-spacing: 0.3px;
        }
        .ghost-btn {
          border: 1.5px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.1);
          color: white;
          padding: 0.65rem 1.25rem;
          border-radius: 999px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        .ghost-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.15);
          transform: translateY(-2px);
        }
        .ghost-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .chat-messages {
          flex: 1;
          padding: 2rem 2.5rem;
          overflow-y: auto;
          background: linear-gradient(to bottom, #fafbfc, #f8f9fa);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .chat-messages::-webkit-scrollbar {
          width: 8px;
        }
        .chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-messages::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .chat-bubble {
          display: flex;
          animation: slideIn 0.3s ease;
        }
        .chat-bubble.user {
          justify-content: flex-end;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .bubble-content {
          max-width: 75%;
          padding: 1rem 1.25rem;
          border-radius: 18px;
          font-size: 0.95rem;
          line-height: 1.6;
          word-wrap: break-word;
          white-space: pre-wrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .chat-bubble.user .bubble-content {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          border-bottom-right-radius: 6px;
          border-top-left-radius: 18px;
        }
        .chat-bubble.assistant .bubble-content {
          background: white;
          color: #1f2937;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 6px;
          border-top-right-radius: 18px;
        }
        .image-preview-bar {
          display: flex;
          gap: 0.75rem;
          padding: 1rem 2rem;
          overflow-x: auto;
          background: #fff;
          border-top: 1px solid #f0f0f0;
          align-items: center;
        }
        .image-preview-bar::-webkit-scrollbar {
          height: 6px;
        }
        .image-preview-bar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .preview-thumb {
          position: relative;
          width: 72px;
          height: 72px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          border: 2px solid #e5e7eb;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }
        .preview-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .preview-thumb button {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(0,0,0,0.65);
          color: white;
          border: none;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .preview-thumb button:hover {
          background: rgba(0,0,0,0.8);
          transform: scale(1.1);
        }
        .listing-summary {
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #f0fdf4, #f7fee7);
          border-top: 2px solid #86efac;
          border-bottom: 1px solid #e5e7eb;
        }
        .listing-summary h4 {
          margin: 0 0 0.75rem;
          font-weight: 600;
          color: #166534;
          font-size: 0.95rem;
        }
        .listing-summary ul {
          margin: 0;
          padding: 0 0 0 1.5rem;
        }
        .listing-summary li {
          margin-bottom: 0.4rem;
          color: #3f6212;
          font-size: 0.9rem;
        }
        .missing-fields {
          color: #dc2626;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin: 0.75rem 0 0;
          font-weight: 500;
          font-size: 0.9rem;
        }
        .submit-row {
          padding: 1rem 2rem;
          background: #fff;
          border-top: 1px solid #f0f0f0;
          display: flex;
          justify-content: center;
        }
        .submit-btn {
          border: none;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          padding: 0.85rem 2rem;
          border-radius: 999px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 600;
          font-size: 0.95rem;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
          transition: all 0.3s ease;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .chat-input-area {
          display: flex;
          align-items: flex-end;
          padding: 1.25rem 2rem;
          background: white;
          border-top: 1px solid #f0f0f0;
          gap: 0.75rem;
          max-height: 200px;
        }
        .chat-textarea {
          flex: 1;
          border: 1.5px solid #e5e7eb;
          outline: none;
          font-size: 0.95rem;
          padding: 0.8rem 1rem;
          border-radius: 12px;
          font-family: inherit;
          resize: none;
          max-height: 120px;
          min-height: 44px;
          transition: all 0.2s ease;
          line-height: 1.5;
        }
        .chat-textarea:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        .chat-textarea:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }
        .attach-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 0.6rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .attach-btn:hover:not(:disabled) {
          color: #4f46e5;
          background: rgba(79, 70, 229, 0.08);
        }
        .attach-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .send-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 0.6rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .send-btn:hover:not(:disabled) {
          color: #4f46e5;
          background: rgba(79, 70, 229, 0.08);
          transform: scale(1.1);
        }
        .send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}