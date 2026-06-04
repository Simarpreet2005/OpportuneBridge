import React, { useEffect, useState } from 'react'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { RadioGroup } from '../../ui/radio-group'
import { Button } from '../../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '../../utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setUser } from '../../store/authSlice'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'

const Signup = () => {

    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "student",
        file: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const { loading, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }
    const changeFileHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                toast.error("File size exceeds 10MB limit");
                e.target.value = ""; // Clear the file input
                setInput({ ...input, file: "" });
                return;
            }
            const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
            if (!allowedTypes.includes(file.type)) {
                toast.error("Invalid file type. Allowed: JPEG, PNG, WebP");
                e.target.value = ""; // Clear the file input
                setInput({ ...input, file: "" });
                return;
            }
        }
        setInput({ ...input, file: file || "" });
    }
    const submitHandler = async (e) => {
        e.preventDefault();
        
        // Phone validation
        if (input.phoneNumber.length < 10) {
            toast.error("Phone number must be at least 10 digits");
            return;
        }
        
        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(input.password)) {
            toast.error("Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character");
            return;
        }
        
        const formData = new FormData();    //formdata object
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("password", input.password);
        formData.append("role", input.role);
        if (input.file) {
            formData.append("file", input.file);
        }

        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                if (res.data.user.role === 'recruiter') {
                    navigate("/admin/dashboard");
                } else if (res.data.user.role === 'admin') {
                    navigate("/admin/dashboard");
                } else if (res.data.user.role === 'superadmin') {
                    navigate("/superadmin/dashboard");
                } else {
                    navigate("/dashboard");
                }
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Signup failed");
        } finally {
            dispatch(setLoading(false));
        }
    }

    useEffect(() => {
        if (!user) return;
        if (user.role === 'recruiter') {
            navigate("/admin/dashboard");
        } else if (user.role === 'admin') {
            navigate("/admin/dashboard");
        } else if (user.role === 'superadmin') {
            navigate("/superadmin/dashboard");
        } else {
            navigate("/dashboard");
        }
    }, [navigate, user])
    const googleLoginHandler = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                dispatch(setLoading(true));
                const res = await axios.post(`${USER_API_END_POINT}/google-login`,
                    { googleToken: tokenResponse.access_token, role: input.role || 'student' },
                    { withCredentials: true }
                );
                if (res.data.success) {
                    dispatch(setUser(res.data.user));
                    if (res.data.user.role === 'recruiter') {
                        navigate("/admin/dashboard");
                    } else if (res.data.user.role === 'admin') {
                        navigate("/admin/dashboard");
                    } else if (res.data.user.role === 'superadmin') {
                        navigate("/superadmin/dashboard");
                    } else {
                        navigate("/dashboard");
                    }
                    toast.success(res.data.message);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || error.message || "Google Signup failed.");
            } finally {
                dispatch(setLoading(false));
            }
        },
        onError: () => toast.error("Google Signup Failed")
    });

    return (
        <div className="min-h-screen">
            <div className="page-container page-padding flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="pb-4">
                        <div className="text-center">
                            <CardTitle className="text-3xl tracking-tight">Create account</CardTitle>
                            <p className="muted mt-2 text-sm">Join OpportuneBridge to start your journey</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm">Full name</Label>
                                    <Input
                                        type="text"
                                        value={input.fullname}
                                        name="fullname"
                                        onChange={changeEventHandler}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">Email</Label>
                                    <Input
                                        type="email"
                                        value={input.email}
                                        name="email"
                                        onChange={changeEventHandler}
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">Phone</Label>
                                    <Input
                                        type="text"
                                        value={input.phoneNumber}
                                        name="phoneNumber"
                                        onChange={changeEventHandler}
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={input.password}
                                            name="password"
                                            onChange={changeEventHandler}
                                            placeholder="Create a strong password"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-sm">Continue as</Label>
                                    <RadioGroup className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="role"
                                                id="r1"
                                                value="student"
                                                checked={input.role === 'student'}
                                                onChange={changeEventHandler}
                                                className="cursor-pointer h-4 w-4 accent-[var(--primary)]"
                                            />
                                            <Label htmlFor="r1">Student</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="role"
                                                id="r2"
                                                value="recruiter"
                                                checked={input.role === 'recruiter'}
                                                onChange={changeEventHandler}
                                                className="cursor-pointer h-4 w-4 accent-[var(--primary)]"
                                            />
                                            <Label htmlFor="r2">Recruiter</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm">Profile photo</Label>
                                    <div className="flex justify-center">
                                        <Input
                                            accept="image/*"
                                            type="file"
                                            onChange={changeFileHandler}
                                            className="cursor-pointer file:mr-4 file:rounded-full file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-foreground hover:file:bg-secondary/80 text-transparent file:text-foreground"
                                        />
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <Button className="w-full" disabled>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                                </Button>
                            ) : (
                                <Button type="submit" className="w-full">Create account</Button>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-border" />
                                <span className="text-xs text-muted-foreground">OR</span>
                                <div className="h-px flex-1 bg-border" />
                            </div>

                            <Button
                                variant="outline"
                                className="w-full flex gap-2 items-center"
                                type="button"
                                onClick={() => googleLoginHandler()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" /><path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" /><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" /><path fill="#1976D2" d="M43.611 20.083A19.556 19.556 0 0 1 44 24c0 1.258-.124 2.486-.356 3.67l-7.733-1.64c.06-.667.089-1.342.089-2.03c0-1.332-.232-2.607-.655-3.788l7.633-1.343z" /></svg>
                                Continue with Google
                            </Button>

                            <p className="text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link to="/login" className="text-primary hover:underline">
                                    Login
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default Signup
