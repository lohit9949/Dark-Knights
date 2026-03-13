import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResources, getSubjects } from '../services/api';
import SearchBar from '../components/SearchBar';
import ResourceCard from '../components/ResourceCard';
import { useAuth } from '../context/AuthContext';
import { toggleBookmark, getBookmarks } from '../services/api';
import {
  FaFilePowerpoint,
  FaFilePdf,
  FaFileAlt,
  FaGraduationCap,
  FaSearch,
  FaBookmark,
  FaArrowRight,
  FaBook,
} from 'react-icons/fa';

const subjectColors = [
  '#6366f1', '#e74c3c', '#10b981', '#f59e0b', '#0ea5e9',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
];

const Home = () => {
  const [featuredResources, setFeaturedResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [res, subRes] = await Promise.all([getResources({}), getSubjects()]);
      setFeaturedResources(res.data.slice(0, 6));
      setSubjects(subRes.data);

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
    navigate(`/resources?search=${encodeURIComponent(query)}`);
  };

  const handleCategoryClick = (category) => {
    navigate(`/resources?category=${category}`);
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
    {
      key: 'ppt',
      label: 'PPTs & Slides',
      icon: <FaFilePowerpoint size={36} />,
      desc: 'Presentation slides for lectures and seminars',
      color: 'category-ppt',
    },
    {
      key: 'textbook',
      label: 'Textbooks & Notes',
      icon: <FaFilePdf size={36} />,
      desc: 'Digital textbooks and PDF study notes',
      color: 'category-textbook',
    },
    {
      key: 'past_paper',
      label: 'Past Papers',
      icon: <FaFileAlt size={36} />,
      desc: 'Previous exam papers and practice questions',
      color: 'category-pastpaper',
    },
  ];

  return (
    <div id="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8 mx-auto text-center">
              <div className="hero-badge mb-3">
                <FaGraduationCap /> Academic Resources
              </div>
              <h1 className="hero-title">
                Find Your Study Materials <br />
                <span className="text-gradient">In One Place</span>
              </h1>
              <p className="hero-subtitle">
                Discover PPTs, textbooks, and past question papers organized by subject.
                Search, browse, and save resources for your exam preparation.
              </p>
              <div className="hero-search-wrapper">
                <SearchBar onSearch={handleSearch} />
              </div>
              <div className="hero-stats mt-4">
                <div className="stat-item">
                  <FaSearch /> <span>Quick Search</span>
                </div>
                <div className="stat-item">
                  <FaBookmark /> <span>Save & Organize</span>
                </div>
                <div className="stat-item">
                  <FaGraduationCap /> <span>All Subjects</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section py-5">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle text-muted">
              Find resources organized by type
            </p>
          </div>
          <div className="row g-4">
            {categories.map((cat) => (
              <div className="col-md-4" key={cat.key}>
                <div
                  className={`category-card ${cat.color}`}
                  onClick={() => handleCategoryClick(cat.key)}
                  role="button"
                  id={`category-${cat.key}`}
                >
                  <div className="category-icon">{cat.icon}</div>
                  <h5 className="fw-bold mt-3">{cat.label}</h5>
                  <p className="text-muted mb-0 small">{cat.desc}</p>
                  <div className="category-arrow mt-2">
                    <FaArrowRight />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Subject Section */}
      {subjects.length > 0 && (
        <section className="subjects-section py-5">
          <div className="container">
            <div className="text-center mb-4">
              <h2 className="section-title">Browse by Subject</h2>
              <p className="section-subtitle text-muted">
                Explore resources by academic subject
              </p>
            </div>
            <div className="row g-3 justify-content-center">
              {subjects.map((subject, idx) => (
                <div className="col-6 col-md-4 col-lg-3" key={subject}>
                  <div
                    className="subject-card"
                    onClick={() => navigate(`/subjects/${encodeURIComponent(subject)}`)}
                    role="button"
                    id={`subject-${subject.replace(/\s+/g, '-').toLowerCase()}`}
                    style={{ '--subject-color': subjectColors[idx % subjectColors.length] }}
                  >
                    <div className="subject-card-icon">
                      <FaBook />
                    </div>
                    <h6 className="fw-semibold mb-0">{subject}</h6>
                    <FaArrowRight className="subject-arrow" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Resources */}
      <section className="featured-section py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="section-title">Featured Resources</h2>
              <p className="section-subtitle text-muted mb-0">
                Latest study materials added to our collection
              </p>
            </div>
            <button
              className="btn btn-outline-primary btn-view-all"
              onClick={() => navigate('/resources')}
            >
              View All <FaArrowRight />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {featuredResources.map((resource) => (
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
      </section>
    </div>
  );
};

export default Home;
