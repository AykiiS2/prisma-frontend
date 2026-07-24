import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { Header } from '../../components/Header/Header';
import { Button } from '../../components/Button/Button';
import { Play, BookOpen, X } from 'lucide-react';
import './Tutorial.css';

export function Tutorial() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isDocOpen, setIsDocOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleVideo = () => setIsVideoOpen(!isVideoOpen);
  const toggleDoc = () => setIsDocOpen(!isDocOpen);

  return (
    <div className="dashboard-page">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Header onMenuClick={toggleSidebar} />
        <div className="dashboard-content tutorial-content">
          <div className="tutorial-header">
            <h1 className="tutorial-title">Tutorial</h1>
            <span className="feedback-title-accent" />
            <p className="tutorial-subtitle">
              Learn how to use all of Prisma's features to find the best opportunities.
            </p>
          </div>

          <div className="tutorial-grid">
            <div className="tutorial-card">
              <div className="tutorial-card-icon video-icon">
                <Play size={28} />
              </div>
              <h3 className="tutorial-card-title">Intro Video</h3>
              <p className="tutorial-card-text">
                Watch a quick guide on how Prisma works.
              </p>
              <Button size="lg" icon={<Play size={16} />} onClick={toggleVideo}>
                Watch
              </Button>
            </div>

            <div className="tutorial-card">
              <div className="tutorial-card-icon doc-icon">
                <BookOpen size={28} />
              </div>
              <h3 className="tutorial-card-title">Documentation</h3>
              <p className="tutorial-card-text">
                Read the complete documentation with all platform features.
              </p>
              <Button 
                size="lg" 
                icon={<BookOpen size={16} />} 
                variant="outline"
                onClick={toggleDoc}
              >
                Open documentation
              </Button>
            </div>
          </div>

          {isVideoOpen && (
            <div className="overlay">
              <div className="modal-container video-modal">
                <div className="modal-header">
                  <h3>Intro Video - Prisma</h3>
                  <button 
                    className="modal-control-btn close-btn"
                    onClick={toggleVideo}
                    title="Close"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="modal-body video-body">
                  <iframe
                    width="100%"
                    height="100%"
                    src=""
                    title="Prisma Tutorial"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          )}

          {isDocOpen && (
            <div className="overlay">
              <div className="modal-container doc-modal">
                <div className="modal-header">
                  <h3>Documentation - Prisma</h3>
                  <button 
                    className="modal-control-btn close-btn"
                    onClick={toggleDoc}
                    title="Close"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="modal-body doc-body">
                  <div className="doc-content">
                    <h1>Prisma Documentation</h1>
                    
                    <section>
                      <h2>What is Prisma?</h2>
                      <p>
                        Prisma is an intelligent prospecting platform that performs real-time 
                        scraping across multiple recruitment platforms to identify job opportunities. 
                        The system collects, normalizes, and structures job posting data from 
                        different sources, consolidating them into a single dashboard to facilitate 
                        searching and analysis for users.
                      </p>
                      <p>
                        Prisma currently integrates data from the following platforms:
                      </p>
                      <ul>
                        <li><strong>Greenhouse</strong></li>
                        <li><strong>Ashby</strong></li>
                        <li><strong>Lever</strong></li>
                      </ul>
                    </section>

                    <section>
                      <h2>How Prospecting Works</h2>
                      <p>
                        The system uses dedicated scrapers for each platform, operating at 
                        regular intervals to ensure always up-to-date data. The prospecting 
                        process follows these steps:
                      </p>
                      <ol>
                        <li>
                          <strong>Structured Collection:</strong> Each scraper is optimized for 
                          the specific structure of the target platform, using techniques like 
                          HTML parsing, public API consumption, and simulated navigation when 
                          necessary.
                        </li>
                        <li>
                          <strong>Data Extraction:</strong> Information such as job title, 
                          complete description, requirements, location, contract type, 
                          salary range, and publication date are accurately extracted.
                        </li>
                        <li>
                          <strong>Normalization:</strong> Collected data goes through a 
                          standardization process where fields like location, seniority level, and 
                          technologies are unified to facilitate searches and filters.
                        </li>
                        <li>
                          <strong>Deduplication:</strong> Similarity algorithms identify and 
                          remove duplicate job postings that may appear across multiple platforms, 
                          avoiding redundancy in the dashboard.
                        </li>
                        <li>
                          <strong>Indexing:</strong> Job postings are indexed with enriched 
                          metadata, allowing advanced searches by keywords, specific technologies, 
                          location, and other criteria.
                        </li>
                        <li>
                          <strong>Continuous Updates:</strong> The system constantly monitors 
                          platforms to identify new job postings, remove expired ones, and 
                          update selection process statuses.
                        </li>
                      </ol>
                    </section>

                    <section>
                      <h2>Platform Features</h2>
                      <ul>
                        <li>
                          <strong>Real-time Monitoring:</strong> Frequent updates ensuring you 
                          never miss an opportunity.
                        </li>
                        <li>
                          <strong>Advanced Filters:</strong> Search by technologies, experience 
                          level, work model (remote, hybrid, on-site), location, and salary range.
                        </li>
                        <li>
                          <strong>Custom Dashboard:</strong> View market statistics, hiring 
                          trends, and opportunities by category.
                        </li>
                        <li>
                          <strong>Market Analysis:</strong> Access aggregated data on the job 
                          market, including salary distribution, most requested technologies, 
                          and growth by segment.
                        </li>
                        <li>
                          <strong>Page Connections:</strong> The platform seamlessly integrates 
                          all sections: Dashboard for viewing opportunities, Analytics for detailed 
                          market analysis, Message Sending for contacting employers, Tutorial for 
                          learning, and Plans for scaling your usage.
                        </li>
                      </ul>
                    </section>

                    <section>
                      <h2>How to Use</h2>
                      <ol>
                        <li>
                          <strong>Registration:</strong> Create your account with email and password
                        </li>
                        <li>
                          <strong>Login:</strong> Access the platform using your registered email 
                          and password. The system does not use Google or LinkedIn login.
                        </li>
                        <li>
                          <strong>Dashboard:</strong> View all available opportunities, use filters 
                          to refine your search, and explore job postings that best fit your profile.
                        </li>
                        <li>
                          <strong>Analytics:</strong> Access detailed analyses of the job market, 
                          including job distribution by contract type, work modality, and other 
                          relevant metrics.
                        </li>
                        <li>
                          <strong>Message Sending:</strong> Contact employers directly through the 
                          platform using the contact form available on each opportunity.
                        </li>
                        <li>
                          <strong>Plans:</strong> Choose the plan that best meets your needs to 
                          unlock advanced features and increase your chances of finding the ideal 
                          opportunity.
                        </li>
                      </ol>
                    </section>

                    <section>
                      <h2>Support</h2>
                      <p>
                        For questions, suggestions, or to report issues, contact us by email:
                      </p>
                      <p>
                        <strong>prismaanalytics80@gmail.com</strong>
                      </p>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
