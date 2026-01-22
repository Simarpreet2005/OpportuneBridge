import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import ResumeUploader from "../components/ResumeUploader";
import ProfilePicUploader from "../components/ProfilePicUploader";

export default function Dashboard() {
    const { user, setUser } = useContext(AuthContext);
    const [resumes, setResumes] = useState([]);

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get("/user/me");
                setUser(res.data.user);
                setResumes(res.data.user.profile?.resumes || []); 
            } catch (error) {
                console.error("Failed to load profile", error);
            }
        }
        load();
    }, [setUser]);

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Welcome {user?.fullname}</h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Profile Picture</h2>
                <ProfilePicUploader setUser={setUser} />
                {user?.profile?.profilePhoto && (
                    <img src={user.profile.profilePhoto} alt="Profile" className="w-32 h-32 rounded-full object-cover mt-4" />
                )}
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Upload Resume</h2>
                <ResumeUploader setResumes={setResumes} />
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">My Resumes</h2>
                <ul className="space-y-2">
                    {resumes.map((r) => (
                        <li key={r._id} className="p-4 border rounded shadow-sm bg-white">
                            <a href={r.fileUrl || r.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                View Resume {r.originalFileName || "File"}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
