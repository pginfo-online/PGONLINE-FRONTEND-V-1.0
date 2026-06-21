import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { UserX, Trash2, Search } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import adminService from '../../services/admin.service';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleTab, setRoleTab] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers({
        role: roleTab === 'all' ? undefined : roleTab,
        limit: 100,
      });
      setUsers(data.users);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [roleTab]);

  const handleSuspend = async (id) => {
    try {
      const updated = await adminService.suspendUser(id);
      setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)));
      toast.success(updated.isActive ? 'User activated' : 'User suspended');
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this user?')) return;
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch (err) { toast.error(err.message); }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper title="User Management" subtitle="Manage tenants and PG owners">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'tenant', 'owner'].map((tab) => (
            <button key={tab} onClick={() => setRoleTab(tab)}
              className={`btn btn-sm ${roleTab === tab ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}>
              {tab}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input className="input" placeholder="Search by name or email..." value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr><th>User</th><th>Role</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 16, width: '80%' }} /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No users found</td></tr>
            ) : (
              filtered.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%',
                        background: user.role === 'owner' ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge badge-${user.role === 'owner' ? 'primary' : 'approved'}`} style={{ textTransform: 'capitalize' }}>{user.role}</span></td>
                  <td style={{ color: '#6b7280' }}>{user.phone || '—'}</td>
                  <td style={{ color: '#6b7280', fontSize: '0.8125rem' }}>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><span className={`badge ${user.isActive ? 'badge-approved' : 'badge-rejected'}`}>{user.isActive ? 'Active' : 'Suspended'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button className="btn btn-sm" onClick={() => handleSuspend(user._id)}
                        style={{ background: user.isActive ? '#fee2e2' : '#d1fae5', color: user.isActive ? '#991b1b' : '#065f46', border: 'none' }}>
                        <UserX size={13} /> {user.isActive ? 'Suspend' : 'Activate'}
                      </button>
                      <button className="btn btn-sm" style={{ background: '#fff1f2', color: '#be123c', border: 'none' }}
                        onClick={() => handleDelete(user._id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
