import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { Header } from '../../components/Header/Header';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { 
  Send, MessageSquare, Sparkles, X,
  CheckCircle2, Loader2, ArrowLeft, AlertCircle,
  ThumbsUp, ThumbsDown, Lightbulb, Bug, Crown,
  Heart, Mail, PartyPopper
} from 'lucide-react';
import './Feedback.css';

interface FeedbackFormData {
  type: 'praise' | 'complaint' | 'suggestion' | 'bug';
  category: string;
  message: string;
}

const feedbackCategories = {
  praise: ['Usability', 'Design', 'Features', 'Support', 'Performance', 'Other'],
  complaint: ['Usability', 'Design', 'Features', 'Support', 'Performance', 'Bug', 'Other'],
  suggestion: ['Usability', 'Design', 'Features', 'Support', 'Performance', 'New Feature', 'Other'],
  bug: ['UI/UX', 'Performance', 'Functionality', 'Integration', 'Mobile', 'Other']
};

const typeLabels = {
  praise: 'Praise',
  complaint: 'Complaint',
  suggestion: 'Suggestion',
  bug: 'Bug Report'
};

export function Feedback() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'praise',
    category: '',
    message: ''
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    setFormData(prev => ({ ...prev, category: '' }));
  }, [formData.type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeSelect = (type: FeedbackFormData['type']) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!formData.message.trim()) {
      setError('Please write your feedback message.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.category) {
      setError('Please select a category.');
      setIsSubmitting(false);
      return;
    }

    try {
      const subject = `${typeLabels[formData.type]} -- ${formData.category}`;
      const body = `${formData.message}`;
      const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=prismaanalytics80@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      window.open(mailtoLink, '_blank');
      setShowSuccessModal(true);
      
      setFormData({
        type: 'praise',
        category: '',
        message: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to open Gmail. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/dashboard');
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'praise': return <ThumbsUp size={18} />;
      case 'complaint': return <ThumbsDown size={18} />;
      case 'suggestion': return <Lightbulb size={18} />;
      case 'bug': return <Bug size={18} />;
      default: return <MessageSquare size={18} />;
    }
  };

  const getTypeLabel = (type: string) => {
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'praise': return '#10b981';
      case 'complaint': return '#ef4444';
      case 'suggestion': return '#f59e0b';
      case 'bug': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getTypeBgColor = (type: string) => {
    switch(type) {
      case 'praise': return 'rgba(16, 185, 129, 0.08)';
      case 'complaint': return 'rgba(239, 68, 68, 0.08)';
      case 'suggestion': return 'rgba(245, 158, 11, 0.08)';
      case 'bug': return 'rgba(139, 92, 246, 0.08)';
      default: return 'rgba(107, 114, 128, 0.08)';
    }
  };

  return (
    <div className="feedback-page">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="feedback-main">
        <Header onMenuClick={() => setSidebarOpen(true)} />
      
        <div className="feedback-content">
          <div className="feedback-header">
            <div className="feedback-header-left">
              <Link to="/dashboard" className="feedback-back-link">
                <ArrowLeft size={18} />
                Back to Dashboard
              </Link>
              <div className="feedback-greeting">
                <Sparkles size={14} />
                <span>{greeting}, {user?.name?.split(' ')[0] || 'User'}</span>
              </div>
              <h1 className="feedback-title">Send Feedback</h1>
              <span className="feedback-title-accent" />
              <p className="feedback-subtitle">
                Help us improve Prisma Analytics. Your feedback is valuable to us.
              </p>
            </div>
            <div className="feedback-header-right">
              <div className="feedback-stats-mini">
                <div className="feedback-stat-mini">
                  <Heart size={14} style={{ color: '#ff1f7a' }} />
                  <span>We value your opinion</span>
                </div>
              </div>
            </div>
          </div>

          <div className="feedback-grid">
            <Card className="feedback-form-card" glow>
              <form onSubmit={handleSubmit} className="feedback-form">
                {error && (
                  <div className="feedback-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="feedback-form-section">
                  <label className="feedback-form-label">Type of Feedback *</label>
                  <div className="feedback-type-selector">
                    {(['praise', 'complaint', 'suggestion', 'bug'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`feedback-type-btn ${formData.type === type ? 'active' : ''}`}
                        style={{
                          borderColor: formData.type === type ? getTypeColor(type) : '#e2e8f0'
                        }}
                        onClick={() => handleTypeSelect(type)}
                      >
                        <span
                          className="feedback-type-icon"
                          style={{ color: getTypeColor(type), background: getTypeBgColor(type) }}
                        >
                          {getTypeIcon(type)}
                        </span>
                        <span className="feedback-type-label">{getTypeLabel(type)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="feedback-form-group">
                  <label className="feedback-form-label">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="feedback-form-select"
                    required
                  >
                    <option value="">Select a category</option>
                    {feedbackCategories[formData.type].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="feedback-form-group">
                  <label className="feedback-form-label">Your Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your experience, what you liked, what could be improved, or any issues you encountered..."
                    rows={8}
                    className="feedback-form-textarea"
                    required
                  />
                  <span className="feedback-char-count">
                    {formData.message.length} characters
                  </span>
                </div>

                <div className="feedback-form-actions">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="md"
                    fullWidth
                    icon={isSubmitting ? <Loader2 size={16} className="spinning" /> : <Mail size={16} />}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Opening Gmail...' : 'Send via Gmail'}
                  </Button>
                </div>
              </form>
            </Card>

            <div className="feedback-sidebar">
              <Card className="feedback-tips-card" glow>
                <h3 className="feedback-tips-title">
                  <Lightbulb size={18} style={{ color: '#f59e0b' }} />
                  Feedback Tips
                </h3>
                <ul className="feedback-tips-list">
                  <li>
                    <span className="feedback-tip-icon">✓</span>
                    <span>Be specific about what you liked or didn't like</span>
                  </li>
                  <li>
                    <span className="feedback-tip-icon">✓</span>
                    <span>Include steps to reproduce any bugs you found</span>
                  </li>
                  <li>
                    <span className="feedback-tip-icon">✓</span>
                    <span>Suggest improvements with clear examples</span>
                  </li>
                  <li>
                    <span className="feedback-tip-icon">✓</span>
                    <span>Share what features would make your experience better</span>
                  </li>
                </ul>
              </Card>

              <Card className="feedback-features-card" glow>
                <h3 className="feedback-features-title">
                  <Crown size={18} style={{ color: '#ff1f7a' }} />
                  Pro Features
                </h3>
                <p className="feedback-features-text">
                  Upgrade to Pro to get priority support and feature requests.
                </p>
                <Link to="/plans">
                  <Button variant="primary" size="sm" fullWidth icon={<Crown size={14} />}>
                    View Plans
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay" onClick={handleCloseSuccessModal}>
          <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseSuccessModal}>
              <X size={20} />
            </button>
            
            <div className="success-modal-content">
              <div className="success-modal-icon">
                <PartyPopper size={56} style={{ color: '#ff1f7a' }} />
              </div>
              
              <h2 className="success-modal-title">Thank You! 🎉</h2>
              
              <p className="success-modal-message">
                The Prisma Analytics team thanks you for your feedback! 
                Your opinion is essential for us to continue improving our platform.
              </p>
              
              <button 
                className="success-modal-button"
                onClick={handleCloseSuccessModal}
              >
                <CheckCircle2 size={18} />
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}