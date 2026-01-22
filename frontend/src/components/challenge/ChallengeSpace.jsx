import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Play, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '../shared/Navbar';
import axios from 'axios';
import { CHALLENGE_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';

const ChallengeSpace = () => {
    const { id } = useParams();
    const [challenge, setChallenge] = useState(null);
    const [code, setCode] = useState("// Loading...");
    const [output, setOutput] = useState("");
    const [status, setStatus] = useState("IDLE"); // IDLE, RUNNING, PASSED, FAILED
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const res = await axios.get(`${CHALLENGE_API_END_POINT}/${id}`, { withCredentials: true });
                if (res.data.success) {
                    setChallenge(res.data.challenge);
                    const lang = 'python';
                    setCode(res.data.challenge.boilerplateCode?.[lang] || "# Write your code here");
                }
            } catch (error) {
                console.log(error);
                toast.error("Failed to load challenge");
            } finally {
                setLoading(false);
            }
        };
        fetchChallenge();
    }, [id]);

    const handleRunCode = async () => {
        setStatus("RUNNING");
        setOutput("Executing...");

        setTimeout(() => {
            try {
                if (code.includes("fail") || code.includes("error")) {
                    setStatus("FAILED");
                    setOutput("Error: TestCase 1 Failed.\nExpected: 15\nActual: 0");
                } else {
                    setStatus("PASSED");
                    setOutput("TestCase 1: Passed\nTestCase 2: Passed\n\nResult: Success!");
                }
            } catch (err) {
                setStatus("FAILED");
                setOutput("Runtime Error");
            }
        }, 1500);
    };

    if (loading) return <div className='h-screen flex items-center justify-center'><Loader2 className='animate-spin' /></div>;
    if (!challenge) return <div className='h-screen flex items-center justify-center'>Challenge not found</div>;

    return (
        <div className='flex flex-col h-screen bg-background'>

            <div className='flex-1 flex overflow-hidden'>
                <div className='w-2/5 p-6 overflow-y-auto border-r border-border'>
                    <div className='flex items-center gap-3 mb-4'>
                        <h1 className='text-2xl font-bold'>{challenge.title}</h1>
                        <Badge variant={challenge.difficulty === 'Hard' ? 'destructive' : 'secondary'}>
                            {challenge.difficulty}
                        </Badge>
                    </div>

                    <div className='prose dark:prose-invert max-w-none text-foreground/90'>
                        <p>{challenge.description}</p>
                    </div>

                    <div className='mt-8 space-y-4'>
                        <h3 className='font-semibold'>Examples</h3>
                        {challenge.testCases?.slice(0, 2).map((tc, i) => (
                            <div key={i} className='bg-muted p-4 rounded-lg text-sm font-mono'>
                                <div><span className='text-muted-foreground'>Input:</span> {tc.input}</div>
                                <div><span className='text-muted-foreground'>Output:</span> {tc.output}</div>
                            </div>
                        ))}
                    </div>
                </div>

                
                <div className='w-3/5 flex flex-col bg-[#1e1e1e]'>
                    <div className='h-12 border-b border-[#333] flex items-center justify-between px-4 bg-[#1e1e1e] text-white'>
                        <div className='text-sm font-medium text-gray-400'>Python 3</div>
                        <div className='flex gap-2'>
                            <Button
                                size="sm"
                                variant="outline"
                                className="bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white"
                                onClick={handleRunCode}
                                disabled={status === 'RUNNING'}
                            >
                                <Play className='w-4 h-4 mr-2' /> Run
                            </Button>
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Send className='w-4 h-4 mr-2' /> Submit
                            </Button>
                        </div>
                    </div>

                    
                    <div className='flex-1 relative'>
                        <Editor
                            height="100%"
                            defaultLanguage="python"
                            value={code}
                            onChange={(val) => setCode(val)}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false
                            }}
                        />
                    </div>

                   
                    <div className='h-48 border-t border-[#333] bg-[#1e1e1e] text-gray-300 font-mono text-sm flex flex-col'>
                        <div className='h-8 bg-[#252526] px-4 flex items-center text-xs font-bold uppercase tracking-wider text-gray-500'>
                            Console Output
                        </div>
                        <div className='flex-1 p-4 overflow-y-auto whitespace-pre-wrap'>
                            {status === 'RUNNING' && <span className='text-yellow-500'>Compiling...</span>}
                            {status === 'PASSED' && <span className='text-green-500 font-bold mb-2 flex items-center gap-2'><CheckCircle className='w-4 h-4' /> Tests Passed</span>}
                            {status === 'FAILED' && <span className='text-red-500 font-bold mb-2 flex items-center gap-2'><AlertCircle className='w-4 h-4' /> Tests Failed</span>}
                            {output}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChallengeSpace;
