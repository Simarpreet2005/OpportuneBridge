import React, { useEffect, useMemo, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage } from '../ui/avatar'
import { LogOut, User2, Menu, X, Moon, Sun } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import NotificationCenter from '../components/NotificationCenter'
import axios from 'axios'
import { USER_API_END_POINT } from '../utils/constant'
import { setUser } from '../store/authSlice'
import { toast } from 'sonner'

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const isSuperadmin = user?.role === "superadmin";
    const isAdminPanel = user?.role === "admin" || user?.role === "recruiter";
    const isStudent = user?.role === "student";

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    const toggleTheme = () => {
        const next = !document.documentElement.classList.contains("dark");
        document.documentElement.classList.toggle("dark", next);
        setIsDark(next);
        try {
            localStorage.setItem("theme", next ? "dark" : "light");
        } catch {
            // ignore
        }
    };

    const themeLabel = useMemo(() => (isDark ? "Switch to light theme" : "Switch to dark theme"), [isDark]);

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(null));
                navigate("/");
                toast.success(res.data.message);
                setIsMobileMenuOpen(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Logout failed");
        }
    }

    const handleProtectedNavigation = (path, message) => {
        if (!user) {
            toast.error(message);
            navigate("/login");
            return;
        }
        navigate(path);
    }

    return (
        <div className='bg-white dark:bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 h-16 transition-all duration-300'>
            <div className='page-container flex items-center justify-between h-full'>
                <div>
                    <Link to="/">
                        <h1 className='text-2xl font-bold font-sans tracking-tight'>Opportune<span className='text-primary'>Bridge</span></h1>
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className='hidden md:flex items-center gap-12'>
                    <ul className='flex font-medium items-center gap-4 text-foreground/80'>
                        {
                            isSuperadmin ? (
                                <>
                                    <li><Link to="/superadmin/dashboard"><Button className="rounded-full bg-primary hover:bg-primary-hover text-primary-foreground">Dashboard</Button></Link></li>
                                    <li><Link to="/superadmin/users"><Button className="rounded-full bg-primary hover:bg-primary-hover text-primary-foreground">Users</Button></Link></li>
                                    <li><Link to="/superadmin/analytics"><Button className="rounded-full bg-primary hover:bg-primary-hover text-primary-foreground">Analytics</Button></Link></li>
                                </>
                            ) : isAdminPanel ? (
                                <>
                                    <li><Link to="/admin/dashboard"><Button className="rounded-full bg-primary hover:bg-primary-hover text-primary-foreground">Dashboard</Button></Link></li>
                                    <li><Link to="/admin/companies"><Button className="rounded-full bg-primary hover:bg-primary-hover text-primary-foreground">Companies</Button></Link></li>
                                    <li><Link to="/admin/jobs"><Button className="rounded-full bg-primary hover:bg-primary-hover text-primary-foreground">Jobs</Button></Link></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/"><Button className="rounded-full bg-primary hover:bg-primary-hover text-primary-foreground">Home</Button></Link></li>
                                    {isStudent && <li><Link to="/dashboard"><Button className="rounded-full bg-primary hover:bg-primary-hover text-primary-foreground">Dashboard</Button></Link></li>}
                                    <li><Link to="/jobs"><Button className="rounded-full bg-primary hover:bg-primary-hover text-primary-foreground">Find Jobs</Button></Link></li>
                                    <li onClick={() => handleProtectedNavigation("/saved-jobs", "Please login to view saved jobs")}><Link to="/saved-jobs"><Button className="rounded-full bg-primary hover:bg-primary-hover text-primary-foreground">Saved Jobs</Button></Link></li>
                                    <li onClick={() => handleProtectedNavigation("/career-assistant", "Please login to access career assistant")}><Link to="/career-assistant"><Button className="rounded-full bg-primary hover:bg-primary-hover text-primary-foreground">Career Assistant</Button></Link></li>
                                </>
                            )
                        }
                    </ul>
                    {
                        !user ? (
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full"
                                    onClick={toggleTheme}
                                    aria-label={themeLabel}
                                    title={themeLabel}
                                >
                                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                                </Button>
                                <Link to="/login"><Button variant="outline" className="rounded-full px-6">Login</Button></Link>
                                <Link to="/signup"><Button className="rounded-full px-6">Signup</Button></Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full"
                                    onClick={toggleTheme}
                                    aria-label={themeLabel}
                                    title={themeLabel}
                                >
                                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                                </Button>
                                <NotificationCenter />
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Avatar className="cursor-pointer border border-border transition-transform hover:scale-105">
                                            {user?.profile?.profilePhoto ? (
                                                <AvatarImage src={user.profile.profilePhoto} alt="@user" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-semibold">
                                                    {user?.fullname?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </Avatar>
                                    </PopoverTrigger>
                                <PopoverContent className="w-80 border-border bg-card shadow-xl rounded-xl mr-4">
                                    <div className=''>
                                        <div className='flex gap-3 space-y-2 items-center mb-4'>
                                            <Avatar className="cursor-pointer border border-border w-10 h-10">
                                                {user?.profile?.profilePhoto ? (
                                                    <AvatarImage src={user.profile.profilePhoto} alt="@user" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-semibold text-xs">
                                                        {user?.fullname?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </Avatar>
                                            <div>
                                                <h4 className='font-bold text-lg leading-none'>{user?.fullname}</h4>
                                                <p className='text-sm text-muted-foreground line-clamp-1'>{user?.profile?.bio || "No bio yet"}</p>
                                            </div>
                                        </div>
                                        <div className='flex flex-col space-y-1 text-foreground'>
                                            {
                                                user && (
                                                    <div className='flex w-full items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-lg transition-colors group'>
                                                        <User2 className='w-4 h-4 text-muted-foreground group-hover:text-primary' />
                                                        <Link to="/profile" className='text-sm font-medium flex-1'>View Profile</Link>
                                                    </div>
                                                )
                                            }

                                            <div className='flex w-full items-center gap-2 cursor-pointer hover:bg-destructive/10 p-2 rounded-lg transition-colors group'>
                                                <LogOut className='w-4 h-4 text-muted-foreground group-hover:text-destructive' />
                                                <span onClick={logoutHandler} className='text-sm font-medium flex-1'>Logout</span>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            </div>
                        )
                    }
                </div>

                {/* Mobile Menu Toggle */}
                <div className='md:hidden flex items-center'>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full mr-1"
                        onClick={toggleTheme}
                        aria-label={themeLabel}
                        title={themeLabel}
                    >
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className='md:hidden absolute top-16 left-0 w-full bg-background border-b border-border p-4 shadow-xl animate-in slide-in-from-top-2'>
                    <div className='flex flex-col space-y-4'>
                        {
                            isSuperadmin ? (
                                <>
                                    <Link to="/superadmin/dashboard" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                                    <Link to="/superadmin/users" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Users</Link>
                                    <Link to="/superadmin/analytics" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Analytics</Link>
                                </>
                            ) : isAdminPanel ? (
                                <>
                                    <Link to="/admin/dashboard" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                                    <Link to="/admin/companies" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Companies</Link>
                                    <Link to="/admin/jobs" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Jobs</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                                    {isStudent && <Link to="/dashboard" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>}
                                    <Link to="/jobs" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Find Jobs</Link>
                                    <Link to="/saved-jobs" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => { handleProtectedNavigation("/saved-jobs", "Please login to view saved jobs"); setIsMobileMenuOpen(false); }}>Saved Jobs</Link>
                                    <Link to="/career-assistant" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => { handleProtectedNavigation("/career-assistant", "Please login to access career assistant"); setIsMobileMenuOpen(false); }}>Career Assistant</Link>
                                </>
                            )
                        }
                        {!user ? (
                            <div className='flex flex-col gap-3 mt-4'>
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}><Button variant="outline" className="w-full rounded-full">Login</Button></Link>
                                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}><Button className="w-full rounded-full">Signup</Button></Link>
                            </div>
                        ) : (
                            <div className='flex flex-col gap-3 mt-4'>
                                <div className='flex items-center gap-3 mb-2'>
                                    <Avatar className="w-8 h-8">
                                        {user?.profile?.profilePhoto ? (
                                            <AvatarImage src={user.profile.profilePhoto} alt="@user" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-semibold text-xs">
                                                {user?.fullname?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </Avatar>
                                    <span className='font-bold'>{user?.fullname}</span>
                                </div>
                                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}><Button variant="outline" className="w-full rounded-full">View Profile</Button></Link>
                                <Button variant="destructive" className="w-full rounded-full" onClick={logoutHandler}>Logout</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    )
}

export default Navbar
