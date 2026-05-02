import React from 'react'
import { Mail, Phone, MapPin, Globe, Award, Briefcase, GraduationCap, Code, Languages, Layout } from 'lucide-react'

const ResumePreview = ({ data }) => {
    const { personalInfo, education, experience, projects, skills, languages, certifications, templateId } = data;

    // Modern Template
    const ModernTemplate = () => (
        <div className='bg-white min-h-[800px] text-gray-800 font-sans p-8 shadow-sm border border-gray-100'>
            {/* Header */}
            <div className='border-b-4 border-primary pb-6 mb-8'>
                <h1 className='text-4xl font-extrabold text-gray-900 tracking-tight'>{personalInfo?.fullName || "Your Name"}</h1>
                <p className='text-lg text-primary font-medium mt-1'>{experience?.[0]?.role || "Profession"}</p>
                <div className='flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground'>
                    {personalInfo?.email && <div className='flex items-center gap-1.5'><Mail className='w-4 h-4' /> {personalInfo.email}</div>}
                    {personalInfo?.phoneNumber && <div className='flex items-center gap-1.5'><Phone className='w-4 h-4' /> {personalInfo.phoneNumber}</div>}
                    {personalInfo?.address && <div className='flex items-center gap-1.5'><MapPin className='w-4 h-4' /> {personalInfo.address}</div>}
                </div>
            </div>

            <div className='grid grid-cols-3 gap-10'>
                {/* Left Column */}
                <div className='col-span-2 space-y-8'>
                    {personalInfo?.summary && (
                        <section>
                            <h3 className='text-lg font-bold uppercase tracking-wider text-gray-900 mb-3 flex items-center gap-2'>
                                <Layout className='w-5 h-5 text-primary' /> Summary
                            </h3>
                            <p className='text-gray-600 leading-relaxed'>{personalInfo.summary}</p>
                        </section>
                    )}

                    {experience?.length > 0 && (
                        <section>
                            <h3 className='text-lg font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2'>
                                <Briefcase className='w-5 h-5 text-primary' /> Experience
                            </h3>
                            <div className='space-y-6'>
                                {experience.map((exp, i) => (
                                    <div key={i} className='relative pl-4 border-l-2 border-gray-100'>
                                        <div className='absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-primary' />
                                        <div className='flex justify-between items-start mb-1'>
                                            <h4 className='font-bold text-gray-900'>{exp.role}</h4>
                                            <span className='text-xs font-semibold bg-gray-100 px-2 py-1 rounded'>{exp.startDate} - {exp.endDate}</span>
                                        </div>
                                        <p className='text-sm text-primary font-medium mb-2'>{exp.company} | {exp.location}</p>
                                        <p className='text-sm text-gray-600 whitespace-pre-line'>{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {projects?.length > 0 && (
                        <section>
                            <h3 className='text-lg font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2'>
                                <Code className='w-5 h-5 text-primary' /> Key Projects
                            </h3>
                            <div className='grid grid-cols-1 gap-4'>
                                {projects.map((proj, i) => (
                                    <div key={i} className='bg-gray-50/50 p-4 rounded-xl border border-gray-100'>
                                        <h4 className='font-bold text-gray-900 flex justify-between'>
                                            {proj.title}
                                            {proj.link && <span className='text-xs text-primary'>{proj.link}</span>}
                                        </h4>
                                        <p className='text-sm text-gray-600 mt-1'>{proj.description}</p>
                                        {proj.technologies?.length > 0 && (
                                            <div className='flex flex-wrap gap-1.5 mt-2'>
                                                {proj.technologies.map((t, idx) => (
                                                    <span key={idx} className='text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded'>{t}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Column */}
                <div className='space-y-8'>
                    {skills?.length > 0 && (
                        <section>
                            <h3 className='text-lg font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2'>
                                <Award className='w-5 h-5 text-primary' /> Skills
                            </h3>
                            <div className='flex flex-wrap gap-2'>
                                {skills.map((skill, i) => (
                                    <span key={i} className='bg-primary/5 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/10'>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {education?.length > 0 && (
                        <section>
                            <h3 className='text-lg font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2'>
                                <GraduationCap className='w-5 h-5 text-primary' /> Education
                            </h3>
                            <div className='space-y-4'>
                                {education.map((edu, i) => (
                                    <div key={i}>
                                        <h4 className='font-bold text-sm text-gray-900'>{edu.degree}</h4>
                                        <p className='text-xs text-primary'>{edu.institution}</p>
                                        <p className='text-[10px] text-gray-500 mt-0.5'>{edu.startDate} - {edu.endDate}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {certifications?.length > 0 && (
                        <section>
                            <h3 className='text-lg font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2'>
                                <Award className='w-5 h-5 text-primary' /> Certifications
                            </h3>
                            <ul className='space-y-2'>
                                {certifications.map((cert, i) => (
                                    <li key={i} className='text-sm'>
                                        <p className='font-bold text-gray-900'>{cert.name}</p>
                                        <p className='text-xs text-muted-foreground'>{cert.issuer} ({cert.year})</p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {languages?.length > 0 && (
                        <section>
                            <h3 className='text-lg font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2'>
                                <Languages className='w-5 h-5 text-primary' /> Languages
                            </h3>
                            <div className='flex flex-wrap gap-2'>
                                {languages.map((lang, i) => (
                                    <span key={i} className='text-sm font-medium bg-gray-100 px-3 py-1 rounded-lg'>{lang}</span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <div>
            {templateId === 'modern' ? <ModernTemplate /> : <ModernTemplate />}
        </div>
    )
}

export default ResumePreview
