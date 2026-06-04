
import React, { useState } from 'react'
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

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
        role: "student",
    });
    const [showPassword, setShowPassword] = useState(false);
    const { loading } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
                headers: {
                    "Content-Type": "application/json"
                },
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
            toast.error(error.response?.data?.message || error.message || "Login failed");
        } finally {
            dispatch(setLoading(false));
        }
    }

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
                toast.error(error.response?.data?.message || error.message || "Google Login failed.");
            } finally {
                dispatch(setLoading(false));
            }
        },
        onError: () => toast.error("Google Login Failed")
    });

    return (
        <div className="min-h-screen">
            <div className="page-container page-padding flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="pb-4">
                        <div className="text-center">
                            <CardTitle className="text-3xl tracking-tight">Login</CardTitle>
                            <p className="muted mt-2 text-sm">Welcome back to OpportuneBridge</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div className="space-y-4">
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
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm">Password</Label>
                                        <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={input.password}
                                            name="password"
                                            onChange={changeEventHandler}
                                            placeholder="Enter your password"
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
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="role"
                                            id="r4"
                                            value="superadmin"
                                            checked={input.role === 'superadmin'}
                                            onChange={changeEventHandler}
                                            className="cursor-pointer h-4 w-4 accent-[var(--primary)]"
                                        />
                                        <Label htmlFor="r4">Super Admin</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {loading ? (
                                <Button className="w-full" disabled>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                                </Button>
                            ) : (
                                <Button type="submit" className="w-full">Login</Button>
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
                                Don&apos;t have an account?{" "}
                                <Link to="/signup" className="text-primary hover:underline">
                                    Signup
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default Login

