import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaSignInAlt, FaShieldAlt } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);

      if (isAdminMode) {
        if (userData.role !== 'admin') {
          setError('Access denied. This account does not have admin privileges.');
          setLoading(false);
          return;
        }
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" id="login-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="auth-card">
              <div className="text-center mb-4">
                <div
                  className="auth-icon-wrapper"
                  style={isAdminMode ? { background: 'linear-gradient(135deg, #dc2626, #f97316)' } : {}}
                >
                  {isAdminMode ? <FaShieldAlt size={28} /> : <FaSignInAlt size={28} />}
                </div>
                <h3 className="fw-bold mt-3">
                  {isAdminMode ? 'Admin Login' : 'Welcome Back'}
                </h3>
                <p className="text-muted">
                  {isAdminMode
                    ? 'Sign in with your admin credentials'
                    : 'Sign in to access your saved resources'}
                </p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 small" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    {isAdminMode ? 'Admin Email' : 'Email Address'}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text"><FaEnvelope /></span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder={isAdminMode ? 'admin@acadfinder.com' : 'you@example.com'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      id="login-email"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text"><FaLock /></span>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      id="login-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn w-100 btn-auth"
                  disabled={loading}
                  id="login-submit"
                  style={isAdminMode ? { background: 'linear-gradient(135deg, #dc2626, #f97316)', border: 'none', color: '#fff' } : {}}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  ) : isAdminMode ? (
                    <FaShieldAlt className="me-2" />
                  ) : (
                    <FaSignInAlt className="me-2" />
                  )}
                  {isAdminMode ? 'Admin Sign In' : 'Sign In'}
                </button>
              </form>

              <div className="text-center mt-4">
                <span className="text-muted">Don't have an account? </span>
                <Link to="/register" className="fw-semibold">Register here</Link>
              </div>

              <hr />

              <div className="text-center">
                <button
                  className={`btn btn-sm ${isAdminMode ? 'btn-outline-primary' : 'btn-outline-danger'} d-inline-flex align-items-center gap-2`}
                  onClick={() => { setIsAdminMode(!isAdminMode); setError(''); }}
                  id="toggle-admin-mode"
                >
                  {isAdminMode ? (
                    <><FaSignInAlt /> Switch to User Login</>
                  ) : (
                    <><FaShieldAlt /> Are you an Admin?</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
