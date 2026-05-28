import React from 'react';
import { Button } from '../ui/button';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Error = ({ 
    title = 'Something went wrong', 
    message = 'An unexpected error occurred. Please try again later.',
    showRefresh = true,
    showHome = true 
}) => {
    const navigate = useNavigate();

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-destructive/15 rounded-full flex items-center justify-center border border-destructive/25">
                        <AlertCircle className="w-10 h-10 text-destructive" />
                    </div>
                </div>
                
                <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
                <p className="text-muted-foreground mb-8">{message}</p>
                
                <div className="flex gap-4 justify-center">
                    {showRefresh && (
                        <Button 
                            onClick={handleRefresh}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </Button>
                    )}
                    
                    {showHome && (
                        <Button 
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Go Home
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Error;
