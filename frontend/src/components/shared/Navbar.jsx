import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage } from '../ui/avatar'
import { LogOut, User2, Menu, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    return (
        <div className='bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 h-16 transition-all duration-300'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-full px-4'>
                <div>
                    <Link to="/">
                        <h1 className='text-2xl font-bold font-sans tracking-tight'>Opportune<span className='text-primary'>Bridge</span></h1>
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className='hidden md:flex items-center gap-12'>
                    <ul className='flex font-medium items-center gap-6 text-foreground/80'>
                        {
                            user && user.role === 'superadmin' ? (
                                <>
                                    <li className='hover:text-primary transition-colors cursor-pointer'><Link to="/superadmin/dashboard">Dashboard</Link></li>
                                    <li className='hover:text-primary transition-colors cursor-pointer'><Link to="/superadmin/users">Users</Link></li>
                                    <li className='hover:text-primary transition-colors cursor-pointer'><Link to="/superadmin/analytics">Analytics</Link></li>
                                    <li className='hover:text-primary transition-colors cursor-pointer'><Link to="/admin/challenges/create">Post Challenge</Link></li>
                                </>
                            ) : user && user.role === 'recruiter' ? (
                                <>
                                    <li className='hover:text-primary transition-colors cursor-pointer'><Link to="/admin/dashboard">Dashboard</Link></li>
                                    <li className='hover:text-primary transition-colors cursor-pointer'><Link to="/admin/companies">Companies</Link></li>
                                    <li className='hover:text-primary transition-colors cursor-pointer'><Link to="/admin/jobs">Jobs</Link></li>
                                    <li className='hover:text-primary transition-colors cursor-pointer'><Link to="/admin/challenges/create">Post Challenge</Link></li>
                                </>
                            ) : (
                                <>
                                    <li className='hover:text-primary transition-colors cursor-pointer'><Link to="/">Home</Link></li>
                                    <li className='hover:text-primary transition-colors cursor-pointer'><Link to="/challenges">Challenges</Link></li>
                                    <li className='hover:text-primary transition-colors cursor-pointer'><Link to="/jobs">Find Jobs</Link></li>
                                    <li className='hover:text-primary transition-colors cursor-pointer'><Link to="/resumes">Resume</Link></li>
                                    <li className='hover:text-primary transition-colors cursor-pointer'><Link to="/interview">Interviews</Link></li>
                                    <li className='hover:text-primary transition-colors cursor-pointer'><Link to="/mock-interview">Mock-Practice</Link></li>
                                    <li className='hover:text-primary transition-colors cursor-pointer'><Link to="/community">Community</Link></li>
                                </>
                            )
                        }
                    </ul>
                    {
                        !user ? (
                            <div className='flex items-center gap-2'>
                                <Link to="/login"><Button variant="outline" className="rounded-full px-6">Login</Button></Link>
                                <Link to="/signup"><Button className="bg-primary hover:bg-primary/90 rounded-full px-6">Signup</Button></Link>
                            </div>
                        ) : (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Avatar className="cursor-pointer border border-border transition-transform hover:scale-105">
                                        <AvatarImage src={user?.profile?.profilePhoto || "https://github.com/shadcn.png"} alt="@user" />
                                    </Avatar>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 border-border bg-card shadow-xl rounded-xl mr-4">
                                    <div className=''>
                                        <div className='flex gap-3 space-y-2 items-center mb-4'>
                                            <Avatar className="cursor-pointer border border-border w-10 h-10">
                                                <AvatarImage src={user?.profile?.profilePhoto || "https://github.com/shadcn.png"} alt="@user" />
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
                        )
                    }
                </div>

                {/* Mobile Menu Toggle */}
                <div className='md:hidden flex items-center'>
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
                            user && user.role === 'superadmin' ? (
                                <>
                                    <Link to="/superadmin/dashboard" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                                    <Link to="/superadmin/users" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Users</Link>
                                    <Link to="/superadmin/analytics" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Analytics</Link>
                                </>
                            ) : user && user.role === 'recruiter' ? (
                                <>
                                    <Link to="/admin/dashboard" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                                    <Link to="/admin/companies" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Companies</Link>
                                    <Link to="/admin/jobs" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Jobs</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                                    <Link to="/challenges" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Challenges</Link>
                                    <Link to="/jobs" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Find Jobs</Link>
                                    <Link to="/community" className='text-lg font-medium py-2 border-b border-border/50' onClick={() => setIsMobileMenuOpen(false)}>Community</Link>
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
                                        <AvatarImage src={user?.profile?.profilePhoto} alt="@user" />
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