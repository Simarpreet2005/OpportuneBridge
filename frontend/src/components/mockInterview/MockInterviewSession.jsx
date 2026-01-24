import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { Editor as MonacoEditor } from '@monaco-editor/react'
import { Button } from '../ui/button'
import { ChevronRight, ChevronLeft, Send, Loader2, Code2, BrainCircuit, Timer, MessageSquareText } from 'lucide-react'
import Navbar from '../shared/Navbar'

const MockInterviewSession = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`https://opportunebridge-backend.onrender.com/api/v1/mockinterview/get/${id}`, { withCredentials: true });
                if (res.data.success) {
                    setInterview(res.data.interview);
                }
            } catch (error) {
                toast.error("Failed to load interview session");
            } finally {
                setLoading(false);
            }
        }
        fetchInterview();
    }, [id]);

    const handleAnswerChange = (val) => {
        setAnswers({ ...answers, [currentQuestionIndex]: val });
    }

    const submitInterview = async () => {
        try {
            setSubmitting(true);
            const formattedAnswers = Object.keys(answers).map(idx => ({
                questionIndex: parseInt(idx),
                answer: answers[idx]
            }));

            const res = await axios.post('https://opportunebridge-backend.onrender.com/api/v1/mockinterview/submit', {
                interviewId: id,
                answers: formattedAnswers
            }, { withCredentials: true });

            if (res.data.success) {
                toast.success("Interview submitted! AI is calculating your score...");
                navigate(`/mock-interview/result/${id}`);
            }
        } catch (error) {
            toast.error("Submission failed");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className='h-screen flex items-center justify-center'><Loader2 className='animate-spin text-primary' /></div>
    if (!interview) return null;

    const currentQuestion = interview.questions[currentQuestionIndex];

    return (
        <div className='h-screen flex flex-col bg-[#f8f9fc]'>
            <div className='flex-1 flex overflow-hidden'>
                {/* Left: Questions & Navigation */}
                <div className='w-1/3 bg-white border-r border-gray-200 flex flex-col shadow-2xl z-10'>
                    <div className='p-8 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent'>
                        <div className='flex items-center gap-3 mb-4'>
                            <div className='bg-primary p-2 rounded-xl text-white'>
                                <BrainCircuit className='w-6 h-6' />
                            </div>
                            <h2 className='text-2xl font-bold text-gray-900'>Practice Session</h2>
                        </div>
                        <div className='flex gap-2 flex-wrap'>
                            {interview.questions.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentQuestionIndex(i)}
                                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all border-2 ${currentQuestionIndex === i
                                        ? 'bg-primary text-white border-primary shadow-lg scale-110'
                                        : answers[i]
                                            ? 'bg-green-50 text-green-600 border-green-200'
                                            : 'bg-white text-gray-400 border-gray-100 hover:border-primary/30'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='flex-1 overflow-y-auto p-8'>
                        <div className='bg-gray-50 p-6 rounded-[2rem] border border-gray-100 mb-8'>
                            <span className='px-3 py-1 bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-widest rounded-full mb-3 inline-block'>
                                {currentQuestion.type} Question
                            </span>
                            <h3 className='text-xl font-bold text-gray-800 leading-snug'>
                                {currentQuestion.question}
                            </h3>
                        </div>

                        {currentQuestion.type !== 'coding' ? (
                            <textarea
                                className='w-full flex-1 min-h-[300px] p-6 rounded-3xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none text-lg resize-none'
                                placeholder="Type your detailed answer here..."
                                value={answers[currentQuestionIndex] || ""}
                                onChange={(e) => handleAnswerChange(e.target.value)}
                            />
                        ) : (
                            <div className='bg-indigo-50 p-6 rounded-3xl border border-indigo-100'>
                                <div className='flex items-center gap-2 mb-2 text-indigo-700 font-bold'>
                                    <Code2 className='w-5 h-5' /> Coding Task
                                </div>
                                <p className='text-indigo-600/80 text-sm'>Please write your code in the editor on the right. You can use any language style, but JavaScript is preferred.</p>
                            </div>
                        )}
                    </div>

                    <div className='p-8 border-t border-gray-100 flex gap-4'>
                        <Button
                            variant="outline"
                            className="flex-1 rounded-2xl h-14"
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        >
                            <ChevronLeft className='mr-2' /> Previous
                        </Button>
                        {currentQuestionIndex === interview.questions.length - 1 ? (
                            <Button
                                onClick={submitInterview}
                                disabled={submitting}
                                className="flex-1 rounded-2xl h-14 bg-green-600 hover:bg-green-700 font-bold text-lg"
                            >
                                {submitting ? <Loader2 className='animate-spin mr-2' /> : <Send className='mr-2' />} Finish Session
                            </Button>
                        ) : (
                            <Button
                                className="flex-1 rounded-2xl h-14 font-bold text-lg"
                                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            >
                                Next <ChevronRight className='ml-2' />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Right: Code Editor (only for coding questions, or general workspace) */}
                <div className='flex-1 relative bg-[#1e1e1e]'>
                    <div className='absolute top-6 left-6 z-10 flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/5'>
                        <Code2 className='w-4 h-4 text-primary' />
                        <span className='text-xs font-bold text-white/80 uppercase tracking-widest'>Collaborative Workspace</span>
                    </div>

                    <MonacoEditor
                        height="100%"
                        defaultLanguage="javascript"
                        theme="vs-dark"
                        value={currentQuestion.type === 'coding' ? answers[currentQuestionIndex] : "// Workspace (Optional for non-coding questions)"}
                        onChange={(val) => currentQuestion.type === 'coding' && handleAnswerChange(val)}
                        options={{
                            fontSize: 16,
                            minimap: { enabled: false },
                            padding: { top: 80, bottom: 20 },
                            fontFamily: 'JetBrains Mono, Menlo, monospace'
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default MockInterviewSession
