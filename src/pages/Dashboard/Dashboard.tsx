import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { Header } from '../../components/Header/Header';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { 
  TrendingUp, Star, MessageSquare, Crown, ArrowRight, 
  Zap, Target, Clock, User, Eye,
  ChevronUp, Sparkles, Filter, Search,
  MapPin, Briefcase, Calendar, MoreHorizontal, Bell,
  CheckCircle2, RefreshCw, FileText, BarChart3,
  ArrowUpRight, Bookmark, DollarSign, Globe, Building2,
  AlertCircle, ChevronRight, TrendingDown, Activity,
  LayoutDashboard, PieChart, Send, GraduationCap, Settings,
  Sliders, ListFilter, Lock, Sparkle, Heart, Loader2, Users, X, MessageCircle, Mail, Info
} from 'lucide-react';
import './Dashboard.css';

interface Opportunity {
  id: string;
  external_id: string;
  source: string;
  company: string;
  title: string;
  contract_type: string;
  modality: string;
  service_type: string;
  location: string;
  application_url: string;
  is_active: boolean;
  created_at: string;
}

interface UserOpportunity {
  id: string;
  title: string;
  company: string;
  contract_type: string;
  modality: string;
  location: string | null;
  salary: string | null;
  available_registration: number | null;
  remaining_vacancies: number | null;
  applicant_ids: string[];
  whatsapp: string | null;
  email: string;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CombinedOpportunity {
  id: string;
  external_id: string;
  source: string;
  company: string;
  title: string;
  contract_type: string;
  modality: string;
  location: string;
  application_url: string;
  is_active: boolean;
  created_at: string;
  salary?: string | null;
  whatsapp?: string | null;
  email?: string;
  description?: string;
  responsibilities?: string | null;
  requirements?: string | null;
  available_registration?: number | null;
  remaining_vacancies?: number | null;
  applicant_ids?: string[];
}

interface Stats {
  total: number;
  plan_type: string;
  daily_limit: number;
  by_source: Record<string, number>;
  by_contract: Record<string, number>;
  by_modality: Record<string, number>;
  recent_count: number;
}

interface DashboardStats {
  opportunities: number;
  newThisWeek: number;
  messages: number;
  matchRate: string;
}

interface ContactModalProps {
  opportunity: CombinedOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DetailModalProps {
  opportunity: CombinedOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onContact: () => void;
}

const filterOptions = {
  modalidades: [
    'Remote',
    'On-site',
    'Hybrid'
  ],
  tipoServico: [
    'UI/UX Design',
    'Branding / Visual Identity',
    'Social Media Design',
    'Motion Graphics / Animation',
    'Editorial Design',
    'Packaging Design',
    'Print Art',
    'Landing Page Design'
  ],
  tipoCliente: [
    'Startup',
    'E-commerce',
    'SME (Small and Medium Enterprise)',
    'Corporation / Large Company',
    'Advertising Agency',
    'Public Institution',
    'Educational',
    'NGO / Non-profit'
  ],
  urgencia: [
    'Normal',
    'Moderate',
    'Urgent'
  ]
};

function DetailModal({ opportunity, isOpen, onClose, onContact }: DetailModalProps) {
  if (!isOpen || !opportunity) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="detail-modal-header">
          <span className="detail-modal-source" style={{ color: '#ec4899' }}>
            {opportunity.source === 'user_posted' ? 'Posted by user' : opportunity.source.toUpperCase()}
          </span>
          <h2>{opportunity.title}</h2>
          <p className="detail-modal-company">{opportunity.company}</p>
        </div>

        <div className="detail-modal-meta">
          <span><MapPin size={16} /> {opportunity.location || 'Remote'}</span>
          <span><Briefcase size={16} /> {opportunity.contract_type || 'CLT'}</span>
          {opportunity.salary && <span><DollarSign size={16} /> {opportunity.salary}</span>}
          {opportunity.available_registration && (
            <span><Users size={16} /> {opportunity.available_registration} openings</span>
          )}
          {opportunity.remaining_vacancies !== undefined && opportunity.remaining_vacancies !== null && (
            <span><Users size={16} /> Remaining: {opportunity.remaining_vacancies}</span>
          )}
        </div>

        {opportunity.description && (
          <div className="detail-modal-section">
            <h4>Description</h4>
            <p>{opportunity.description}</p>
          </div>
        )}

        {opportunity.responsibilities && (
          <div className="detail-modal-section">
            <h4>Responsibilities</h4>
            <p>{opportunity.responsibilities}</p>
          </div>
        )}

        {opportunity.requirements && (
          <div className="detail-modal-section">
            <h4>Requirements</h4>
            <p>{opportunity.requirements}</p>
          </div>
        )}

        {opportunity.source === 'user_posted' && (
          <div className="detail-modal-contact">
            <button 
              className="modal-submit-button"
              onClick={onContact}
            >
              <MessageCircle size={18} style={{ marginRight: '8px' }} />
              Contact
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactModal({ opportunity, isOpen, onClose }: ContactModalProps) {
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [formData, setFormData] = useState({
    nome: '',
    pitch: '',
    portfolio: '',
    linkedin: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  if (!isOpen || !opportunity) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApplyError(null);

    try {
      const applyResponse = await api.applyToOpportunity(opportunity.id);
      
      if (applyResponse.error) {
        if (applyResponse.error.includes('already applied')) {
          setApplyError('You have already submitted a proposal for this opportunity.');
          setIsSubmitting(false);
          return;
        }
        
        const isFullyBooked = applyResponse.error.includes('fully booked') || 
                             applyResponse.error.includes('deactivated') ||
                             applyResponse.error.includes('no vacancies');
        
        if (!isFullyBooked) {
          setApplyError(applyResponse.error);
          setIsSubmitting(false);
          return;
        }
      }

      const message = `Contact from Prisma Analytics\n\nName: ${formData.nome}\nPitch: ${formData.pitch}\nPortfolio: ${formData.portfolio}\nLinkedIn: ${formData.linkedin || 'Not provided'}\n\nOpportunity: ${opportunity.title} - ${opportunity.company}`;

      if (contactMethod === 'whatsapp' && opportunity.whatsapp) {
        const phone = opportunity.whatsapp.replace(/\D/g, '');
        window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
      } else if (contactMethod === 'email' && opportunity.email) {
        window.location.href = `mailto:${opportunity.email}?subject=Contact about opportunity: ${opportunity.title}&body=${encodeURIComponent(message)}`;
      }

      setSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || '';
      
      if (errorMessage.includes('already applied')) {
        setApplyError('You have already submitted a proposal for this opportunity.');
        setIsSubmitting(false);
        return;
      }
      
      const isFullyBooked = errorMessage.includes('fully booked') || 
                           errorMessage.includes('deactivated') ||
                           errorMessage.includes('no vacancies');
      
      if (isFullyBooked) {
        const message = `Contact from Prisma Analytics\n\nName: ${formData.nome}\nPitch: ${formData.pitch}\nPortfolio: ${formData.portfolio}\nLinkedIn: ${formData.linkedin || 'Not provided'}\n\nOpportunity: ${opportunity.title} - ${opportunity.company}`;

        if (contactMethod === 'whatsapp' && opportunity.whatsapp) {
          const phone = opportunity.whatsapp.replace(/\D/g, '');
          window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
        } else if (contactMethod === 'email' && opportunity.email) {
          window.location.href = `mailto:${opportunity.email}?subject=Contact about opportunity: ${opportunity.title}&body=${encodeURIComponent(message)}`;
        }

        setSuccess(true);
        setIsSubmitting(false);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 3000);
        return;
      }
      
      setApplyError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="modal-header">
          <h3>Contact about: {opportunity.title}</h3>
          <p className="modal-company">{opportunity.company}</p>
          {opportunity.remaining_vacancies !== undefined && opportunity.remaining_vacancies !== null && (
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Remaining openings: {opportunity.remaining_vacancies}
            </p>
          )}
        </div>

        {applyError && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#dc2626', 
            padding: '10px 14px', 
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {applyError}
          </div>
        )}

        {success ? (
          <div className="modal-success">
            <CheckCircle2 size={48} />
            <h4>Message sent!</h4>
            <p>Your message has been forwarded successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="modal-contact-methods">
              <button
                type="button"
                className={`modal-method-btn ${contactMethod === 'whatsapp' ? 'active' : ''}`}
                onClick={() => setContactMethod('whatsapp')}
                disabled={!opportunity.whatsapp}
              >
                <MessageCircle size={18} />
                WhatsApp
              </button>
              <button
                type="button"
                className={`modal-method-btn ${contactMethod === 'email' ? 'active' : ''}`}
                onClick={() => setContactMethod('email')}
                disabled={!opportunity.email}
              >
                <Mail size={18} />
                Email
              </button>
            </div>

            <div className="modal-form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="modal-form-group">
              <label>Pitch / Introduction *</label>
              <textarea
                name="pitch"
                value={formData.pitch}
                onChange={handleChange}
                placeholder="Tell us about yourself, your experience, and why you're interested in this opportunity..."
                rows={4}
                required
              />
            </div>

            <div className="modal-form-group">
              <label>Portfolio Link (Behance, Dribbble, etc) *</label>
              <input
                type="url"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="https://behance.net/your-portfolio"
                required
              />
            </div>

            <div className="modal-form-group">
              <label>LinkedIn Link (optional)</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/your-profile"
              />
            </div>

            <div className="modal-form-footer">
              <p className="modal-disclaimer">
                By submitting, you agree that Prisma Analytics will forward your information to the hiring party.
              </p>
              <button 
                type="submit" 
                className="modal-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : `Send via ${contactMethod === 'whatsapp' ? 'WhatsApp' : 'Email'}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [savedOpps, setSavedOpps] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContractType, setSelectedContractType] = useState<'clt' | 'freelancer' | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [userOpportunities, setUserOpportunities] = useState<UserOpportunity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    opportunities: 0,
    newThisWeek: 0,
    messages: 0,
    matchRate: '0%'
  });
  const [selectedOpportunity, setSelectedOpportunity] = useState<CombinedOpportunity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    modalidades: [] as string[],
    tipoServico: [] as string[],
    tipoCliente: [] as string[],
    urgencia: [] as string[]
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    fetchOpportunities();
    fetchUserOpportunities();
    fetchStats();
  }, []);

  useEffect(() => {
    updateDashboardStats(opportunities, userOpportunities);
  }, [opportunities, userOpportunities]);

  const fetchOpportunities = async () => {
    try {
      const response = await api.get<{ data: Opportunity[] }>('/opportunities');
      
      if (response.data && response.data.data) {
        const opportunitiesData = response.data.data;
        setOpportunities(opportunitiesData);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOpportunities = async () => {
    try {
      const response = await api.getUserOpportunities(true);
      
      if (response.data && Array.isArray(response.data)) {
        setUserOpportunities(response.data);
      } else {
        setUserOpportunities([]);
      }
    } catch (error) {
      console.error('Error fetching user opportunities:', error);
      setUserOpportunities([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get<Stats>('/opportunities/stats');
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateDashboardStats = (opps: Opportunity[], userOpps: UserOpportunity[]) => {
    const total = opps.length + userOpps.length;

    setDashboardStats({
      opportunities: total,
      newThisWeek: total,
      messages: 0,
      matchRate: total > 0 ? `${Math.min(100, Math.round((total / 10) * 100))}%` : '0%'
    });
  };

  const handleScrape = async (source?: string) => {
    setScraping(true);
    try {
      const endpoint = source ? `/scrape/${source}` : '/scrape/all';
      const response = await api.get(endpoint);
      if (response.data) {
        await fetchOpportunities();
        await fetchStats();
      }
    } catch (error) {
      console.error('Error scraping:', error);
    } finally {
      setScraping(false);
    }
  };

  const toggleFilter = (category: 'modalidades' | 'tipoServico' | 'tipoCliente' | 'urgencia', value: string) => {
    setFilters(prev => {
      const current = prev[category];
      const newValues = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: newValues };
    });
  };

  const clearFilters = () => {
    setFilters({ 
      modalidades: [],
      tipoServico: [],
      tipoCliente: [],
      urgencia: []
    });
    setSelectedContractType(null);
  };

  const toggleSave = (id: string) => {
    setSavedOpps(prev => 
      prev.includes(id) 
        ? prev.filter(oppId => oppId !== id)
        : [...prev, id]
    );
  };

  const handleCardClick = (opp: CombinedOpportunity) => {
    setSelectedOpportunity(opp);
    setIsDetailModalOpen(true);
  };

  const handleContactFromDetail = () => {
    setIsDetailModalOpen(false);
    setIsContactModalOpen(true);
  };

  const getAllOpportunities = (): CombinedOpportunity[] => {
    const cltOpps: CombinedOpportunity[] = opportunities.map(opp => ({
      id: opp.id,
      external_id: opp.external_id,
      source: opp.source,
      company: opp.company,
      title: opp.title,
      contract_type: opp.contract_type,
      modality: opp.modality,
      location: opp.location || 'Remote',
      application_url: opp.application_url,
      is_active: opp.is_active,
      created_at: opp.created_at
    }));

    const freelanceOpps: CombinedOpportunity[] = userOpportunities.map(opp => ({
      id: opp.id,
      external_id: opp.id,
      source: 'user_posted',
      company: opp.company,
      title: opp.title,
      contract_type: 'Freelancer',
      modality: opp.modality,
      location: opp.location || 'Remote',
      application_url: opp.whatsapp || `mailto:${opp.email}`,
      is_active: opp.is_active,
      created_at: opp.created_at,
      salary: opp.salary,
      whatsapp: opp.whatsapp,
      email: opp.email,
      description: opp.description,
      responsibilities: opp.responsibilities,
      requirements: opp.requirements,
      available_registration: opp.available_registration,
      remaining_vacancies: opp.remaining_vacancies,
      applicant_ids: opp.applicant_ids
    }));

    return [...cltOpps, ...freelanceOpps];
  };

  const getFilteredOpportunities = (): CombinedOpportunity[] => {
    let filtered = getAllOpportunities();

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.title.toLowerCase().includes(term) ||
        opp.company.toLowerCase().includes(term) ||
        opp.location.toLowerCase().includes(term)
      );
    }

    if (selectedContractType === 'clt') {
      filtered = filtered.filter(opp => opp.contract_type === 'CLT');
    } else if (selectedContractType === 'freelancer') {
      filtered = filtered.filter(opp => opp.contract_type === 'Freelancer');
    }

    if (filters.modalidades.length > 0) {
      filtered = filtered.filter(opp => filters.modalidades.includes(opp.modality));
    }

    return filtered;
  };

  const getSourceIcon = (source: string) => {
    if (source === 'user_posted') return <Users size={14} />;
    switch(source) {
      case 'ashby': return <Building2 size={14} />;
      case 'greenhouse': return <Globe size={14} />;
      case 'lever': return <Briefcase size={14} />;
      default: return <Briefcase size={14} />;
    }
  };

  const getSourceColor = (source: string) => {
    if (source === 'user_posted') return '#ec4899';
    switch(source) {
      case 'ashby': return '#ec4899';
      case 'greenhouse': return '#10b981';
      case 'lever': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getSourceLabel = (source: string) => {
    if (source === 'user_posted') return 'Posted by user';
    return source.charAt(0).toUpperCase() + source.slice(1);
  };

  const statsCards = [
    { 
      icon: TrendingUp, 
      value: dashboardStats.opportunities.toString(), 
      label: 'Opportunities',
      change: `+${dashboardStats.newThisWeek}`,
      trend: 'up',
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.08)'
    },
    { 
      icon: Star, 
      value: dashboardStats.newThisWeek.toString(), 
      label: 'New this week',
      change: `+${dashboardStats.newThisWeek}`,
      trend: 'up',
      color: '#f472b6',
      bgColor: 'rgba(244, 114, 182, 0.08)'
    },
    { 
      icon: MessageSquare, 
      value: '0', 
      label: 'Messages',
      change: '+0',
      trend: 'up',
      color: '#db2777',
      bgColor: 'rgba(219, 39, 119, 0.08)'
    },
    { 
      icon: Target, 
      value: dashboardStats.matchRate, 
      label: 'Match rate',
      change: '+0%',
      trend: 'up',
      color: '#be185d',
      bgColor: 'rgba(190, 24, 93, 0.08)'
    }
  ];

  const quickActions = [
    { icon: BarChart3, label: 'Analytics', path: '/analytics', color: '#ec4899' },
    { icon: Send, label: 'Send Message', path: '/messages', color: '#f472b6' },
    { icon: GraduationCap, label: 'Tutorial', path: '/tutorial', color: '#db2777' },
    { icon: Crown, label: 'Plans', path: '/plans', color: '#be185d' },
  ];

  const filteredOpportunities = getFilteredOpportunities();

  return (
    <div className="dashboard-page">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="dashboard-main">
        <Header onMenuClick={() => setSidebarOpen(true)} />
      
        <div className="dashboard-content">
          <div className="dashboard-welcome">
            <div className="dashboard-welcome-left">
              <div>
                <div className="dashboard-welcome-greeting">
                  <Sparkles size={16} />
                  <span>{greeting}, {user?.name?.split(' ')[0] || 'User'}</span>
                </div>
                <span className="feedback-title-accent" />
                <p className="dashboard-welcome-text">
                  Connect with the best opportunities for designers.
                </p>
              </div>
            </div>
            <div className="dashboard-welcome-right">
              <div className="dashboard-date">
                <Calendar size={14} />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>
          </div>

          <div className="dashboard-stats-grid">
            {statsCards.map((stat, index) => (
              <Card key={index} className="dashboard-stat-card" hover glow>
                <div className="dashboard-stat-top">
                  <div className="dashboard-stat-icon" style={{ background: stat.bgColor }}>
                    <stat.icon size={18} style={{ color: stat.color }} />
                  </div>
                  <div className={`dashboard-stat-trend ${stat.trend === 'up' ? 'up' : 'down'}`}>
                    {stat.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className="dashboard-stat-bottom">
                  <span className="dashboard-stat-value">{stat.value}</span>
                  <span className="dashboard-stat-label">{stat.label}</span>
                </div>
                <div className="dashboard-stat-sparkline">
                  <svg width="100%" height="40" viewBox="0 0 200 40">
                    <path
                      d={`M0,35 Q20,30 40,25 T80,20 T120,28 T160,15 T200,10`}
                      fill="none"
                      stroke={stat.color}
                      strokeWidth="1.5"
                      opacity="0.5"
                    />
                  </svg>
                </div>
              </Card>
            ))}
          </div>

          <div className="dashboard-quick-actions">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.path} className="dashboard-quick-action">
                <div className="dashboard-quick-action-icon" style={{ background: `${action.color}10` }}>
                  <action.icon size={18} style={{ color: action.color }} />
                </div>
                <span className="dashboard-quick-action-label">{action.label}</span>
                <ChevronRight size={14} className="dashboard-quick-action-arrow" />
              </Link>
            ))}
          </div>

          <div className="dashboard-grid">
            <Card className="dashboard-opportunities-card" glow>
              <div className="dashboard-section-header">
                <div className="dashboard-section-header-left">
                  <h2 className="dashboard-section-title">Opportunities</h2>
                  <span className="dashboard-section-badge pulse">{filteredOpportunities.length} available</span>
                </div>
                <div className="dashboard-section-header-right">
                  <div className="dashboard-search-wrapper">
                    <Search size={16} className="dashboard-search-icon" />
                    <input
                      type="text"
                      placeholder="Search opportunities..."
                      className="dashboard-search-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="dashboard-opportunities-container">
                {loading ? (
                  <div className="dashboard-loading-state">
                    <Loader2 size={48} className="spinning" />
                    <p>Loading opportunities...</p>
                  </div>
                ) : filteredOpportunities.length === 0 ? (
                  <div className="dashboard-empty-state">
                    <div className="dashboard-empty-state-icon">
                      <Briefcase size={48} />
                    </div>
                    <h3>No opportunities available</h3>
                    <p>We're searching for the best positions for you. 
                    <br />Click "Scrape Jobs" to get started.</p>
                    <div className="dashboard-empty-state-actions">
                      <Button 
                        variant="primary" 
                        size="md" 
                        icon={scraping ? <Loader2 size={16} className="spinning" /> : <RefreshCw size={16} />}
                        onClick={() => handleScrape()}
                        disabled={scraping}
                      >
                        {scraping ? 'Scraping...' : 'Scrape Jobs'}
                      </Button>
                      <Link to="/tutorial">
                        <Button variant="outline" size="md" icon={<GraduationCap size={16} />}>
                          View tutorial
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="dashboard-opportunities-list">
                    {filteredOpportunities.map((opp) => {
                      const isUserPosted = opp.source === 'user_posted';
                      return (
                        <div 
                          key={opp.external_id} 
                          className={`dashboard-opportunity-item ${isUserPosted ? 'user-posted-item' : ''}`}
                          onClick={() => handleCardClick(opp)}
                        >
                          <div className="dashboard-opportunity-main">
                            <div className="dashboard-opportunity-source">
                              {getSourceIcon(opp.source)}
                              <span style={{ color: getSourceColor(opp.source) }}>
                                {getSourceLabel(opp.source)}
                              </span>
                            </div>
                            <h4 className="dashboard-opportunity-title">{opp.title}</h4>
                            <div className="dashboard-opportunity-meta">
                              <span className="dashboard-opportunity-company">
                                <Building2 size={14} />
                                {opp.company}
                              </span>
                              <span className="dashboard-opportunity-location">
                                <MapPin size={14} />
                                {opp.location || 'Remote'}
                              </span>
                              <span className="dashboard-opportunity-contract">
                                <Briefcase size={14} />
                                {opp.contract_type || 'CLT'}
                              </span>
                              {isUserPosted && opp.salary && (
                                <span className="dashboard-opportunity-salary">
                                  <DollarSign size={14} />
                                  {opp.salary}
                                </span>
                              )}
                              {isUserPosted && opp.available_registration && (
                                <span className="dashboard-opportunity-vacancies">
                                  <Users size={14} />
                                  {opp.available_registration} openings
                                </span>
                              )}
                              {isUserPosted && opp.remaining_vacancies !== undefined && opp.remaining_vacancies !== null && (
                                <span className="dashboard-opportunity-remaining">
                                  <Users size={14} />
                                  Remaining: {opp.remaining_vacancies}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="dashboard-opportunity-actions" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className={`dashboard-save-button ${savedOpps.includes(opp.external_id) ? 'saved' : ''}`}
                              onClick={() => toggleSave(opp.external_id)}
                            >
                              <Heart size={18} fill={savedOpps.includes(opp.external_id) ? '#ec4899' : 'none'} />
                            </button>
                            {isUserPosted ? (
                              <button 
                                className="dashboard-contact-button"
                                onClick={() => {
                                  setSelectedOpportunity(opp);
                                  setIsContactModalOpen(true);
                                }}
                              >
                                Contact
                                <ArrowUpRight size={14} />
                              </button>
                            ) : (
                              <a 
                                href={opp.application_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="dashboard-apply-button"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Job
                                <ArrowUpRight size={14} />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>

            <Card className="dashboard-filter-card" glow>
              <div className="dashboard-filter-header">
                <div className="dashboard-filter-title">
                  <Sliders size={16} />
                  Filters
                </div>
                <span className="dashboard-filter-clear" onClick={clearFilters}>Clear</span>
              </div>

              <div className="dashboard-filter-section">
                <span className="dashboard-filter-label">Contract type</span>
                <div className="dashboard-filter-options">
                  <div 
                    className={`dashboard-filter-option ${selectedContractType === 'clt' ? 'selected' : ''}`}
                    onClick={() => setSelectedContractType(selectedContractType === 'clt' ? null : 'clt')}
                  >
                    CLT
                  </div>
                  <div 
                    className={`dashboard-filter-option ${selectedContractType === 'freelancer' ? 'selected' : ''}`}
                    onClick={() => setSelectedContractType(selectedContractType === 'freelancer' ? null : 'freelancer')}
                  >
                    Freelancer
                  </div>
                </div>
              </div>

              <div className="dashboard-filter-section">
                <span className="dashboard-filter-label">Modalities</span>
                <div className="dashboard-filter-options">
                  {filterOptions.modalidades.map((opt) => (
                    <div 
                      key={opt}
                      className={`dashboard-filter-option ${filters.modalidades.includes(opt) ? 'selected' : ''}`}
                      onClick={() => toggleFilter('modalidades', opt)}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-advanced-divider">
                <span>Advanced Filters</span>
                <Sparkle size={14} className="dashboard-advanced-sparkle" />
              </div>

              <div className="dashboard-filter-advanced-locked">
                <div className="dashboard-lock-overlay">
                  <div className="dashboard-lock-banner">
                    <div className="dashboard-lock-banner-icon">
                      <Crown size={22} />
                    </div>
                    <div className="dashboard-lock-banner-text">
                      <h3>Unlock advanced filters</h3>
                      <p>Access service type, client type, and urgency levels</p>
                    </div>
                    <Link to="/plans" className="dashboard-lock-banner-button">
                      <Button variant="primary" size="sm" icon={<Crown size={14} />}>
                        Subscribe to Pro Plan
                      </Button>
                    </Link>
                  </div>

                  <div className="dashboard-filter-section locked">
                    <span className="dashboard-filter-label">Service type</span>
                    <div className="dashboard-filter-options">
                      {filterOptions.tipoServico.map((opt) => (
                        <div key={opt} className="dashboard-filter-option disabled">
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="dashboard-filter-section locked">
                    <span className="dashboard-filter-label">Client type</span>
                    <div className="dashboard-filter-options">
                      {filterOptions.tipoCliente.map((opt) => (
                        <div key={opt} className="dashboard-filter-option disabled">
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="dashboard-filter-section locked">
                    <span className="dashboard-filter-label">Urgency levels</span>
                    <div className="dashboard-filter-options">
                      {filterOptions.urgencia.map((opt) => (
                        <div key={opt} className={`dashboard-filter-option disabled urgency-${opt.toLowerCase()}`}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-filter-apply">
                <Button fullWidth size="sm" icon={<ListFilter size={16} />}>
                  Apply filters
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <DetailModal 
        opportunity={selectedOpportunity}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOpportunity(null);
        }}
        onContact={handleContactFromDetail}
      />

      <ContactModal 
        opportunity={selectedOpportunity}
        isOpen={isContactModalOpen}
        onClose={() => {
          setIsContactModalOpen(false);
          setSelectedOpportunity(null);
        }}
      />
    </div>
  );
}
