import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import ChatbotUI from '../../components/chat/ChatbotUI';
import Button from '../../components/ui/Button';
import PageWrapper from '../../components/layout/PageWrapper';

export default function ChatbotListing() {
  const navigate = useNavigate();

  const handleListingCreated = (pg) => {
    navigate(`/owner/listings/${pg._id}/edit`);
  };

    const backAction = (
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button variant="secondary" size="sm" onClick={() => navigate('/owner/listings/add')} icon={<Sparkles size={16} />}>
          Manual Form
        </Button>
        <Button variant="secondary" size="sm" onClick={() => navigate('/owner/listings')} icon={<ArrowLeft size={16} />}>
          Back to Listings
        </Button>
      </div>
    );

  return (

    <PageWrapper title="Add New PG" subtitle="Fill in details to list your PG" >


    <div style={{ minHeight: '100vh', background: '#f3f4f6', paddingBottom: '2rem' }}>
      {/* Header */}
      {/* <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', paddingTop: '2rem', paddingBottom: '1.5rem', boxShadow: '0 10px 30px rgba(79, 70, 229, 0.2)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingLeft: '2rem', paddingRight: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Sparkles size={32} /> Create Listing with AI
            </h1>
            <p style={{ margin: 0, fontSize: '1rem', color: 'rgba(255, 255, 255, 0.9)' }}>Chat naturally and let our AI build your perfect PG listing</p>
          </div>
          <Button variant="secondary" size="sm" icon={<ArrowLeft size={16} />} onClick={() => navigate('/owner/listings/add')}>
            Manual Form
          </Button>
        </div>
      </div> */}

      {/* Chatbot Container */}
      <div style={{ maxWidth: '1400px', margin: '1rem auto', paddingLeft: '2rem', paddingRight: '2rem' }}>
        <ChatbotUI onListingCreated={handleListingCreated} />
      </div>
    </div>
        </PageWrapper>
  );
}