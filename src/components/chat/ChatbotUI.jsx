import { useState, useRef, useEffect } from 'react';
import { 
  Send, X, Loader2, CheckCircle, AlertTriangle, Sparkles, Zap, 
  Edit3, Check, RefreshCw, Upload, Image, Phone, MapPin, Globe, Award, HelpCircle
} from 'lucide-react';
import { chatbotService } from '../../services/chatbot.service';
import pgService from '../../services/pg.service';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const welcomeMessage = "👋 Hi! I'm your AI listing assistant. Tell me about your PG property and I'll help you create a polished, complete listing. You can describe it naturally—just as you would to a friend!";

const SUGGESTION_CHIPS = [
  "Boys PG in Pune, rent 7000",
  "Girls PG with single & double sharing",
  "WiFi & AC rooms, gym access",
  "Food included in rent, veg only",
  "Co-ed PG, close to IT Park",
  "Daily housekeeping & CCTV"
];

const FACILITIES = [
  'WiFi', 'Laundry', 'Parking', 'Gym', 'CCTV', 'Power Backup',
  'Hot Water', 'Housekeeping', 'TV', 'Refrigerator', 'RO Water',
  'Study Room', 'Lift', 'Security Guard', 'Kitchen Access'
];

export default function ChatbotUI({ onListingCreated }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: welcomeMessage, timestamp: new Date().toISOString() }]);
  const [input, setInput] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [listingData, setListingData] = useState({});
  const [missingFields, setMissingFields] = useState([]);
  const [step, setStep] = useState('init'); // init, collecting_details, confirm_submission, completed
  
  // Inline editing state
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editValueRent, setEditValueRent] = useState({ single: '', double: '', triple: '' });

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
          
          // Re-evaluate missing fields
          const mandatory = ['name', 'city', 'area', 'address', 'contactPhone'];
          const missing = mandatory.filter((f) => !conv.listingData?.[f]);
          const hasRoomConfigs = conv.listingData?.roomConfigs && conv.listingData.roomConfigs.length > 0;
          if (!hasRoomConfigs) missing.push('roomConfigs');
          setMissingFields(missing);
        }
      } catch {
        // Fall back to default
      }
    };
    loadConversation();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
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
      setMessages([{ 
        role: 'assistant', 
        content: '✨ Fresh start! Let\'s create a new listing. Tell me about your PG and I\'ll guide you through it.', 
        timestamp: new Date().toISOString() 
      }]);
      setListingData({});
      setMissingFields(['name', 'city', 'area', 'address', 'contactPhone', 'roomConfigs']);
      setStep('init');
      setPhotos([]);
      setInput('');
      setEditingField(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      toast.error(err.message || 'Failed to start a new chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (msgText = '') => {
    const textToSend = typeof msgText === 'string' && msgText.trim() ? msgText.trim() : input.trim();
    if (!textToSend) return;

    setMessages((prev) => [...prev, { role: 'user', content: textToSend, timestamp: new Date().toISOString() }]);
    setLoading(true);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const res = await chatbotService.sendMessage(textToSend);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.message, timestamp: new Date().toISOString() }]);
      setListingData(res.listingData || {});
      setMissingFields(res.missingFields || []);
      setStep(res.currentStep || 'init');
      if (res.conversationId) setConversationId(res.conversationId);
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      toast.error(err.message || 'Unable to send message');
    } finally {
      setLoading(false);
    }
  };

  // Inline edit handlers
  const startEditing = (field) => {
    setEditingField(field);
    if (field === 'rent') {
      setEditValueRent({
        single: listingData.rent?.single || '',
        double: listingData.rent?.double || '',
        triple: listingData.rent?.triple || '',
      });
    } else if (field === 'facilities') {
      setEditValue(listingData.facilities || []);
    } else {
      setEditValue(listingData[field] || '');
    }
  };

  const saveEdit = () => {
    let updatedData = { ...listingData };
    if (editingField === 'rent') {
      updatedData.rent = {
        single: editValueRent.single ? Number(editValueRent.single) : undefined,
        double: editValueRent.double ? Number(editValueRent.double) : undefined,
        triple: editValueRent.triple ? Number(editValueRent.triple) : undefined,
      };
    } else if (editingField === 'facilities') {
      updatedData.facilities = editValue;
      updatedData.amenities = editValue;
    } else {
      updatedData[editingField] = editingField === 'availableRooms' || editingField === 'floors' || editingField === 'totalBeds'
        ? Number(editValue) 
        : editValue;
    }

    setListingData(updatedData);
    setEditingField(null);

    // Re-evaluate missing fields locally
    const mandatory = ['name', 'city', 'area', 'address', 'contactPhone'];
    const missing = mandatory.filter((f) => !updatedData[f]);
    const hasRoomConfigs = updatedData.roomConfigs && updatedData.roomConfigs.length > 0;
    if (!hasRoomConfigs) missing.push('roomConfigs');
    setMissingFields(missing);

    if (missing.length === 0) {
      setStep('confirm_submission');
    } else {
      setStep('collecting_details');
    }
    toast.success('Field updated locally');
  };

  const toggleFacility = (facility) => {
    setEditValue((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      if (arr.includes(facility)) {
        return arr.filter((x) => x !== facility);
      } else {
        return [...arr, facility];
      }
    });
  };

  // Photos state management
  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 15) return toast.error('Max 15 photos allowed');
    setPhotos((p) => [...p, ...files]);
  };

  const removePhoto = (idx) => {
    setPhotos((p) => p.filter((_, i) => i !== idx));
  };

  // Final submit
  const handleFinalize = async () => {
    if (!conversationId) return toast.error('Start a chat first');

    setLoading(true);
    try {
      // Step 1: Create the PG listing on the backend with merged override data
      const pg = await chatbotService.finalizeListing(conversationId, listingData);
      
      // Step 2: Upload images directly to Cloudinary if selected
      if (photos.length > 0) {
        setUploadingPhotos(true);
        toast.loading('Uploading photos directly to Cloudinary...', { id: 'photo-upload' });
        try {
          await pgService.uploadImages(pg._id, photos, true);
          toast.success('Photos uploaded successfully!', { id: 'photo-upload' });
        } catch (uploadErr) {
          toast.error('Listing created, but photo upload failed. You can add them later.', { id: 'photo-upload' });
        }
      }

      toast.success('PG Listing published successfully!');
      if (onListingCreated) {
        onListingCreated(pg);
      } else {
        navigate('/owner/listings');
      }
    } catch (err) {
      toast.error(err.message || 'Unable to submit the listing');
    } finally {
      setLoading(false);
      setUploadingPhotos(false);
    }
  };

  // Step indicator completeness calculation
  const getCompletenessPercent = () => {
    const totalFields = 6; // Name, City, Area, Address, Rent, Phone
    let filledCount = 0;
    if (listingData.name) filledCount++;
    if (listingData.city) filledCount++;
    if (listingData.area) filledCount++;
    if (listingData.address) filledCount++;
    if (listingData.contactPhone) filledCount++;
    if (listingData.roomConfigs && listingData.roomConfigs.length > 0) filledCount++;
    return Math.round((filledCount / totalFields) * 100);
  };

  return (
    <div className="premium-chatbot">
      {/* Visual Step Timeline */}
      <div className="step-timeline">
        <div className="progress-bar-container">
          <div className="progress-fill" style={{ width: `${getCompletenessPercent()}%` }}></div>
        </div>
        <div className="steps-container">
          <div className={`step-node ${getCompletenessPercent() >= 20 ? 'completed' : 'active'}`}>
            <span className="node-num">1</span>
            <span className="node-label">Basic Info</span>
          </div>
          <div className={`step-node ${getCompletenessPercent() >= 60 ? 'completed' : getCompletenessPercent() >= 20 ? 'active' : ''}`}>
            <span className="node-num">2</span>
            <span className="node-label">Amenities & Rent</span>
          </div>
          <div className={`step-node ${getCompletenessPercent() === 100 ? 'completed' : getCompletenessPercent() >= 60 ? 'active' : ''}`}>
            <span className="node-num">3</span>
            <span className="node-label">Photos (Last Step)</span>
          </div>
          <div className={`step-node ${step === 'confirm_submission' ? 'active' : ''}`}>
            <span className="node-num">4</span>
            <span className="node-label">Publish</span>
          </div>
        </div>
      </div>

      <div className="chatbot-core-layout">
        {/* Left Side: Conversational Chat */}
        <div className="chat-section">
          <div className="chat-messages-container">
            {messages.map((msg, i) => (
              <div key={`${msg.role}-${i}`} className={`chat-bubble-row ${msg.role}`}>
                <div className="avatar">
                  {msg.role === 'assistant' ? <Sparkles size={16} /> : 'U'}
                </div>
                <div className="bubble-payload">
                  <div className="bubble-content-text">{msg.content}</div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {step !== 'confirm_submission' && (
            <div className="suggestion-chips-bar">
              {SUGGESTION_CHIPS.map((chip, idx) => (
                <button 
                  key={idx} 
                  type="button" 
                  className="chip" 
                  onClick={() => handleSend(chip)}
                  disabled={loading}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar */}
          <form className="chat-input-row" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type PG description... (e.g. 'I have a girls PG in Hinjewadi with double room rent 6500...')"
              disabled={loading || step === 'confirm_submission'}
              className="chat-textarea"
            />
            <button type="submit" className="send-action-btn" disabled={loading || !input.trim() || step === 'confirm_submission'}>
              {loading ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
            </button>
          </form>
        </div>

        {/* Right Side: Interactive Real-time Inspector & Photo Uploader */}
        <div className="inspector-section">
          <div className="inspector-card-header">
            <h3><Award size={18} color="#4f46e5" /> Extracted Property Card</h3>
            <button type="button" className="action-link" onClick={resetConversation}>
              <RefreshCw size={14} /> Reset
            </button>
          </div>

          <div className="inspector-body">
            <div className="live-preview-card">
              <div className="preview-card-img-placeholder">
                {photos.length > 0 ? (
                  <img src={URL.createObjectURL(photos[0])} alt="PG Preview" className="card-featured-img" />
                ) : (
                  <div className="no-img-badge">
                    <Image size={24} color="#9ca3af" />
                    <span>No photos selected yet</span>
                  </div>
                )}
                <div className="gender-tag-overlay">
                  {listingData.gender === 'male' && 'Boys Only'}
                  {listingData.gender === 'female' && 'Girls Only'}
                  {listingData.gender === 'any' && 'Co-Ed'}
                  {!listingData.gender && 'Gender Allowed?'}
                </div>
              </div>

              <div className="preview-card-details">
                <div className="card-top-row">
                  <h4 className="card-title-text">{listingData.name || "My Premium PG Listing"}</h4>
                  <div className="price-tag">
                    {listingData.roomConfigs && listingData.roomConfigs.length > 0 
                      ? `Starts ₹${Math.min(...listingData.roomConfigs.map(rc => rc.rent || Infinity))}/mo`
                      : '₹0/mo'}
                  </div>
                </div>

                <div className="card-location-row">
                  <MapPin size={14} color="#6b7280" />
                  <span>{listingData.area || "Area Name"}, {listingData.city || "Pune"}</span>
                </div>

                <div className="facilities-wrap">
                  {(listingData.facilities || []).slice(0, 4).map((f) => (
                    <span key={f} className="facility-tag">{f}</span>
                  ))}
                  {(!listingData.facilities || listingData.facilities.length === 0) && (
                    <span className="facility-tag-placeholder">No facilities listed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Structured Fields Editor */}
            <div className="fields-table-list">
              <h4 className="section-subtitle">Verify / Correct Field Values</h4>
              
              {/* Field: Name */}
              <div className="field-row">
                <div className="field-label-cell">PG Name:</div>
                <div className="field-value-cell">
                  {editingField === 'name' ? (
                    <input className="field-editor-input" value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus />
                  ) : (
                    <span>{listingData.name || <em className="missing-alert">Missing</em>}</span>
                  )}
                </div>
                <div className="field-edit-cell">
                  {editingField === 'name' ? (
                    <button className="done-btn" onClick={saveEdit}><Check size={14} /></button>
                  ) : (
                    <button className="edit-btn" onClick={() => startEditing('name')}><Edit3 size={14} /></button>
                  )}
                </div>
              </div>

              {/* Field: City */}
              <div className="field-row">
                <div className="field-label-cell">City:</div>
                <div className="field-value-cell">
                  {editingField === 'city' ? (
                    <select className="field-editor-input" value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus>
                      <option value="Pune">Pune</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Kolkata">Kolkata</option>
                    </select>
                  ) : (
                    <span>{listingData.city || <em className="missing-alert">Missing</em>}</span>
                  )}
                </div>
                <div className="field-edit-cell">
                  {editingField === 'city' ? (
                    <button className="done-btn" onClick={saveEdit}><Check size={14} /></button>
                  ) : (
                    <button className="edit-btn" onClick={() => startEditing('city')}><Edit3 size={14} /></button>
                  )}
                </div>
              </div>

              {/* Field: Area */}
              <div className="field-row">
                <div className="field-label-cell">Area/Locality:</div>
                <div className="field-value-cell">
                  {editingField === 'area' ? (
                    <input className="field-editor-input" value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus />
                  ) : (
                    <span>{listingData.area || <em className="missing-alert">Missing</em>}</span>
                  )}
                </div>
                <div className="field-edit-cell">
                  {editingField === 'area' ? (
                    <button className="done-btn" onClick={saveEdit}><Check size={14} /></button>
                  ) : (
                    <button className="edit-btn" onClick={() => startEditing('area')}><Edit3 size={14} /></button>
                  )}
                </div>
              </div>

              {/* Field: Address */}
              <div className="field-row">
                <div className="field-label-cell">Address:</div>
                <div className="field-value-cell">
                  {editingField === 'address' ? (
                    <textarea className="field-editor-input" value={editValue} onChange={(e) => setEditValue(e.target.value)} rows={2} autoFocus />
                  ) : (
                    <span>{listingData.address || <em className="missing-alert">Missing</em>}</span>
                  )}
                </div>
                <div className="field-edit-cell">
                  {editingField === 'address' ? (
                    <button className="done-btn" onClick={saveEdit}><Check size={14} /></button>
                  ) : (
                    <button className="edit-btn" onClick={() => startEditing('address')}><Edit3 size={14} /></button>
                  )}
                </div>
              </div>

              {/* Field: Room Configs options */}
              <div className="field-row">
                <div className="field-label-cell">Room Configurations:</div>
                <div className="field-value-cell">
                  <span>
                    {listingData.roomConfigs && listingData.roomConfigs.length > 0 ? (
                      listingData.roomConfigs.map(rc => `${rc.shareType}: ₹${rc.rent}`).join(', ')
                    ) : (
                      <em className="missing-alert">Missing (Add via chat)</em>
                    )}
                  </span>
                </div>
                <div className="field-edit-cell">
                  {/* Read only from UI, users must edit via chat */}
                </div>
              </div>

              {/* Field: Phone */}
              <div className="field-row">
                <div className="field-label-cell">Contact Phone:</div>
                <div className="field-value-cell">
                  {editingField === 'contactPhone' ? (
                    <input className="field-editor-input" value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus />
                  ) : (
                    <span>{listingData.contactPhone || <em className="missing-alert">Missing</em>}</span>
                  )}
                </div>
                <div className="field-edit-cell">
                  {editingField === 'contactPhone' ? (
                    <button className="done-btn" onClick={saveEdit}><Check size={14} /></button>
                  ) : (
                    <button className="edit-btn" onClick={() => startEditing('contactPhone')}><Edit3 size={14} /></button>
                  )}
                </div>
              </div>

              {/* Field: Facilities (Multi-Select Tags) */}
              <div className="field-row">
                <div className="field-label-cell">Facilities:</div>
                <div className="field-value-cell flex-wrap-tags">
                  {editingField === 'facilities' ? (
                    <div className="facility-editor-panel">
                      {FACILITIES.map((f) => {
                        const active = editValue?.includes(f);
                        return (
                          <button key={f} type="button" className={`facility-chip-btn ${active ? 'active' : ''}`} onClick={() => toggleFacility(f)}>
                            {f}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="inline-tags-preview">
                      {(listingData.facilities || []).map((f) => (
                        <span key={f} className="preview-tag">{f}</span>
                      ))}
                      {(!listingData.facilities || listingData.facilities.length === 0) && (
                        <span>None selected</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="field-edit-cell">
                  {editingField === 'facilities' ? (
                    <button className="done-btn" onClick={saveEdit}><Check size={14} /></button>
                  ) : (
                    <button className="edit-btn" onClick={() => startEditing('facilities')}><Edit3 size={14} /></button>
                  )}
                </div>
              </div>
            </div>

            {/* List missing fields explicitly */}
            {missingFields.length > 0 && (
              <div className="missing-banner">
                <AlertTriangle size={16} />
                <span>Still required: <strong>{missingFields.join(', ')}</strong></span>
              </div>
            )}

            {/* Image Uploader & Submit Panel (Only when complete or in confirm step) */}
            {missingFields.length === 0 && (
              <div className="finalization-action-box">
                <h4 className="uploader-title">Upload PG Photos (Max 15)</h4>
                
                <div className="photo-dropzone-uploader" onClick={() => fileRef.current?.click()}>
                  <Upload size={28} color="#6b7280" />
                  <span>Click to select PG photos</span>
                  <input ref={fileRef} type="file" multiple accept="image/*" onChange={handlePhotos} hidden />
                </div>

                {photos.length > 0 && (
                  <div className="uploader-preview-row">
                    {photos.map((file, idx) => (
                      <div key={idx} className="preview-thumbnail-wrap">
                        <img src={URL.createObjectURL(file)} alt="" />
                        <button type="button" onClick={(e) => { e.stopPropagation(); removePhoto(idx); }} className="remove-photo-tag-btn">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  type="button" 
                  className="publish-submit-button"
                  onClick={handleFinalize} 
                  disabled={loading || uploadingPhotos}
                >
                  {loading ? <Loader2 className="spin" size={18} /> : <CheckCircle size={18} />}
                  <span>{uploadingPhotos ? "Uploading Photos..." : "Publish PG Listing"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .premium-chatbot {
          display: flex;
          flex-direction: column;
          background: #fff;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 10px 40px rgba(0,0,0,0.06);
          overflow: hidden;
          font-family: inherit;
        }
        
        /* Timeline Tracker */
        .step-timeline {
          padding: 1.5rem 2.5rem;
          background: #fafafa;
          border-bottom: 1px solid #f0f0f0;
          position: relative;
        }
        .progress-bar-container {
          position: absolute;
          top: 45px;
          left: 10%;
          right: 10%;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          z-index: 1;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4f46e5, #7c3aed);
          border-radius: 2px;
          transition: width 0.4s ease;
        }
        .steps-container {
          display: flex;
          justify-content: space-between;
          position: relative;
          z-index: 2;
        }
        .step-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .node-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          color: #6b7280;
          transition: all 0.3s ease;
        }
        .step-node.active .node-num {
          border-color: #4f46e5;
          color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
        }
        .step-node.completed .node-num {
          background: #4f46e5;
          border-color: #4f46e5;
          color: #fff;
        }
        .node-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: #4b5563;
        }
        .step-node.active .node-label {
          color: #4f46e5;
          font-weight: 600;
        }
        
        /* Core Layout Split */
        .chatbot-core-layout {
          display: flex;
          height: 720px;
        }
        .chat-section {
          flex: 1.2;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #f0f0f0;
          background: #ffffff;
        }
        .inspector-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #fafbfc;
        }
        
        /* Chat view */
        .chat-messages-container {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .chat-bubble-row {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          max-width: 85%;
        }
        .chat-bubble-row.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #eef2ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.75rem;
          flex-shrink: 0;
          border: 1px solid #c7d2fe;
        }
        .chat-bubble-row.user .avatar {
          background: #f5f3ff;
          color: #7c3aed;
          border-color: #ddd6fe;
        }
        .bubble-payload {
          background: #f3f4f6;
          padding: 0.85rem 1.1rem;
          border-radius: 16px;
          border-top-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .chat-bubble-row.user .bubble-payload {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: #fff;
          border-radius: 16px;
          border-top-right-radius: 4px;
        }
        .bubble-content-text {
          font-size: 0.92rem;
          line-height: 1.5;
          white-space: pre-wrap;
        }
        
        /* Suggestion Chips */
        .suggestion-chips-bar {
          display: flex;
          gap: 0.5rem;
          padding: 0.75rem 1.2rem;
          overflow-x: auto;
          border-top: 1px solid #f5f5f5;
          background: #fbfbfb;
        }
        .suggestion-chips-bar::-webkit-scrollbar {
          height: 4px;
        }
        .suggestion-chips-bar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 2px;
        }
        .chip {
          padding: 0.45rem 0.85rem;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          font-size: 0.8rem;
          color: #4b5563;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .chip:hover {
          border-color: #4f46e5;
          color: #4f46e5;
          background: #f5f3ff;
        }
        
        /* Chat Input */
        .chat-input-row {
          display: flex;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-top: 1px solid #f0f0f0;
          align-items: flex-end;
        }
        .chat-textarea {
          flex: 1;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-size: 0.92rem;
          outline: none;
          resize: none;
          height: 44px;
          min-height: 44px;
          max-height: 120px;
          line-height: 1.4;
          font-family: inherit;
          transition: all 0.2s ease;
        }
        .chat-textarea:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08);
        }
        .send-action-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #4f46e5;
          color: #fff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .send-action-btn:hover:not(:disabled) {
          background: #3730a3;
        }
        .send-action-btn:disabled {
          background: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
        }
        
        /* Inspector Section */
        .inspector-card-header {
          padding: 1.2rem 1.5rem;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
        }
        .inspector-card-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .action-link {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 500;
        }
        .action-link:hover {
          color: #ef4444;
        }
        .inspector-body {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        /* Live Preview Card */
        .live-preview-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          overflow: hidden;
        }
        .preview-card-img-placeholder {
          height: 140px;
          background: #f3f4f6;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-featured-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .no-img-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          color: #6b7280;
          font-size: 0.75rem;
        }
        .gender-tag-overlay {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255,255,255,0.92);
          padding: 0.25rem 0.65rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #4f46e5;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .preview-card-details {
          padding: 1rem 1.25rem;
        }
        .card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.4rem;
        }
        .card-title-text {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 600;
          color: #111827;
        }
        .price-tag {
          font-weight: 700;
          color: #4f46e5;
          font-size: 1.05rem;
        }
        .card-location-row {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.8rem;
          color: #6b7280;
          margin-bottom: 0.75rem;
        }
        .facilities-wrap {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .facility-tag {
          background: #f5f3ff;
          color: #7c3aed;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 500;
        }
        .facility-tag-placeholder {
          font-size: 0.75rem;
          color: #9ca3af;
          font-style: italic;
        }
        
        /* Fields List Table */
        .fields-table-list {
          background: #ffffff;
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid #e5e7eb;
        }
        .section-subtitle {
          margin: 0 0 0.85rem;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
          font-weight: 600;
        }
        .field-row {
          display: flex;
          align-items: center;
          padding: 0.65rem 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.875rem;
        }
        .field-row:last-child {
          border-bottom: none;
        }
        .field-label-cell {
          width: 30%;
          font-weight: 500;
          color: #4b5563;
        }
        .field-value-cell {
          width: 60%;
          color: #111827;
          word-break: break-all;
        }
        .missing-alert {
          color: #dc2626;
          font-style: italic;
        }
        .field-edit-cell {
          width: 10%;
          display: flex;
          justify-content: flex-end;
        }
        .edit-btn, .done-btn {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        .edit-btn:hover {
          color: #4f46e5;
          background: #eef2ff;
        }
        .done-btn {
          color: #10b981;
          background: #ecfdf5;
        }
        .field-editor-input {
          width: 100%;
          border: 1.5px solid #4f46e5;
          border-radius: 6px;
          padding: 0.25rem 0.5rem;
          font-size: 0.85rem;
          outline: none;
          font-family: inherit;
        }
        .nested-rent-editors {
          display: flex;
          gap: 0.25rem;
        }
        .nested-rent-editors input {
          width: 32%;
          border: 1.5px solid #4f46e5;
          border-radius: 6px;
          padding: 0.25rem;
          font-size: 0.8rem;
          outline: none;
        }
        .flex-wrap-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
        }
        .facility-editor-panel {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          padding: 0.5rem 0;
        }
        .facility-chip-btn {
          padding: 0.25rem 0.5rem;
          background: #fff;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.75rem;
          color: #4b5563;
          cursor: pointer;
        }
        .facility-chip-btn.active {
          background: #4f46e5;
          color: #fff;
          border-color: #4f46e5;
        }
        .inline-tags-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }
        .preview-tag {
          font-size: 0.75rem;
          padding: 0.15rem 0.4rem;
          background: #f3f4f6;
          border-radius: 4px;
          color: #4b5563;
        }
        
        /* Missing Fields Alert banner */
        .missing-banner {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #b91c1c;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }
        
        /* Final Submit Box */
        .finalization-action-box {
          background: #ffffff;
          border: 1px solid #10b981;
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .uploader-title {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: #065f46;
        }
        .photo-dropzone-uploader {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          color: #4b5563;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .photo-dropzone-uploader:hover {
          border-color: #4f46e5;
          background: #fefefe;
        }
        .uploader-preview-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .preview-thumbnail-wrap {
          position: relative;
          width: 54px;
          height: 54px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .preview-thumbnail-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .remove-photo-tag-btn {
          position: absolute;
          top: 2px;
          right: 2px;
          background: rgba(0,0,0,0.65);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .publish-submit-button {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 0.85rem;
          font-size: 0.95rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
          transition: transform 0.2s ease;
        }
        .publish-submit-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
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