import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Bookmark, Loader2, MapPin } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../store/authSlice'
import axios from 'axios'
import { JOB_API_END_POINT } from '../utils/constant'
import { toast } from 'sonner'
import { Badge } from '../ui/badge'
import { useNavigate } from 'react-router-dom'
import { Card } from '../ui/card'

const Job = ({ job }) => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [matchData, setMatchData] = useState(null);
    const [loadingMatch, setLoadingMatch] = useState(false);

    // Lazy load match score only when user clicks "Why match?" button
    // Removed automatic API call to prevent Groq API exhaustion

    const saveJobHandler = async () => {
        if (!user) {
            toast.error("Please login to save jobs");
            navigate("/login");
            return;
        }
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
            toast.error(error.response?.data?.message || error.message || "Failed to save job");
        }
    }

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    }

    const isSaved = Boolean(user?.profile?.savedJobs?.includes(job?._id));
    const matchScore = matchData?.matchScore;

    return (
        <Card className="group h-full">
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        {daysAgoFunction(job?.createdAt) === 0 ? "Posted today" : `Posted ${daysAgoFunction(job?.createdAt)}d ago`}
                    </p>
                    <Button
                        onClick={saveJobHandler}
                        variant="ghost"
                        size="icon"
                        className={isSaved ? "text-success hover:text-success" : "text-muted-foreground hover:text-foreground"}
                        aria-label={isSaved ? "Saved" : "Save job"}
                    >
                        <Bookmark className="h-4 w-4" />
                    </Button>
                </div>

                <div className="mt-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl border border-border/70 bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                        {job?.company?.logo ? (
                            <img src={job.company.logo} alt={job.company.name} className="h-full w-full object-contain p-1" />
                        ) : (
                            <span className="text-sm font-semibold text-muted-foreground">
                                {job?.company?.name?.[0]?.toUpperCase() || "C"}
                            </span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium leading-none truncate">{job?.company?.name}</p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{job?.location || "Location not specified"}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="text-base font-semibold tracking-tight leading-snug line-clamp-2">{job?.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{job?.description}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{job?.position} Positions</Badge>
                    {job?.jobType ? <Badge variant="outline">{job.jobType}</Badge> : null}
                    <Badge variant="secondary">
                        {Number.isFinite(Number(job?.salary)) ? `${job.salary} LPA` : 'Salary —'}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-primary hover:text-primary/95"
                        onClick={() => navigate(`/jobs/${job?._id}`)}
                    >
                        View match details
                    </Button>
                </div>

                <div className="mt-5 flex items-center gap-3">
                    <Button onClick={() => navigate(`/jobs/${job?._id}`)} variant="outline" className="flex-1">
                        View details
                    </Button>
                    <Button onClick={saveJobHandler} variant={isSaved ? "secondary" : "default"} className="flex-1">
                        {isSaved ? "Saved" : "Save"}
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default Job


