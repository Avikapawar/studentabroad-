import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const HelpSystem = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFAQs, setFilteredFAQs] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'suggestion',
    subject: '',
    message: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const location = useLocation();

  // FAQ data
  const faqs = [
    {
      id: 1,
      category: 'Getting Started',
      question: 'How do I create my profile?',
      answer: 'Go to the Profile page and fill in your academic information including CGPA, test scores (GRE, IELTS/TOEFL), budget range, and preferred countries. This information helps us provide personalized university recommendations.',
      tags: ['profile', 'setup', 'academic', 'scores']
    },
    {
      id: 2,
      category: 'Recommendations',
      question: 'How are university recommendations generated?',
      answer: 'Our AI analyzes your academic profile, test scores, budget, and preferences to match you with universities where you have good admission chances. We consider factors like admission requirements, acceptance rates, and cost of attendance.',
      tags: ['recommendations', 'ai', 'matching', 'admission']
    },
    {
      id: 3,
      category: 'Search',
      question: 'How can I search for universities?',
      answer: 'Use the Search page to filter universities by country, field of study, tuition fees, admission requirements, and rankings. You can also use the search bar to find specific universities by name.',
      tags: ['search', 'filter', 'universities', 'criteria']
    },
    {
      id: 4,
      category: 'Bookmarks',
      question: 'How do I save and compare universities?',
      answer: 'Click the bookmark icon on any university card to save it to your bookmarks. You can then compare multiple universities side-by-side from your Bookmarks page.',
      tags: ['bookmarks', 'save', 'compare', 'favorites']
    },
    {
      id: 5,
      category: 'Account',
      question: 'How do I change my password?',
      answer: 'Go to your Profile page and click on "Change Password". You\'ll need to enter your current password and then your new password twice to confirm.',
      tags: ['password', 'security', 'account', 'change']
    },
    {
      id: 6,
      category: 'Data & Privacy',
      question: 'How is my data protected?',
      answer: 'We use industry-standard encryption to protect your personal information. Your data is never shared with third parties without your consent. You can request data export or deletion at any time.',
      tags: ['privacy', 'data', 'security', 'gdpr']
    },
    {
      id: 7,
      category: 'Technical',
      question: 'The website is loading slowly. What should I do?',
      answer: 'Try refreshing the page, clearing your browser cache, or checking your internet connection. If the problem persists, please contact our support team.',
      tags: ['performance', 'loading', 'technical', 'troubleshooting']
    },
    {
      id: 8,
      category: 'Universities',
      question: 'How often is university data updated?',
      answer: 'We update university information regularly, including tuition fees, admission requirements, and rankings. Data is typically refreshed monthly from official sources.',
      tags: ['data', 'updates', 'accuracy', 'universities']
    }
  ];

  // Context-sensitive help based on current page
  const getContextualHelp = () => {
    const path = location.pathname;
    
    switch (path) {
      case '/profile':
        return {
          title: 'Profile Help',
          tips: [
            'Fill in all academic information for better recommendations',
            'CGPA should be on a 4.0 scale',
            'Test scores are optional but improve matching accuracy',
            'Budget range helps filter affordable options'
          ]
        };
      case '/search':
        return {
          title: 'Search Help',
          tips: [
            'Use filters to narrow down results',
            'Sort by ranking, cost, or admission probability',
            'Click on university cards for detailed information',
            'Use the comparison feature to evaluate options'
          ]
        };
      case '/recommendations':
        return {
          title: 'Recommendations Help',
          tips: [
            'Recommendations are based on your profile',
            'Green indicators show good admission chances',
            'Update your profile to refresh recommendations',
            'Bookmark interesting universities for later'
          ]
        };
      case '/bookmarks':
        return {
          title: 'Bookmarks Help',
          tips: [
            'Save universities you\'re interested in',
            'Compare up to 4 universities side-by-side',
            'Remove bookmarks you\'re no longer considering',
            'Export your bookmarked list for offline review'
          ]
        };
      default:
        return {
          title: 'General Help',
          tips: [
            'Complete your profile for personalized recommendations',
            'Use the search to explore universities',
            'Bookmark universities you like',
            'Check notifications for updates'
          ]
        };
    }
  };

  // Filter FAQs based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFAQs(faqs);
    } else {
      const filtered = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFAQs(filtered);
    }
  }, [searchQuery]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFeedbackForm({
        type: 'suggestion',
        subject: '',
        message: '',
        email: ''
      });
      
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (error) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contextualHelp = getContextualHelp();

  if (!isOpen) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
          }}
        >
          ❓
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      height: '600px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          Help & Support
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '4px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {[
          { id: 'contextual', label: 'Quick Help', icon: '💡' },
          { id: 'faq', label: 'FAQ', icon: '❓' },
          { id: 'contact', label: 'Contact', icon: '📧' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? '#f3f4f6' : 'transparent',
              color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px'
      }}>
        {/* Contextual Help Tab */}
        {activeTab === 'contextual' && (
          <div>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              {contextualHelp.title}
            </h4>
            <div style={{ marginBottom: '20px' }}>
              {contextualHelp.tips.map((tip, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                    fontSize: '0.875rem',
                    color: '#4b5563'
                  }}
                >
                  <span style={{ marginRight: '8px', color: '#3b82f6' }}>•</span>
                  {tip}
                </div>
              ))}
            </div>

            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ marginRight: '8px', fontSize: '1.25rem' }}>💬</span>
                <strong style={{ fontSize: '0.875rem', color: '#0369a1' }}>
                  Need more help?
                </strong>
              </div>
              <p style={{
                margin: 0,
                fontSize: '0.875rem',
                color: '#0369a1'
              }}>
                Check our FAQ section or contact support for personalized assistance.
              </p>
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div>
            {/* Search */}
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {/* FAQ List */}
            <div>
              {filteredFAQs.map(faq => (
                <details
                  key={faq.id}
                  style={{
                    marginBottom: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}
                >
                  <summary style={{
                    padding: '12px',
                    cursor: 'pointer',
                    backgroundColor: '#f9fafb',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#1f2937'
                  }}>
                    {faq.question}
                  </summary>
                  <div style={{
                    padding: '12px',
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    lineHeight: '1.5'
                  }}>
                    {faq.answer}
                  </div>
                </details>
              ))}
              
              {filteredFAQs.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}>
                  No FAQs found matching your search.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div>
            <form onSubmit={handleFeedbackSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Type
                </label>
                <select
                  value={feedbackForm.type}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, type: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="suggestion">Suggestion</option>
                  <option value="bug">Bug Report</option>
                  <option value="question">Question</option>
                  <option value="complaint">Complaint</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={feedbackForm.subject}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your message"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Message
                </label>
                <textarea
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Please provide details..."
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={feedbackForm.email}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>

              {submitStatus === 'success' && (
                <div style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}>
                  ✅ Message sent successfully!
                </div>
              )}

              {submitStatus === 'error' && (
                <div style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}>
                  ❌ Failed to send message. Please try again.
                </div>
              )}
            </form>

            {/* Contact Info */}
            <div style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              fontSize: '0.875rem',
              color: '#4b5563'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Other ways to reach us:</strong>
              </div>
              <div>📧 support@studyabroad.com</div>
              <div>💬 Live chat (Mon-Fri, 9AM-5PM)</div>
              <div>📞 +1-800-STUDY-ABROAD</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpSystem;