import React, { useEffect, useRef } from 'react'
import HeroSection from '../ui/HeroSection'
import LatestJobs from '../jobs/LatestJobs'
import useGetAllJobs from '../hooks/useGetAllJobs'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Footer from '../shared/Footer'

const Home = () => {
  useGetAllJobs({ keyword: '' });
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  const jobsSectionRef = useRef(null);

  useEffect(() => {
    if (user?.role === 'recruiter') {
      navigate("/admin/companies");
    }
  }, [user, navigate]);


  return (
    <div className='min-h-screen'>
      <HeroSection jobsSectionRef={jobsSectionRef} />

      <div ref={jobsSectionRef} className='scroll-mt-20'>
        <LatestJobs />
      </div>

      <Footer />
    </div>
  )
}

export default Home

