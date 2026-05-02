import React from 'react'
import { Button } from './ui/button'
import { Bookmark, Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '@/redux/authSlice'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import useGetMatchScore from '@/Hooks/useGetMatchScore'

const Job = ({ job }) => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { score, loading } = useGetMatchScore(job?._id, 'Job');

    const saveJobHandler = async () => {
        try {
            const res = await axios.post(`${JOB_API_END_POINT}/save/${job?._id}`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);

                if (user && user.profile) {
                    const updatedUser = {
                        ...user,
                        profile: {
                            ...user.profile,
                            savedJobs: res.data.updatedSavedJobs
                        }
                    };
                    dispatch(setUser(updatedUser));
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    }

    return (
        <div className='p-5 rounded-md shadow-xl bg-white border border-gray-100'>
            <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-500'>{daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}</p>
                <div className='flex items-center gap-2'>
                    {loading ? (
                        <Loader2 className='w-4 h-4 animate-spin text-muted-foreground' />
                    ) : score !== null ? (
                        <Badge variant="outline" className={`${score > 75 ? 'text-green-600 border-green-200 bg-green-50' : 'text-yellow-600 border-yellow-200 bg-yellow-50'}`}>
                            {score}% Match
                        </Badge>
                    ) : null}
                    <Button variant="outline" className="rounded-full" size="icon"><Bookmark /></Button>
                </div>
            </div>

            <div className='flex items-center gap-2 my-2'>
                <Button className="p-6" variant="outline" size="icon">
                    <Avatar>
                        <AvatarImage src={job?.company?.logo} />
                    </Avatar>
                </Button>
                <div>
                    <h1 className='font-medium text-lg'>{job?.company?.name}</h1>
                    <p className='text-sm text-gray-500'>India</p>
                </div>
            </div>

            <div>
                <h1 className='font-bold text-lg my-2'>{job?.title}</h1>
                <p className='text-sm text-gray-600'>{job?.description}</p>
            </div>
            <div className='flex items-center gap-2 mt-4'>
                <Badge className={'text-blue-700 font-bold'} variant="ghost">{job?.position} Positions</Badge>
                <Badge className={'text-[#F83002] font-bold'} variant="ghost">{job?.jobType}</Badge>
                <Badge className={'text-[#7209b7] font-bold'} variant="ghost">
                    {Number.isFinite(Number(job?.salary)) ? `${job.salary} LPA` : '—'}
                </Badge>
            </div>
            <div className='flex items-center gap-4 mt-4'>
                <Button onClick={() => navigate(`/jobs/${job?._id}`)} variant="outline">Details</Button>
                <Button
                    onClick={saveJobHandler}
                    className={`bg-[#7209b7] ${user?.profile?.savedJobs?.includes(job?._id) ? 'bg-green-600' : ''}`}
                >
                    {user?.profile?.savedJobs?.includes(job?._id) ? 'Saved' : 'Save For Later'}
                </Button>
            </div>
        </div>
    )
}

export default Job