import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getResources, getBookmarks, toggleBookmark } from '../services/api';
import SearchBar from '../components/SearchBar';
import ResourceCard from '../components/ResourceCard';
import { useAuth } from '../context/AuthContext';
import { FaFilePowerpoint, FaFilePdf, FaFileAlt, FaTh, FaFilter } from 'react-icons/fa';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const activeCategory = searchParams.get('category') || '';
  const activeSearch = searchParams.get('search') || '';

  useEffect(() => {
    fetchResources();
  }, [activeCategory, activeSearch, user]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory) params.category = activeCategory;
      if (activeSearch) params.search = activeSearch;

      const res = await getResources(params);
      setResources(res.data);

      if (user) {
        const bmRes = await getBookmarks();
        setBookmarkedIds(bmRes.data.map((r) => r._id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategoryFilter = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category === activeCategory) {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    setSearchParams(params);
  };

  const handleToggleBookmark = async (resourceId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await toggleBookmark(resourceId);
      if (res.data.bookmarked) {
        setBookmarkedIds((prev) => [...prev, resourceId]);
      } else {
        setBookmarkedIds((prev) => prev.filter((id) => id !== resourceId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [
    { key: '', label: 'All', icon: <FaTh /> },
    { key: 'ppt', label: 'PPTs', icon: <FaFilePowerpoint /> },
    { key: 'textbook', label: 'Textbooks', icon: <FaFilePdf /> },
    { key: 'past_paper', label: 'Past Papers', icon: <FaFileAlt /> },
  ];

  return (
    <div className="resources-page py-4" id="resources-page">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="section-title">
            <FaFilter className="me-2" />
            Browse Resources
          </h2>
          <p className="text-muted">Search and filter academic materials by category</p>
        </div>

        {/* Search */}
        <div className="row justify-content-center mb-4">
          <div className="col-lg-8">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* Active search info */}
        {activeSearch && (
          <div className="text-center mb-3">
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
              Showing results for: <strong>"{activeSearch}"</strong>
              <button
                className="btn btn-sm btn-link text-danger ms-2 p-0"
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete('search');
                  setSearchParams(params);
                }}
              >
                ✕ Clear
              </button>
            </span>
          </div>
        )}

        {/* Category Filter Pills */}
        <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`btn btn-filter ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => handleCategoryFilter(cat.key)}
              id={`filter-${cat.key || 'all'}`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-5">
            <h5 className="text-muted">No resources found</h5>
            <p className="text-muted small">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <p className="text-muted small mb-3">{resources.length} resources found</p>
            <div className="row g-4">
              {resources.map((resource) => (
                <div className="col-md-6 col-lg-4" key={resource._id}>
                  <ResourceCard
                    resource={resource}
                    isBookmarked={bookmarkedIds.includes(resource._id)}
                    onToggleBookmark={handleToggleBookmark}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Resources;
