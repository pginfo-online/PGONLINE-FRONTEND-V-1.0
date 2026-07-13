import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Smartphone, Plus, Edit, Trash2, ShieldAlert, History, ToggleLeft, ToggleRight, ListPlus } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import Modal from '../../components/ui/Modal';
import appVersionService from '../../services/appVersion.service';

export default function AppVersionManagement() {
  const [versions, setVersions] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('android'); // 'android' | 'ios' | 'audits'

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState(null);
  const [form, setForm] = useState({
    platform: 'android',
    version: '',
    minVersion: '',
    priority: 'optional',
    title: '',
    description: '',
    releaseNotes: '',
    rolloutPercentage: 100,
    maintenanceMode: false,
    maintenanceMessage: '',
    updateLink: 'https://play.google.com/store/apps/details?id=com.pginfo.onlinee&pcampaignid=web_share',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [versionsData, auditsData] = await Promise.all([
        appVersionService.getAllVersions(),
        appVersionService.getVersionAudits(),
      ]);
      setVersions(versionsData);
      setAudits(auditsData);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingVersion(null);
    setForm({
      platform: activeTab === 'audits' ? 'android' : activeTab,
      version: '',
      minVersion: '',
      priority: 'optional',
      title: '',
      description: '',
      releaseNotes: '',
      rolloutPercentage: 100,
      maintenanceMode: false,
      maintenanceMessage: '',
      updateLink: 'https://play.google.com/store/apps/details?id=com.pginfo.onlinee&pcampaignid=web_share',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVersion(v);
    setForm({
      platform: v.platform,
      version: v.version,
      minVersion: v.minVersion,
      priority: v.priority,
      title: v.title,
      description: v.description,
      releaseNotes: v.releaseNotes ? v.releaseNotes.join('\n') : '',
      rolloutPercentage: v.rolloutPercentage,
      maintenanceMode: v.maintenanceMode,
      maintenanceMessage: v.maintenanceMessage || '',
      updateLink: v.updateLink,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleToggleActive = async (v) => {
    try {
      const updated = await appVersionService.updateVersion(v._id, { isActive: !v.isActive });
      toast.success(`Version marked ${updated.isActive ? 'Active' : 'Inactive'}`);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this version? This action is permanent and logged.')) return;
    try {
      await appVersionService.deleteVersion(id);
      toast.success('Version deleted successfully');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const validateForm = () => {
    const errors = {};
    const semverRegex = /^\d+\.\d+\.\d+$/;

    if (!form.version.trim()) {
      errors.version = 'Version is required';
    } else if (!semverRegex.test(form.version)) {
      errors.version = 'Must be semver format (x.y.z)';
    }

    if (!form.minVersion.trim()) {
      errors.minVersion = 'Min version is required';
    } else if (!semverRegex.test(form.minVersion)) {
      errors.minVersion = 'Must be semver format (x.y.z)';
    }

    if (!form.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!form.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!form.updateLink.trim()) {
      errors.updateLink = 'Update link is required';
    } else {
      try {
        new URL(form.updateLink);
      } catch (_) {
        errors.updateLink = 'Must be a valid URL';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const notes = form.releaseNotes
        ? form.releaseNotes.split('\n').filter((line) => line.trim() !== '')
        : [];

      const payload = {
        ...form,
        releaseNotes: notes,
      };

      if (editingVersion) {
        await appVersionService.updateVersion(editingVersion._id, payload);
        toast.success('Version configuration updated successfully');
      } else {
        await appVersionService.createVersion(payload);
        toast.success('New version configuration created');
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVersions = versions.filter((v) => v.platform === activeTab);

  return (
    <PageWrapper title="App Version Management" subtitle="Manage mobile app versions, staged rollouts, and maintenance mode">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'android', label: 'Android' },
            { id: 'ios', label: 'iOS' },
            { id: 'audits', label: 'Audit History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ListPlus size={16} />
          Release Version
        </button>
      </div>

      {activeTab === 'audits' ? (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Version Info</th>
                <th>Action</th>
                <th>Performed By</th>
                <th>Changes Logged</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 16, width: '80%' }} /></td>
                    ))}
                  </tr>
                ))
              ) : audits.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                    No audit records found
                  </td>
                </tr>
              ) : (
                audits.map((audit) => (
                  <tr key={audit._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {audit.versionId?.platform?.toUpperCase()} v{audit.versionId?.version || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        audit.action === 'create' ? 'badge-approved' :
                        audit.action === 'delete' ? 'badge-rejected' :
                        audit.action === 'toggle_active' ? 'badge-primary' :
                        'badge-pending'
                      }`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        {audit.action}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500 }}>{audit.performedBy?.name || 'System'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{audit.performedBy?.email}</div>
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '0.8125rem' }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.75rem', color: '#475569' }}>
                        {JSON.stringify(audit.changes, null, 2)}
                      </pre>
                    </td>
                    <td style={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                      {new Date(audit.createdAt).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Priority</th>
                <th>Rollout</th>
                <th>Status</th>
                <th>Maintenance</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 16, width: '80%' }} /></td>
                    ))}
                  </tr>
                ))
              ) : filteredVersions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                    No versions found for {activeTab}
                  </td>
                </tr>
              ) : (
                filteredVersions.map((v) => (
                  <tr key={v._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Smartphone size={16} style={{ color: '#4f46e5' }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>v{v.version}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Min support: v{v.minVersion}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        v.priority === 'critical' ? 'badge-rejected' :
                        v.priority === 'important' ? 'badge-pending' :
                        v.priority === 'recommended' ? 'badge-verified' :
                        'badge-draft'
                      }`} style={{ textTransform: 'capitalize' }}>
                        {v.priority}
                      </span>
                    </td>
                    <td>
                      <div style={{ width: '100px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          <span>Rollout</span>
                          <span style={{ fontWeight: 600 }}>{v.rolloutPercentage}%</span>
                        </div>
                        <div style={{ width: '100%', height: 6, borderRadius: 3, background: '#e5e7eb', overflow: 'hidden' }}>
                          <div style={{ width: `${v.rolloutPercentage}%`, height: '100%', background: '#4f46e5' }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(v)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        {v.isActive ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontSize: '0.8125rem', fontWeight: 500 }}>
                            <ToggleRight size={22} /> Active
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#9ca3af', fontSize: '0.8125rem', fontWeight: 500 }}>
                            <ToggleLeft size={22} /> Inactive
                          </span>
                        )}
                      </button>
                    </td>
                    <td>
                      {v.maintenanceMode ? (
                        <span className="badge badge-rejected" style={{ fontSize: '0.75rem' }}>Under Maintenance</span>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>No</span>
                      )}
                    </td>
                    <td style={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                      {new Date(v.updatedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button
                          className="btn btn-sm"
                          style={{ background: '#e0e7ff', color: '#4338ca', border: 'none' }}
                          onClick={() => handleOpenEdit(v)}
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: '#fff1f2', color: '#be123c', border: 'none' }}
                          onClick={() => handleDelete(v._id)}
                        >
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
      )}

      {/* Release version Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingVersion ? 'Update Version Release' : 'Release New App Version'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="label">Platform *</label>
              <select
                className="input"
                value={form.platform}
                onChange={(e) => setForm(prev => ({ ...prev, platform: e.target.value }))}
              >
                <option value="android">Android</option>
                <option value="ios">iOS</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Update Priority *</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="optional">Optional (Small popup/banner)</option>
                <option value="recommended">Recommended (Bottom sheet alert)</option>
                <option value="important">Important (Dismissable alert modal)</option>
                <option value="critical">Critical / Strict (Block application usage)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="label">Release Version *</label>
              <input
                type="text"
                className={`input ${formErrors.version ? 'error' : ''}`}
                placeholder="e.g. 1.1.0"
                value={form.version}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, version: e.target.value }));
                  if (formErrors.version) setFormErrors(prev => ({ ...prev, version: '' }));
                }}
              />
              {formErrors.version && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{formErrors.version}</span>}
            </div>

            <div className="form-group">
              <label className="label">Minimum Supported Version *</label>
              <input
                type="text"
                className={`input ${formErrors.minVersion ? 'error' : ''}`}
                placeholder="e.g. 1.0.0"
                value={form.minVersion}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, minVersion: e.target.value }));
                  if (formErrors.minVersion) setFormErrors(prev => ({ ...prev, minVersion: '' }));
                }}
              />
              {formErrors.minVersion && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{formErrors.minVersion}</span>}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="label">App Store / Play Store Update Link *</label>
            <input
              type="text"
              className={`input ${formErrors.updateLink ? 'error' : ''}`}
              placeholder="Store URL link"
              value={form.updateLink}
              onChange={(e) => {
                setForm(prev => ({ ...prev, updateLink: e.target.value }));
                if (formErrors.updateLink) setFormErrors(prev => ({ ...prev, updateLink: '' }));
              }}
            />
            {formErrors.updateLink && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{formErrors.updateLink}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="label">Update Header (Title) *</label>
            <input
              type="text"
              className={`input ${formErrors.title ? 'error' : ''}`}
              placeholder="e.g. New Features Available!"
              value={form.title}
              onChange={(e) => {
                setForm(prev => ({ ...prev, title: e.target.value }));
                if (formErrors.title) setFormErrors(prev => ({ ...prev, title: '' }));
              }}
            />
            {formErrors.title && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{formErrors.title}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="label">Update Prompt Details *</label>
            <textarea
              className={`input ${formErrors.description ? 'error' : ''}`}
              placeholder="Explain why the update is needed or what benefits it brings."
              value={form.description}
              rows={3}
              onChange={(e) => {
                setForm(prev => ({ ...prev, description: e.target.value }));
                if (formErrors.description) setFormErrors(prev => ({ ...prev, description: '' }));
              }}
              style={{ resize: 'vertical' }}
            />
            {formErrors.description && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>{formErrors.description}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="label">Release Notes (One change item per line)</label>
            <textarea
              className="input"
              placeholder="e.g. Added dark mode support&#10;Fixed chat performance bugs&#10;Improved map resolution"
              value={form.releaseNotes}
              rows={3}
              onChange={(e) => setForm(prev => ({ ...prev, releaseNotes: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div>
              <label className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Staged Rollout Percentage</span>
                <span style={{ fontWeight: 600, color: '#4f46e5' }}>{form.rolloutPercentage}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.rolloutPercentage}
                onChange={(e) => setForm(prev => ({ ...prev, rolloutPercentage: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#4f46e5' }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                Limits rollout to a subset of users by unique device ID. 100% installs for all.
              </span>
            </div>

            <div>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={form.maintenanceMode}
                  onChange={(e) => setForm(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <span style={{ color: form.maintenanceMode ? '#ef4444' : '#475569' }}>Lock App in Maintenance Mode</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="Maintenance detail message..."
                value={form.maintenanceMessage}
                disabled={!form.maintenanceMode}
                onChange={(e) => setForm(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                style={{ marginTop: '0.5rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Releasing...' : editingVersion ? 'Update Release' : 'Release Version'}
            </button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
