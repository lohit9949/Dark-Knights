import { FaBook, FaGithub, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer id="main-footer">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-4 text-center text-md-start mb-3 mb-md-0">
            <div className="d-flex align-items-center gap-2 justify-content-center justify-content-md-start">
              <FaBook size={20} />
              <span className="fw-bold">AcadFinder</span>
            </div>
            <small className="text-muted d-block mt-1">Your academic resource hub</small>
          </div>
          <div className="col-md-4 text-center mb-3 mb-md-0">
            <small className="text-muted">
              Made with <FaHeart className="text-danger" /> for Students
            </small>
          </div>
          <div className="col-md-4 text-center text-md-end">
            <small className="text-muted">
              &copy; {new Date().getFullYear()} AcadFinder. All rights reserved.
            </small>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
