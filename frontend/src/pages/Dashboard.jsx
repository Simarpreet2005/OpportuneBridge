import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/authSlice";
import api from "../api";
import ResumeUploader from "./ResumeUploader";
import ProfilePicUploader from "./ProfilePicUploader";

export default function Dashboard() {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const [resumes, setResumes] = useState([]);

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get("/user/me");
                dispatch(setUser(res.data.user));
                setResumes(res.data.user.profile?.resumes || []); 
            } catch (error) {
                console.error("Failed to load profile", error);
            }
        }
        load();
    }, []);

    return (
        <div className="page-container page-padding">
            <h1 className="text-2xl font-bold mb-4">Welcome {user?.fullname}</h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Profile Picture</h2>
                <ProfilePicUploader setUser={(u) => dispatch(setUser(u))} />
                {user?.profile?.profilePhoto && (
                    <img src={user.profile.profilePhoto} alt="Profile" className="w-32 h-32 rounded-full object-cover mt-4" />
                )}
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Upload Resume</h2>
                <ResumeUploader setResumes={setResumes} setUser={(u) => dispatch(setUser(u))} />
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">My Resumes</h2>
                <ul className="space-y-2">
                    {resumes.map((r) => (
                        <li key={r._id} className="p-4 border border-border rounded-xl shadow-card bg-card">
                            <a href={r.fileUrl || r.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                View Resume {r.originalFileName || "File"}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

