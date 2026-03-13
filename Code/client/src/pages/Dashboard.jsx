import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBookmarks, toggleBookmark, getProfile } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import SearchBar from '../components/SearchBar';
import {
  FaUser,
  FaEnvelope,
  FaBookmark,
  FaClock,
  FaSignOutAlt,
  FaFilePowerpoint,
  FaFilePdf,
  FaFileAlt,
} from 'react-icons/fa';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [activeTab, setActiveTab] = useState('saved');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch bookmarks (populated)
      const bmRes = await getBookmarks();
      setBookmarks(bmRes.data);

      // Fetch profile with populated recentlyViewed
      const profileRes = await getProfile();
      if (profileRes.data.recentlyViewed && profileRes.data.recentlyViewed.length > 0) {
        // The /auth/me endpoint already populates recentlyViewed
        // Filter out any null entries (deleted resources)
        const validRecent = profileRes.data.recentlyViewed.filter(
          (r) => r && typeof r === 'object' && r._id
        );
        setRecentlyViewed(validRecent);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    navigate(`/resources?search=${encodeURIComponent(query)}`);
  };

  const handleToggleBookmark = async (resourceId) => {
    try {
      await toggleBookmark(resourceId);
      setBookmarks((prev) => prev.filter((r) => r._id !== resourceId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const bookmarkIds = bookmarks.map((r) => r._id);

  return (
    <div className="dashboard-page py-4" id="dashboard-page">
      <div className="container">
        {/* Welcome Header */}
        <div className="dashboard-header mb-4">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-1">
                Welcome back, <span className="text-gradient">{user?.name}</span>! 👋
              </h2>
              <p className="text-muted mb-0">Manage your saved resources and study materials</p>
            </div>
            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
              <button className="btn btn-outline-danger d-inline-flex align-items-center gap-2" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="row justify-content-center mb-4">
          <div className="col-lg-8">
            <SearchBar onSearch={handleSearch} placeholder="Search for new resources..." />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                <FaBookmark size={20} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{bookmarks.length}</h4>
                <small className="text-muted">Saved Resources</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <FaClock size={20} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold">{recentlyViewed.length}</h4>
                <small className="text-muted">Recently Viewed</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e' }}>
                <FaUser size={20} />
              </div>
              <div>
                <h5 className="mb-0 fw-bold small">{user?.email}</h5>
                <small className="text-muted">Profile</small>
              </div>
            </div>
          </div>
        </div>

        {/* Category Quick Links */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/resources?category=ppt')}>
            <FaFilePowerpoint className="me-1" /> PPTs
          </button>
          <button className="btn btn-sm btn-outline-success" onClick={() => navigate('/resources?category=textbook')}>
            <FaFilePdf className="me-1" /> Textbooks
          </button>
          <button className="btn btn-sm btn-outline-warning" onClick={() => navigate('/resources?category=past_paper')}>
            <FaFileAlt className="me-1" /> Past Papers
          </button>
        </div>

        {/* Tabs */}
        <ul className="nav nav-pills dashboard-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              <FaBookmark className="me-1" /> Saved Resources ({bookmarks.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'recent' ? 'active' : ''}`}
              onClick={() => setActiveTab('recent')}
            >
              <FaClock className="me-1" /> Recently Viewed ({recentlyViewed.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUser className="me-1" /> Profile
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Saved Resources Tab */}
            {activeTab === 'saved' && (
              <div>
                {bookmarks.length === 0 ? (
                  <div className="text-center py-5">
                    <FaBookmark size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">No saved resources yet</h5>
                    <p className="text-muted small">Browse resources and bookmark the ones you like!</p>
                    <button className="btn btn-primary" onClick={() => navigate('/resources')}>
                      Browse Resources
                    </button>
                  </div>
                ) : (
                  <div className="row g-4">
                    {bookmarks.map((resource) => (
                      <div className="col-md-6 col-lg-4" key={resource._id}>
                        <ResourceCard
                          resource={resource}
                          isBookmarked={true}
                          onToggleBookmark={handleToggleBookmark}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recently Viewed Tab */}
            {activeTab === 'recent' && (
              <div>
                {recentlyViewed.length === 0 ? (
                  <div className="text-center py-5">
                    <FaClock size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">No recently viewed resources</h5>
                    <p className="text-muted small">Start exploring resources to see them here!</p>
                    <button className="btn btn-primary" onClick={() => navigate('/resources')}>
                      Browse Resources
                    </button>
                  </div>
                ) : (
                  <div className="row g-4">
                    {recentlyViewed.map((resource) => (
                      <div className="col-md-6 col-lg-4" key={resource._id}>
                        <ResourceCard
                          resource={resource}
                          isBookmarked={bookmarkIds.includes(resource._id)}
                          onToggleBookmark={handleToggleBookmark}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="row justify-content-center">
                <div className="col-md-6">
                  <div className="profile-card">
                    <div className="text-center mb-4">
                      <div className="profile-avatar">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <h4 className="fw-bold mt-3">{user?.name}</h4>
                    </div>
                    <div className="profile-info">
                      <div className="profile-info-item">
                        <FaUser className="text-primary" />
                        <div>
                          <small className="text-muted d-block">Full Name</small>
                          <span className="fw-semibold">{user?.name}</span>
                        </div>
                      </div>
                      <div className="profile-info-item">
                        <FaEnvelope className="text-primary" />
                        <div>
                          <small className="text-muted d-block">Email</small>
                          <span className="fw-semibold">{user?.email}</span>
                        </div>
                      </div>
                      <div className="profile-info-item">
                        <FaBookmark className="text-warning" />
                        <div>
                          <small className="text-muted d-block">Saved Resources</small>
                          <span className="fw-semibold">{bookmarks.length} resources</span>
                        </div>
                      </div>
                      <div className="profile-info-item">
                        <FaClock className="text-success" />
                        <div>
                          <small className="text-muted d-block">Recently Viewed</small>
                          <span className="fw-semibold">{recentlyViewed.length} resources</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
