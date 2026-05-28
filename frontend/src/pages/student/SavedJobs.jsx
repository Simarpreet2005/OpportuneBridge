import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { JOB_API_END_POINT } from '../../utils/constant';
import Job from '../../jobs/job';
import { Bookmark } from 'lucide-react';
import { Button } from '../../ui/button';
import { useNavigate } from 'react-router-dom';

const SavedJobs = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedJobs = async () => {
            try {
                setLoading(true);
                const res = await api.get(`${JOB_API_END_POINT}/saved`);
                if (res.data.success) {
                    setSavedJobs(res.data.savedJobs || []);
                }
            } catch (error) {
                console.error("Failed to fetch saved jobs", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchSavedJobs();
        }
    }, [user]);

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
            </div>
        );
    }

    return (
        <div className='max-w-7xl mx-auto px-4 py-8 min-h-screen'>
            <div className='mb-8'>
                <h1 className='text-3xl font-bold'>Saved Opportunities</h1>
                <p className='text-muted-foreground mt-1'>Manage your bookmarked positions</p>
            </div>

            {savedJobs.length === 0 ? (
                <div className='text-center py-20 border-2 border-dashed border-border rounded-lg bg-card'>
                    <Bookmark className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-xl font-semibold mb-2'>No saved opportunities yet</h3>
                    <p className='text-muted-foreground max-w-sm mx-auto mb-6'>
                        Bookmark jobs you are interested in, and they will appear here.
                    </p>
                    <Button onClick={() => navigate('/jobs')}>
                        Explore Opportunities
                    </Button>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    {savedJobs.map((job) => (
                        <Job key={job._id} job={job} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedJobs;
