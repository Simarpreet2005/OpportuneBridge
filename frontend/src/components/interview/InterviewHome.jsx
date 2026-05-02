import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../shared/Navbar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Code2, PlusCircle, LogIn, Sparkles } from 'lucide-react';
import Footer from '../shared/Footer';

const InterviewHome = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState(user?.fullname || '');

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('Generated a new room ID');
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('ROOM ID & username is required');
            return;
        }

      
        navigate(`/interview/room/${roomId}`, {
            state: {
                username,
            },
        });
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };

    return (
        <div className='min-h-screen flex flex-col'>
            <div className='flex-1 flex items-center justify-center p-4'>
                <div className='bg-white shadow-2xl rounded-[2.5rem] overflow-hidden max-w-5xl w-full flex flex-col md:flex-row border border-gray-100'>
                    {/* Left Side: Illustration & Branding */}
                    <div className='md:w-1/2 bg-primary p-12 text-white flex flex-col justify-between relative overflow-hidden'>
                        <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl' />
                        <div className='absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl' />

                        <div>
                            <div className='flex items-center gap-3 mb-8'>
                                <div className='bg-white p-2 rounded-2xl'>
                                    <Code2 className='w-8 h-8 text-primary' />
                                </div>
                                <h1 className='text-3xl font-extrabold tracking-tight'>OpportuneBridge</h1>
                            </div>
                            <h2 className='text-5xl font-bold leading-tight mb-6'>Collaborative Coding Interviews.</h2>
                            <p className='text-xl text-white/80 leading-relaxed max-w-md'>
                                Real-time code editing, peer programming, and technical assessments made simple.
                            </p>
                        </div>

                        <div className='bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 mt-12'>
                            <div className='flex items-center gap-2 mb-2'>
                                <Sparkles className='w-5 h-5 text-yellow-300' />
                                <span className='font-bold uppercase tracking-widest text-xs'>Powered by AI</span>
                            </div>
                            <p className='text-sm text-white/90'>Our environment is optimized for technical screening with built-in syntax support and multi-user sync.</p>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className='md:w-1/2 p-12 flex flex-col justify-center'>
                        <div className='mb-10'>
                            <h3 className='text-3xl font-bold text-gray-900 mb-2'>Join an Interview</h3>
                            <p className='text-gray-500'>Enter the Room ID shared by your recruiter or create a new one.</p>
                        </div>

                        <div className='space-y-6'>
                            <div className='space-y-2'>
                                <Label htmlFor="roomId" className="text-gray-700 font-semibold">Invitation Room ID</Label>
                                <Input
                                    id="roomId"
                                    type="text"
                                    className="h-14 rounded-2xl border-gray-200 bg-gray-50 focus:bg-white transition-all text-lg"
                                    placeholder="PASTE ROOM ID"
                                    onChange={(e) => setRoomId(e.target.value)}
                                    value={roomId}
                                    onKeyUp={handleInputEnter}
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor="username" className="text-gray-700 font-semibold">Your Full Name</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    className="h-14 rounded-2xl border-gray-200 bg-gray-50 focus:bg-white transition-all text-lg"
                                    placeholder="ENTER USERNAME"
                                    onChange={(e) => setUsername(e.target.value)}
                                    value={username}
                                    onKeyUp={handleInputEnter}
                                />
                            </div>

                            <Button onClick={joinRoom} className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
                                <LogIn className='w-5 h-5 mr-2' /> Join Interview Room
                            </Button>

                            <div className='pt-4 text-center'>
                                <span className='text-gray-500'>Don't have an invite? </span>
                                <button onClick={createNewRoom} className='text-primary font-bold hover:underline inline-flex items-center'>
                                    <PlusCircle className='w-4 h-4 mr-1' /> Create new room
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default InterviewHome;
