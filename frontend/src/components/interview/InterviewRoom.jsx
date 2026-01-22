import React, { useState, useRef, useEffect } from 'react';
import { initSocket } from '../../socket';
import ACTIONS from '../../utils/socketAction';
import { useParams, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import Editor from './Editor';
import { Button } from '../ui/button';
import { Avatar, AvatarImage } from '../ui/avatar';
import { LogOut, Copy, Users, Code2 } from 'lucide-react';

const InterviewRoom = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                navigate('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username || 'Anonymous',
            });

            // Listening for joined event
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                    }
                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );

            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.error(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        };
        init();
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current.off(ACTIONS.JOINED);
                socketRef.current.off(ACTIONS.DISCONNECTED);
            }
        };
    }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        navigate('/');
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className='flex flex-col h-screen bg-[#0f0f0f] text-white overflow-hidden'>
            <div className='flex h-full'>
                {/* Sidebar */}
                <div className='w-64 bg-[#1a1a1a] flex flex-col border-r border-gray-800'>
                    <div className='p-6 flex items-center gap-2 border-b border-gray-800'>
                        <div className='bg-primary p-1.5 rounded-lg'>
                            <Code2 className='w-6 h-6 text-white' />
                        </div>
                        <h1 className='font-bold text-xl'>OpportuneBridge</h1>
                    </div>

                    <div className='flex-1 overflow-y-auto p-4'>
                        <div className='flex items-center gap-2 mb-4 text-gray-400'>
                            <Users className='w-4 h-4' />
                            <span className='text-sm font-semibold uppercase tracking-wider'>Connected Users</span>
                        </div>
                        <div className='space-y-3'>
                            {clients.map((client) => (
                                <div key={client.socketId} className='flex items-center gap-3 bg-gray-800/50 p-2 rounded-xl border border-gray-700/50 transition-all hover:bg-gray-800'>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`https://avatar.iran.liara.run/username?username=${client.username}`} />
                                    </Avatar>
                                    <span className='text-sm font-medium truncate'>{client.username}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='p-4 space-y-2 border-t border-gray-800'>
                        <Button onClick={copyRoomId} variant="outline" className="w-full justify-start rounded-xl border-gray-700 bg-transparent hover:bg-gray-800 text-gray-300">
                            <Copy className='w-4 h-4 mr-2' /> Copy Room ID
                        </Button>
                        <Button onClick={leaveRoom} variant="destructive" className="w-full justify-start rounded-xl">
                            <LogOut className='w-4 h-4 mr-2' /> Leave Room
                        </Button>
                    </div>
                </div>

                {/* Editor Surface */}
                <div className='flex-1 relative'>
                    <Editor
                        socketRef={socketRef}
                        roomId={roomId}
                        onCodeChange={(code) => {
                            codeRef.current = code;
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default InterviewRoom;
