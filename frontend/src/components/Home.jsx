import React, { useEffect } from 'react'
import HeroSection from './HeroSection'
import LatestJobs from './LatestJobs'
import useGetAllJobs from '@/Hooks/useGetAllJobs'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Footer from './shared/Footer'

const Home = () => {
  useGetAllJobs();
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'recruiter') {
      navigate("/admin/companies");
    }
  }, [user, navigate]);


  return (
    <div className='min-h-screen'>
      <div className="pt-8 pb-4">
        <HeroSection />
      </div>

      <LatestJobs />

      <Footer />
    </div>
  )
}

export default Home