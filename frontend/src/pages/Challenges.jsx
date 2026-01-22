import React from 'react'
import Navbar from '../components/shared/Navbar'
import HomeFeed from '../components/home/HomeFeed'
import Footer from '../components/shared/Footer'

const Challenges = () => {
    return (
        <div className='bg-background min-h-screen'>
            <div className='pt-8'>
                <div className='max-w-7xl mx-auto px-4'>
                    <h1 className='text-4xl font-bold mb-2'>Coding Challenges</h1>
                    <p className='text-muted-foreground mb-8'>Prove your skills and climb the leaderboard.</p>
                </div>
                <HomeFeed />
            </div>
            <Footer />
        </div>
    )
}

export default Challenges
