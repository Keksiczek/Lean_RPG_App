
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/apiClient';
import { ApiResponse, Submission } from '../types';
import { ENDPOINTS } from '../config';

interface FetchOptions {
  retry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

// 1. Základní fetch hook s error handling a retry logikou
export function useFetch<T>(endpoint: string | null, options: FetchOptions = {}) {
  const { retry = false, maxRetries = 3, retryDelay = 1000 } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const retryTimerRef = useRef<number | null>(null);

  const refetch = useCallback(async () => {
    if (!endpoint) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get<ApiResponse<T>>(endpoint);
      if (response.success) {
        setData(response.data ?? null);
        setRetryCount(0);
        setIsRetrying(false);
      } else {
        throw new Error(response.error ?? 'Unknown error');
      }
    } catch (e: any) {
      const errorMsg = e instanceof Error ? e.message : 'Request failed';
      
      if (retry && retryCount < maxRetries) {
        setIsRetrying(true);
        const nextCount = retryCount + 1;
        setRetryCount(nextCount);
        
        const delay = retryDelay * Math.pow(2, retryCount); // Backoff
        
        retryTimerRef.current = window.setTimeout(() => {
          refetch();
        }, delay);
      } else {
        setError(errorMsg);
        setIsRetrying(false);
      }
    } finally {
      if (!isRetrying) {
        setLoading(false);
      }
    }
  }, [endpoint, retry, maxRetries, retryDelay, retryCount, isRetrying]);

  useEffect(() => {
    refetch();
    return () => {
      if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current);
    };
  }, [endpoint]); // Initial fetch and on endpoint change

  const manualRetry = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    refetch();
  }, [refetch]);

  return { 
    data, 
    loading, 
    error, 
    refetch: manualRetry,
    retryCount,
    isRetrying 
  };
}

// 2. Mutation hook pro POST/PUT/DELETE
export function useMutation<TRequest, TResponse>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST'
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* FIX: Added endpointOverride parameter to allow dynamic endpoints like ID-based paths */
  const execute = async (data?: TRequest, endpointOverride?: string): Promise<TResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      /* FIX: Using endpointOverride if provided, otherwise fallback to default hook endpoint */
      const response = await apiClient.request<ApiResponse<TResponse>>(endpointOverride || endpoint, {
        method,
        body: data ? JSON.stringify(data) : undefined,
      });
      if (response.success) {
        return response.data ?? null;
      } else {
        setError(response.error ?? 'Unknown error');
        return null;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}

// 3. Polling pro Gemini async submissions
export function useSubmissionPolling(submissionId: string | null) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!submissionId) {
      setSubmission(null);
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    setError(null);

    const pollSubmission = async () => {
      try {
        const response = await apiClient.get<ApiResponse<Submission>>(
          ENDPOINTS.SUBMISSIONS.DETAIL(submissionId)
        );
        
        if (response.success && response.data) {
          setSubmission(response.data);
          
          // Stop polling when evaluated
          if (response.data.status === 'evaluated') {
            setIsPolling(false);
            return true; // Signal to stop
          }
        }
        return false;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Polling failed');
        setIsPolling(false);
        return true; // Stop on error
      }
    };

    // Initial fetch
    pollSubmission();

    // Poll every 2 seconds
    const interval = setInterval(async () => {
      const shouldStop = await pollSubmission();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, 2000);

    // Cleanup
    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [submissionId]);

  return { submission, isPolling, error };
}

// 4. Hook pro submit quest solution
export function useQuestSubmission() {
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const { execute, loading: submitting, error: submitError } = useMutation<
    { questId: string; content: string },
    Submission
  >(ENDPOINTS.SUBMISSIONS.CREATE);
  
  const { submission, isPolling, error: pollError } = useSubmissionPolling(submissionId);

  const submitSolution = async (questId: string, content: string) => {
    const result = await execute({ questId, content });
    if (result) {
      setSubmissionId(result.id);
    }
    return result;
  };

  const reset = () => {
    setSubmissionId(null);
  };

  return {
    submitSolution,
    reset,
    submitting,
    isPolling,
    submission,
    error: submitError || pollError,
    isEvaluated: submission?.status === 'evaluated',
  };
}
