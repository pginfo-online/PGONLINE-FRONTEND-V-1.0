import api from './api';

export const chatbotService = {
  getActiveConversation: () => api.get('/pg/chat/active').then((res) => res.data.data.conversation),
  startNewConversation: () => api.post('/pg/chat/new').then((res) => res.data.data.conversation),
  sendMessage: (message) => {
    return api.post('/pg/chat/message', { message }).then((res) => res.data.data);
  },
  finalizeListing: (conversationId, listingData = null) =>
    api.post('/pg/chat/finalize', { conversationId, listingData }).then((res) => res.data.data.pg),
};