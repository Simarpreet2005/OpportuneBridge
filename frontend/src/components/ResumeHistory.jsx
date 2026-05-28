import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Eye, Download, Trash2, CheckCircle, Clock, FileText } from 'lucide-react';
import api from '../services/api';
import { Skeleton } from '../ui/skeleton';

const ResumeHistory = () => {
    const [resumeVersions, setResumeVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchResumeVersions();
    }, []);

    const fetchResumeVersions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/resume/versions');
            if (response.data.success) {
                setResumeVersions(response.data.resumeVersions);
            }
        } catch (error) {
            console.error('Error fetching resume versions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSetActive = async (versionId) => {
        try {
            const response = await api.patch(`/resume/set-active/${versionId}`);
            if (response.data.success) {
                fetchResumeVersions();
            }
        } catch (error) {
            console.error('Error setting active version:', error);
        }
    };

    const handleDelete = async (versionId) => {
        if (!window.confirm('Are you sure you want to delete this resume version?')) {
            return;
        }
        try {
            const response = await api.delete(`/resume/version/${versionId}`);
            if (response.data.success) {
                fetchResumeVersions();
            }
        } catch (error) {
            console.error('Error deleting resume version:', error);
            alert(error.message || 'Failed to delete resume version');
        }
    };

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size exceeds 10MB limit');
            event.target.value = '';
            return;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Allowed: PDF, DOC, DOCX');
            event.target.value = '';
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            // Do NOT set Content-Type header - axios handles it automatically for FormData
            const response = await api.post('/resume/upload-version', formData);

            if (response.data.success) {
                fetchResumeVersions();
                event.target.value = '';
            }
        } catch (error) {
            console.error('Error uploading resume version:', error);
            alert(error.message || 'Failed to upload resume version');
        } finally {
            setUploading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Resume history</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-40" />
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-2xl border border-border/70 bg-card p-6">
                                <div className="flex items-start justify-between gap-6">
                                    <div className="space-y-3">
                                        <Skeleton className="h-6 w-56" />
                                        <Skeleton className="h-4 w-40" />
                                        <div className="flex gap-2">
                                            <Skeleton className="h-6 w-24 rounded-full" />
                                            <Skeleton className="h-6 w-24 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-10 w-24 rounded-xl" />
                                        <Skeleton className="h-10 w-24 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-lg">Resume history</CardTitle>
                        <p className="muted mt-1 text-sm">Upload new versions and choose the active resume.</p>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            id="resume-upload"
                            accept=".pdf,.doc,.docx"
                            onChange={handleUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                        <Button 
                            disabled={uploading} 
                            className="cursor-pointer"
                            onClick={() => document.getElementById('resume-upload').click()}
                        >
                            {uploading ? 'Uploading...' : resumeVersions.length === 0 ? 'Upload resume' : 'Upload new version'}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {resumeVersions.length === 0 ? (
                    <div className="rounded-2xl border border-border/70 bg-secondary/30 p-10 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold tracking-tight">No resume versions yet</h3>
                        <p className="muted mt-1 text-sm">Upload your first resume to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {resumeVersions.map((version) => (
                            <Card key={version._id} className="border-l-4 border-l-primary">
                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant={version.isActive ? "primary" : "secondary"}>
                                                    {version.isActive ? (
                                                        <span className="flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            Inactive
                                                        </span>
                                                    )}
                                                </Badge>
                                                <Badge variant="outline">Version {version.version}</Badge>
                                            </div>
                                            <h3 className="mt-3 font-medium text-base md:text-lg truncate">{version.fileName}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Uploaded {formatDate(version.uploadedAt)}
                                            </p>
                                            {version.skillsExtracted && version.skillsExtracted.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {version.skillsExtracted.slice(0, 6).map((skill, idx) => (
                                                        <Badge key={idx} variant="secondary" className="text-xs">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                    {version.skillsExtracted.length > 6 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{version.skillsExtracted.length - 6} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.open(version.resumeUrl, '_blank')}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = version.resumeUrl;
                                                    link.download = version.fileName;
                                                    link.click();
                                                }}
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                Download
                                            </Button>
                                            {!version.isActive && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSetActive(version._id)}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Set active
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(version._id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ResumeHistory;
