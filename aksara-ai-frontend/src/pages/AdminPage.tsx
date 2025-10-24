import React, { useEffect, useState } from 'react';
import { adminApi, type AdminStatistics, type AdminUser } from '@/services/api';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const AdminPage: React.FC = () => {
    const [stats, setStats] = useState<AdminStatistics | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

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

    if (!user) {
        return <div className="p-6">Unauthorized</div>;
    }

    return (
        <div className="container p-6">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

            {loading && <p>Loading...</p>}

            {stats && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 border rounded">Total Users: {stats.total_users}</div>
                    <div className="p-4 border rounded">Admins: {stats.admin_users}</div>
                    <div className="p-4 border rounded">Regulars: {stats.regular_users}</div>
                </div>
            )}

            <div className="border rounded p-4">
                <h2 className="text-lg font-semibold mb-2">Users</h2>
                <table className="w-full table-auto">
                    <thead>
                        <tr>
                            <th className="text-left p-2">Username</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Role</th>
                            <th className="text-left p-2">Active</th>
                            <th className="text-left p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} className="border-t">
                                <td className="p-2">{u.username}</td>
                                <td className="p-2">{u.email}</td>
                                <td className="p-2">{u.role}</td>
                                <td className="p-2">{u.is_active ? 'Yes' : 'No'}</td>
                                <td className="p-2 space-x-2">
                                    <Button size="sm" onClick={() => toggleActive(u.id, u.is_active)}>
                                        {u.is_active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                    <Button size="sm" onClick={() => changeRole(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')}>
                                        Make {u.role === 'ADMIN' ? 'User' : 'Admin'}
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => deleteUser(u.id)}>
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPage;
