import { fetchAPI } from './api';

export const generateRoadmap = () => {
  return fetchAPI('/roadmap/generate', {
    method: 'POST',
  });
};

export const getTodayRoadmap = () => {
  return fetchAPI('/roadmap/today');
};

export const getRoadmapHistory = () => {
  return fetchAPI('/roadmap/history');
};

export const completeRoadmapItem = (roadmapId, itemId) => {
  return fetchAPI(`/roadmap/${roadmapId}/items/${itemId}/complete`, {
    method: 'PATCH',
  });
};
