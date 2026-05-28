import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        console.error(error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[60vh] flex items-center justify-center px-4 text-center text-muted-foreground">
                    Something went wrong. Please refresh and try again.
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

