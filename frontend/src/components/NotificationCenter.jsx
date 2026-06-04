import React, { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notification');
            if (res.data.success) {
                setNotifications(res.data.notifications || []);
                setUnreadCount(res.data.notifications.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            const res = await api.post(`/notification/${id}/read`);
            if (res.data.success) {
                setNotifications(prev => 
                    prev.map(n => n._id === id ? { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />;
            default:
                return <Info className="w-5 h-5 text-primary flex-shrink-0" />;
        }
    };

    const formatTimestamp = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted">
                    <Bell className="w-5 h-5 text-foreground/80" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 border border-border shadow-xl rounded-xl mr-2">
                <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                    <h3 className="font-bold text-base">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="text-xs font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                            {unreadCount} new
                        </span>
                    )}
                </div>
                <div className="max-h-[300px] overflow-y-auto divide-y divide-border">
                    {loading && notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center">
                            <Bell className="w-8 h-8 text-muted-foreground/50 mb-2" />
                            <p className="font-medium">No new notifications</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div 
                                key={notif._id} 
                                className={`p-4 flex gap-3 transition-colors hover:bg-muted/50 ${!notif.isRead ? 'bg-muted/20' : ''}`}
                            >
                                {getIcon(notif.type)}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-1">
                                        <p className={`text-sm font-semibold truncate ${!notif.isRead ? 'text-foreground' : 'text-foreground/75'}`}>
                                            {notif.title}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {formatTimestamp(notif.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground/90 mt-1 line-clamp-2">
                                        {notif.message}
                                    </p>
                                    {!notif.isRead && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-6 mt-2 px-2 text-xs text-primary hover:text-primary/95 flex items-center gap-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(notif._id);
                                            }}
                                        >
                                            <Check className="w-3.5 h-3.5" /> Mark read
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationCenter;
