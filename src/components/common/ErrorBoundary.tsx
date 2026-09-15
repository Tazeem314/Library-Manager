import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('StudySpace ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleResetData = () => {
    try {
      localStorage.removeItem('studyspace_manager_data_v1');
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center">
            <div className="w-14 h-14 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
              Application Error
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              StudySpace Manager encountered an unexpected issue while loading. You can reload the app or reset to fresh demo data.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={this.handleResetData}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
              >
                Reset to Fresh Demo Data & Reload
              </button>

              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
              >
                Try Reloading Page
              </button>
            </div>

            {this.state.error && (
              <div className="mt-6 text-left">
                <details className="text-xs text-slate-400 cursor-pointer">
                  <summary className="hover:text-slate-600 font-mono">Error details</summary>
                  <pre className="mt-2 p-3 bg-slate-900 text-red-400 rounded-lg overflow-x-auto text-[11px] font-mono leading-relaxed whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
