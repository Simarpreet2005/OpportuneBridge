import React, { useState } from 'react'
import { Button } from './button'
import { Search, Sparkles, TrendingUp, Award } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '../store/jobSlice';
import { useNavigate } from 'react-router-dom';

const HeroSection = ({ jobsSectionRef }) => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/jobs");
    }

    return (
        <div className='relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-hero -z-10'></div>

            <div className='text-center max-w-5xl mx-auto px-4 py-20 md:py-28'>
                <div className='flex flex-col gap-6 animate-fade-in'>
                    <div className='flex justify-center'>
                        <Button className='inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-foreground font-semibold shadow-soft border border-border/70 transition-colors hover:bg-white/90'>
                            <Sparkles className='w-4 h-4' />
                            Level Up Your Career
                        </Button>
                    </div>

                    <h1 className='text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-tight'>
                        Search, Apply & <br />
                        Get Your <span className='text-primary'>Dream Opportunity</span>
                    </h1>

                    <p className='text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed'>
                        Discover the best jobs, internships, and coding competitions all in one place.
                        Your perfect career path starts here!
                    </p>

                    <div className='flex w-full md:w-[600px] shadow-sm border border-border/70 pl-4 rounded-2xl items-center gap-3 mx-auto bg-card focus-within:ring-[3px] focus-within:ring-ring/25 transition-smooth mt-4'>
                        <Search className='h-5 w-5 text-muted-foreground' />
                        <input
                            type="text"
                            placeholder='Find jobs, internships, or competitions...'
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && searchJobHandler()}
                            className='outline-none border-none w-full bg-transparent py-3.5 text-base placeholder:text-muted-foreground/60'
                        />
                        <Button
                            onClick={searchJobHandler}
                            className="rounded-xl h-[44px] m-1 px-6 text-sm font-semibold"
                        >
                            Search
                        </Button>
                    </div>

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
                            <div className='w-10 h-10 rounded-full bg-secondary flex items-center justify-center'>
                                <Award className='w-5 h-5 text-muted-foreground' />
                            </div>
                            <div className='text-left'>
                                <div className='text-2xl font-bold text-foreground'>500+</div>
                                <div className='text-xs text-muted-foreground'>Companies</div>
                            </div>
                        </div>
                        <div className='flex items-center gap-2 text-sm font-semibold text-foreground/80'>
                            <div className='w-10 h-10 rounded-full bg-secondary flex items-center justify-center'>
                                <Sparkles className='w-5 h-5 text-muted-foreground' />
                            </div>
                            <div className='text-left'>
                                <div className='text-2xl font-bold text-foreground'>95%</div>
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
