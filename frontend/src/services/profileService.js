import { fetchAPI } from './api';

export const getProfile = () => {
  return fetchAPI('/profile');
};

export const updateProfile = (profileData) => {
  return fetchAPI('/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};
