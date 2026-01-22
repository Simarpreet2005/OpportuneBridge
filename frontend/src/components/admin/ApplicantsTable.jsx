import React, { useState } from 'react'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { MoreHorizontal, Award, Download } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { Button } from '../ui/button';

const shortlistingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = () => {
    const { applicants } = useSelector(store => store.application);
    const [atsResult, setAtsResult] = useState(null);
    const [atsOpen, setAtsOpen] = useState(false);
    const [loadingATS, setLoadingATS] = useState(false);

    const statusHandler = async (status, id) => {
        console.log('called');
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
            console.log(res);
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    const checkATS = async (applicationId) => {
        try {
            setLoadingATS(true);
            const res = await axios.get(`${APPLICATION_API_END_POINT}/ats-check/${applicationId}`, { withCredentials: true });
            if (res.data.success) {
                setAtsResult(res.data);
                setAtsOpen(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to check ATS");
        } finally {
            setLoadingATS(false);
        }
    }

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
    }

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
                        <TableHead>ATS Check</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        applicants && applicants?.applications?.map((item) => {
                            return (
                                <tr key={item._id}>
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
                                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    <span>{item?.applicant?.profile?.resumeOriginalName || 'Download'}</span>
                                                </button>
                                            ) : <span>NA</span>
                                        }
                                    </TableCell>
                                    <TableCell>{item?.applicant.createdAt.split("T")[0]}</TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => checkATS(item._id)}
                                            disabled={loadingATS}
                                        >
                                            <Award className="h-4 w-4 mr-1" /> Check
                                        </Button>
                                    </TableCell>
                                    <TableCell className="float-right cursor-pointer">
                                        <Popover>
                                            <PopoverTrigger>
                                                <MoreHorizontal />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-32">
                                                {
                                                    shortlistingStatus.map((status, index) => {
                                                        return (
                                                            <div onClick={() => statusHandler(status, item?._id)} key={index} className='flex w-fit items-center my-2 cursor-pointer'>
                                                                <span>{status}</span>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </PopoverContent>
                                        </Popover>

                                    </TableCell>

                                </tr>
                            );
                        })
                    }

                </TableBody>

            </Table>

            {/* ATS Result Dialog */}
            <Dialog open={atsOpen} onOpenChange={setAtsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            ATS Analysis - {atsResult?.applicantName}
                            <Badge className={`text-lg ${atsResult?.score >= 80 ? 'bg-green-500' :
                                atsResult?.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}>
                                {atsResult?.score}/100
                            </Badge>
                        </DialogTitle>
                    </DialogHeader>
                    {atsResult && (
                        <div className="space-y-4 py-4">
                            <div>
                                <h4 className="font-bold mb-2">Analysis</h4>
                                <p className="text-sm text-gray-600">{atsResult.analysis}</p>
                            </div>

                            {atsResult.missingSkills && atsResult.missingSkills.length > 0 && (
                                <div>
                                    <h4 className="font-bold mb-2 text-orange-600">Missing Skills</h4>
                                    <ul className="list-disc pl-5 text-sm">
                                        {atsResult.missingSkills.map((skill, i) => <li key={i}>{skill}</li>)}
                                    </ul>
                                </div>
                            )}

                            <div>
                                <h4 className="font-bold mb-2">Recommendation</h4>
                                <Badge className={`${atsResult.recommendation === 'Shortlist' ? 'bg-green-500' :
                                    atsResult.recommendation === 'Review' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}>
                                    {atsResult.recommendation}
                                </Badge>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ApplicantsTable
