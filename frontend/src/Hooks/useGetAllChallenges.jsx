import { setChallenges } from '@/redux/challengeSlice';
import { CHALLENGE_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const useGetAllChallenges = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const res = await axios.get(`${CHALLENGE_API_END_POINT}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setChallenges(res.data.challenges));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchChallenges();
    }, []);
}

export default useGetAllChallenges;
