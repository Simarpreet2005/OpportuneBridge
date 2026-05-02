import React, { useState } from 'react'
import { Button } from './ui/button'
import { Search, Sparkles, TrendingUp, Award } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        if (window.location.pathname !== '/') {
            navigate("/jobs");
        }
    }

    return (
        <div className='relative overflow-hidden'>
            {/* Background Gradient */}
            <div className='absolute inset-0 bg-gradient-hero -z-10'></div>

            {/* Decorative Elements */}
            <div className='absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10'></div>
            <div className='absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10'></div>

            <div className='text-center max-w-5xl mx-auto px-4 py-20 md:py-28'>
                <div className='flex flex-col gap-6 animate-fade-in'>
                    {/* Badge */}
                    <div className='flex justify-center'>
                        <span className='inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm text-primary font-semibold shadow-card border border-primary/20 hover:shadow-elevated transition-all hover:scale-105'>
                            <Sparkles className='w-4 h-4' />
                            Level Up Your Career
                        </span>
                    </div>

                    {/* Main Heading */}
                    <h1 className='text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight'>
                        Search, Apply & <br />
                        Get Your <span className='text-gradient-primary'>Dream Opportunity</span>
                    </h1>

                    {/* Subheading */}
                    <p className='text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed'>
                        Discover the best jobs, internships, and coding competitions all in one place.
                        Your perfect career path starts here!
                    </p>

                    {/* Search Bar */}
                    <div className='flex w-full md:w-[600px] shadow-elevated border-2 border-white/50 pl-6 rounded-2xl items-center gap-4 mx-auto bg-white/90 backdrop-blur-sm focus-within:ring-4 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all mt-4 hover:shadow-floating'>
                        <Search className='h-5 w-5 text-muted-foreground' />
                        <input
                            type="text"
                            placeholder='Find jobs, internships, or competitions...'
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && searchJobHandler()}
                            className='outline-none border-none w-full bg-transparent py-4 text-base placeholder:text-muted-foreground/60'
                        />
                        <Button
                            onClick={searchJobHandler}
                            variant="accent"
                            className="rounded-r-2xl rounded-l-xl h-[44px] m-1 px-5 text-sm font-semibold"
                        >
                            Search
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className='flex flex-wrap justify-center gap-8 mt-8'>
                        <div className='flex items-center gap-2 text-sm font-semibold text-foreground/80'>
                            <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
                                <TrendingUp className='w-5 h-5 text-primary' />
                            </div>
                            <div className='text-left'>
                                <div className='text-2xl font-bold text-primary'>10K+</div>
                                <div className='text-xs text-muted-foreground'>Active Jobs</div>
                            </div>
                        </div>
                        <div className='flex items-center gap-2 text-sm font-semibold text-foreground/80'>
                            <div className='w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center'>
                                <Award className='w-5 h-5 text-accent' />
                            </div>
                            <div className='text-left'>
                                <div className='text-2xl font-bold text-accent'>500+</div>
                                <div className='text-xs text-muted-foreground'>Companies</div>
                            </div>
                        </div>
                        <div className='flex items-center gap-2 text-sm font-semibold text-foreground/80'>
                            <div className='w-10 h-10 rounded-full bg-success/10 flex items-center justify-center'>
                                <Sparkles className='w-5 h-5 text-success' />
                            </div>
                            <div className='text-left'>
                                <div className='text-2xl font-bold text-success'>95%</div>
                                <div className='text-xs text-muted-foreground'>Success Rate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeroSection