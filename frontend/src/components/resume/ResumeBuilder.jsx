import React, { useState, useEffect } from 'react'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Plus, Trash, Sparkles, Loader2, Save, Download, ChevronRight, ChevronLeft, Award } from 'lucide-react'
import ResumePreview from './ResumePreview'
import axios from 'axios'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'

const ResumeBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [atsResult, setAtsResult] = useState(null);
    const [atsOpen, setAtsOpen] = useState(false);

    const [data, setData] = useState({
        title: "Untitled Resume",
        personalInfo: { fullName: "", email: "", phoneNumber: "", address: "", summary: "" },
        education: [{ institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", description: "" }],
        experience: [{ company: "", role: "", location: "", startDate: "", endDate: "", description: "", isCurrent: false }],
        projects: [{ title: "", description: "", link: "", technologies: [] }],
        skills: [""],
        languages: [""],
        certifications: [{ name: "", issuer: "", year: "" }],
        templateId: "modern"
    });

    useEffect(() => {
        if (id) {
            const fetchResume = async () => {
                try {
                    const res = await axios.get(`https://opportunebridge-backend.onrender.com/api/v1/resume/get/${id}`, { withCredentials: true });
                    if (res.data.success) {
                        setData(res.data.resume);
                    }
                } catch (error) {
                    toast.error("Failed to load resume");
                }
            }
            fetchResume();
        }
    }, [id]);

    const handleChange = (e, section, index, field) => {
        if (section === 'personalInfo') {
            setData({ ...data, personalInfo: { ...data.personalInfo, [field]: e.target.value } });
        } else if (index !== undefined) {
            const updatedSection = [...data[section]];
            if (field) {
                updatedSection[index][field] = e.target.value;
            } else {
                updatedSection[index] = e.target.value;
            }
            setData({ ...data, [section]: updatedSection });
        } else {
            setData({ ...data, [e.target.name]: e.target.value });
        }
    }

    const addItem = (section, initial) => {
        setData({ ...data, [section]: [...data[section], initial] });
    }

    const removeItem = (section, index) => {
        const updatedSection = data[section].filter((_, i) => i !== index);
        setData({ ...data, [section]: updatedSection });
    }

    const optimizeWithAI = async (section, index, field) => {
        try {
            setAiLoading(true);
            const content = field ? data[section][index][field] : data.personalInfo.summary;
            const res = await axios.post('https://opportunebridge-backend.onrender.com/api/v1/resume/optimize', {
                section,
                content
            }, { withCredentials: true });

            if (res.data.success) {
                if (field) {
                    const updated = [...data[section]];
                    updated[index][field] = res.data.optimizedText;
                    setData({ ...data, [section]: updated });
                } else {
                    setData({ ...data, personalInfo: { ...data.personalInfo, summary: res.data.optimizedText } });
                }
                toast.success("AI Optimization Applied");
            }
        } catch (error) {
            toast.error("AI Optimization failed");
        } finally {
            setAiLoading(false);
        }
    }

    const saveResume = async () => {
        try {
            setLoading(true);
            const url = id ? `https://opportunebridge-backend.onrender.com/api/v1/resume/update/${id}` : 'https://opportunebridge-backend.onrender.com/api/v1/resume/create';
            const method = id ? 'put' : 'post';

            const res = await axios[method](url, data, { withCredentials: true });
            if (res.data.success) {
                toast.success("Resume saved!");
                if (!id) navigate('/resumes');
            }
        } catch (error) {
            toast.error("Failed to save resume");
        } finally {
            setLoading(false);
        }
    }

    const checkATS = async () => {
        try {
            setAiLoading(true);
            const res = await axios.post('https://opportunebridge-backend.onrender.com/api/v1/resume/ats-score', { resumeData: data }, { withCredentials: true });
            if (res.data.success) {
                setAtsResult(res.data);
                setAtsOpen(true);
                toast.success("ATS Score Calculated");
            }
        } catch (error) {
            toast.error("Failed to calculate ATS score");
        } finally {
            setAiLoading(false);
        }
    }

    const steps = ["Basics", "Experience", "Education", "Projects", "Skills & more"];

    return (
        <div className='min-h-screen bg-gray-50'>

            <div className='max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 h-[calc(110vh-64px)] overflow-hidden'>
                {/* Editor Side */}
                <div className='p-8 overflow-y-auto bg-white border-r border-gray-200'>
                    <div className='flex items-center justify-between mb-8'>
                        <div className='flex items-center gap-4'>
                            <Button onClick={() => navigate('/resumes')} variant="ghost" size="icon"><ChevronLeft /></Button>
                            <Input
                                name="title"
                                value={data.title}
                                onChange={(e) => handleChange(e)}
                                className="text-2xl font-bold border-none bg-transparent hover:bg-gray-100 focus:bg-white w-auto px-2"
                            />
                        </div>
                        <div className='flex gap-2'>
                            <Button onClick={checkATS} disabled={aiLoading} variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/5">
                                {aiLoading ? <Loader2 className='mr-2 animate-spin' /> : <Award className='mr-2' />} ATS Check
                            </Button>
                            <Button onClick={saveResume} disabled={loading} className="rounded-full">
                                {loading ? <Loader2 className='mr-2 animate-spin' /> : <Save className='mr-2' />} Save
                            </Button>
                        </div>
                    </div>

                    {/* Stepper */}
                    <div className='flex items-center justify-between mb-10 px-4'>
                        {steps.map((s, i) => (
                            <div key={i} className='flex flex-col items-center gap-2'>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === i + 1 ? 'bg-primary text-white scale-110 shadow-lg' : i + 1 < step ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {i + 1 < step ? "✓" : i + 1}
                                </div>
                                <span className={`text-xs font-semibold ${step === i + 1 ? 'text-primary' : 'text-gray-400'}`}>{s}</span>
                            </div>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
                        {step === 1 && (
                            <div className='space-y-6'>
                                <h2 className='text-3xl font-bold tracking-tight'>Personal Information</h2>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <Label>Full Name</Label>
                                        <Input placeholder="John Doe" value={data.personalInfo.fullName} onChange={(e) => handleChange(e, 'personalInfo', null, 'fullName')} />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Email</Label>
                                        <Input placeholder="john@example.com" value={data.personalInfo.email} onChange={(e) => handleChange(e, 'personalInfo', null, 'email')} />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Phone</Label>
                                        <Input placeholder="+1 234 567 890" value={data.personalInfo.phoneNumber} onChange={(e) => handleChange(e, 'personalInfo', null, 'phoneNumber')} />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Address</Label>
                                        <Input placeholder="City, Country" value={data.personalInfo.address} onChange={(e) => handleChange(e, 'personalInfo', null, 'address')} />
                                    </div>
                                </div>
                                <div className='space-y-2 relative'>
                                    <div className='flex justify-between items-center'>
                                        <Label>Professional Summary</Label>
                                        <Button variant="ghost" size="sm" onClick={() => optimizeWithAI('personalInfo')} disabled={aiLoading} className='text-primary hover:bg-primary/5'>
                                            {aiLoading ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : <Sparkles className='w-4 h-4 mr-2' />} AI Enhance
                                        </Button>
                                    </div>
                                    <Textarea rows={6} value={data.personalInfo.summary} onChange={(e) => handleChange(e, 'personalInfo', null, 'summary')} placeholder="Tell us about your professional journey..." />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className='space-y-6'>
                                <div className='flex justify-between items-center'>
                                    <h2 className='text-3xl font-bold tracking-tight'>Work Experience</h2>
                                    <Button onClick={() => addItem('experience', { company: "", role: "", location: "", startDate: "", endDate: "", description: "" })} variant="outline" className="rounded-full">Add Experience</Button>
                                </div>
                                {data.experience.map((exp, i) => (
                                    <div key={i} className='p-6 border border-gray-100 rounded-3xl bg-gray-50/30 relative group'>
                                        <Button onClick={() => removeItem('experience', i)} variant="ghost" size="icon" className='absolute top-4 right-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity'><Trash className='w-4 h-4' /></Button>
                                        <div className='grid grid-cols-2 gap-4 mb-4'>
                                            <div className='space-y-2'><Label>Company</Label><Input value={exp.company} onChange={(e) => handleChange(e, 'experience', i, 'company')} /></div>
                                            <div className='space-y-2'><Label>Role</Label><Input value={exp.role} onChange={(e) => handleChange(e, 'experience', i, 'role')} /></div>
                                            <div className='space-y-2'><Label>Location</Label><Input value={exp.location} onChange={(e) => handleChange(e, 'experience', i, 'location')} /></div>
                                            <div className='grid grid-cols-2 gap-2'>
                                                <div className='space-y-2'><Label>Start Date</Label><Input value={exp.startDate} onChange={(e) => handleChange(e, 'experience', i, 'startDate')} /></div>
                                                <div className='space-y-2'><Label>End Date</Label><Input value={exp.endDate} placeholder="Present" onChange={(e) => handleChange(e, 'experience', i, 'endDate')} /></div>
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <div className='flex justify-between items-center'>
                                                <Label>Description & Achievements</Label>
                                                <Button variant="ghost" size="sm" onClick={() => optimizeWithAI('experience', i, 'description')} disabled={aiLoading} className='text-primary hover:bg-primary/5'>
                                                    {aiLoading ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : <Sparkles className='w-4 h-4 mr-2' />} AI Polish
                                                </Button>
                                            </div>
                                            <Textarea value={exp.description} onChange={(e) => handleChange(e, 'experience', i, 'description')} rows={4} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {step === 3 && (
                            <div className='space-y-6'>
                                <div className='flex justify-between items-center'>
                                    <h2 className='text-3xl font-bold tracking-tight'>Education</h2>
                                    <Button onClick={() => addItem('education', { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" })} variant="outline" className="rounded-full">Add Education</Button>
                                </div>
                                {data.education.map((edu, i) => (
                                    <div key={i} className='p-6 border border-gray-100 rounded-3xl bg-gray-50/30 relative group'>
                                        <Button onClick={() => removeItem('education', i)} variant="ghost" size="icon" className='absolute top-4 right-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity'><Trash className='w-4 h-4' /></Button>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2 col-span-2'><Label>Institution</Label><Input value={edu.institution} onChange={(e) => handleChange(e, 'education', i, 'institution')} /></div>
                                            <div className='space-y-2'><Label>Degree</Label><Input value={edu.degree} onChange={(e) => handleChange(e, 'education', i, 'degree')} /></div>
                                            <div className='grid grid-cols-2 gap-2'>
                                                <div className='space-y-2'><Label>Start Date</Label><Input value={edu.startDate} onChange={(e) => handleChange(e, 'education', i, 'startDate')} /></div>
                                                <div className='space-y-2'><Label>End Date</Label><Input value={edu.endDate} onChange={(e) => handleChange(e, 'education', i, 'endDate')} /></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {step === 4 && (
                            <div className='space-y-6'>
                                <div className='flex justify-between items-center'>
                                    <h2 className='text-3xl font-bold tracking-tight'>Projects</h2>
                                    <Button onClick={() => addItem('projects', { title: "", description: "", link: "", technologies: [] })} variant="outline" className="rounded-full">Add Project</Button>
                                </div>
                                {data.projects.map((proj, i) => (
                                    <div key={i} className='p-6 border border-gray-100 rounded-3xl bg-gray-50/30 relative group'>
                                        <Button onClick={() => removeItem('projects', i)} variant="ghost" size="icon" className='absolute top-4 right-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity'><Trash className='w-4 h-4' /></Button>
                                        <div className='grid grid-cols-2 gap-4 mb-4'>
                                            <div className='space-y-2 col-span-2'><Label>Project Title</Label><Input value={proj.title} onChange={(e) => handleChange(e, 'projects', i, 'title')} /></div>
                                            <div className='space-y-2 col-span-2'><Label>Project Link</Label><Input value={proj.link} placeholder="GitHub or Live Demo URL" onChange={(e) => handleChange(e, 'projects', i, 'link')} /></div>
                                        </div>
                                        <div className='space-y-2'>
                                            <div className='flex justify-between items-center'>
                                                <Label>Description</Label>
                                                <Button variant="ghost" size="sm" onClick={() => optimizeWithAI('projects', i, 'description')} disabled={aiLoading} className='text-primary hover:bg-primary/5'>
                                                    {aiLoading ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : <Sparkles className='w-4 h-4 mr-2' />} AI Polish
                                                </Button>
                                            </div>
                                            <Textarea value={proj.description} onChange={(e) => handleChange(e, 'projects', i, 'description')} rows={3} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {step === 5 && (
                            <div className='space-y-6'>
                                <h2 className='text-3xl font-bold tracking-tight'>Skills & More</h2>
                                <div className='space-y-4'>
                                    <div className='space-y-2'>
                                        <Label>Skills (Comma separated)</Label>
                                        <Textarea
                                            value={data.skills.join(', ')}
                                            onChange={(e) => setData({ ...data, skills: e.target.value.split(',').map(s => s.trim()) })}
                                            placeholder="React, Node.js, Python, Leadership..."
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Languages (Comma separated)</Label>
                                        <Input
                                            value={data.languages.join(', ')}
                                            onChange={(e) => setData({ ...data, languages: e.target.value.split(',').map(s => s.trim()) })}
                                            placeholder="English, Spanish, French..."
                                        />
                                    </div>
                                    <div className='space-y-4 pt-4'>
                                        <div className='flex justify-between items-center'>
                                            <h3 className='text-xl font-semibold'>Certifications</h3>
                                            <Button onClick={() => addItem('certifications', { name: "", issuer: "", year: "" })} variant="outline" size="sm" className="rounded-full">Add Cert</Button>
                                        </div>
                                        {data.certifications.map((cert, i) => (
                                            <div key={i} className='grid grid-cols-3 gap-4 items-end border p-4 rounded-xl relative group'>
                                                <Button onClick={() => removeItem('certifications', i)} variant="ghost" size="icon" className='absolute -top-2 -right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity'><Trash className='w-4 h-4' /></Button>
                                                <div className='space-y-2'><Label>Name</Label><Input value={cert.name} onChange={(e) => handleChange(e, 'certifications', i, 'name')} /></div>
                                                <div className='space-y-2'><Label>Issuer</Label><Input value={cert.issuer} onChange={(e) => handleChange(e, 'certifications', i, 'issuer')} /></div>
                                                <div className='space-y-2'><Label>Year</Label><Input value={cert.year} onChange={(e) => handleChange(e, 'certifications', i, 'year')} /></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className='flex justify-between pt-10'>
                            <Button disabled={step === 1} onClick={() => setStep(s => s - 1)} variant="outline" className="rounded-full px-8">Previous</Button>
                            {step < 5 ? (
                                <Button onClick={() => setStep(s => s + 1)} className="rounded-full px-8">Next <ChevronRight className='ml-2 w-4 h-4' /></Button>
                            ) : (
                                <Button onClick={saveResume} className="rounded-full px-10 bg-green-600 hover:bg-green-700">Finish & Save</Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview Side */}
                <div className='hidden lg:block bg-gray-100 p-8 overflow-y-auto'>
                    <div className='sticky top-0 mb-6 flex justify-between items-center'>
                        <span className='text-sm font-bold uppercase tracking-widest text-muted-foreground'>Live Preview</span>
                        <div className='flex gap-2 text-xs'>
                            <Button variant="secondary" size="sm" className="rounded-full" onClick={() => window.print()}><Download className='w-4 h-4 mr-2' /> PDF</Button>
                        </div>
                    </div>
                    <div className='flex justify-center'>
                        <div className='w-full max-w-[800px] shadow-2xl origin-top'>
                            <ResumePreview data={data} />
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={atsOpen} onOpenChange={setAtsOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            ATS Score Analysis <span className={`text-xl px-3 py-1 rounded-full ${atsResult?.score >= 70 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{atsResult?.score}/100</span>
                        </DialogTitle>
                        <DialogDescription>Based on typical Applicant Tracking System algorithms.</DialogDescription>
                    </DialogHeader>
                    {atsResult && (
                        <div className='space-y-4 py-4'>
                            <div>
                                <h4 className='font-bold mb-2'>Feedback</h4>
                                <p className='text-sm text-gray-600 whitespace-pre-line'>{atsResult.feedback}</p>
                            </div>
                            {atsResult.missing && atsResult.missing.length > 0 && (
                                <div>
                                    <h4 className='font-bold mb-2 text-red-600'>Missing Keywords/Sections</h4>
                                    <ul className='list-disc pl-5 text-sm'>
                                        {atsResult.missing.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ResumeBuilder
