import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { UserX, Trash2, Search, UserPlus, Key, Copy, Check } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import adminService from '../../services/admin.service';
import Modal from '../../components/ui/Modal';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleTab, setRoleTab] = useState('all');
  const [search, setSearch] = useState('');

  // Owner Creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

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

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm(prev => ({ ...prev, password: pass }));
    setFormErrors(prev => ({ ...prev, password: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) {
      errors.name = 'Name is required';
    } else if (form.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (form.phone && form.phone.trim() !== '') {
      if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
        errors.phone = 'Enter a valid 10-digit Indian mobile number';
      }
    }

    if (!form.password) {
      errors.password = 'Password is required';
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setCreating(true);
    try {
      await adminService.createOwner({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
      setCreatedCredentials({ email: form.email.trim(), password: form.password });
      toast.success('Owner account created successfully');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setForm({ name: '', email: '', phone: '', password: '' });
    setFormErrors({});
    setCreatedCredentials(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!createdCredentials) return;
    const text = `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper title="User Management" subtitle="Manage tenants and PG owners">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'tenant', 'owner'].map((tab) => (
              <button key={tab} onClick={() => setRoleTab(tab)}
                className={`btn btn-sm ${roleTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize' }}>
                {tab}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 400 }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input className="input" placeholder="Search by name or email..." value={search}
              onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <UserPlus size={16} />
          Create Owner
        </button>
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

      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        title={createdCredentials ? "Owner Account Created" : "Create Owner Account"}
        size="md"
      >
        {createdCredentials ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#d1fae5', color: '#065f46',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold'
            }}>
              ✓
            </div>
            <h4 style={{ fontWeight: 600, fontSize: '1.125rem', color: '#111827', marginBottom: '0.5rem' }}>Credentials Generated</h4>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem', maxWidth: '380px' }}>
              The owner account has been created successfully. Please copy and share these credentials with the owner.
            </p>

            <div style={{
              width: '100%',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Email Address</span>
                <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#111827', wordBreak: 'break-all' }}>{createdCredentials.email}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Password</span>
                <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#111827', fontFamily: 'monospace' }}>{createdCredentials.password}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
              <button
                onClick={handleCopy}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Credentials'}
              </button>
              <button
                onClick={handleCloseModal}
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Full Name *</label>
              <input
                type="text"
                className={`input ${formErrors.name ? 'error' : ''}`}
                placeholder="e.g. Rajesh Kumar"
                value={form.name}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, name: e.target.value }));
                  if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
                }}
              />
              {formErrors.name && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{formErrors.name}</span>}
            </div>

            <div className="form-group">
              <label className="label">Email Address *</label>
              <input
                type="email"
                className={`input ${formErrors.email ? 'error' : ''}`}
                placeholder="e.g. rajesh@example.com"
                value={form.email}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, email: e.target.value }));
                  if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
                }}
              />
              {formErrors.email && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{formErrors.email}</span>}
            </div>

            <div className="form-group">
              <label className="label">Phone Number (Optional)</label>
              <input
                type="tel"
                className={`input ${formErrors.phone ? 'error' : ''}`}
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, phone: e.target.value }));
                  if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }));
                }}
              />
              {formErrors.phone && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{formErrors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="label">Password *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className={`input ${formErrors.password ? 'error' : ''}`}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, password: e.target.value }));
                    if (formErrors.password) setFormErrors(prev => ({ ...prev, password: '' }));
                  }}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={generatePassword}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0 0.875rem' }}
                  title="Generate secure password"
                >
                  <Key size={14} />
                  Generate
                </button>
              </div>
              {formErrors.password && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{formErrors.password}</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn btn-secondary"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Owner'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </PageWrapper>
  );
}
