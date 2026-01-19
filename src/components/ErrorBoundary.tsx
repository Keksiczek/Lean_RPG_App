import React, { ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './ui/ErrorFallback';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Standard Error Boundary component to catch rendering errors.
 * Explicitly using React.Component to ensure props and state are correctly typed.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Use public class field for state initialization to avoid constructor context issues
  public state: ErrorBoundaryState = { 
    hasError: false, 
    error: null 
  };

  /**
   * Updates state so the next render will show the fallback UI.
   */
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Lifecycle method to catch errors in children components.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Accessing this.props from React.Component
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Resets the error state to allow the application to attempt re-rendering.
   */
  public handleReset = () => {
    // Accessing this.setState from React.Component
    this.setState({ hasError: false, error: null });
    // Accessing this.props from React.Component
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    // Accessing this.state and this.props from React.Component
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback as React.ReactNode;
      }
      return <ErrorFallback error={error} onRetry={this.handleReset} />;
    }

    return children as React.ReactNode;
  }
}

export default ErrorBoundary;
