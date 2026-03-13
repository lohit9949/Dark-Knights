import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getResourceById, toggleBookmark, getBookmarks } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { resolveFileUrl } from '../utils/resolveUrl';
import {
  FaBookmark,
  FaRegBookmark,
  FaFilePowerpoint,
  FaFilePdf,
  FaFileAlt,
  FaArrowLeft,
  FaExternalLinkAlt,
  FaUser,
  FaCalendar,
  FaTag,
  FaDownload,
  FaShareAlt,
  FaCopy,
  FaCheck,
  FaLink,
  FaYoutube,
  FaBookOpen,
  FaFileWord,
  FaFileImage,
  FaFile,
} from 'react-icons/fa';

const categoryIcons = {
  ppt: <FaFilePowerpoint />,
  textbook: <FaFilePdf />,
  past_paper: <FaFileAlt />,
};

const categoryLabels = {
  ppt: 'PPT / Slides',
  textbook: 'Textbook / PDF Notes',
  past_paper: 'Past Question Paper',
};

const fileTypeIcons = {
  pdf: <FaFilePdf className="text-danger" />,
  ppt: <FaFilePowerpoint className="text-danger" />,
  doc: <FaFileWord className="text-primary" />,
  image: <FaFileImage className="text-success" />,
  other: <FaFile className="text-muted" />,
};

// Extract YouTube video ID from various URL formats
const getYoutubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
  return match ? match[1] : null;
};

const ResourceDetail = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchResource();
  }, [id, user]);

  const fetchResource = async () => {
    setLoading(true);
    try {
      const res = await getResourceById(id);
      setResource(res.data);

      if (user) {
        const bmRes = await getBookmarks();
        setIsBookmarked(bmRes.data.some((r) => r._id === id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await toggleBookmark(id);
      setIsBookmarked(res.data.bookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: resource.title,
      text: `Check out: ${resource.title}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { /* cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  if (!resource) {
    return (
      <div className="container py-5 text-center">
        <h4 className="text-muted">Resource not found</h4>
        <Link to="/resources" className="btn btn-primary mt-3">Back to Resources</Link>
      </div>
    );
  }

  const hasFiles = resource.files && resource.files.length > 0;
  const hasLinks = resource.links && resource.links.length > 0;
  const hasRefs = resource.references && resource.references.length > 0;
  const hasVideos = resource.videoLinks && resource.videoLinks.length > 0;

  return (
    <div className="resource-detail-page py-4" id="resource-detail-page">
      <div className="container">
        <button className="btn btn-link text-decoration-none mb-3 p-0" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2" /> Back
        </button>

        {/* Top Section: Image + Basic Info */}
        <div className="row g-4 mb-4">
          <div className="col-lg-5">
            <div className="detail-image-wrapper">
              <img
                src={resolveFileUrl(resource.thumbnailUrl) || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600'}
                alt={resource.title}
                className="img-fluid rounded-3 w-100"
              />
            </div>
          </div>

          <div className="col-lg-7">
            <div className="detail-info-card">
              <span className={`category-badge-lg badge-${resource.category}`}>
                {categoryIcons[resource.category]} {categoryLabels[resource.category]}
              </span>

              <h2 className="fw-bold mt-3">{resource.title}</h2>

              <div className="detail-meta d-flex flex-wrap gap-3 my-3">
                <span className="d-flex align-items-center gap-1 text-muted">
                  <FaUser /> {resource.author}
                </span>
                <Link
                  to={`/subjects/${encodeURIComponent(resource.subject)}`}
                  className="d-flex align-items-center gap-1 text-muted text-decoration-none subject-link"
                >
                  <FaTag /> {resource.subject}
                </Link>
                {resource.topic && (
                  <span className="d-flex align-items-center gap-1 text-muted">
                    <FaCalendar /> {resource.topic}
                  </span>
                )}
              </div>

              <p className="text-muted lh-lg">{resource.description}</p>

              {/* Action Buttons */}
              <div className="detail-actions mt-3">
                <div className="d-flex gap-2 flex-wrap">
                  {resource.fileUrl && (
                    <a href={resolveFileUrl(resource.fileUrl)} target="_blank" rel="noopener noreferrer" className="btn btn-primary d-flex align-items-center gap-2">
                      <FaExternalLinkAlt /> Open Resource
                    </a>
                  )}
                  <button
                    className={`btn ${isBookmarked ? 'btn-warning' : 'btn-outline-warning'} d-flex align-items-center gap-2`}
                    onClick={handleToggleBookmark}
                    id="resource-bookmark-btn"
                  >
                    {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                    {isBookmarked ? 'Saved' : 'Save'}
                  </button>
                  <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={handleShare}>
                    <FaShareAlt /> Share
                  </button>
                  <button className={`btn ${copied ? 'btn-success' : 'btn-outline-secondary'} d-flex align-items-center gap-2`} onClick={handleCopyLink}>
                    {copied ? <FaCheck /> : <FaCopy />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="row g-4">
          {/* Downloadable Files */}
          {hasFiles && (
            <div className="col-lg-6">
              <div className="detail-section-card">
                <h5 className="detail-section-title">
                  <FaDownload className="me-2 text-primary" /> Downloadable Files
                </h5>
                <div className="d-flex flex-column gap-2">
                  {resource.files.map((file, idx) => (
                    <a key={idx} href={resolveFileUrl(file.url)} target="_blank" rel="noopener noreferrer" className="attached-file-item" download>
                      {fileTypeIcons[file.type] || fileTypeIcons.other}
                      <span className="ms-2 flex-grow-1">{file.name}</span>
                      {file.size && <small className="text-muted">{(file.size / 1024 / 1024).toFixed(1)} MB</small>}
                      <FaDownload className="ms-2 text-primary" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resource Links */}
          {hasLinks && (
            <div className="col-lg-6">
              <div className="detail-section-card">
                <h5 className="detail-section-title">
                  <FaLink className="me-2 text-primary" /> Resource Links
                </h5>
                <div className="d-flex flex-column gap-2">
                  {resource.links.map((link, idx) => (
                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="resource-link-item">
                      <FaExternalLinkAlt className="me-2" />
                      <span>{link.title || link.url}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* References */}
          {hasRefs && (
            <div className="col-lg-6">
              <div className="detail-section-card">
                <h5 className="detail-section-title">
                  <FaBookOpen className="me-2 text-success" /> References
                </h5>
                <div className="d-flex flex-column gap-2">
                  {resource.references.map((ref, idx) => (
                    <a key={idx} href={ref.url} target="_blank" rel="noopener noreferrer" className="resource-link-item">
                      <FaBookOpen className="me-2 text-success" />
                      <span>{ref.title || ref.url}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Video Links */}
          {hasVideos && (
            <div className="col-12">
              <div className="detail-section-card">
                <h5 className="detail-section-title">
                  <FaYoutube className="me-2 text-danger" /> Video Resources
                </h5>
                <div className="row g-3">
                  {resource.videoLinks.map((video, idx) => {
                    const ytId = getYoutubeId(video.url);
                    return (
                      <div key={idx} className="col-md-6">
                        {ytId ? (
                          <div className="video-embed-card">
                            <div className="ratio ratio-16x9 rounded-3 overflow-hidden">
                              <iframe
                                src={`https://www.youtube.com/embed/${ytId}`}
                                title={video.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                            <p className="mt-2 mb-0 fw-semibold small">{video.title}</p>
                          </div>
                        ) : (
                          <a href={video.url} target="_blank" rel="noopener noreferrer" className="resource-link-item">
                            <FaYoutube className="me-2 text-danger" />
                            <span>{video.title || video.url}</span>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail;
