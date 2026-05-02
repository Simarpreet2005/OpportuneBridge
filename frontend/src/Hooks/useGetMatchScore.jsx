import { useState, useEffect } from 'react';
import axios from 'axios';
import { AI_API_END_POINT } from '@/utils/constant';

const useGetMatchScore = (targetId, targetType = 'Challenge') => {
    const [score, setScore] = useState(null);
    const [analysis, setAnalysis] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchScore = async () => {
            if (!targetId) return;

            setLoading(true);
            try {
                const res = await axios.post(`${AI_API_END_POINT}/score`,
                    { targetId, targetType },
                    { withCredentials: true }
                );

                if (res.data.success) {
                    setScore(res.data.score);
                    setAnalysis(res.data.analysis);
                }
            } catch (error) {
                console.log("AI Score Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchScore();
    }, [targetId, targetType]);

    return { score, analysis, loading };
};

export default useGetMatchScore;
