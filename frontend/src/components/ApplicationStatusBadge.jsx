import React from 'react';
import { Badge } from '../ui/badge';

const ApplicationStatusBadge = ({ status }) => {
    const getStatusVariant = (status) => {
        switch (status) {
            case 'Applied':
                return 'outline';
            case 'Under Review':
                return 'secondary';
            case 'Shortlisted':
                return 'warning';
            case 'Interview Scheduled':
                return 'warning';
            case 'Selected':
                return 'success';
            case 'Rejected':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <Badge variant={getStatusVariant(status)}>
            {status}
        </Badge>
    );
};

export default ApplicationStatusBadge;
