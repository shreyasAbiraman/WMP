import React from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Women Safety Shield UI Error]', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-center">
          <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mb-4 shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold">Application Render Issue</h1>
          <p className="text-sm text-slate-500 max-w-md mt-2">
            The safety shield encountered an unexpected interface error. You can reload or reset your local session below.
          </p>
          <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-left max-w-lg overflow-auto text-red-600">
            {this.state.error?.message || 'Unknown error occurred'}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs shadow-md hover:bg-purple-800 transition"
            >
              Reload Application
            </button>
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-300 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Local Cache</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
