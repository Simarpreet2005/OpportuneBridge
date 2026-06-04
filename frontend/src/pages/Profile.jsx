import React, { useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Button } from '../ui/button'
import { Contact, Mail, Pen } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Label } from '../ui/label'
import AppliedJobTable from '../dashboard/AppliedJobTable'
import UpdateProfileDialog from './UpdateProfileDialog'
import ResumeHistory from '../components/ResumeHistory'
import { useSelector } from 'react-redux'
import useGetAppliedJobs from '../hooks/useGetAppliedJobs'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'


const Profile = () => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);

    return (
        <div className="page-container page-padding space-y-6">
            <Card>
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20 md:h-24 md:w-24 border border-border/70">
                                <AvatarImage src={user?.profile?.profilePhoto} alt="profile" />
                                <AvatarFallback className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-semibold text-2xl md:text-3xl rounded-full">
                                    {user?.fullname?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight truncate">{user?.fullname}</h1>
                                <p className="muted mt-1 text-sm md:text-base">
                                    {user?.profile?.bio || "Add a short bio to help recruiters understand your profile."}
                                </p>
                                <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        <span className="truncate">{user?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Contact className="h-4 w-4" />
                                        <span className="truncate">{user?.phoneNumber}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button onClick={() => setOpen(true)} variant="outline" size="icon" aria-label="Edit profile">
                                <Pen className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {user?.role === 'student' && (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user?.profile?.skills?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.profile.skills.map((item, index) => (
                                        <Badge key={index} variant="secondary">{item}</Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No skills added yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Resume</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {user?.profile?.resume ? (
                                <a
                                    target="blank"
                                    href={user.profile.resume}
                                    className="text-primary hover:underline break-words"
                                >
                                    {user.profile.resumeOriginalName || "Download resume"}
                                </a>
                            ) : (
                                <p className="text-sm text-muted-foreground">No resume uploaded.</p>
                            )}
                            <Label className="text-xs text-muted-foreground">Upload a new version from Resume History.</Label>
                        </CardContent>
                    </Card>
                </div>
            )}

            {user?.role === 'student' && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Applied jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AppliedJobTable />
                    </CardContent>
                </Card>
            )}

            {user?.role === 'student' && <ResumeHistory />}
            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    )
}

export default Profile



