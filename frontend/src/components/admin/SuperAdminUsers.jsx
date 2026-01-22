import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Badge } from '../ui/badge'
import axios from 'axios'
import { USER_API_END_POINT, SUPERADMIN_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'

const SuperAdminUsers = () => {
    
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${SUPERADMIN_API_END_POINT}/users`, { withCredentials: true });
                if (res.data.success) {
                    setUsers(res.data.users);
                }
            } catch (error) {
                console.log(error);
                toast.error("Failed to fetch users");
            }
        }
        fetchUsers();
    }, []);

    return (
        <div className='max-w-7xl mx-auto my-10 px-4'>
            <h1 className='text-3xl font-bold mb-5'>User Management</h1>
            <div className='bg-white rounded-xl shadow-md p-6'>
                <Table>
                    <TableCaption>A list of all registered users.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            users.length <= 0 ? <span>No users found.</span> : (
                                users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>{user.fullname}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'recruiter' ? 'secondary' : user.role === 'superadmin' ? 'destructive' : 'outline'}>{user.role}</Badge>
                                        </TableCell>
                                        <TableCell>{user.createdAt.split("T")[0]}</TableCell>
                                    </TableRow>
                                ))
                            )
                        }
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default SuperAdminUsers
