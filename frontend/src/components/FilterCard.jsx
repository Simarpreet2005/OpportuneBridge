import React, { useEffect, useState } from 'react'
import { Label } from './ui/label'

const filterData = [
    {
        filterType: "Location",
        array: ["Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Mumbai", "Remote", "Pan India"]
    },
    {
        filterType: "Industry",
        array: ["Frontend Developer", "Backend Developer", "FullStack Developer", "Nextjs Developer", "Reactjs Developer", "Nodejs Developer", "DevOps", "Data Science", "AI/ML", "Mobile Developer"]
    },
    {
        filterType: "Opportunity Type",
        array: ["Job", "Internship", "Competition"]
    },
    {
        filterType: "Salary",
        array: ["0-40k", "42k-1lakh", "1lakh to 5lakh"]
    },
]

const FilterCard = ({ selectedFilters = {}, onFilterChange }) => {
    const [localFilters, setLocalFilters] = useState(selectedFilters);

    useEffect(() => {
        setLocalFilters(selectedFilters);
    }, [selectedFilters]);

    const changeHandler = (filterType, item) => {
        setLocalFilters((prev) => {
            const currentValues = prev[filterType] || [];
            const nextValues = currentValues.includes(item)
                ? currentValues.filter((value) => value !== item)
                : [...currentValues, item];
            const updated = { ...prev, [filterType]: nextValues };
            onFilterChange?.(updated);
            return updated;
        });
    };

    return (
        <div className='w-full bg-white p-3 rounded-md'>
            <h1 className='font-bold text-lg'>Filter Jobs</h1>
            <hr className='mt-3' />
            {
                filterData.map((data, index) => (
                    <div key={index} className='mt-4'>
                        <h1 className='font-bold text-lg'>{data.filterType}</h1>
                        {
                            data.array.map((item, idx) => {
                                const itemId = `id${index}-${idx}`;
                                const checked = (localFilters[data.filterType] || []).includes(item);
                                return (
                                    <div key={itemId} className='flex items-center space-x-2 my-2'>
                                        <input
                                            id={itemId}
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => changeHandler(data.filterType, item)}
                                            className="h-4 w-4 cursor-pointer accent-blue-600"
                                        />
                                        <Label htmlFor={itemId} className="cursor-pointer">{item}</Label>
                                    </div>
                                )
                            })
                        }
                    </div>
                ))
            }
        </div>
    )
}

export default FilterCard