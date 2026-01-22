import React, { useState } from 'react';
import api from "../api";
import { Button } from './ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ProfilePicUploader = ({ setUser }) => {
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            setLoading(true);
            const res = await api.post("/profile-new/upload-pic", formData);
            setUser(res.data);
            toast.success("Profile picture updated!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload profile picture");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <input
                type="file"
                id="profile-pic-upload"
                className="hidden"
                accept="image/*"
                onChange={handleUpload}
            />
            <label htmlFor="profile-pic-upload">
                <Button variant="outline" className="cursor-pointer" asChild disabled={loading}>
                    <span>
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        Change Photo
                    </span>
                </Button>
            </label>
        </div>
    );
};

export default ProfilePicUploader;
