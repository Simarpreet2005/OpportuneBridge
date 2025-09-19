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
return res.status(200).json({
    message:"New job created Successfully",
    job,
    success:true
});
}catch(error){
    console.log(error);
}
}