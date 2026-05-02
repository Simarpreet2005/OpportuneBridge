import React, { useState, useRef, useEffect } from 'react';
import { initSocket } from '../../socket';
import ACTIONS from '../../utils/socketAction';
import { useParams, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import Editor from './Editor';
import { Button } from '../ui/button';
import { Avatar, AvatarImage } from '../ui/avatar';
import { LogOut, Copy, Users, Code2, Video, Mic, VideoOff, MicOff, MessageSquare, Send } from 'lucide-react';
import { Input } from '../ui/input';

const InterviewRoom = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);

    // WebRTC & Chat State
    const [stream, setStream] = useState(null);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const myVideo = useRef();
    const peerConnections = useRef({});
    const remoteVideosContainer = useRef(null);
    const [messages, setMessages] = useState([]);
    const [chatMsg, setChatMsg] = useState("");
    const [showChat, setShowChat] = useState(false);

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

            // Setup Media
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(mediaStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Failed to get local stream", err);
                toast.error("Could not access camera/microphone. Please ensure permissions are granted.");
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
                        // Create Offer for new peer if I'm already in the room
                        if (socketId !== socketRef.current.id) {
                            createOffer(socketId);
                        }
                    }
                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );

            // WebRTC Signaling
            socketRef.current.on(ACTIONS.OFFER, handleReceiveOffer);
            socketRef.current.on(ACTIONS.ANSWER, handleReceiveAnswer);
            socketRef.current.on(ACTIONS.ICE_CANDIDATE, handleReceiveIceCandidate);

            // Chat
            socketRef.current.on(ACTIONS.CHAT_MESSAGE, ({ message, username }) => {
                setMessages(prev => [...prev, { username, message }]);
            });

            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.error(`${username} left the room.`);
                    setClients((prev) => prev.filter((client) => client.socketId !== socketId));
                    if (peerConnections.current[socketId]) {
                        peerConnections.current[socketId].close();
                        delete peerConnections.current[socketId];
                    }
                    const videoEl = document.getElementById(`video-${socketId}`);
                    if (videoEl) videoEl.remove();
                }
            );
        };
        init();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current.off(ACTIONS.JOINED);
                socketRef.current.off(ACTIONS.DISCONNECTED);
                socketRef.current.off(ACTIONS.OFFER);
                socketRef.current.off(ACTIONS.ANSWER);
                socketRef.current.off(ACTIONS.ICE_CANDIDATE);
                socketRef.current.off(ACTIONS.CHAT_MESSAGE);
            }
        };
    }, []);

    const createPeerConnection = (socketId) => {
        if (peerConnections.current[socketId]) {
            return peerConnections.current[socketId];
        }

        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit(ACTIONS.ICE_CANDIDATE, { to: socketId, candidate: event.candidate });
            }
        };

        peer.ontrack = (event) => {
            let videoEl = document.getElementById(`video-${socketId}`);
            if (!videoEl) {
                videoEl = document.createElement('video');
                videoEl.id = `video-${socketId}`;
                videoEl.autoplay = true;
                videoEl.playsInline = true;
                videoEl.className = "w-full rounded-lg border-2 border-gray-700 bg-black";
                if (remoteVideosContainer.current) {
                    remoteVideosContainer.current.appendChild(videoEl);
                }
            }
            if (videoEl.srcObject !== event.streams[0]) {
                 videoEl.srcObject = event.streams[0];
            }
        };

        if (stream) {
            stream.getTracks().forEach(track => {
                peer.addTrack(track, stream);
            });
        }

        peerConnections.current[socketId] = peer;
        return peer;
    };

    const createOffer = async (socketId) => {
        const peer = createPeerConnection(socketId);
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socketRef.current.emit(ACTIONS.OFFER, { to: socketId, offer });
    };

    const handleReceiveOffer = async ({ from, offer }) => {
        const peer = createPeerConnection(from);
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socketRef.current.emit(ACTIONS.ANSWER, { to: from, answer });
    };

    const handleReceiveAnswer = async ({ from, answer }) => {
        const peer = peerConnections.current[from];
        if (peer) {
            await peer.setRemoteDescription(new RTCSessionDescription(answer));
        }
    };

    const handleReceiveIceCandidate = async ({ from, candidate }) => {
        const peer = peerConnections.current[from];
        if (peer) {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(videoTrack.enabled);
            }
        }
    };

    const toggleAudio = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioOn(audioTrack.enabled);
            }
        }
    };

    const sendChat = (e) => {
        e.preventDefault();
        if (!chatMsg.trim()) return;
        const msgData = { roomId, message: chatMsg, username: location.state?.username || 'Anonymous' };
        socketRef.current.emit(ACTIONS.CHAT_MESSAGE, msgData);
        setMessages(prev => [...prev, { username: 'You', message: chatMsg }]);
        setChatMsg("");
    };

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
        }
    }

    function leaveRoom() {
        navigate('/');
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className='flex flex-col h-screen text-white overflow-hidden'>
            <div className='flex h-full'>
                {/* Sidebar */}
                <div className='w-64 bg-[#1a1a1a] flex flex-col border-r border-gray-800 z-10'>
                    <div className='p-6 flex items-center gap-2 border-b border-gray-800'>
                        <div className='bg-primary p-1.5 rounded-lg'>
                            <Code2 className='w-6 h-6 text-white' />
                        </div>
                        <h1 className='font-bold text-xl'>OpportuneBridge</h1>
                    </div>

                    <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-4 hidden-scrollbar'>
                        <div>
                            <div className='flex items-center gap-2 mb-4 text-gray-400'>
                                <Users className='w-4 h-4' />
                                <span className='text-sm font-semibold uppercase tracking-wider'>Connected</span>
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

                        {/* Videos */}
                        <div className='mt-auto space-y-4'>
                            <div className='relative'>
                                <video playsInline muted ref={myVideo} autoPlay className="w-full rounded-lg border-2 border-gray-700 bg-black transform scale-x-[-1]" />
                                <div className='absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2'>
                                    <Button size="icon" variant={isVideoOn ? "default" : "destructive"} onClick={toggleVideo} className="rounded-full h-8 w-8">
                                        {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                                    </Button>
                                    <Button size="icon" variant={isAudioOn ? "default" : "destructive"} onClick={toggleAudio} className="rounded-full h-8 w-8">
                                        {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div ref={remoteVideosContainer} className="space-y-2 max-h-[300px] overflow-y-auto hidden-scrollbar">
                                {/* Remote videos injected here */}
                            </div>
                        </div>
                    </div>

                    <div className='p-4 space-y-2 border-t border-gray-800 bg-[#1a1a1a]'>
                        <Button onClick={() => setShowChat(!showChat)} variant={showChat ? "default" : "outline"} className="w-full justify-start rounded-xl border-gray-700 bg-transparent hover:bg-gray-800 text-gray-300">
                            <MessageSquare className='w-4 h-4 mr-2' /> Chat
                        </Button>
                        <Button onClick={copyRoomId} variant="outline" className="w-full justify-start rounded-xl border-gray-700 bg-transparent hover:bg-gray-800 text-gray-300">
                            <Copy className='w-4 h-4 mr-2' /> Copy Room ID
                        </Button>
                        <Button onClick={leaveRoom} variant="destructive" className="w-full justify-start rounded-xl">
                            <LogOut className='w-4 h-4 mr-2' /> Leave Room
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className='flex-1 relative flex overflow-hidden'>
                    <div className={`flex-1 transition-all ${showChat ? 'mr-80' : ''}`}>
                        <Editor
                            socketRef={socketRef}
                            roomId={roomId}
                            onCodeChange={(code) => {
                                codeRef.current = code;
                            }}
                        />
                    </div>
                    
                    {/* Chat Panel */}
                    {showChat && (
                        <div className='absolute right-0 top-0 bottom-0 w-80 bg-[#1a1a1a] border-l border-gray-800 flex flex-col z-20 animate-in slide-in-from-right-8 duration-300'>
                            <div className='p-4 border-b border-gray-800 flex justify-between items-center'>
                                <h3 className='font-bold flex items-center gap-2'><MessageSquare className='w-4 h-4'/> Room Chat</h3>
                            </div>
                            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex flex-col ${m.username === 'You' ? 'items-end' : 'items-start'}`}>
                                        <span className='text-xs text-gray-500 mb-1'>{m.username}</span>
                                        <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${m.username === 'You' ? 'bg-primary text-white rounded-tr-sm' : 'bg-gray-800 text-gray-200 rounded-tl-sm'}`}>
                                            {m.message}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={sendChat} className='p-4 border-t border-gray-800 flex gap-2'>
                                <Input 
                                    value={chatMsg} 
                                    onChange={(e) => setChatMsg(e.target.value)} 
                                    placeholder="Type a message..." 
                                    className="bg-gray-900 text-white border-gray-700 focus-visible:ring-primary rounded-xl"
                                />
                                <Button type="submit" size="icon" className="rounded-xl shrink-0"><Send className='w-4 h-4'/></Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterviewRoom;
