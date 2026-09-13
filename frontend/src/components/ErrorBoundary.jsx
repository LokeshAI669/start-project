import React from 'react';

/**
 * ErrorBoundary — catches any uncaught JS errors in the React tree.
 * Without this, a single component crash causes the entire app to go blank.
 * 
 * Usage: wrap <AppRoutes /> or individual pages in <ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you could send this to a logging service like Sentry
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'var(--bg, #09090B)',
          color: 'var(--text-primary, #FAFAFA)',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
          gap: '16px',
        }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ color: 'var(--text-secondary, #A1A1AA)', maxWidth: '400px', margin: 0 }}>
            An unexpected error occurred. Please refresh the page — your data is safe.
          </p>
          {this.state.error && (
            <code style={{
              fontSize: '12px',
              color: 'var(--red, #EF4444)',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              padding: '8px 12px',
              borderRadius: '8px',
              maxWidth: '500px',
              wordBreak: 'break-all',
              display: 'block',
            }}>
              {this.state.error.message}
            </code>
          )}
          <button
            onClick={this.handleReload}
            style={{
              marginTop: '8px',
              padding: '12px 28px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--orange, #3B82F6)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
