import React, { useEffect, useState } from 'react';
import { adminApi, type AdminStatistics, type AdminUser } from '@/services/api';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
    const [stats, setStats] = useState<AdminStatistics | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const s = await adminApi.getStatistics();
                setStats(s);
                const u = await adminApi.getUsers();
                setUsers(u);
            } catch (e) {
                console.error('Failed to load admin data', e);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const toggleActive = async (id: string, isActive: boolean) => {
        try {
            await adminApi.toggleUserActive(id, !isActive);
            setUsers((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: !isActive } : p)));
        } catch (e) {
            console.error(e);
        }
    };

    const changeRole = async (id: string, newRole: string) => {
        try {
            await adminApi.changeUserRole(id, newRole);
            setUsers((prev) => prev.map((p) => (p.id === id ? { ...p, role: newRole } : p)));
        } catch (e) {
            console.error(e);
        }
    };

    const deleteUser = async (id: string) => {
        try {
            await adminApi.deleteUser(id);
            setUsers((prev) => prev.filter((p) => p.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    const handleLogout = () => {
        setLogoutDialogOpen(true);
    };

    const confirmLogout = () => {
        logout();
        navigate('/login');
        setLogoutDialogOpen(false);
    };

    if (!user) {
        return <div className="p-6">Unauthorized</div>;
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-orange-100 via-gray-50 to-gray-200">
            {/* Navbar */}
            <Navbar 
                variant="admin" 
                onLogout={handleLogout}
            />

            <div className="w-full p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage users and system settings</p>
                </div>

            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
            )}

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
                        <p className="text-3xl font-bold text-amber-600">{stats.total_users}</p>
                    </div>
                    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Admin Users</h3>
                        <p className="text-3xl font-bold text-amber-600">{stats.admin_users}</p>
                    </div>
                    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Regular Users</h3>
                        <p className="text-3xl font-bold text-amber-600">{stats.regular_users}</p>
                    </div>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">User Management</h2>
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left p-3 text-sm font-semibold text-gray-700">Username</th>
                                <th className="text-left p-3 text-sm font-semibold text-gray-700">Email</th>
                                <th className="text-left p-3 text-sm font-semibold text-gray-700">Role</th>
                                <th className="text-left p-3 text-sm font-semibold text-gray-700">Status</th>
                                <th className="text-left p-3 text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-3 text-sm font-medium text-gray-900">{u.username}</td>
                                    <td className="p-3 text-sm text-gray-600">{u.email}</td>
                                    <td className="p-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            u.role === 'ADMIN' 
                                                ? 'bg-amber-100 text-amber-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            u.is_active 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {u.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-2 flex-wrap">
                                            <Button 
                                                size="sm" 
                                                variant={u.is_active ? "outline" : "default"}
                                                onClick={() => toggleActive(u.id, u.is_active)}
                                                className={!u.is_active ? "bg-green-600 hover:bg-green-700" : ""}
                                            >
                                                {u.is_active ? 'Deactivate' : 'Activate'}
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => changeRole(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                            >
                                                {u.role === 'ADMIN' ? '→ User' : '→ Admin'}
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="destructive" 
                                                onClick={() => deleteUser(u.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
            </div>

            {/* Logout Confirmation Dialog */}
            <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin keluar dari Admin Dashboard?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmLogout}
                            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
                        >
                            Ya, Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminPage;
