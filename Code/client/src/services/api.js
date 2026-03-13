import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/me');

// Resources API
export const getResources = (params) => API.get('/resources', { params });
export const getResourceById = (id) => API.get(`/resources/${id}`);

// Bookmarks API
export const getBookmarks = () => API.get('/bookmarks');
export const toggleBookmark = (resourceId) => API.post(`/bookmarks/${resourceId}`);

// Admin API
export const getAdminResources = () => API.get('/admin/resources');
export const createResource = (data) => API.post('/admin/resources', data);
export const updateResource = (id, data) => API.put(`/admin/resources/${id}`, data);
export const deleteResource = (id) => API.delete(`/admin/resources/${id}`);
export const getAdminStats = () => API.get('/admin/stats');

// Upload API
export const uploadFile = (file, folder = 'files') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  return API.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Subjects API
export const getSubjects = () => API.get('/resources/subjects');

export default API;
