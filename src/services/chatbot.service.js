import api from './api';

export const chatbotService = {
  getActiveConversation: () => api.get('/pg/chat/active').then((res) => res.data.data.conversation),
  startNewConversation: () => api.post('/pg/chat/new').then((res) => res.data.data.conversation),
  sendMessage: (message, images = []) => {
    const formData = new FormData();
    if (message) formData.append('message', message);
    images.forEach((file) => formData.append('images', file));
    return api.post('/pg/chat/message', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data.data);
  },
  finalizeListing: (conversationId) =>
    api.post('/pg/chat/finalize', { conversationId }).then((res) => res.data.data.pg),
};