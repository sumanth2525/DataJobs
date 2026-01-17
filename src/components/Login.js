import React, { useState } from 'react';
import './Auth.css';

const Login = ({ onLogin, onSwitchToSignUp, onClose }) => {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (loginMethod === 'email') {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
    } else {
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
        newErrors.phone = 'Phone number is invalid';
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, this would call an authentication API
      const userData = {
        email: loginMethod === 'email' ? formData.email : formData.phone,
        loginMethod: loginMethod,
        name: 'John Doe', // This would come from the API
      };
      onLogin(userData);
    }, 1000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>Login</h2>
          <button 
            className="auth-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="auth-modal-body">
          <div className="auth-method-toggle">
            <button
              className={`auth-method-button ${loginMethod === 'email' ? 'active' : ''}`}
              onClick={() => setLoginMethod('email')}
            >
              <i className="bi bi-envelope"></i>
              Email
            </button>
            <button
              className={`auth-method-button ${loginMethod === 'phone' ? 'active' : ''}`}
              onClick={() => setLoginMethod('phone')}
            >
              <i className="bi bi-telephone"></i>
              Phone
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {loginMethod === 'email' ? (
              <div className="form-group">
                <label htmlFor="email">
                  <i className="bi bi-envelope"></i>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="phone">
                  <i className="bi bi-telephone"></i>
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">
                <i className="bi bi-lock"></i>
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="auth-form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#forgot-password" className="forgot-password">
                Forgot password?
              </a>
            </div>

            <button 
              type="submit" 
              className="auth-submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i>
                  Login
                </>
              )}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="social-login">
              <button type="button" className="social-button google">
                <i className="bi bi-google"></i>
                Continue with Google
              </button>
              <button type="button" className="social-button linkedin">
                <i className="bi bi-linkedin"></i>
                Continue with LinkedIn
              </button>
            </div>

            <div className="auth-switch">
              <span>Don't have an account?</span>
              <button 
                type="button" 
                className="switch-link"
                onClick={onSwitchToSignUp}
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
