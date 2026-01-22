import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Zap, Code, Loader2 } from 'lucide-react';
import useGetMatchScore from '@/hooks/useGetMatchScore';
import { useNavigate } from 'react-router-dom';

const ChallengeCard = ({
    challengeId,
    title = "Algorithm Mastery",
    difficulty = "Hard",
    techStack = ["Python", "C++"],
    participants = 0,
    image = "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop"
}) => {
    // AI Match Hook
    const { score, loading } = useGetMatchScore(challengeId, 'Challenge');
    const navigate = useNavigate();

    return (
        <div className='group relative break-inside-avoid mb-6 rounded-xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300'>
            {/* AI Match Badge */}
            <div className='absolute top-3 right-3 z-10'>
                <div className={`
           px-2 py-1 rounded-full flex items-center gap-1 shadow-sm transition-all
           ${loading ? 'bg-muted/80' : 'bg-white/90 backdrop-blur-sm'}
        `}>
                    {loading ? (
                        <Loader2 className='w-3 h-3 animate-spin text-muted-foreground' />
                    ) : (
                        <>
                            <Zap className={`w-4 h-4 ${score > 80 ? 'text-green-500 fill-green-500' : 'text-yellow-500 fill-yellow-500'}`} />
                            <span className={`text-xs font-bold ${score > 80 ? 'text-green-700' : 'text-foreground'}`}>
                                {score !== null ? `${score}% Match` : 'N/A'}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Cover Image */}
            <div className='relative h-48 overflow-hidden'>
                <img
                    src={image}
                    alt={title}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4'>
                    <Badge className={`
             ${difficulty === 'Hard' ? 'bg-destructive/90' : difficulty === 'Medium' ? 'bg-orange-500/90' : 'bg-green-500/90'} 
             text-white border-none`
                    }>
                        {difficulty}
                    </Badge>
                </div>
            </div>

            {/* Content */}
            <div className='p-4 space-y-3'>
                <h3 className='font-bold text-lg leading-tight line-clamp-2'>{title}</h3>

                <div className='flex flex-wrap gap-2'>
                    {techStack && techStack.map((tech, i) => (
                        <span key={i} className='text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md font-medium'>
                            {tech}
                        </span>
                    ))}
                </div>

                <div className='flex items-center justify-between pt-2'>
                    <div className='flex -space-x-2'>
                        {[1, 2, 3].map((_, i) => (
                            <Avatar key={i} className='w-6 h-6 border-2 border-white'>
                                <AvatarFallback className='text-[10px] bg-muted'>U</AvatarFallback>
                            </Avatar>
                        ))}
                        <div className='w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium border-2 border-white text-muted-foreground'>
                            +{participants}
                        </div>
                    </div>

                    <Button size="sm" className='rounded-full h-8 px-4' onClick={() => navigate(`/challenge/${challengeId}`)}>
                        Start <Code className='w-3 h-3 ml-2' />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChallengeCard;
