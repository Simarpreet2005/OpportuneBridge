import { Job } from "../models/job.model";

export const postJob =async(req,res)=>{
try{
const{title,description,requirements,salary,location,jobType,experience,position,companyId}=req.body;
const userId=req.id;
if(!title||!description||!requirements||!salary||!location||!jobType||!experience||!position||!companyId){
    return res.status(400).json({
        message:"Something is missing",
        success:false
})
}
const job=await Job.create({
  title,
  description,requirements:requirements.split(","),
  salary:Number(salary),location,
  jobType,
  experienceLevel:experience,
  position,
  company:companyId,
  created_by:userId  
});
return res.status(201).json({
    message:"New job created Successfully",
    job,
    success:true
});
}catch(error){
    console.log(error);
}
}
export const getAllJobs=async(req,res)=>{
    try{
        const keyword=req.query.keyword || "";
        const query={
            $or:[
               {title:{$regex:keyword,$options:"i"}},
               {description:{$regex:keyword,$options:"i"}} 
            ]
        };
        const jobs=await Job.find(query);
        if(!jobs){
    return res.status(404).json({
        message:"Job not found",
        success:false
})
        }
return res.status(201).json({
    jobs,
    success:true
});

    }catch(error){
        console.log(error);
    }
}
