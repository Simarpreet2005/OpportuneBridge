import api from "../api";
import React from 'react';
import { toast } from 'sonner';

export default function ResumeUploader({ setResumes, setUser }) {
    const uploadResume = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("resume", file);

        try {
            const res = await api.post("/resume/upload-version", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (res.data.success) {
                const userRes = await api.get("/user/me");
                if (userRes.data.success) {
                    setUser(userRes.data.user);
                    setResumes(userRes.data.user.profile?.resumes || []);
                }
                toast.success("Resume uploaded successfully!");
            }
        } catch (error) {
            console.error("Resume upload failed", error);
            toast.error("Failed to upload resume");
        }
    };

    return <input type="file" onChange={uploadResume} />;
}

