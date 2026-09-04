// src/hooks/useDiagnosis.js
import { useState, useCallback } from 'react';
import { diagnosePlant } from '../api/diagnoseApi';

// Drop this into LoadingScreen in place of your Day 1 setTimeout delay.
// See INTEGRATION.md for the exact wiring.
export default function useDiagnosis() {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runDiagnosis = useCallback(async (imageFile) => {
    setStatus('loading');
    setError(null);
    try {
      const data = await diagnosePlant(imageFile);
      setResult(data);
      setStatus('success');
      return data;
    } catch (err) {
      setError(err);
      setStatus('error');
      throw err;
    }
  }, []);

  return { status, result, error, runDiagnosis };
}
