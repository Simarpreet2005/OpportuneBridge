import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { Plus, Play, History, Award, BookOpen, BrainCircuit, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import Footer from '../shared/Footer'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const MockInterviewHome = () => {
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const [setupData, setSetupData] = useState({
        jobRole: "",
        experience: "",
        techStack: "",
        jobDescription: ""
    });

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                setFetching(true);
                const res = await axios.get('https://opportunebridge-backend.onrender.com/api/v1/mockinterview/get', { withCredentials: true });
                if (res.data.success) {
                    setInterviews(res.data.interviews);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setFetching(false);
            }
        }
        fetchInterviews();
    }, []);

    const startInterview = async () => {
        if (!setupData.jobRole || !setupData.experience || !setupData.techStack) {
            toast.error("Please fill all required fields");
            return;
        }
        try {
            setLoading(true);
            const res = await axios.post('https://opportunebridge-backend.onrender.com/api/v1/mockinterview/start', setupData, { withCredentials: true });
            if (res.data.success) {
                navigate(`/mock-interview/session/${res.data.mockInterview._id}`);
            }
        } catch (error) {
            toast.error("Failed to start mockup");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='min-h-screen bg-gray-50 flex flex-col'>
            <div className='max-w-7xl mx-auto px-4 py-12 flex-1 w-full'>
                <div className='flex flex-col md:flex-row items-start justify-between mb-12 gap-8'>
                    <div>
                        <h1 className='text-4xl font-extrabold tracking-tight text-gray-900'>AI Mock Interviews</h1>
                        <p className='text-lg text-muted-foreground mt-2 max-w-2xl'>Ace your next technical interview with real-time AI practice sessions tailored to your role and tech stack.</p>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="rounded-full px-8 h-14 text-lg shadow-xl hover:shadow-2xl transition-all gap-2">
                                <BrainCircuit className='w-6 h-6' /> Start Practice Session
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Configure Your Session</DialogTitle>
                                <DialogDescription>Our AI will generate custom questions based on these details.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="space-y-2">
                                    <Label>Target Job Role</Label>
                                    <Input placeholder="e.g. Frontend Developer" value={setupData.jobRole} onChange={(e) => setSetupData({ ...setupData, jobRole: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Years of Experience</Label>
                                    <Input type="number" placeholder="e.g. 2" value={setupData.experience} onChange={(e) => setSetupData({ ...setupData, experience: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Core Tech Stack</Label>
                                    <Input placeholder="e.g. React, Node.js, Tailwind" value={setupData.techStack} onChange={(e) => setSetupData({ ...setupData, techStack: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Job Description (Optional)</Label>
                                    <textarea
                                        className="w-full min-h-[100px] p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm"
                                        placeholder="Paste the job description here for more tailored questions..."
                                        value={setupData.jobDescription}
                                        onChange={(e) => setSetupData({ ...setupData, jobDescription: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button onClick={startInterview} disabled={loading} className="w-full h-12 rounded-xl text-lg font-bold">
                                {loading ? <Loader2 className='animate-spin mr-2' /> : <Play className='mr-2 w-5 h-5' />} Join Room
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    {/* Stats Section */}
                    <div className='space-y-6'>
                        <div className='bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm'>
                            <h3 className='text-xl font-bold mb-6 flex items-center gap-2'><History className='text-primary' /> Quick Stats</h3>
                            <div className='space-y-4'>
                                <div className='flex justify-between items-center bg-gray-50 p-4 rounded-2xl'>
                                    <span className='text-gray-500 font-medium'>Attempts</span>
                                    <span className='text-2xl font-bold text-primary font-mono'>{interviews.length}</span>
                                </div>
                                <div className='flex justify-between items-center bg-gray-50 p-4 rounded-2xl'>
                                    <span className='text-gray-500 font-medium'>Avg. Score</span>
                                    <span className='text-2xl font-bold text-green-600 font-mono'>
                                        {interviews.length > 0
                                            ? Math.round(interviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / interviews.length)
                                            : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className='bg-gradient-to-br from-primary to-indigo-600 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden'>
                            <BrainCircuit className='absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12' />
                            <h3 className='text-xl font-bold mb-2'>AI Tips</h3>
                            <p className='text-white/80 text-sm leading-relaxed'>Be specific in your coding solutions. Our AI evaluates not just correctness, but also performance and clean code patterns.</p>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="secondary" className="mt-6 w-full rounded-xl font-bold text-primary">Learn More</Button>
                                </DialogTrigger>
                                <DialogContent className="bg-white rounded-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-bold text-primary">AI Interview Tips</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <p><strong>1. STAR Method:</strong> Structure your answers using Situation, Task, Action, and Result.</p>
                                        <p><strong>2. Keyword Usage:</strong> Our AI looks for industry-standard terms relevant to your tech stack.</p>
                                        <p><strong>3. Clarity:</strong> Speak (or write) clearly. Short, concise sentences score higher than run-on paragraphs.</p>
                                        <p><strong>4. Code Efficiency:</strong> For coding questions, time and space complexity are key factors.</p>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* History Section */}
                    <div className='lg:col-span-2'>
                        <div className='bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm min-h-[400px]'>
                            <h3 className='text-xl font-bold mb-6 flex items-center gap-2'><History className='text-primary' /> Recent Attempts</h3>

                            {fetching ? (
                                <div className='flex items-center justify-center h-48'><Loader2 className='animate-spin text-primary' /></div>
                            ) : interviews.length === 0 ? (
                                <div className='text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200'>
                                    <div className='bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm'>
                                        <BookOpen className='text-primary w-8 h-8' />
                                    </div>
                                    <h4 className='font-bold text-gray-900'>No attempts yet</h4>
                                    <p className='text-muted-foreground text-sm'>Start your first session to see your progress here.</p>
                                </div>
                            ) : (
                                <div className='space-y-4'>
                                    {interviews.map((interview) => (
                                        <div key={interview._id} onClick={() => navigate(`/mock-interview/result/${interview._id}`)} className='group flex items-center justify-between p-5 rounded-3xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer'>
                                            <div className='flex items-center gap-4'>
                                                <div className='bg-primary/5 p-3 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors'>
                                                    <BrainCircuit className='w-6 h-6' />
                                                </div>
                                                <div>
                                                    <h4 className='font-bold text-lg'>{interview.jobRole}</h4>
                                                    <p className='text-sm text-muted-foreground'>{interview.techStack} • {new Date(interview.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className='text-right'>
                                                <span className={`text-xl font-black font-mono ${interview.overallScore > 70 ? 'text-green-600' : 'text-orange-500'}`}>
                                                    {interview.overallScore || 0}%
                                                </span>
                                                <p className='text-[10px] uppercase font-bold tracking-widest text-gray-400'>Final Score</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default MockInterviewHome
