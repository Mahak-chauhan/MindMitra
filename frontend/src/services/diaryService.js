import { fetchAPI } from './api';

export const createDiaryEntry = (data) => {
  return fetchAPI('/diary', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getDiaryEntries = () => {
  return fetchAPI('/diary');
};

export const deleteDiaryEntry = (id) => {
  return fetchAPI(/diary/ + id, {
    method: 'DELETE',
  });
};
