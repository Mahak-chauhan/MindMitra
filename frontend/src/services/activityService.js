import { fetchAPI } from './api';

export const getActivities = () => {
  return fetchAPI('/activities');
};

export const getRecommendations = () => {
  return fetchAPI('/activities/recommendations');
};

export const startActivity = (activityId) => {
  return fetchAPI(`/activities/${activityId}/start`, {
    method: 'POST',
  });
};

export const completeActivity = (logId, rating) => {
  return fetchAPI(`/activities/history/${logId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ rating }),
  });
};

export const getActivityHistory = () => {
  return fetchAPI('/activities/history');
};
