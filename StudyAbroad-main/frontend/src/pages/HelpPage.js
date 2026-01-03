import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './HelpPage.css';

const HelpPage = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    category: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const categories = [
    { id: 'getting-started', icon: '🚀', name: 'Getting Started' },
    { id: 'search', icon: '🔍', name: 'Search & Filters' },
    { id: 'applications', icon: '📝', name: 'Applications' },
    { id: 'recommendations', icon: '🎯', name: 'AI Recommendations' },
    { id: 'account', icon: '👤', name: 'Account & Profile' },
    { id: 'technical', icon: '⚙️', name: 'Technical Issues' }
  ];

  const faqs = {
    'getting-started': [
      {
        question: 'How do I get started with StudyAbroad?',
        answer: 'Start by creating a free account, then complete your profile with your academic information, test scores, and study preferences. Our AI will then recommend universities that match your profile.'
      },
      {
        question: 'Is StudyAbroad free to use?',
        answer: 'Yes! StudyAbroad is completely free. You can search universities, get AI recommendations, compare options, and save bookmarks without any cost.'
      },
      {
        question: 'What information do I need to provide?',
        answer: 'To get personalized recommendations, provide your CGPA, test scores (GRE, IELTS/TOEFL), preferred countries, fields of study, and budget. The more complete your profile, the better our recommendations.'
      },
      {
        question: 'How accurate are the university rankings?',
        answer: 'We use official rankings from QS World University Rankings, Times Higher Education, and other reputable sources. Rankings are updated regularly to ensure accuracy.'
      }
    ],
    'search': [
      {
        question: 'How do I search for universities?',
        answer: 'Use the Search page to browse universities. You can filter by country, tuition fees, CGPA requirements, acceptance rates, and more. Use the sort options to organize results by ranking, cost, or acceptance rate.'
      },
      {
        question: 'Can I search by specific programs?',
        answer: 'Yes! Use the field of study filter to find universities offering specific programs like Computer Science, Engineering, Business, Medicine, etc.'
      },
      {
        question: 'What do the filters mean?',
        answer: 'Filters help narrow your search: Country (location), Tuition (annual cost), CGPA (minimum grade requirement), Type (public/private), and Acceptance Rate (admission difficulty).'
      },
      {
        question: 'How do I save universities for later?',
        answer: 'Click the bookmark icon on any university card to save it. Access all your saved universities from the Bookmarks page in the navigation menu.'
      }
    ],
    'applications': [
      {
        question: 'Does StudyAbroad help with applications?',
        answer: 'We provide comprehensive information about each university including application deadlines, required documents, test scores, and direct links to official application portals.'
      },
      {
        question: 'What are the typical application requirements?',
        answer: 'Common requirements include: academic transcripts, standardized test scores (GRE, GMAT, SAT), English proficiency tests (IELTS, TOEFL), letters of recommendation, statement of purpose, and application fees.'
      },
      {
        question: 'When should I start applying?',
        answer: 'Start 12-18 months before your intended start date. Most universities have deadlines 6-12 months before the semester begins. Check specific deadlines on each university\'s detail page.'
      },
      {
        question: 'Can I apply to multiple universities?',
        answer: 'Yes! We recommend applying to 6-10 universities: 2-3 reach schools, 3-4 target schools, and 2-3 safety schools to maximize your chances of admission.'
      }
    ],
    'recommendations': [
      {
        question: 'How does AI Recommendations work?',
        answer: 'Our AI analyzes your academic profile, test scores, preferences, and budget to recommend universities where you have the best chances of admission and success. The algorithm considers 50+ factors.'
      },
      {
        question: 'Why am I not getting recommendations?',
        answer: 'Make sure your profile is complete with CGPA, test scores, preferred countries, and fields of study. The AI needs this information to generate accurate recommendations.'
      },
      {
        question: 'Can I update my preferences?',
        answer: 'Yes! Update your profile anytime from the Profile Settings page. The AI will automatically generate new recommendations based on your updated information.'
      },
      {
        question: 'What is the match percentage?',
        answer: 'The match percentage shows how well a university fits your profile based on academic requirements, location preferences, budget, and program offerings. Higher percentages indicate better matches.'
      }
    ],
    'account': [
      {
        question: 'How do I update my profile?',
        answer: 'Go to Profile Settings from the account dropdown menu. You can update your personal information, academic details, test scores, and study preferences.'
      },
      {
        question: 'How do I change my password?',
        answer: 'Visit Profile Settings and click on "Change Password". Enter your current password and new password to update your credentials.'
      },
      {
        question: 'Can I delete my account?',
        answer: 'Yes, you can delete your account from Profile Settings. Note that this action is permanent and will remove all your data, bookmarks, and preferences.'
      },
      {
        question: 'How do I manage notifications?',
        answer: 'Go to Preferences from the account dropdown to customize your notification settings. You can enable/disable email notifications, deadline reminders, and recommendation alerts.'
      }
    ],
    'technical': [
      {
        question: 'The website is loading slowly. What should I do?',
        answer: 'Try clearing your browser cache, disabling browser extensions, or using a different browser. If the issue persists, check your internet connection or contact support.'
      },
      {
        question: 'I can\'t log in to my account',
        answer: 'Ensure you\'re using the correct email and password. Try the "Forgot Password" link to reset your password. Clear browser cookies if the issue continues.'
      },
      {
        question: 'Images are not loading properly',
        answer: 'This might be due to slow internet or browser cache issues. Try refreshing the page (Ctrl+F5) or clearing your browser cache. Some images may take time to load on slower connections.'
      },
      {
        question: 'The comparison feature is not working',
        answer: 'Make sure you\'re logged in and have selected 2-4 universities to compare. Clear your browser cache and try again. If the issue persists, contact support.'
      }
    ]
  };

  const quickLinks = [
    { icon: '📚', title: 'User Guide', description: 'Complete guide to using StudyAbroad', link: '#' },
    { icon: '🎥', title: 'Video Tutorials', description: 'Watch step-by-step tutorials', link: '#' },
    { icon: '💬', title: 'Community Forum', description: 'Connect with other students', link: '#' },
    { icon: '📧', title: 'Email Support', description: 'support@studyabroad.com', link: 'mailto:support@studyabroad.com' }
  ];

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In real app, send to backend
      // await fetch('/api/support/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(contactForm)
      // });

      setSubmitMessage('Thank you! Your message has been sent. We\'ll respond within 24 hours.');
      setContactForm({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        category: 'general',
        message: ''
      });
    } catch (error) {
      setSubmitMessage('Failed to send message. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFaqs = searchQuery
    ? Object.values(faqs).flat().filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs[activeCategory] || [];

  return (
    <div className="help-page">
      <div className="help-container">
        {/* Header */}
        <div className="help-header">
          <h1>❓ Help & Support</h1>
          <p>We're here to help you succeed in your study abroad journey</p>
        </div>

        {/* Search Bar */}
        <div className="help-search">
          <input
            type="text"
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Quick Links */}
        <div className="quick-links">
          {quickLinks.map((link, index) => (
            <a
              key={index}
              href={link.link}
              className="quick-link-card"
              target={link.link.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
            >
              <span className="quick-link-icon">{link.icon}</span>
              <h3>{link.title}</h3>
              <p>{link.description}</p>
            </a>
          ))}
        </div>

        {/* Main Content */}
        <div className="help-content">
          {/* Categories Sidebar */}
          {!searchQuery && (
            <div className="help-categories">
              <h2>Categories</h2>
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* FAQs */}
          <div className="help-faqs">
            <h2>
              {searchQuery
                ? `Search Results (${filteredFaqs.length})`
                : categories.find(c => c.id === activeCategory)?.name}
            </h2>

            {filteredFaqs.length === 0 ? (
              <div className="no-results">
                <span className="no-results-icon">🔍</span>
                <p>No results found for "{searchQuery}"</p>
                <p className="no-results-hint">Try different keywords or browse categories</p>
              </div>
            ) : (
              <div className="faq-list">
                {filteredFaqs.map((faq, index) => (
                  <div
                    key={index}
                    className={`faq-item ${expandedFaq === index ? 'expanded' : ''}`}
                  >
                    <button
                      className="faq-question"
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    >
                      <span>{faq.question}</span>
                      <span className="faq-toggle">{expandedFaq === index ? '−' : '+'}</span>
                    </button>
                    {expandedFaq === index && (
                      <div className="faq-answer">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-section">
          <h2>📧 Still Need Help?</h2>
          <p>Can't find what you're looking for? Send us a message and we'll get back to you soon.</p>

          {submitMessage && (
            <div className={`submit-message ${submitMessage.includes('Failed') ? 'error' : 'success'}`}>
              {submitMessage}
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  placeholder="Your name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={contactForm.category}
                  onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                  required
                >
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Issue</option>
                  <option value="account">Account Problem</option>
                  <option value="recommendations">Recommendations</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  required
                  placeholder="Brief description of your issue"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                required
                placeholder="Please describe your issue or question in detail..."
                rows="6"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Additional Resources */}
        <div className="resources-section">
          <h2>📖 Additional Resources</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <span className="resource-icon">📱</span>
              <h3>Mobile App</h3>
              <p>Download our mobile app for on-the-go access</p>
              <a href="#" className="resource-link">Coming Soon</a>
            </div>
            <div className="resource-card">
              <span className="resource-icon">📊</span>
              <h3>Blog & Articles</h3>
              <p>Read tips and guides for studying abroad</p>
              <a href="#" className="resource-link">Visit Blog</a>
            </div>
            <div className="resource-card">
              <span className="resource-icon">🎓</span>
              <h3>Webinars</h3>
              <p>Join live sessions with admission experts</p>
              <a href="#" className="resource-link">View Schedule</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
