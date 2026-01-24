import React, { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import axios from 'axios';
import { CHALLENGE_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, X } from 'lucide-react';

const CreateChallenge = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        difficulty: "",
        techStack: "",
        boilerplateCode: {
            python: "",
            javascript: "",
            java: "",
            cpp: ""
        }
    });
    const [testCases, setTestCases] = useState([{ input: "", output: "", isHidden: false }]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const boilerplateHandler = (lang, value) => {
        setInput({
            ...input,
            boilerplateCode: {
                ...input.boilerplateCode,
                [lang]: value
            }
        });
    };

    const handleTestCaseChange = (index, field, value) => {
        const newTestCases = [...testCases];
        newTestCases[index][field] = value;
        setTestCases(newTestCases);
    };

    const addTestCase = () => {
        setTestCases([...testCases, { input: "", output: "", isHidden: false }]);
    };

    const removeTestCase = (index) => {
        const newTestCases = testCases.filter((_, i) => i !== index);
        setTestCases(newTestCases);
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const formattedTechStack = input.techStack.split(',').map(tag => tag.trim());
            const payload = {
                ...input,
                techStack: formattedTechStack,
                testCases
            };

            const res = await axios.post(`https://opportunebridge-backend.onrender.com/api/v1/challenge`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/challenges");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className='flex items-center justify-center w-full my-5'>
                <form onSubmit={submitHandler} className='p-8 max-w-4xl w-full border border-gray-200 shadow-lg rounded-md'>
                    <h2 className='font-bold text-2xl mb-5'>Create New Challenge</h2>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                        <div>
                            <Label>Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
                                onChange={changeEventHandler}
                                className="my-1"
                                placeholder="Challenge Title"
                                required
                            />
                        </div>
                        <div>
                            <Label>Difficulty</Label>
                            <Select onValueChange={(value) => setInput({ ...input, difficulty: value })}>
                                <SelectTrigger className="w-full my-1">
                                    <SelectValue placeholder="Select Difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className='mb-4'>
                        <Label>Description</Label>
                        <Textarea
                            name="description"
                            value={input.description}
                            onChange={changeEventHandler}
                            className="my-1"
                            placeholder="Describe the challenge..."
                            required
                        />
                    </div>

                    <div className='mb-4'>
                        <Label>Tech Stack (Comma separated)</Label>
                        <Input
                            type="text"
                            name="techStack"
                            value={input.techStack}
                            onChange={changeEventHandler}
                            className="my-1"
                            placeholder="e.g. JavaScript, Python, Algorithms"
                        />
                    </div>

                    <div className='mb-6'>
                        <Label className="text-lg font-semibold">Boilerplate Code</Label>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-2'>
                            <div>
                                <Label className="text-xs text-muted-foreground">JavaScript</Label>
                                <Textarea
                                    value={input.boilerplateCode.javascript}
                                    onChange={(e) => boilerplateHandler('javascript', e.target.value)}
                                    className="h-32 font-mono text-sm"
                                    placeholder="// JavaScript starter code"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Python</Label>
                                <Textarea
                                    value={input.boilerplateCode.python}
                                    onChange={(e) => boilerplateHandler('python', e.target.value)}
                                    className="h-32 font-mono text-sm"
                                    placeholder="# Python starter code"
                                />
                            </div>
                            {/* Can add Java/C++ here if needed */}
                        </div>
                    </div>

                    <div className='mb-6'>
                        <div className="flex justify-between items-center mb-2">
                            <Label className="text-lg font-semibold">Test Cases</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addTestCase}>
                                <Plus className="w-4 h-4 mr-1" /> Add Case
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {testCases.map((tc, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-2 items-start p-3 bg-muted/30 rounded-md border border-border">
                                    <div className="flex-1 w-full">
                                        <Input
                                            placeholder="Input (e.g. 5, [1,2])"
                                            value={tc.input}
                                            onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <Input
                                            placeholder="Expected Output"
                                            value={tc.output}
                                            onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 md:mt-0">
                                        <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeTestCase(index)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {
                        loading ? <Button className="w-full my-4" disabled> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Creating... </Button>
                            : <Button type="submit" className="w-full my-4">Create Challenge</Button>
                    }
                </form>
            </div>
        </div>
    );
};

export default CreateChallenge;
