import { fetchAPI } from './api';

export const createWellbeingRecord = (data) => {
  return fetchAPI('/wellbeing', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getWellbeingRecords = () => {
  return fetchAPI('/wellbeing');
};

export const deleteWellbeingRecord = (id) => {
  return fetchAPI(`/wellbeing/${id}`, {
    method: 'DELETE',
  });
};
