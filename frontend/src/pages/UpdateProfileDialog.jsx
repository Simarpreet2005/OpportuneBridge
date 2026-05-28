import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Loader2, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import api from '../services/api'
import { setUser } from '../store/authSlice'
import { toast } from 'sonner'

const UpdateProfileDialog = ({ open, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);

    const [input, setInput] = useState({
        fullname: user?.fullname || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        bio: user?.profile?.bio || "",
        skills: user?.profile?.skills?.join(",") || "",
        resume: user?.profile?.resume || "",
        profilePhoto: user?.profile?.profilePhoto || ""
    });
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (10MB limit)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error("File size exceeds 10MB limit");
                e.target.value = "";
                return;
            }
            // Validate file type based on field name
            if (e.target.name === "profilePhoto") {
                const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
                if (!allowedTypes.includes(file.type)) {
                    toast.error("Invalid file type. Allowed: JPEG, PNG, WebP");
                    e.target.value = "";
                    return;
                }
            }
            if (e.target.name === "resume") {
                const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
                if (!allowedTypes.includes(file.type)) {
                    toast.error("Invalid file type. Allowed: PDF, DOC, DOCX");
                    e.target.value = "";
                    return;
                }
            }
        }
        setInput({ ...input, [e.target.name]: file })
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("bio", input.bio);
        formData.append("skills", input.skills);
        if (input.resume && typeof input.resume !== 'string') {
            formData.append("resume", input.resume);
        }
        if (input.profilePhoto && typeof input.profilePhoto !== 'string') {
            formData.append("profilePhoto", input.profilePhoto);
        }
        try {
            setLoading(true);
            // Do NOT set Content-Type header - axios handles it automatically for FormData
            const res = await api.post("/user/profile/update", formData);
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error("Profile Update Error:", error);
            const errorMessage = error.response?.data?.message || "An unexpected error occurred during update.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
        setOpen(false);
    }



    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px] bg-card">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle>Update Profile</DialogTitle>
                        </div>
                        <DialogDescription>
                            Make changes to your profile here. Click update when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitHandler}>
                        <div className='grid gap-4 py-4'>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input
                                    id="name"
                                    name="fullname"
                                    type="text"
                                    value={input.fullname}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={input.email}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="number" className="text-right">Number</Label>
                                <Input
                                    id="number"
                                    name="phoneNumber"
                                    value={input.phoneNumber}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="bio" className="text-right">Bio</Label>
                                <Input
                                    id="bio"
                                    name="bio"
                                    value={input.bio}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="skills" className="text-right">Skills</Label>
                                <Input
                                    id="skills"
                                    name="skills"
                                    value={input.skills}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="profilePhoto" className="text-right">Photo</Label>
                                <Input
                                    id="profilePhoto"
                                    name="profilePhoto"
                                    type="file"
                                    accept="image/*"
                                    onChange={fileChangeHandler}
                                    className="col-span-3"
                                />
                            </div>
                            {
                                user?.role === 'student' && (
                                    <div className='grid grid-cols-4 items-center gap-4'>
                                        <Label htmlFor="resume" className="text-right">Resume</Label>
                                        <Input
                                            id="resume"
                                            name="resume"
                                            type="file"
                                            accept="application/pdf"
                                            onChange={fileChangeHandler}
                                            className="col-span-3"
                                        />
                                    </div>
                                )
                            }
                        </div>
                        <DialogFooter>
                            {
                                loading ? <Button className="w-full my-4"> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full my-4">Update</Button>
                            }
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default UpdateProfileDialog


