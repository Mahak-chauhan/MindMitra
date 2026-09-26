import { fetchAPI } from './api';

export const sendMessage = (message) => {
  return fetchAPI('/chatbot', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
};

export const getChatHistory = () => {
  return fetchAPI('/chatbot/history');
};
