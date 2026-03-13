import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getAdminResources,
  createResource,
  updateResource,
  deleteResource,
  getAdminStats,
  uploadFile,
} from '../services/api';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilePowerpoint,
  FaFilePdf,
  FaFileAlt,
  FaTachometerAlt,
  FaSignOutAlt,
  FaTimes,
  FaSave,
  FaShieldAlt,
  FaCloudUploadAlt,
  FaImage,
  FaCheck,
  FaLink,
  FaYoutube,
  FaBookOpen,
} from 'react-icons/fa';

const categoryLabels = {
  ppt: 'PPT',
  textbook: 'Textbook',
  past_paper: 'Past Paper',
};

const emptyForm = {
  title: '',
  description: '',
  category: 'ppt',
  subject: '',
  topic: '',
  fileUrl: '',
  thumbnailUrl: '',
  author: '',
  links: [],
  references: [],
  videoLinks: [],
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState({ totalResources: 0, pptCount: 0, textbookCount: 0, pastPaperCount: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]); // Files array for the resource

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [resData, statsData] = await Promise.all([getAdminResources(), getAdminStats()]);
      setResources(resData.data);
      setStats(statsData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const openAddModal = () => {
    setEditingResource(null);
    setFormData({ ...emptyForm, links: [], references: [], videoLinks: [] });
    setUploadedFiles([]);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      category: resource.category,
      subject: resource.subject,
      topic: resource.topic || '',
      fileUrl: resource.fileUrl || '',
      thumbnailUrl: resource.thumbnailUrl || '',
      author: resource.author || '',
      links: resource.links || [],
      references: resource.references || [],
      videoLinks: resource.videoLinks || [],
    });
    setUploadedFiles(resource.files || []);
    setFormError('');
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Multi-input helpers ---
  const addArrayItem = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], { title: '', url: '' }],
    });
  };

  const updateArrayItem = (field, index, key, value) => {
    const arr = [...formData[field]];
    arr[index] = { ...arr[index], [key]: value };
    setFormData({ ...formData, [field]: arr });
  };

  const removeArrayItem = (field, index) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  // --- File uploads (local storage) ---
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadingFile(true);
    setFormError('');
    try {
      for (const file of files) {
        const res = await uploadFile(file, 'files');
        const ext = file.name.split('.').pop().toLowerCase();
        let fileType = 'other';
        if (['pdf'].includes(ext)) fileType = 'pdf';
        else if (['ppt', 'pptx'].includes(ext)) fileType = 'ppt';
        else if (['doc', 'docx'].includes(ext)) fileType = 'doc';
        else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) fileType = 'image';

        setUploadedFiles((prev) => [...prev, {
          name: file.name,
          url: res.data.url,
          type: fileType,
          size: file.size,
        }]);
      }
    } catch (err) {
      setFormError('File upload failed. ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const removeUploadedFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleThumbUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingThumb(true);
    setFormError('');
    try {
      const res = await uploadFile(file, 'thumbnails');
      setFormData((prev) => ({ ...prev, thumbnailUrl: res.data.url }));
    } catch (err) {
      setFormError('Thumbnail upload failed. ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title || !formData.category || !formData.subject) {
      setFormError('Title, category, and subject are required.');
      return;
    }

    // Filter out empty entries
    const cleanArray = (arr) => arr.filter((item) => item.title || item.url);

    const submitData = {
      ...formData,
      files: uploadedFiles,
      links: cleanArray(formData.links),
      references: cleanArray(formData.references),
      videoLinks: cleanArray(formData.videoLinks),
    };

    setSaving(true);
    try {
      if (editingResource) {
        await updateResource(editingResource._id, submitData);
      } else {
        await createResource(submitData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save resource.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await deleteResource(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Multi-input row component
  const MultiInputSection = ({ label, icon, field, urlPlaceholder }) => (
    <div className="col-12">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="form-label small fw-semibold mb-0">
          {icon} {label}
        </label>
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => addArrayItem(field)}>
          <FaPlus className="me-1" /> Add
        </button>
      </div>
      {formData[field].map((item, idx) => (
        <div key={idx} className="multi-input-row d-flex gap-2 mb-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Title / Label"
            value={item.title}
            onChange={(e) => updateArrayItem(field, idx, 'title', e.target.value)}
          />
          <input
            type="url"
            className="form-control form-control-sm"
            placeholder={urlPlaceholder}
            value={item.url}
            onChange={(e) => updateArrayItem(field, idx, 'url', e.target.value)}
          />
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeArrayItem(field, idx)}>
            <FaTimes />
          </button>
        </div>
      ))}
      {formData[field].length === 0 && (
        <small className="text-muted">No {label.toLowerCase()} added yet. Click "Add" to add one.</small>
      )}
    </div>
  );

  return (
    <div className="admin-dashboard-page py-4" id="admin-dashboard-page">
      <div className="container">
        {/* Admin Header */}
        <div className="admin-header mb-4">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 mb-1">
                <FaShieldAlt className="text-danger" size={20} />
                <span className="badge bg-danger">Admin Panel</span>
              </div>
              <h2 className="fw-bold mb-1">
                <FaTachometerAlt className="me-2" />
                Admin Dashboard
              </h2>
              <p className="text-muted mb-0">Manage academic resources</p>
            </div>
            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
              <button className="btn btn-outline-danger d-inline-flex align-items-center gap-2" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                <FaTachometerAlt size={20} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{stats.totalResources}</h4>
                <small className="text-muted">Total</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' }}>
                <FaFilePowerpoint size={20} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{stats.pptCount}</h4>
                <small className="text-muted">PPTs</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <FaFilePdf size={20} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{stats.textbookCount}</h4>
                <small className="text-muted">Textbooks</small>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <FaFileAlt size={20} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{stats.pastPaperCount}</h4>
                <small className="text-muted">Past Papers</small>
              </div>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">All Resources</h5>
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openAddModal} id="add-resource-btn">
            <FaPlus /> Add Resource
          </button>
        </div>

        {/* Resources Table */}
        <div className="table-responsive">
          <table className="table admin-table align-middle" id="admin-resources-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Subject</th>
                <th>Files</th>
                <th>Author</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource._id}>
                  <td>
                    <div className="fw-semibold">{resource.title}</div>
                    <small className="text-muted">{resource.topic}</small>
                  </td>
                  <td>
                    <span className={`badge badge-cat-${resource.category}`}>
                      {categoryLabels[resource.category]}
                    </span>
                  </td>
                  <td>{resource.subject}</td>
                  <td>
                    <small className="text-muted">
                      {(resource.files?.length || 0)} files, {(resource.links?.length || 0)} links, {(resource.videoLinks?.length || 0)} videos
                    </small>
                  </td>
                  <td><small className="text-muted">{resource.author}</small></td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditModal(resource)} title="Edit">
                      <FaEdit />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(resource._id)} title="Delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {resources.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No resources found. Click "Add Resource" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                {editingResource ? 'Edit Resource' : 'Add New Resource'}
              </h5>
              <button className="btn btn-sm btn-light" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            {formError && (
              <div className="alert alert-danger py-2 small">{formError}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Basic Info */}
                <div className="col-12">
                  <label className="form-label small fw-semibold">Title *</label>
                  <input type="text" className="form-control" name="title" value={formData.title} onChange={handleFormChange} placeholder="e.g. Introduction to Data Structures" required />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Category *</label>
                  <select className="form-select" name="category" value={formData.category} onChange={handleFormChange} required>
                    <option value="ppt">PPT / Slides</option>
                    <option value="textbook">Textbook / PDF Notes</option>
                    <option value="past_paper">Past Question Paper</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Subject *</label>
                  <input type="text" className="form-control" name="subject" value={formData.subject} onChange={handleFormChange} placeholder="e.g. Data Structures" required />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Topic</label>
                  <input type="text" className="form-control" name="topic" value={formData.topic} onChange={handleFormChange} placeholder="e.g. Arrays and Linked Lists" />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Author</label>
                  <input type="text" className="form-control" name="author" value={formData.author} onChange={handleFormChange} placeholder="e.g. Prof. Sarah Johnson" />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Description</label>
                  <textarea className="form-control" name="description" rows="2" value={formData.description} onChange={handleFormChange} placeholder="Brief description of the resource..." />
                </div>

                {/* Thumbnail Upload */}
                <div className="col-12">
                  <label className="form-label small fw-semibold"><FaImage className="me-1" /> Thumbnail Image (ImageKit)</label>
                  <div className="upload-zone">
                    <input type="file" className="form-control" accept=".png,.jpg,.jpeg,.webp" onChange={handleThumbUpload} disabled={uploadingThumb} />
                    {uploadingThumb && (
                      <div className="upload-status mt-2">
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        <small className="text-primary">Uploading...</small>
                      </div>
                    )}
                    {formData.thumbnailUrl && !uploadingThumb && (
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <img src={formData.thumbnailUrl} alt="Thumb" className="thumb-preview" />
                        <small className="text-success"><FaCheck className="me-1" />Thumbnail set</small>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload via ImageKit */}
                <div className="col-12">
                  <label className="form-label small fw-semibold"><FaCloudUploadAlt className="me-1" /> Upload Files — PDF, PPT, DOC (ImageKit)</label>
                  <div className="upload-zone">
                    <input type="file" className="form-control" accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.png,.jpg,.jpeg" onChange={handleFileUpload} disabled={uploadingFile} multiple />
                    {uploadingFile && (
                      <div className="upload-status mt-2">
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        <small className="text-primary">Uploading files...</small>
                      </div>
                    )}
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div className="uploaded-files-list mt-2">
                      {uploadedFiles.map((f, idx) => (
                        <div key={idx} className="uploaded-file-chip d-flex align-items-center gap-2 mb-1">
                          <FaCheck className="text-success" />
                          <small className="flex-grow-1">{f.name} <span className="text-muted">({f.type})</span></small>
                          <button type="button" className="btn btn-sm text-danger p-0" onClick={() => removeUploadedFile(idx)}>
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Main File URL (legacy / direct paste) */}
                <div className="col-12">
                  <label className="form-label small fw-semibold">Primary File URL (or paste directly)</label>
                  <input type="url" className="form-control form-control-sm" name="fileUrl" value={formData.fileUrl} onChange={handleFormChange} placeholder="https://example.com/resource.pdf" />
                </div>

                <hr className="my-2" />

                {/* Multi-input: Links */}
                <MultiInputSection
                  label="Resource Links"
                  icon={<FaLink className="me-1" />}
                  field="links"
                  urlPlaceholder="https://example.com/resource"
                />

                {/* Multi-input: References */}
                <MultiInputSection
                  label="References"
                  icon={<FaBookOpen className="me-1" />}
                  field="references"
                  urlPlaceholder="https://example.com/reference"
                />

                {/* Multi-input: Video Links */}
                <MultiInputSection
                  label="Video Links (YouTube)"
                  icon={<FaYoutube className="me-1 text-danger" />}
                  field="videoLinks"
                  urlPlaceholder="https://youtube.com/watch?v=..."
                />

                <div className="col-12 d-flex gap-2 justify-content-end mt-3">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={saving || uploadingFile || uploadingThumb}>
                    {saving ? <span className="spinner-border spinner-border-sm" role="status"></span> : <FaSave />}
                    {editingResource ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
