
import React, { Component, ErrorInfo, ReactNode } from 'react';
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
 * Uses explicitly imported Component class to avoid issues with inherited properties in some TypeScript configurations.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null 
    };
  }

  /**
   * Updates state so the next render will show the fallback UI.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Lifecycle method to catch errors in children components.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Correct access to props via this.props.
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Resets the error state to allow the application to attempt re-rendering.
   */
  handleReset = () => {
    // Correct access to setState via this.setState.
    this.setState({ hasError: false, error: null });
    // Correct access to props via this.props.
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    // Fix: Access state and props correctly to satisfy TypeScript requirements for class components.
    if (hasError) {
      if (fallback) {
        return fallback as React.ReactNode;
      }
      return <ErrorFallback error={error} onRetry={this.handleReset} />;
    }

    return children;
  }
}

export default ErrorBoundary;
