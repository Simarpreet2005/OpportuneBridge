import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import axios from 'axios'
import { USER_API_END_POINT, SUPERADMIN_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { Trash2, Ban, CheckCircle, Loader2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog"

const SuperAdminUsers = () => {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

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
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId) => {
        try {
            setLoading(true);
            const res = await axios.delete(`${SUPERADMIN_API_END_POINT}/users/${userId}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchUsers(); // Refresh the list
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to delete user");
        } finally {
            setLoading(false);
            setDeleteDialogOpen(false);
            setSelectedUser(null);
        }
    };

    const handleSuspendUser = async (userId, suspend) => {
        try {
            setLoading(true);
            const res = await axios.patch(`${SUPERADMIN_API_END_POINT}/users/${userId}/suspend`,
                { suspend },
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                fetchUsers(); // Refresh the list
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to update user status");
        } finally {
            setLoading(false);
        }
    };

    const openDeleteDialog = (user) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

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
                            <TableHead>Status</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            users.length <= 0 ? <TableRow><TableCell colSpan={6} className="text-center">No users found.</TableCell></TableRow> : (
                                users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell className="font-medium">{user.fullname}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'recruiter' ? 'secondary' : user.role === 'superadmin' ? 'destructive' : 'outline'}>{user.role}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.isSuspended ? (
                                                <Badge variant="destructive">Suspended</Badge>
                                            ) : (
                                                <Badge variant="default" className="bg-green-500">Active</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{user.createdAt?.split("T")[0]}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {user.isSuspended ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleSuspendUser(user._id, false)}
                                                        disabled={loading}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Activate
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleSuspendUser(user._id, true)}
                                                        disabled={loading}
                                                    >
                                                        <Ban className="w-4 h-4 mr-1" />
                                                        Suspend
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => openDeleteDialog(user)}
                                                    disabled={loading}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )
                        }
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account for <strong>{selectedUser?.fullname}</strong> and remove all their data from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleDeleteUser(selectedUser?._id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default SuperAdminUsers

