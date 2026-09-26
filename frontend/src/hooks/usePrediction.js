import { useState } from 'react';
import { createPrediction } from '../services/predictionService';

export const usePrediction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const submitCheckIn = async (checkInData) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      // Backend now derives user identity from the JWT via authMiddleware
      const response = await createPrediction({
        features: checkInData
      });
      setResult(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || "We couldn't generate your prediction right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { submitCheckIn, loading, error, result };
};
