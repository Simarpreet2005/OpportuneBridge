import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Trophy, Medal } from 'lucide-react';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get("http://localhost:8000/api/v1/user/leaderboard");
                if (res.data.success) {
                    setUsers(res.data.leaderboard);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchLeaderboard();
    }, []);

    return (
        <div className='bg-card border border-border rounded-xl p-6 shadow-sm'>
            <div className='flex items-center gap-2 mb-6'>
                <Trophy className='w-6 h-6 text-yellow-500' />
                <h2 className='text-xl font-bold'>Global Leaderboard</h2>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">Rank</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead className="text-right">XP</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user, index) => (
                        <TableRow key={user._id}>
                            <TableCell className="font-medium">
                                {index === 0 && <Medal className="w-5 h-5 text-yellow-500" />}
                                {index === 1 && <Medal className="w-5 h-5 text-gray-400" />}
                                {index === 2 && <Medal className="w-5 h-5 text-amber-600" />}
                                {index > 2 && `#${index + 1}`}
                            </TableCell>
                            <TableCell>
                                <div className='flex items-center gap-3'>
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user.profile?.profilePhoto} />
                                        <AvatarFallback>{user.fullname?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col'>
                                        <span className='font-medium'>{user.fullname}</span>
                                        <span className='text-xs text-muted-foreground'>{user.profile?.gamification?.rank || 'Bronze'}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-bold text-primary">
                                {user.profile?.gamification?.xp || 0}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default Leaderboard;
