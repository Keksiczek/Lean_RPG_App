import React, { useEffect, useCallback } from 'react';
import { useFetch } from '../../hooks/useApi';
import ApiError from './ApiError';
import Skeleton from './Skeleton';

interface RetryableRequestProps<T> {
  endpoint: string;
  children: (data: T) => React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  maxRetries?: number;
  compact?: boolean;
}

const RetryableRequest = <T,>({ 
  endpoint, 
  children, 
  loadingFallback, 
  errorFallback,
  maxRetries = 3,
  compact = false
}: RetryableRequestProps<T>) => {
  const { data, loading, error, refetch } = useFetch<T>(endpoint, {
    retry: true,
    maxRetries
  });

  if (loading && !data) {
    return <>{loadingFallback || <div className="p-10 flex justify-center"><Skeleton variant="rounded" width="100%" height={200} /></div>}</>;
  }

  if (error && !data) {
    return <>{errorFallback || <ApiError error={error} onRetry={refetch} compact={compact} />}</>;
  }

  if (!data) return null;

  return <>{children(data)}</>;
};

export default RetryableRequest;