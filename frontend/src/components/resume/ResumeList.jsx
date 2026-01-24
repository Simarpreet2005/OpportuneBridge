import React, { useEffect } from 'react'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { Plus, Edit2, Trash2, Share2, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { setResumes } from '@/redux/resumeSlice'
import { toast } from 'sonner'
import Footer from '../shared/Footer'

const ResumeList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { resumes } = useSelector(store => store.resume);

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const res = await axios.get('https://opportunebridge-backend.onrender.com/api/v1/resume/get', { withCredentials: true });
                if (res.data.success) {
                    dispatch(setResumes(res.data.resumes));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchResumes();
    }, [dispatch]);

    const deleteResume = async (id) => {
        try {
            const res = await axios.delete(`https://opportunebridge-backend.onrender.com/api/v1/resume/delete/${id}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(setResumes(resumes.filter(r => r._id !== id)));
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    return (
        <div className='min-h-screen bg-gray-50/50'>
            <div className='max-w-7xl mx-auto px-4 py-12'>
                <div className='flex items-center justify-between mb-10'>
                    <div>
                        <h1 className='text-4xl font-bold tracking-tight'>AI Resume Generator</h1>
                        <p className='text-muted-foreground mt-2'>Create and manage professional, AI-optimized resumes in minutes.</p>
                    </div>
                    <Button onClick={() => navigate('/resume-builder')} className="rounded-full px-8 h-12 text-lg shadow-lg hover:shadow-xl transition-all">
                        <Plus className='w-5 h-5 mr-2' /> Create New Resume
                    </Button>
                </div>

                {resumes.length === 0 ? (
                    <div className='bg-white border-2 border-dashed border-gray-200 rounded-3xl p-20 text-center'>
                        <div className='bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6'>
                            <FileText className='w-10 h-10 text-primary' />
                        </div>
                        <h3 className='text-2xl font-semibold mb-2'>No Resumes Found</h3>
                        <p className='text-muted-foreground max-w-sm mx-auto mb-8'>Start by creating your first professional resume with our AI-powered builder.</p>
                        <Button onClick={() => navigate('/resume-builder')} variant="outline" className="rounded-full px-8">Get Started</Button>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {resumes.map((resume) => (
                            <div key={resume._id} className='group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300'>
                                <div className='h-48 bg-gray-100/50 rounded-2xl mb-6 flex items-center justify-center group-hover:bg-primary/5 transition-colors overflow-hidden relative'>

                                    <div className='w-32 h-40 bg-white shadow-md rounded-md p-4 space-y-2 transform group-hover:scale-105 transition-transform'>
                                        <div className='w-full h-2 bg-gray-200 rounded-full' />
                                        <div className='w-2/3 h-2 bg-gray-100 rounded-full' />
                                        <div className='w-full h-1 bg-gray-50 rounded-full mt-4' />
                                        <div className='w-full h-1 bg-gray-50 rounded-full' />
                                        <div className='w-full h-1 bg-gray-50 rounded-full' />
                                    </div>
                                </div>

                                <h2 className='text-xl font-bold mb-1 truncate'>{resume.title}</h2>
                                <p className='text-sm text-muted-foreground mb-6'>Last updated {new Date(resume.updatedAt).toLocaleDateString()}</p>

                                <div className='flex items-center gap-2'>
                                    {resume.fileUrl ? (
                                        <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                                            <Button variant="secondary" className="w-full rounded-xl">
                                                <FileText className='w-4 h-4 mr-2' /> View PDF
                                            </Button>
                                        </a>
                                    ) : (
                                        <Button onClick={() => navigate(`/resume-builder/${resume._id}`)} variant="secondary" className="flex-1 rounded-xl">
                                            <Edit2 className='w-4 h-4 mr-2' /> Edit
                                        </Button>
                                    )}
                                    <Button onClick={() => navigate(`/resume/share/${resume._id}`)} variant="outline" size="icon" className="rounded-xl">
                                        <Share2 className='w-4 h-4' />
                                    </Button>
                                    <Button onClick={() => deleteResume(resume._id)} variant="outline" size="icon" className="rounded-xl text-destructive hover:bg-destructive hover:text-white border-destructive/20">
                                        <Trash2 className='w-4 h-4' />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}

export default ResumeList
