import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, Filter } from 'lucide-react';

const JobFilterPanel = ({ onApplyFilters, onClearFilters }) => {
    const [skills, setSkills] = useState('');
    const [location, setLocation] = useState('');
    const [experience, setExperience] = useState('');
    const [salaryRange, setSalaryRange] = useState(['', '']);
    const [company, setCompany] = useState('');

    const experienceLevels = [
        'Entry Level',
        'Mid Level',
        'Senior Level',
        'Lead',
        'Manager'
    ];

    const handleApply = () => {
        const filters = {
            skills: skills,
            location: location,
            experience: experience,
            minSalary: salaryRange[0],
            maxSalary: salaryRange[1],
            company: company
        };
        onApplyFilters(filters);
    };

    const handleClear = () => {
        setSkills('');
        setLocation('');
        setExperience('');
        setSalaryRange(['', '']);
        setCompany('');
        onClearFilters();
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                    <X className="w-4 h-4 mr-1" />
                    Clear
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma separated)</Label>
                    <Input
                        id="skills"
                        placeholder="e.g., React, Node.js, Python"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        placeholder="e.g., New York, Remote"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select value={experience} onValueChange={setExperience}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                            {experienceLevels.map((level) => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Salary Range (LPA)</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            min={0}
                            placeholder="Min Salary"
                            value={salaryRange[0]}
                            onChange={(e) => setSalaryRange([e.target.value, salaryRange[1]])}
                            className="w-full"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                            type="number"
                            min={0}
                            placeholder="Max Salary"
                            value={salaryRange[1]}
                            onChange={(e) => setSalaryRange([salaryRange[0], e.target.value])}
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                        id="company"
                        placeholder="e.g., Google, Microsoft"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                    />
                </div>

                <Button onClick={handleApply} className="w-full">
                    Apply Filters
                </Button>
            </CardContent>
        </Card>
    );
};

export default JobFilterPanel;
