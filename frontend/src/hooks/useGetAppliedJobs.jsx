import { setAllAppliedJobs } from "../store/jobSlice";
import { getAppliedJobs } from "../services/jobService";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react"
import { useDispatch } from "react-redux"

const useGetAppliedJobs = () => {
    const dispatch = useDispatch();
    const query = useQuery({
        queryKey: ["appliedJobs"],
        queryFn: getAppliedJobs
    });

    useEffect(() => {
        if (query.data) {
            dispatch(setAllAppliedJobs(query.data));
        }
    }, [dispatch, query.data]);

    return query;
};
export default useGetAppliedJobs;
