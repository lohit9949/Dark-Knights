import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResources, getBookmarks, toggleBookmark } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ResourceCard from '../components/ResourceCard';
import SearchBar from '../components/SearchBar';
import {
  FaArrowLeft,
  FaFilePowerpoint,
  FaFilePdf,
  FaFileAlt,
  FaGraduationCap,
  FaLayerGroup,
} from 'react-icons/fa';

const SubjectDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const subjectName = decodeURIComponent(name);

  useEffect(() => {
    fetchData();
  }, [name, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getResources({ subject: subjectName });
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

  const handleSearch = (query) => {
    navigate(`/resources?search=${encodeURIComponent(query)}`);
  };

  const filteredResources = activeFilter === 'all'
    ? resources
    : resources.filter((r) => r.category === activeFilter);

  const categoryCounts = {
    all: resources.length,
    ppt: resources.filter((r) => r.category === 'ppt').length,
    textbook: resources.filter((r) => r.category === 'textbook').length,
    past_paper: resources.filter((r) => r.category === 'past_paper').length,
  };

  return (
    <div className="subject-detail-page py-4" id="subject-detail-page">
      <div className="container">
        {/* Back */}
        <button className="btn btn-link text-decoration-none mb-3 p-0" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2" /> Back
        </button>

        {/* Subject Header */}
        <div className="subject-header mb-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="subject-header-icon">
              <FaGraduationCap size={24} />
            </div>
            <div>
              <h2 className="fw-bold mb-0">{subjectName}</h2>
              <p className="text-muted mb-0 small">{resources.length} resources available</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="row justify-content-center mb-4">
          <div className="col-lg-8">
            <SearchBar onSearch={handleSearch} placeholder={`Search within ${subjectName}...`} />
          </div>
        </div>

        {/* Category Filters */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          <button
            className={`btn btn-filter ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <FaLayerGroup className="me-1" /> All ({categoryCounts.all})
          </button>
          <button
            className={`btn btn-filter ${activeFilter === 'ppt' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ppt')}
          >
            <FaFilePowerpoint className="me-1" /> PPTs ({categoryCounts.ppt})
          </button>
          <button
            className={`btn btn-filter ${activeFilter === 'textbook' ? 'active' : ''}`}
            onClick={() => setActiveFilter('textbook')}
          >
            <FaFilePdf className="me-1" /> Textbooks ({categoryCounts.textbook})
          </button>
          <button
            className={`btn btn-filter ${activeFilter === 'past_paper' ? 'active' : ''}`}
            onClick={() => setActiveFilter('past_paper')}
          >
            <FaFileAlt className="me-1" /> Past Papers ({categoryCounts.past_paper})
          </button>
        </div>

        {/* Resources */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-5">
            <FaGraduationCap size={48} className="text-muted mb-3" />
            <h5 className="text-muted">No resources found for this subject</h5>
            <p className="text-muted small">Check back later or browse other subjects.</p>
            <button className="btn btn-primary" onClick={() => navigate('/resources')}>
              Browse All Resources
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {filteredResources.map((resource) => (
              <div className="col-md-6 col-lg-4" key={resource._id}>
                <ResourceCard
                  resource={resource}
                  isBookmarked={bookmarkedIds.includes(resource._id)}
                  onToggleBookmark={handleToggleBookmark}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectDetail;
