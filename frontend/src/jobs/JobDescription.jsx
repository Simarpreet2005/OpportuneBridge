import React, { useEffect, useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '../utils/constant';
import { setSingleJob } from '../store/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const [matchData, setMatchData] = useState(null);
    const [loadingMatch, setLoadingMatch] = useState(false);

    const applyJobHandler = async () => {
        try {
            const res = await axios.post(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {}, { withCredentials: true });

            if (res.data.success) {
                setIsApplied(true);
                const updatedSingleJob = { ...singleJob, applications: [...(singleJob?.applications || []), { applicant: user?._id }] }
                dispatch(setSingleJob(updatedSingleJob));
                queryClient.invalidateQueries({ queryKey: ['jobs'] });
                queryClient.invalidateQueries({ queryKey: ['appliedJobs'] });
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to apply for job");
        }
    }

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application => application.applicant === user?._id));
                }
            } catch (error) {
                // silently ignore — job fetch failures are non-critical
            }
        }

        fetchSingleJob();
    }, [jobId, dispatch]);

    const fetchMatchData = async () => {
        if (!user || !jobId) return;
        setLoadingMatch(true);
        try {
            const res = await axios.get(`${JOB_API_END_POINT}/match/${jobId}`, { withCredentials: true });
            if (res.data.success) {
                setMatchData(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMatch(false);
        }
    };

    useEffect(() => {
        fetchMatchData();
    }, [jobId, user]);

    return (
        <div className="page-container page-padding space-y-6">
            <Card>
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                                {singleJob?.title || "Job details"}
                            </h1>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">{singleJob?.position} Positions</Badge>
                                {singleJob?.jobType ? <Badge variant="outline">{singleJob.jobType}</Badge> : null}
                                <Badge variant="secondary">
                                    {Number.isFinite(Number(singleJob?.salary)) ? `${singleJob.salary} LPA` : 'Salary —'}
                                </Badge>
                            </div>
                        </div>
                        <Button
                            onClick={isApplied ? undefined : applyJobHandler}
                            disabled={isApplied}
                            variant={isApplied ? "secondary" : "default"}
                        >
                            {isApplied ? 'Applied' : 'Apply now'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Job details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Location</p>
                                <p className="text-sm font-medium">{singleJob?.location || "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Experience</p>
                                <p className="text-sm font-medium">{singleJob?.experienceLevel ?? singleJob?.experience ?? "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Applicants</p>
                                <p className="text-sm font-medium">{singleJob?.applications?.length ?? 0}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Posted</p>
                                <p className="text-sm font-medium">
                                    {singleJob?.createdAt ? singleJob.createdAt.split("T")[0] : "—"}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Description</p>
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                                {singleJob?.description || "—"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Required skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {singleJob?.requirements && singleJob.requirements.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {singleJob.requirements.map((skill, index) => (
                                    <Badge key={index} variant="secondary">{skill}</Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No specific skills required.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Career insights & match</CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingMatch ? (
                        <div className="space-y-6">
                            <Skeleton className="h-8 w-40" />
                            <Skeleton className="h-24 w-full" />
                            <div className="grid gap-4 md:grid-cols-2">
                                <Skeleton className="h-36 w-full" />
                                <Skeleton className="h-36 w-full" />
                            </div>
                        </div>
                    ) : matchData ? (
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="text-2xl font-semibold tracking-tight">
                                    {matchData.matchScore}%
                                </div>
                                <Badge
                                    variant="outline"
                                    className={
                                        matchData.matchScore >= 70
                                            ? "border-success/30 bg-success/10 text-success"
                                            : matchData.matchScore >= 40
                                                ? "border-warning/30 bg-warning/10 text-warning-foreground"
                                                : "border-destructive/30 bg-destructive/10 text-destructive"
                                    }
                                >
                                    Match score
                                </Badge>
                            </div>

                            {matchData.aiExplanation ? (
                                <div className="rounded-2xl border border-border/70 bg-secondary/30 p-5">
                                    <p className="text-sm font-medium">Career insights</p>
                                    <div className="mt-2 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                                        {matchData.aiExplanation}
                                    </div>
                                </div>
                            ) : matchData.strengths && matchData.strengths.length > 0 ? (
                                <div className="rounded-2xl border border-border/70 bg-secondary/30 p-5">
                                    <p className="text-sm font-medium">Career insights</p>
                                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                        Based on the analysis, your profile stands out because: {matchData.strengths.join(", ")}.
                                    </p>
                                </div>
                            ) : null}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-success/20 bg-success/5 p-5">
                                    <p className="text-sm font-medium">Strong skills</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {matchData.matchedSkills?.length > 0 ? (
                                            matchData.matchedSkills.map((skill, index) => (
                                                <Badge key={index} variant="outline" className="border-success/30 bg-success/10 text-success">
                                                    {skill}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No matching skills found.</p>
                                        )}
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
                                    <p className="text-sm font-medium">Missing skills</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {matchData.missingSkills?.length > 0 ? (
                                            matchData.missingSkills.map((skill, index) => (
                                                <Badge key={index} variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                                                    {skill}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">You have all the required skills.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border/70 bg-secondary/30 p-8 text-center">
                            <p className="text-sm text-muted-foreground">Sign in to see your personalized match score.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default JobDescription
