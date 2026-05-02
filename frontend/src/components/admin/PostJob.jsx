import React, { useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const parseSalaryForSubmit = (raw) => {
    if (raw === undefined || raw === null || raw === "") return NaN;
    const cleaned = String(raw).trim().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : NaN;
};

const PostJob = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experience: "",
        position: "",
        companyId: "",
        opportunityType: "Job"
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { companies } = useSelector(store => store.company);
    const changeEventHandler = (e) => {
        const { name, value, type } = e.target;
        if (name === "salary") {
            setInput((prev) => ({ ...prev, salary: value }));
            return;
        }
        if (type === "number" || name === "position") {
            setInput((prev) => ({
                ...prev,
                [name]: value === "" ? "" : Number(value)
            }));
            return;
        }
        setInput((prev) => ({ ...prev, [name]: value }));
    };

    const selectChangeHandler = (value) => {
        const selectedCompany = companies.find((company) => company.name.toLowerCase() === value);
        if (!selectedCompany?._id) return;
        setInput((prev) => ({ ...prev, companyId: selectedCompany._id }));
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const salaryNum = parseSalaryForSubmit(input.salary);
        const positionNum = input.position === "" ? NaN : Number(input.position);
        if (!input.companyId) {
            toast.error("Please select a company.");
            return;
        }
        if (!Number.isFinite(salaryNum) || salaryNum < 0) {
            toast.error("Enter a valid salary (numbers only, e.g. 12 or 12.5).");
            return;
        }
        if (!Number.isFinite(positionNum) || positionNum < 1) {
            toast.error("Enter a valid number of open positions (at least 1).");
            return;
        }
        const payload = {
            title: input.title,
            description: input.description,
            requirements: input.requirements,
            salary: salaryNum,
            location: input.location,
            jobType: input.jobType,
            experience: input.experience,
            position: positionNum,
            companyId: input.companyId,
            opportunityType: input.opportunityType || "Job"
        };
        try {
            setLoading(true);
            const res = await axios.post(`${JOB_API_END_POINT}/post`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/jobs");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className='flex items-center justify-center w-full my-5'>
                <form onSubmit={submitHandler} className='p-8 max-w-4xl border border-gray-200 shadow-lg rounded-md'>
                    <div className='grid grid-cols-2 gap-2'>
                        <div>
                            <Label>Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input
                                type="text"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Requirements</Label>
                            <Input
                                type="text"
                                name="requirements"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Salary</Label>
                            <Input
                                type="text"
                                name="salary"
                                value={input.salary}
                                onChange={changeEventHandler}
                                placeholder="e.g. 12 or 12.5 (LPA)"
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Job Type</Label>
                            <Input
                                type="text"
                                name="jobType"
                                value={input.jobType}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Experience Level</Label>
                            <Input
                                type="text"
                                name="experience"
                                value={input.experience}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Opportunity Type</Label>
                            <Select
                                value={input.opportunityType}
                                onValueChange={(value) => setInput((prev) => ({ ...prev, opportunityType: value }))}
                            >
                                <SelectTrigger className="w-full my-1">
                                    <SelectValue placeholder="Select Opportunity Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Job">Job</SelectItem>
                                    <SelectItem value="Internship">Internship</SelectItem>
                                    <SelectItem value="Competition">Competition</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>No of Postion</Label>
                            <Input
                                type="number"
                                name="position"
                                value={input.position}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        {
                            companies.length > 0 && (
                                <Select
                                    value={companies.find((c) => c._id === input.companyId)?.name?.toLowerCase() ?? ""}
                                    onValueChange={selectChangeHandler}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select a Company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {
                                                companies.map((company) => {
                                                    return (
                                                        <SelectItem key={company?._id} value={company?.name?.toLowerCase()}>{company.name}</SelectItem>
                                                    )
                                                })
                                            }

                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )
                        }
                    </div>
                    {
                        loading ? <Button className="w-full my-4"> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full my-4">Post New Job</Button>
                    }
                    {
                        companies.length === 0 && <p className='text-xs text-red-600 font-bold text-center my-3'>*Please register a company first, before posting a jobs</p>
                    }
                </form>
            </div>
        </div>
    )
}

export default PostJob