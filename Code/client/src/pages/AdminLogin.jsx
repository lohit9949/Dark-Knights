import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaShieldAlt, FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);
      if (userData.role !== 'admin') {
        setError('Access denied. Admin credentials required.');
        setLoading(false);
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" id="admin-login-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="auth-card">
              <div className="text-center mb-4">
                <div className="auth-icon-wrapper" style={{ background: 'linear-gradient(135deg, #dc2626, #f97316)' }}>
                  <FaShieldAlt size={28} />
                </div>
                <h3 className="fw-bold mt-3">Admin Login</h3>
                <p className="text-muted">Access the admin dashboard</p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 small" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Admin Email</label>
                  <div className="input-group">
                    <span className="input-group-text"><FaEnvelope /></span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="admin@acadfinder.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      id="admin-login-email"
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
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      id="admin-login-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn w-100 btn-auth"
                  disabled={loading}
                  id="admin-login-submit"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #f97316)', border: 'none', color: '#fff' }}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  ) : (
                    <FaSignInAlt className="me-2" />
                  )}
                  Admin Sign In
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
