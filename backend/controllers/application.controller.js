import { Job } from "../models/job.model";

export const applyJob=async(requestAnimationFrame,res)=>{
    try{
    const userId=req.id;
    const jobId=req.params.id;
    if(!jobId){
        return res.status(400).json({
            message:"Job id is required",
            success:false
        })
    }
    // check if the user has already applied for the job
    const existingApplication=await Application.findOne({job:jobId,applicant:userId})
    if(existingApplication){
        return res.status(400).json({
            message:"You have already applied for this job",
            success:false
        })  
    }
    // check if the jobs exists
    const job=await Job.findById(jobId)
    if(!job){
        return res.status(404).json({
            message:"Job not found",
            success:false
        })     
    }}
    catch(error){
        console.log(error);
    }
}
