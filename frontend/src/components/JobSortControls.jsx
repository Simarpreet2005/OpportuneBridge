import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

const JobSortControls = ({ sortBy, onSortChange }) => {
    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'salary_high', label: 'Salary: High to Low' },
        { value: 'salary_low', label: 'Salary: Low to High' },
        { value: 'relevance', label: 'Relevance' }
    ];

    return (
        <div className="flex items-center space-x-4">
            <Label htmlFor="sortBy">Sort by:</Label>
            <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger id="sortBy" className="w-[200px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default JobSortControls;
