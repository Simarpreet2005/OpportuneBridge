import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();
    const [aiScore, setAiScore] = useState(null);

    const applyJobHandler = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, { withCredentials: true });

            if (res.data.success) {
                setIsApplied(true); // Update the local state
                const updatedSingleJob = { ...singleJob, applications: [...singleJob.applications, { applicant: user?._id }] }
                dispatch(setSingleJob(updatedSingleJob)); // helps us to real time UI update
                toast.success(res.data.message);

            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application => application.applicant === user?._id)) // Ensure the state is in sync with fetched data
                }
            } catch (error) {
                console.log(error);
            }
        }
        const fetchAiScore = async () => {
            try {
                const res = await axios.post(`http://localhost:8000/api/v1/ai/score`, { targetId: jobId, targetType: 'Job' }, { withCredentials: true });
                if (res.data.success) {
                    setAiScore(res.data); // Store entire response { score, analysis }
                }
            } catch (error) {
                console.log("AI Score fetch failed", error);
            }
        }
        fetchSingleJob();
        if (user) fetchAiScore();
    }, [jobId, dispatch, user?._id]);

    return (
        <div className='max-w-7xl mx-auto my-10'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='font-bold text-xl'>{singleJob?.title}</h1>
                    <div className='flex items-center gap-2 mt-4'>
                        <Badge className={'text-blue-700 font-bold'} variant="ghost">{singleJob?.postion} Positions</Badge>
                        <Badge className={'text-[#F83002] font-bold'} variant="ghost">{singleJob?.jobType}</Badge>
                        <Badge className={'text-[#7209b7] font-bold'} variant="ghost">{singleJob?.salary}LPA</Badge>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    {aiScore && (
                        <div className='flex flex-col items-end group relative'>
                            <Badge className={'bg-green-100 text-green-700 font-bold border-green-200 cursor-help'} variant="outline">AI Match: {aiScore.score}%</Badge>
                            <div className='absolute top-full right-0 mt-2 w-64 p-3 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none'>
                                <p className='text-xs text-gray-500 font-semibold mb-1'>Analysis</p>
                                <p className='text-xs text-gray-700 leading-snug'>{aiScore.analysis}</p>
                            </div>
                        </div>
                    )}
                    <Button
                        onClick={isApplied ? null : applyJobHandler}
                        disabled={isApplied}
                        className={`rounded-lg ${isApplied ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#7209b7] hover:bg-[#5f32ad]'}`}>
                        {isApplied ? 'Already Applied' : 'Apply Now'}
                    </Button>
                </div>
            </div>
            {user?.profile?.resume && (
                <div className='mt-4 flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-dashed'>
                    <div>
                        <h3 className='font-bold text-sm'>ATS Score Analysis</h3>
                        <p className='text-xs text-muted-foreground'>See how well your resume matches this job description.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={async () => {
                        try {
                            const res = await axios.post(`http://localhost:8000/api/v1/aichat/ats`, {
                                resumeText: user.profile.skills.join(", "), 
                                jobDescription: singleJob.description
                            }, { withCredentials: true });
                            if (res.data.success) {
                                toast.success(`ATS Score: ${res.data.score}% - ${res.data.justification}`);
                            }
                        } catch (error) {
                            toast.error("ATS analysis failed");
                        }
                    }}>Check ATS Score</Button>
                </div>
            )}
            <h1 className='border-b-2 border-b-gray-300 font-medium py-4'>Job Description</h1>
            <div className='my-4'>
                <h1 className='font-bold my-1'>Role: <span className='pl-4 font-normal text-gray-800'>{singleJob?.title}</span></h1>
                <h1 className='font-bold my-1'>Location: <span className='pl-4 font-normal text-gray-800'>{singleJob?.location}</span></h1>
                <h1 className='font-bold my-1'>Description: <span className='pl-4 font-normal text-gray-800'>{singleJob?.description}</span></h1>
                <h1 className='font-bold my-1'>Experience: <span className='pl-4 font-normal text-gray-800'>{singleJob?.experience} yrs</span></h1>
                <h1 className='font-bold my-1'>Salary: <span className='pl-4 font-normal text-gray-800'>{singleJob?.salary}LPA</span></h1>
                <h1 className='font-bold my-1'>Total Applicants: <span className='pl-4 font-normal text-gray-800'>{singleJob?.applications?.length}</span></h1>
                <h1 className='font-bold my-1'>Posted Date: <span className='pl-4 font-normal text-gray-800'>{singleJob?.createdAt.split("T")[0]}</span></h1>
            </div>
        </div>
    )
}

export default JobDescription