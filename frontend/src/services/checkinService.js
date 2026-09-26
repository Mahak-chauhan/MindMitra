import { fetchAPI } from './api';

export const createCheckIn = (data) => {
  return fetchAPI('/checkins', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getCheckIns = () => {
  return fetchAPI('/checkins');
};
