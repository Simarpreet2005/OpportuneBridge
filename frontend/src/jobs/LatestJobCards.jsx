import React from 'react'
import { Badge } from '../ui/badge'
import { useNavigate } from 'react-router-dom'
import { Card } from '../ui/card'
import { MapPin } from 'lucide-react'

const LatestJobCards = ({ job }) => {
    const navigate = useNavigate();
    return (
        <Card
            onClick={() => navigate(`/jobs/${job._id}`)}
            className="cursor-pointer hover-lift border-border bg-white dark:bg-card"
        >
            <div className="p-5">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                    <div className="min-w-0">
                        <p className="font-medium leading-none truncate">{job?.company?.name}</p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{job?.location || "Location not specified"}</span>
                        </div>
                    </div>
                    <div className="h-10 w-10 rounded-xl border border-border/70 bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                        {job?.company?.logo ? (
                            <img src={job.company.logo} alt={job.company.name} className="h-full w-full object-contain p-1" />
                        ) : (
                            <span className="text-sm font-semibold text-muted-foreground">
                                {job?.company?.name?.[0]?.toUpperCase() || "C"}
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-4 pb-4 border-b border-border">
                    <h3 className="text-base font-semibold tracking-tight leading-snug line-clamp-2">{job?.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{job?.description}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{job?.position} Positions</Badge>
                    {job?.jobType ? <Badge variant="outline">{job.jobType}</Badge> : null}
                    <Badge variant="secondary">
                        {Number.isFinite(Number(job?.salary)) ? `${job.salary} LPA` : 'Salary —'}
                    </Badge>
                </div>
            </div>
        </Card>
    )
}

export default LatestJobCards

