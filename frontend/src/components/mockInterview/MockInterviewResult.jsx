import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { BrainCircuit, Star, CheckCircle, ChevronLeft, Award, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import Footer from '../shared/Footer'
import { MOCK_INTERVIEW_API_END_POINT } from '@/utils/constant'

const MockInterviewResult = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await axios.get(`${MOCK_INTERVIEW_API_END_POINT}/get/${id}`, { withCredentials: true });
                if (res.data.success) {
                    setInterview(res.data.interview);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        fetchResult();
    }, [id]);

    if (loading) return <div className='h-screen flex items-center justify-center'><Loader2 className='animate-spin text-primary' /></div>
    if (!interview) return null;

    return (
        <div className='min-h-screen flex flex-col'>
            <div className='max-w-5xl mx-auto px-4 py-16 flex-1 w-full'>
                <Button variant="ghost" className="mb-8 rounded-full" onClick={() => navigate('/mock-interview')}>
                    <ChevronLeft className='mr-2 w-4 h-4' /> Back to Dashboard
                </Button>

                {/* Header Score Card */}
                <div className='bg-white rounded-[3rem] p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-12 mb-10 relative overflow-hidden'>
                    <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl' />

                    <div className='relative'>
                        <div className={`w-48 h-48 rounded-full border-[12px] flex flex-col items-center justify-center ${interview.overallScore > 70 ? 'border-green-500 text-green-600' : 'border-primary text-primary'}`}>
                            <span className='text-6xl font-black font-mono leading-none'>{interview.overallScore || 0}%</span>
                        </div>
                    </div>

                    <div className='flex-1 text-center md:text-left'>
                        <div className='flex items-center justify-center md:justify-start gap-2 mb-4'>
                            <Award className='text-primary' />
                            <span className='text-xs font-bold uppercase tracking-[0.2em] text-gray-400'>Analysis Report</span>
                        </div>
                        <h2 className='text-4xl font-bold text-gray-900 mb-4'>Performance Summary</h2>
                        <p className='text-lg text-gray-600 leading-relaxed'>{interview.overallFeedback}</p>
                    </div>
                </div>

                {/* Detailed Breakdown */}
                <div className='space-y-6'>
                    <h3 className='text-2xl font-bold text-gray-900 px-4'>Detailed Analysis</h3>
                    {interview.questions.map((q, i) => (
                        <div key={i} className='bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md'>
                            <div className='flex justify-between items-start mb-6'>
                                <div className='flex-1 pr-8'>
                                    <span className='text-[10px] font-bold uppercase text-primary tracking-widest bg-primary/5 px-2 py-1 rounded-md'>Question {i + 1} • {q.type}</span>
                                    <h4 className='text-xl font-bold text-gray-800 mt-3 leading-snug'>{q.question}</h4>
                                </div>
                                <div className='bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 text-center min-w-[100px]'>
                                    <span className={`text-2xl font-black font-mono ${q.score > 7 ? 'text-green-600' : 'text-orange-500'}`}>{q.score}/10</span>
                                    <p className='text-[8px] uppercase font-bold text-gray-400'>Score</p>
                                </div>
                            </div>

                            <div className='space-y-6'>
                                <div className='bg-primary/5 p-5 rounded-2xl border-l-4 border-primary'>
                                    <p className='text-sm italic text-gray-600'>" {q.answer} "</p>
                                    <p className='text-[10px] uppercase font-bold text-primary mt-2'>Your Response</p>
                                </div>

                                <div className='flex gap-4 items-start'>
                                    <div className='bg-green-50 p-2 rounded-xl text-green-600'>
                                        <CheckCircle className='w-5 h-5' />
                                    </div>
                                    <div>
                                        <p className='text-sm font-medium text-gray-700 leading-relaxed'>{q.feedback}</p>
                                        <p className='text-[10px] uppercase font-bold text-green-600 mt-2 tracking-widest'>AI Insights</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='mt-16 text-center'>
                    <Button onClick={() => navigate('/mock-interview')} className="rounded-full px-12 h-14 text-lg font-bold shadow-xl">
                        Practice Again
                    </Button>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default MockInterviewResult
