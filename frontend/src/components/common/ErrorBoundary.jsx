import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SchemeSetu Error Boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-4">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Something Went Wrong</h2>
            <p className="text-sm text-slate-400">
              SchemeSetu encountered an unexpected render issue. Don't worry, your data is safe.
            </p>
            <button
              onClick={this.handleReload}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 mx-auto shadow-lg"
            >
              <RefreshCw className="w-4 h-4" /> Refresh SchemeSetu App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
