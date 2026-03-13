import { Link } from 'react-router-dom';
import { FaBookmark, FaRegBookmark, FaFilePowerpoint, FaFilePdf, FaFileAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { resolveFileUrl } from '../utils/resolveUrl';

const categoryIcons = {
  ppt: <FaFilePowerpoint />,
  textbook: <FaFilePdf />,
  past_paper: <FaFileAlt />,
};

const categoryLabels = {
  ppt: 'PPT',
  textbook: 'Textbook',
  past_paper: 'Past Paper',
};

const categoryColors = {
  ppt: 'badge-ppt',
  textbook: 'badge-textbook',
  past_paper: 'badge-pastpaper',
};

const ResourceCard = ({ resource, isBookmarked, onToggleBookmark }) => {
  const { user } = useAuth();

  return (
    <div className="resource-card card h-100" id={`resource-${resource._id}`}>
      <div className="card-img-wrapper">
        <img
          src={resolveFileUrl(resource.thumbnailUrl) || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'}
          className="card-img-top"
          alt={resource.title}
          loading="lazy"
        />
        <span className={`category-badge ${categoryColors[resource.category]}`}>
          {categoryIcons[resource.category]} {categoryLabels[resource.category]}
        </span>
      </div>
      <div className="card-body d-flex flex-column">
        <h6 className="card-title fw-bold">{resource.title}</h6>
        <p className="card-text text-muted small flex-grow-1">
          {resource.description?.substring(0, 100)}
          {resource.description?.length > 100 ? '...' : ''}
        </p>
        <div className="d-flex align-items-center justify-content-between mt-2">
          <span className="badge bg-light text-dark">{resource.subject}</span>
          <div className="d-flex align-items-center gap-2">
            {user && (
              <button
                className="btn btn-sm btn-bookmark"
                onClick={() => onToggleBookmark && onToggleBookmark(resource._id)}
                title={isBookmarked ? 'Remove bookmark' : 'Save resource'}
              >
                {isBookmarked ? <FaBookmark className="text-warning" /> : <FaRegBookmark />}
              </button>
            )}
            <Link to={`/resources/${resource._id}`} className="btn btn-sm btn-view">
              View
            </Link>
          </div>
        </div>
      </div>
      <div className="card-footer">
        <small className="text-muted">By {resource.author}</small>
      </div>
    </div>
  );
};

export default ResourceCard;
