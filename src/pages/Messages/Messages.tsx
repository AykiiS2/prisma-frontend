import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { Header } from '../../components/Header/Header';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { 
  Send, MessageSquare, Sparkles, Copy, CheckCircle,
  Building2, User, Mail, Briefcase, Globe, Phone
} from 'lucide-react';
import messagesData from '../../data/messages.json';
import './Messages.css';

export function Messages() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    subject: '',
    contactType: 'email',
    jobType: 'freelance',
    messageGoal: 'proposal'
  });

  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateMessage = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const filteredMessages = messagesData.filter(
        msg => msg.type === formData.messageGoal
      );
      
      const randomMessage = filteredMessages[Math.floor(Math.random() * filteredMessages.length)];
      
      let personalizedMessage = randomMessage.text
        .replace(/{contactName}/g, formData.contactName || 'client')
        .replace(/{companyName}/g, formData.companyName || 'your company');

      if (formData.contactType === 'whatsapp') {
        personalizedMessage = personalizedMessage
          .replace(/Dear/g, 'Hi')
          .replace(/Sincerely,/g, 'Cheers,')
          .replace(/Let's talk\?/g, 'Let\'s chat?')
          .replace(/I would like to/g, 'I want to')
          .replace(/We can schedule/g, 'Let\'s schedule')
          .replace(/I will be happy to/g, 'I would love to');
      } else if (formData.contactType === 'linkedin') {
        personalizedMessage = personalizedMessage
          .replace(/Hello,/g, 'Hello,')
          .replace(/Sincerely,/g, 'Sincerely,')
          .replace(/I would like to/g, 'I would like to')
          .replace(/Let's talk\?/g, 'Let\'s connect and chat?');
      }

      setGeneratedMessage(personalizedMessage);
      setIsGenerating(false);
    }, 1000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendEmail = () => {
    if (!formData.email || !generatedMessage) return;
    
    const subject = formData.subject || `Work proposal - ${formData.companyName || 'Design'}`;
    const mailtoLink = `mailto:${formData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(generatedMessage)}`;
    window.open(mailtoLink, '_blank');
  };

  const sendWhatsApp = () => {
    if (!formData.whatsappNumber || !generatedMessage) return;
    
    const cleanNumber = formData.whatsappNumber.replace(/\D/g, '');
    const whatsappLink = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(generatedMessage)}`;
    window.open(whatsappLink, '_blank');
  };

  const handleSend = () => {
    if (formData.contactType === 'email') {
      sendEmail();
    } else if (formData.contactType === 'whatsapp') {
      sendWhatsApp();
    } else if (formData.contactType === 'linkedin') {
      copyToClipboard();
      alert('Message copied! Paste it on LinkedIn to send.');
    }
  };

  const isSendDisabled = () => {
    if (!generatedMessage) return true;
    if (formData.contactType === 'email' && !formData.email) return true;
    if (formData.contactType === 'whatsapp' && !formData.whatsappNumber) return true;
    return false;
  };

  const getSendButtonText = () => {
    if (!generatedMessage) return 'Generate a message first';
    if (formData.contactType === 'email') return 'Send by Email';
    if (formData.contactType === 'whatsapp') return 'Send by WhatsApp';
    if (formData.contactType === 'linkedin') return 'Copy to LinkedIn';
    return 'Send message';
  };

  return (
    <div className="dashboard-page">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Header onMenuClick={toggleSidebar} />
        <div className="dashboard-content messages-content">
          <div className="messages-header">
            <div>
              <h1 className="messages-title">Messages</h1>
              <span className="feedback-title-accent" />
              <p className="messages-subtitle">
                Generate personalized messages and send them directly via Email or WhatsApp.
              </p>
            </div>
          </div>

          <div className="messages-layout">
            <Card className="messages-form-card">
              <div className="messages-form-header">
                <h3>Generate personalized message</h3>
              </div>

              <form className="messages-form" onSubmit={(e) => { e.preventDefault(); generateMessage(); }}>
                <div className="messages-form-row">
                  <div className="messages-form-group">
                    <label>Job type</label>
                    <select name="jobType" value={formData.jobType} onChange={handleChange} className="messages-form-select">
                      <option value="freelance">Freelance</option>
                      <option value="clt">CLT</option>
                    </select>
                  </div>
                  <div className="messages-form-group">
                    <label>Contact type</label>
                    <select name="contactType" value={formData.contactType} onChange={handleChange} className="messages-form-select">
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                  </div>
                </div>

                <div className="messages-form-group">
                  <label>Company / Client name</label>
                  <div className="messages-form-input-wrapper">
                    <Building2 size={16} className="messages-form-icon" />
                    <input 
                      type="text" 
                      name="companyName" 
                      placeholder="Ex: TechCorp Brazil" 
                      value={formData.companyName}
                      onChange={handleChange}
                      className="messages-form-input"
                    />
                  </div>
                </div>

                <div className="messages-form-group">
                  <label>Full contact name</label>
                  <div className="messages-form-input-wrapper">
                    <User size={16} className="messages-form-icon" />
                    <input 
                      type="text" 
                      name="contactName" 
                      placeholder="Ex: John Smith" 
                      value={formData.contactName}
                      onChange={handleChange}
                      className="messages-form-input"
                    />
                  </div>
                </div>

                {formData.contactType === 'email' && (
                  <>
                    <div className="messages-form-group">
                      <label>Recipient email</label>
                      <div className="messages-form-input-wrapper">
                        <Mail size={16} className="messages-form-icon" />
                        <input 
                          type="email" 
                          name="email" 
                          placeholder="Ex: john@company.com" 
                          value={formData.email}
                          onChange={handleChange}
                          className="messages-form-input"
                          required
                        />
                      </div>
                    </div>
                    <div className="messages-form-group">
                      <label>Email subject</label>
                      <div className="messages-form-input-wrapper">
                        <Briefcase size={16} className="messages-form-icon" />
                        <input 
                          type="text" 
                          name="subject" 
                          placeholder="Ex: Work proposal - Design" 
                          value={formData.subject}
                          onChange={handleChange}
                          className="messages-form-input"
                        />
                      </div>
                    </div>
                  </>
                )}

                {formData.contactType === 'whatsapp' && (
                  <div className="messages-form-group">
                    <label>WhatsApp number (with area code)</label>
                    <div className="messages-form-input-wrapper">
                      <Phone size={16} className="messages-form-icon" />
                      <input 
                        type="text" 
                        name="whatsappNumber" 
                        placeholder="Ex: 11999999999" 
                        value={formData.whatsappNumber}
                        onChange={handleChange}
                        className="messages-form-input"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="messages-form-group">
                  <label>Message goal</label>
                  <select name="messageGoal" value={formData.messageGoal} onChange={handleChange} className="messages-form-select">
                    <option value="proposal">Work proposal</option>
                    <option value="pitch">Professional pitch</option>
                    <option value="negotiation">Negotiation message</option>
                  </select>
                </div>

                <Button 
                  type="submit" 
                  fullWidth 
                  size="lg" 
                  icon={isGenerating ? undefined : <Sparkles size={16} />}
                  disabled={isGenerating}
                  className="messages-submit-btn"
                >
                  {isGenerating ? (
                    <>
                      <span className="messages-spinner" />
                      Generating message...
                    </>
                  ) : (
                    'Generate message'
                  )}
                </Button>
              </form>
            </Card>

            <Card className="messages-result-card">
              <div className="messages-result-header">
                <h3>Generated message</h3>
                <div className="messages-result-actions">
                  {generatedMessage && (
                    <button onClick={copyToClipboard} className="messages-result-btn">
                      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
              <div className="messages-result-content">
                {generatedMessage ? (
                  <pre className="messages-result-text">{generatedMessage}</pre>
                ) : (
                  <div className="messages-result-empty">
                    <MessageSquare size={40} />
                    <p>Fill in the fields and click "Generate message"</p>
                  </div>
                )}
              </div>
              {generatedMessage && (
                <div className="messages-send-container">
                  <Button 
                    fullWidth 
                    size="lg" 
                    icon={<Send size={16} />}
                    onClick={handleSend}
                    disabled={isSendDisabled()}
                    className="messages-send-btn"
                  >
                    {getSendButtonText()}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
