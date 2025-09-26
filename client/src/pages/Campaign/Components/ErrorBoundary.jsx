// client/src/pages/Campaign/components/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("ErrorBoundary caught error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-900 text-red-200 rounded">
                    Preview Error — please check your content.
                </div>
            );
        }
        return this.props.children;
    }
}
