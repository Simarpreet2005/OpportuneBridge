import React, { useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Badge } from '../ui/badge'
import { useSelector } from 'react-redux'
import ApplicationStatusBadge from '../components/ApplicationStatusBadge'
import ApplicationTimeline from '../components/ApplicationTimeline'
import { Button } from '../ui/button'
import { Eye } from 'lucide-react'

const AppliedJobTable = () => {
    const { allAppliedJobs } = useSelector(store => store.job);
    const [selectedApplication, setSelectedApplication] = useState(null);

    return (
        <div>
            {selectedApplication ? (
                <div className="space-y-4">
                    <Button 
                        variant="outline" 
                        onClick={() => setSelectedApplication(null)}
                        className="mb-4"
                    >
                        ← Back to Applications
                    </Button>
                    <ApplicationTimeline 
                        statusHistory={selectedApplication.statusHistory}
                        currentStatus={selectedApplication.status}
                        interviewDetails={selectedApplication.interviewDetails}
                        rejectionReason={selectedApplication.rejectionReason}
                    />
                </div>
            ) : (
                <Table>
                    <TableCaption>A list of your applied jobs</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Job Role</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            allAppliedJobs.length <= 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">
                                        <div className='flex flex-col items-center justify-center'>
                                            <p className='text-muted-foreground mb-2'>You haven't applied to any jobs yet.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : allAppliedJobs.map((appliedJob) => (
                                <TableRow key={appliedJob._id}>
                                    <TableCell>{appliedJob?.createdAt?.split("T")[0]}</TableCell>
                                    <TableCell>{appliedJob.job?.title}</TableCell>
                                    <TableCell>{appliedJob.job?.company?.name}</TableCell>
                                    <TableCell className="text-right">
                                        <ApplicationStatusBadge status={appliedJob.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedApplication(appliedJob)}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            )}
        </div>
    )
}

export default AppliedJobTable
