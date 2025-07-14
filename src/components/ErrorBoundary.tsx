import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRefresh = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-4">
                An error occurred while rendering this component. Don't worry, we can fix this!
              </p>
              {this.state.error && (
                <details className="text-left bg-gray-100 p-3 rounded text-sm mb-4">
                  <summary className="cursor-pointer font-medium">Error Details</summary>
                  <pre className="mt-2 text-xs text-red-600 overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleRefresh}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;