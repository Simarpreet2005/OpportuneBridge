import React from 'react';
import ChallengeCard from '../shared/ChallengeCard';
import Leaderboard from '../shared/Leaderboard';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import useGetAllChallenges from '@/Hooks/useGetAllChallenges';

const HomeFeed = () => {
    useGetAllChallenges();
    const { challenges } = useSelector(store => store.challenge);

    return (
        <div className='max-w-7xl mx-auto px-4 py-8 flex items-start gap-8'>
            <div className='flex-1'>
                <div className='flex items-center justify-between mb-8'>
                    <h2 className='text-3xl font-bold tracking-tight'>Recommended For You</h2>
                    <Button variant="ghost" className='text-primary hover:text-primary/80'>View All <ArrowRight className='w-4 h-4 ml-2' /></Button>
                </div>


                <div className='columns-1 md:columns-2 gap-6 space-y-6'>
                    {challenges && challenges.length > 0 ? (
                        challenges.map((item, index) => (
                            <ChallengeCard
                                key={item._id || index}
                                challengeId={item._id}
                                title={item.title}
                                difficulty={item.difficulty}
                                techStack={item.techStack}
                                participants={item.participants?.length || 0}
                                image={item.image || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop"}
                            />
                        ))
                    ) : (
                        <div className='text-center col-span-full py-10'>
                            <p className='text-muted-foreground text-lg'>No active challenges found.</p>
                            <p className='text-sm text-gray-400'>Check back later for new coding sprints!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar: Leaderboard */}
            <div className='hidden lg:block w-80 sticky top-24'>
                <Leaderboard />
            </div>
        </div>
    );
};

export default HomeFeed;
