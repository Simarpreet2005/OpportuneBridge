import api from "../api";
import React from 'react';

export default function ResumeUploader({ setResumes }) {
    const uploadResume = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("resume", file);

        try {
            const res = await api.post("/resume-new/upload", formData);
            setResumes((prev) => [...prev, res.data]);
        } catch (error) {
            console.error("Resume upload failed", error);
        }
    };

    return <input type="file" onChange={uploadResume} />;
}
