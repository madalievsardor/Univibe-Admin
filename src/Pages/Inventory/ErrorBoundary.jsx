import React, { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-error text-center p-4">
          <h2>Что-то пошло не так.</h2>
          <p>Пожалуйста, попробуйте перезагрузить страницу или обратитесь в поддержку.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;