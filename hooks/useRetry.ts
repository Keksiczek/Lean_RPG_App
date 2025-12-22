import { useState, useCallback, useRef, useEffect } from 'react';

interface UseRetryOptions {
  maxAttempts?: number;      // default 3
  initialDelay?: number;     // default 1000ms
  maxDelay?: number;         // default 10000ms
  backoffFactor?: number;    // default 2
  onRetry?: (attempt: number) => void;
  onMaxAttemptsReached?: () => void;
}

interface UseRetryReturn<T> {
  execute: (fn: () => Promise<T>) => Promise<T | null>;
  isRetrying: boolean;
  attempt: number;
  error: Error | null;
  reset: () => void;
}

export function useRetry<T>(options: UseRetryOptions = {}): UseRetryReturn<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry,
    onMaxAttemptsReached
  } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<number | null>(null);
  const isUnmounted = useRef(false);

  useEffect(() => {
    return () => {
      isUnmounted.current = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const reset = useCallback(() => {
    setAttempt(0);
    setError(null);
    setIsRetrying(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const execute = useCallback(async (fn: () => Promise<T>): Promise<T | null> => {
    reset();
    
    const run = async (currentAttempt: number): Promise<T | null> => {
      try {
        const result = await fn();
        if (isUnmounted.current) return null;
        return result;
      } catch (err: any) {
        if (isUnmounted.current) return null;
        
        const nextAttempt = currentAttempt + 1;
        if (nextAttempt < maxAttempts) {
          setAttempt(nextAttempt);
          setIsRetrying(true);
          
          if (onRetry) onRetry(nextAttempt);

          const delay = Math.min(
            initialDelay * Math.pow(backoffFactor, currentAttempt),
            maxDelay
          );

          return new Promise((resolve) => {
            timerRef.current = window.setTimeout(async () => {
              const res = await run(nextAttempt);
              resolve(res);
            }, delay);
          });
        } else {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsRetrying(false);
          if (onMaxAttemptsReached) onMaxAttemptsReached();
          return null;
        }
      }
    };

    return run(0);
  }, [maxAttempts, initialDelay, maxDelay, backoffFactor, onRetry, onMaxAttemptsReached, reset]);

  return { execute, isRetrying, attempt, error, reset };
}