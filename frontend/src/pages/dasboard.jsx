import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import ResumeUploader from "../components/ResumeUploader";

export default function Dashboard() {
  const { user, setUser } = useContext(AuthContext);
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await api.get("/me");
      setUser(res.data);
      setResumes(res.data.resumes || []);
    }
    load();
  }, []);

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      <ResumeUploader setResumes={setResumes} />

      <ul>
        {resumes.map((r) => (
          <li key={r._id}>
            <a href={r.fileUrl} target="_blank">View Resume</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
