import React from 'react';
import { CheckCircle, Clock, XCircle, Calendar } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const ApplicationTimeline = ({ statusHistory, currentStatus, interviewDetails, rejectionReason }) => {
    const statusOrder = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    const getStatusIcon = (status, index) => {
        if (status === 'Rejected') return <XCircle className="w-5 h-5 text-destructive" />;
        if (status === 'Selected') return <CheckCircle className="w-5 h-5 text-success" />;
        if (status === 'Interview Scheduled') return <Calendar className="w-5 h-5 text-primary" />;
        if (index < currentIndex) return <CheckCircle className="w-5 h-5 text-success" />;
        if (index === currentIndex) return <Clock className="w-5 h-5 text-primary" />;
        return <Clock className="w-5 h-5 text-muted-foreground/40" />;
    };

    const getStatusColor = (status, index) => {
        if (status === 'Rejected') return 'border-destructive/40 bg-destructive/10';
        if (status === 'Selected') return 'border-success/50 bg-success/15';
        if (status === 'Interview Scheduled') return 'border-primary/40 bg-primary/10';
        if (index < currentIndex) return 'border-success/50 bg-success/15';
        if (index === currentIndex) return 'border-primary/40 bg-primary/10';
        return 'border-border bg-card/40';
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getHistoryEntry = (status) => {
        if (!statusHistory) return null;
        return statusHistory.find(h => h.status === status);
    };

    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6">Application Progress</h3>
                
                <div className="space-y-4">
                    {statusOrder.map((status, index) => {
                        const historyEntry = getHistoryEntry(status);
                        const isCurrent = index === currentIndex;
                        const isPast = index < currentIndex;
                        const isFuture = index > currentIndex;
                        
                        // Stop showing future steps if rejected or selected
                        if ((currentStatus === 'Rejected' || currentStatus === 'Selected') && isFuture) {
                            return null;
                        }

                        return (
                            <div key={status} className="flex items-start gap-4">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStatusColor(status, index)}`}>
                                    {getStatusIcon(status, index)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className={`font-medium ${isCurrent ? 'text-primary' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {status}
                                        </p>
                                        {historyEntry && (
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(historyEntry.changedAt)}
                                            </p>
                                        )}
                                    </div>
                                    {historyEntry && historyEntry.notes && (
                                        <p className="text-sm text-muted-foreground mt-1">{historyEntry.notes}</p>
                                    )}
                                    {status === 'Interview Scheduled' && interviewDetails && (
                                        <div className="mt-2 p-3 bg-primary/10 rounded-xl border border-border">
                                            <p className="text-sm font-medium text-foreground">Interview Details</p>
                                            <div className="mt-1 text-sm text-muted-foreground">
                                                <p>Date: {interviewDetails.scheduledDate ? formatDate(interviewDetails.scheduledDate) : 'Not scheduled'}</p>
                                                <p>Time: {interviewDetails.scheduledTime || 'Not specified'}</p>
                                                <p>Type: {interviewDetails.interviewType || 'Video Call'}</p>
                                                {interviewDetails.location && <p>Location: {interviewDetails.location}</p>}
                                                {interviewDetails.meetingLink && (
                                                    <a href={interviewDetails.meetingLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                        Join Meeting
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {status === 'Rejected' && rejectionReason && (
                                        <div className="mt-2 p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                                            <p className="text-sm font-medium text-destructive">Rejection Reason</p>
                                            <p className="mt-1 text-sm text-muted-foreground">{rejectionReason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export default ApplicationTimeline;
