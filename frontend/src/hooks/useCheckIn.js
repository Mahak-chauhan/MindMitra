import { useState } from 'react';
import { createCheckIn } from '../services/checkinService';
import { getRecommendations } from '../services/activityService';

export const useCheckIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const submitCheckIn = async (checkInData) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await createCheckIn(checkInData);
      setResult(response);
      
      // Fetch recommendations based on this new check-in
      try {
        const recs = await getRecommendations();
        setRecommendations(recs);
      } catch (recErr) {
        console.error('Failed to fetch recommendations', recErr);
      }
      
      return response;
    } catch (err) {
      setError(err.message || "We couldn't generate your prediction right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { submitCheckIn, loading, error, result, recommendations };
};
