import React, { useState } from 'react'
import { Badge } from '../../ui/badge'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { MoreHorizontal, Download, Calendar } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '../../utils/constant';
import axios from 'axios';
import { Button } from '../../ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge';
import ApplicationTimeline from '../../components/ApplicationTimeline';

const statusOptions = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];

const ApplicantsTable = () => {
    const { applicants } = useSelector(store => store.application);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [notes, setNotes] = useState('');
    const [interviewDetails, setInterviewDetails] = useState({
        scheduledDate: '',
        scheduledTime: '',
        interviewType: 'Video Call',
        location: '',
        meetingLink: ''
    });
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [timelineOpen, setTimelineOpen] = useState(false);
    const queryClient = useQueryClient();

    const statusHandler = async () => {
        try {
            setLoading(true);
            const payload = {
                status: selectedStatus,
                notes
            };

            if (selectedStatus === 'Interview Scheduled') {
                payload.interviewDetails = interviewDetails;
            }

            if (selectedStatus === 'Rejected') {
                payload.rejectionReason = rejectionReason;
            }

            const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${selectedApplication._id}/update`, payload, { withCredentials: true });
            if (res.data.success) {
                queryClient.invalidateQueries({ queryKey: ["appliedJobs"] });
                toast.success(res.data.message);
                setStatusDialogOpen(false);
                setSelectedApplication(null);
                setSelectedStatus('');
                setNotes('');
                setInterviewDetails({
                    scheduledDate: '',
                    scheduledTime: '',
                    interviewType: 'Video Call',
                    location: '',
                    meetingLink: ''
                });
                setRejectionReason('');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    const downloadResume = async (resumeUrl, fileName) => {
        try {
            toast.info('Downloading resume...');
            const response = await fetch(resumeUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName || 'resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Resume downloaded successfully');
        } catch (error) {
            toast.error('Failed to download resume');
            console.error(error);
        }
    };

    const openStatusDialog = (application) => {
        setSelectedApplication(application);
        setSelectedStatus(application.status);
        setNotes('');
        if (application.interviewDetails) {
            setInterviewDetails(application.interviewDetails);
        }
        if (application.rejectionReason) {
            setRejectionReason(application.rejectionReason);
        }
        setStatusDialogOpen(true);
    };

    const openTimeline = (application) => {
        setSelectedApplication(application);
        setTimelineOpen(true);
    };

    return (
        <div>
            <Table>
                <TableCaption>A list of your recent applied user</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>FullName</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        applicants && applicants?.applications?.map((item) => {
                            return (
                                <TableRow key={item._id}>
                                    <TableCell>{item?.applicant?.fullname}</TableCell>
                                    <TableCell>{item?.applicant?.email}</TableCell>
                                    <TableCell>{item?.applicant?.phoneNumber}</TableCell>
                                    <TableCell>
                                        {
                                            item.applicant?.profile?.resume ? (
                                                <button
                                                    onClick={() => downloadResume(
                                                        item?.applicant?.profile?.resume,
                                                        item?.applicant?.profile?.resumeOriginalName || 'resume.pdf'
                                                    )}
                                                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 cursor-pointer hover:underline"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    <span>{item?.applicant?.profile?.resumeOriginalName || 'Download'}</span>
                                                </button>
                                            ) : <span>NA</span>
                                        }
                                    </TableCell>
                                    <TableCell>{item?.applicant.createdAt.split("T")[0]}</TableCell>
                                    <TableCell>
                                        <ApplicationStatusBadge status={item.status} />
                                    </TableCell>
                                    <TableCell className="float-right cursor-pointer">
                                        <Popover>
                                            <PopoverTrigger>
                                                <MoreHorizontal />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-40">
                                                <div onClick={() => openTimeline(item)} className='flex w-fit items-center my-2 cursor-pointer hover:text-primary'>
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    <span>View Timeline</span>
                                                </div>
                                                <div onClick={() => openStatusDialog(item)} className='flex w-fit items-center my-2 cursor-pointer hover:text-primary'>
                                                    <span>Update Status</span>
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                    </TableCell>

                                </TableRow>
                            );
                        })
                    }

                </TableBody>

            </Table>

            {/* Status Update Dialog */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            Update Application Status
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((status) => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Input
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add notes about this status change"
                            />
                        </div>

                        {selectedStatus === 'Interview Scheduled' && (
                            <div className="space-y-3 p-4 bg-secondary/50 rounded-xl border border-border">
                                <h4 className="font-semibold text-foreground">Interview Details</h4>
                                <div>
                                    <Label htmlFor="scheduledDate">Date</Label>
                                    <Input
                                        id="scheduledDate"
                                        type="date"
                                        value={interviewDetails.scheduledDate}
                                        onChange={(e) => setInterviewDetails({ ...interviewDetails, scheduledDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="scheduledTime">Time</Label>
                                    <Input
                                        id="scheduledTime"
                                        type="time"
                                        value={interviewDetails.scheduledTime}
                                        onChange={(e) => setInterviewDetails({ ...interviewDetails, scheduledTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="interviewType">Interview Type</Label>
                                    <Select value={interviewDetails.interviewType} onValueChange={(value) => setInterviewDetails({ ...interviewDetails, interviewType: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="In-Person">In-Person</SelectItem>
                                            <SelectItem value="Video Call">Video Call</SelectItem>
                                            <SelectItem value="Phone Screen">Phone Screen</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={interviewDetails.location}
                                        onChange={(e) => setInterviewDetails({ ...interviewDetails, location: e.target.value })}
                                        placeholder="Physical location (if in-person)"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="meetingLink">Meeting Link</Label>
                                    <Input
                                        id="meetingLink"
                                        value={interviewDetails.meetingLink}
                                        onChange={(e) => setInterviewDetails({ ...interviewDetails, meetingLink: e.target.value })}
                                        placeholder="Zoom/Meet link (if video call)"
                                    />
                                </div>
                            </div>
                        )}

                        {selectedStatus === 'Rejected' && (
                            <div className="space-y-3 p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                                <h4 className="font-semibold text-destructive">Rejection Reason</h4>
                                <Input
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Provide reason for rejection"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={statusHandler} disabled={loading}>
                            {loading ? 'Updating...' : 'Update Status'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Timeline Dialog */}
            <Dialog open={timelineOpen} onOpenChange={setTimelineOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            Application Timeline
                        </DialogTitle>
                    </DialogHeader>
                    {selectedApplication && (
                        <ApplicationTimeline
                            statusHistory={selectedApplication.statusHistory}
                            currentStatus={selectedApplication.status}
                            interviewDetails={selectedApplication.interviewDetails}
                            rejectionReason={selectedApplication.rejectionReason}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ApplicantsTable
