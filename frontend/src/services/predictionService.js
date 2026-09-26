import { fetchAPI } from './api';

export const getPredictions = (userId) => {
  return fetchAPI(`/predictions/user/${userId}`);
};

export const createPrediction = (data) => {
  return fetchAPI('/predictions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
