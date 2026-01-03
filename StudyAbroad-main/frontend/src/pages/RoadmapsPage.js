import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoadmapsPage.css';

const RoadmapsPage = () => {
  const navigate = useNavigate();
  const [selectedField, setSelectedField] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Comprehensive roadmap data inspired by roadmap.sh
  const roadmaps = {
    'Computer Science': {
      icon: '💻',
      color: '#4361ee',
      description: 'Complete learning path for Computer Science and Software Development',
      duration: '4 years',
      difficulty: 'Advanced',
      careers: ['Software Engineer', 'Data Scientist', 'AI/ML Engineer', 'Full Stack Developer'],
      roadmapUrl: 'https://roadmap.sh/computer-science',
      phases: [
        {
          year: 'Year 1',
          title: 'Foundations',
          topics: [
            { name: 'Programming Fundamentals', subtopics: ['Python', 'Java', 'C++', 'Problem Solving'] },
            { name: 'Data Structures', subtopics: ['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees'] },
            { name: 'Mathematics', subtopics: ['Discrete Math', 'Linear Algebra', 'Calculus'] },
            { name: 'Computer Architecture', subtopics: ['Digital Logic', 'CPU Design', 'Memory Systems'] }
          ]
        },
        {
          year: 'Year 2',
          title: 'Core Concepts',
          topics: [
            { name: 'Algorithms', subtopics: ['Sorting', 'Searching', 'Graph Algorithms', 'Dynamic Programming'] },
            { name: 'Database Systems', subtopics: ['SQL', 'NoSQL', 'Database Design', 'Transactions'] },
            { name: 'Operating Systems', subtopics: ['Process Management', 'Memory Management', 'File Systems'] },
            { name: 'Web Development', subtopics: ['HTML/CSS', 'JavaScript', 'React', 'Node.js'] }
          ]
        },
        {
          year: 'Year 3',
          title: 'Advanced Topics',
          topics: [
            { name: 'Software Engineering', subtopics: ['Design Patterns', 'Testing', 'CI/CD', 'Agile'] },
            { name: 'Computer Networks', subtopics: ['TCP/IP', 'HTTP', 'Security', 'Cloud Computing'] },
            { name: 'Machine Learning', subtopics: ['Supervised Learning', 'Neural Networks', 'Deep Learning'] },
            { name: 'Mobile Development', subtopics: ['Android', 'iOS', 'React Native', 'Flutter'] }
          ]
        },
        {
          year: 'Year 4',
          title: 'Specialization & Projects',
          topics: [
            { name: 'Capstone Project', subtopics: ['Research', 'Development', 'Testing', 'Deployment'] },
            { name: 'Electives', subtopics: ['AI', 'Cybersecurity', 'Blockchain', 'IoT'] },
            { name: 'Internship', subtopics: ['Industry Experience', 'Real-world Projects'] },
            { name: 'Career Prep', subtopics: ['Resume', 'Interview Prep', 'Portfolio', 'Networking'] }
          ]
        }
      ],
      resources: [
        { name: 'CS50 - Harvard', url: 'https://cs50.harvard.edu', type: 'Course' },
        { name: 'LeetCode', url: 'https://leetcode.com', type: 'Practice' },
        { name: 'GitHub', url: 'https://github.com', type: 'Portfolio' },
        { name: 'Stack Overflow', url: 'https://stackoverflow.com', type: 'Community' }
      ]
    },
    'Engineering': {
      icon: '⚙️',
      color: '#f59e0b',
      description: 'Comprehensive engineering curriculum covering core principles',
      duration: '4 years',
      difficulty: 'Advanced',
      careers: ['Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer', 'Chemical Engineer'],
      roadmapUrl: 'https://roadmap.sh/software-engineer',
      phases: [
        {
          year: 'Year 1',
          title: 'Engineering Fundamentals',
          topics: [
            { name: 'Mathematics', subtopics: ['Calculus', 'Differential Equations', 'Statistics'] },
            { name: 'Physics', subtopics: ['Mechanics', 'Thermodynamics', 'Electromagnetism'] },
            { name: 'Chemistry', subtopics: ['General Chemistry', 'Organic Chemistry'] },
            { name: 'Engineering Graphics', subtopics: ['CAD', 'Technical Drawing', '3D Modeling'] }
          ]
        },
        {
          year: 'Year 2',
          title: 'Core Engineering',
          topics: [
            { name: 'Mechanics of Materials', subtopics: ['Stress', 'Strain', 'Material Properties'] },
            { name: 'Fluid Mechanics', subtopics: ['Flow Dynamics', 'Pressure Systems'] },
            { name: 'Circuits & Electronics', subtopics: ['Circuit Analysis', 'Digital Electronics'] },
            { name: 'Manufacturing Processes', subtopics: ['Machining', 'Casting', 'Welding'] }
          ]
        },
        {
          year: 'Year 3',
          title: 'Specialization',
          topics: [
            { name: 'Design Engineering', subtopics: ['Product Design', 'System Design', 'Optimization'] },
            { name: 'Control Systems', subtopics: ['Feedback Control', 'PID Controllers', 'Automation'] },
            { name: 'Project Management', subtopics: ['Planning', 'Budgeting', 'Risk Management'] },
            { name: 'Lab Work', subtopics: ['Experiments', 'Data Analysis', 'Report Writing'] }
          ]
        },
        {
          year: 'Year 4',
          title: 'Capstone & Industry',
          topics: [
            { name: 'Senior Design Project', subtopics: ['Problem Definition', 'Prototyping', 'Testing'] },
            { name: 'Industry Standards', subtopics: ['Safety', 'Quality Control', 'Regulations'] },
            { name: 'Internship', subtopics: ['Industry Experience', 'Professional Skills'] },
            { name: 'Professional Development', subtopics: ['PE Exam Prep', 'Ethics', 'Communication'] }
          ]
        }
      ],
      resources: [
        { name: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu', type: 'Course' },
        { name: 'Engineering Toolbox', url: 'https://engineeringtoolbox.com', type: 'Reference' },
        { name: 'AutoCAD', url: 'https://autodesk.com', type: 'Software' },
        { name: 'ASME', url: 'https://asme.org', type: 'Professional Body' }
      ]
    },
    'Business Administration': {
      icon: '💼',
      color: '#10b981',
      description: 'MBA and Business Management learning pathway',
      duration: '2-4 years',
      difficulty: 'Intermediate',
      careers: ['Business Manager', 'Consultant', 'Entrepreneur', 'Financial Analyst'],
      roadmapUrl: 'https://roadmap.sh/product-manager',
      phases: [
        {
          year: 'Year 1',
          title: 'Business Foundations',
          topics: [
            { name: 'Accounting', subtopics: ['Financial Accounting', 'Managerial Accounting', 'Cost Analysis'] },
            { name: 'Economics', subtopics: ['Microeconomics', 'Macroeconomics', 'Market Analysis'] },
            { name: 'Business Statistics', subtopics: ['Data Analysis', 'Forecasting', 'Decision Making'] },
            { name: 'Marketing Fundamentals', subtopics: ['Consumer Behavior', '4Ps', 'Market Research'] }
          ]
        },
        {
          year: 'Year 2',
          title: 'Core Business Skills',
          topics: [
            { name: 'Finance', subtopics: ['Corporate Finance', 'Investment Analysis', 'Risk Management'] },
            { name: 'Operations Management', subtopics: ['Supply Chain', 'Quality Management', 'Logistics'] },
            { name: 'Human Resources', subtopics: ['Recruitment', 'Training', 'Performance Management'] },
            { name: 'Business Law', subtopics: ['Contracts', 'Corporate Law', 'Intellectual Property'] }
          ]
        },
        {
          year: 'Year 3',
          title: 'Strategic Management',
          topics: [
            { name: 'Strategic Planning', subtopics: ['SWOT Analysis', 'Competitive Strategy', 'Growth Strategy'] },
            { name: 'Leadership', subtopics: ['Team Management', 'Change Management', 'Organizational Behavior'] },
            { name: 'Digital Business', subtopics: ['E-commerce', 'Digital Marketing', 'Analytics'] },
            { name: 'International Business', subtopics: ['Global Markets', 'Cross-cultural Management'] }
          ]
        },
        {
          year: 'Year 4',
          title: 'Specialization & Practice',
          topics: [
            { name: 'Capstone Project', subtopics: ['Business Plan', 'Market Entry Strategy', 'Pitch'] },
            { name: 'Electives', subtopics: ['Entrepreneurship', 'Consulting', 'Investment Banking'] },
            { name: 'Internship', subtopics: ['Corporate Experience', 'Networking', 'Mentorship'] },
            { name: 'Career Development', subtopics: ['Resume', 'Interview Skills', 'Personal Branding'] }
          ]
        }
      ],
      resources: [
        { name: 'Harvard Business Review', url: 'https://hbr.org', type: 'Publication' },
        { name: 'Coursera MBA', url: 'https://coursera.org', type: 'Course' },
        { name: 'LinkedIn Learning', url: 'https://linkedin.com/learning', type: 'Platform' },
        { name: 'Case Studies', url: 'https://hbsp.harvard.edu', type: 'Practice' }
      ]
    },
    'Medicine': {
      icon: '⚕️',
      color: '#ef4444',
      description: 'Medical education pathway from pre-med to residency',
      duration: '8+ years',
      difficulty: 'Very Advanced',
      careers: ['Doctor', 'Surgeon', 'Medical Researcher', 'Specialist'],
      roadmapUrl: 'https://roadmap.sh',
      phases: [
        {
          year: 'Years 1-2',
          title: 'Pre-Clinical Sciences',
          topics: [
            { name: 'Anatomy', subtopics: ['Gross Anatomy', 'Histology', 'Embryology', 'Neuroanatomy'] },
            { name: 'Physiology', subtopics: ['Cardiovascular', 'Respiratory', 'Renal', 'Endocrine'] },
            { name: 'Biochemistry', subtopics: ['Metabolism', 'Molecular Biology', 'Genetics'] },
            { name: 'Pathology', subtopics: ['General Pathology', 'Systemic Pathology', 'Clinical Pathology'] }
          ]
        },
        {
          year: 'Years 3-4',
          title: 'Clinical Rotations',
          topics: [
            { name: 'Internal Medicine', subtopics: ['Patient Care', 'Diagnosis', 'Treatment Plans'] },
            { name: 'Surgery', subtopics: ['Surgical Techniques', 'Pre/Post-op Care', 'Emergency Surgery'] },
            { name: 'Pediatrics', subtopics: ['Child Development', 'Pediatric Diseases', 'Vaccinations'] },
            { name: 'Obstetrics & Gynecology', subtopics: ['Pregnancy Care', 'Delivery', 'Women\'s Health'] }
          ]
        },
        {
          year: 'Years 5-6',
          title: 'Advanced Clinical Training',
          topics: [
            { name: 'Psychiatry', subtopics: ['Mental Health', 'Psychotherapy', 'Medications'] },
            { name: 'Emergency Medicine', subtopics: ['Trauma Care', 'Critical Care', 'Triage'] },
            { name: 'Radiology', subtopics: ['X-ray', 'CT', 'MRI', 'Ultrasound'] },
            { name: 'Research', subtopics: ['Clinical Trials', 'Evidence-based Medicine', 'Publications'] }
          ]
        },
        {
          year: 'Years 7-8+',
          title: 'Residency & Specialization',
          topics: [
            { name: 'Residency Program', subtopics: ['Specialty Training', 'Patient Management', 'Teaching'] },
            { name: 'Board Certification', subtopics: ['USMLE', 'Board Exams', 'Licensing'] },
            { name: 'Fellowship (Optional)', subtopics: ['Sub-specialization', 'Advanced Training'] },
            { name: 'Professional Practice', subtopics: ['Hospital Privileges', 'Private Practice', 'Research'] }
          ]
        }
      ],
      resources: [
        { name: 'USMLE', url: 'https://usmle.org', type: 'Exam' },
        { name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov', type: 'Research' },
        { name: 'Medscape', url: 'https://medscape.com', type: 'Reference' },
        { name: 'Khan Academy Medicine', url: 'https://khanacademy.org', type: 'Learning' }
      ]
    },
    'Data Science': {
      icon: '📊',
      color: '#8b5cf6',
      description: 'Data Science and Analytics career pathway',
      duration: '2-4 years',
      difficulty: 'Advanced',
      careers: ['Data Scientist', 'Data Analyst', 'ML Engineer', 'Business Intelligence Analyst'],
      roadmapUrl: 'https://roadmap.sh/data-science',
      phases: [
        {
          year: 'Phase 1',
          title: 'Foundations',
          topics: [
            { name: 'Programming', subtopics: ['Python', 'R', 'SQL', 'Git'] },
            { name: 'Mathematics', subtopics: ['Statistics', 'Probability', 'Linear Algebra', 'Calculus'] },
            { name: 'Data Manipulation', subtopics: ['Pandas', 'NumPy', 'Data Cleaning', 'ETL'] },
            { name: 'Visualization', subtopics: ['Matplotlib', 'Seaborn', 'Tableau', 'Power BI'] }
          ]
        },
        {
          year: 'Phase 2',
          title: 'Machine Learning',
          topics: [
            { name: 'Supervised Learning', subtopics: ['Regression', 'Classification', 'Decision Trees', 'SVM'] },
            { name: 'Unsupervised Learning', subtopics: ['Clustering', 'PCA', 'Anomaly Detection'] },
            { name: 'Model Evaluation', subtopics: ['Cross-validation', 'Metrics', 'Hyperparameter Tuning'] },
            { name: 'Feature Engineering', subtopics: ['Selection', 'Extraction', 'Transformation'] }
          ]
        },
        {
          year: 'Phase 3',
          title: 'Deep Learning & Big Data',
          topics: [
            { name: 'Neural Networks', subtopics: ['CNN', 'RNN', 'LSTM', 'Transformers'] },
            { name: 'Deep Learning Frameworks', subtopics: ['TensorFlow', 'PyTorch', 'Keras'] },
            { name: 'Big Data Tools', subtopics: ['Hadoop', 'Spark', 'Hive', 'Kafka'] },
            { name: 'Cloud Platforms', subtopics: ['AWS', 'Azure', 'GCP', 'MLOps'] }
          ]
        },
        {
          year: 'Phase 4',
          title: 'Specialization & Deployment',
          topics: [
            { name: 'NLP', subtopics: ['Text Processing', 'Sentiment Analysis', 'LLMs', 'Chatbots'] },
            { name: 'Computer Vision', subtopics: ['Image Classification', 'Object Detection', 'GANs'] },
            { name: 'Model Deployment', subtopics: ['APIs', 'Docker', 'Kubernetes', 'Monitoring'] },
            { name: 'Portfolio Projects', subtopics: ['Kaggle', 'GitHub', 'Blog', 'Presentations'] }
          ]
        }
      ],
      resources: [
        { name: 'Kaggle', url: 'https://kaggle.com', type: 'Practice' },
        { name: 'Coursera ML', url: 'https://coursera.org', type: 'Course' },
        { name: 'Fast.ai', url: 'https://fast.ai', type: 'Learning' },
        { name: 'Papers with Code', url: 'https://paperswithcode.com', type: 'Research' }
      ]
    },
    'Cybersecurity': {
      icon: '🔒',
      color: '#dc2626',
      description: 'Cybersecurity and Information Security pathway',
      duration: '2-4 years',
      difficulty: 'Advanced',
      careers: ['Security Analyst', 'Penetration Tester', 'Security Architect', 'CISO'],
      roadmapUrl: 'https://roadmap.sh/cyber-security',
      phases: [
        {
          year: 'Phase 1',
          title: 'Security Fundamentals',
          topics: [
            { name: 'Networking', subtopics: ['TCP/IP', 'Protocols', 'Firewalls', 'VPN'] },
            { name: 'Operating Systems', subtopics: ['Linux', 'Windows', 'System Hardening'] },
            { name: 'Cryptography', subtopics: ['Encryption', 'Hashing', 'PKI', 'SSL/TLS'] },
            { name: 'Security Basics', subtopics: ['CIA Triad', 'Threats', 'Vulnerabilities', 'Risk'] }
          ]
        },
        {
          year: 'Phase 2',
          title: 'Offensive Security',
          topics: [
            { name: 'Ethical Hacking', subtopics: ['Reconnaissance', 'Scanning', 'Exploitation'] },
            { name: 'Penetration Testing', subtopics: ['Web Apps', 'Networks', 'Wireless', 'Social Engineering'] },
            { name: 'Tools', subtopics: ['Metasploit', 'Burp Suite', 'Nmap', 'Wireshark'] },
            { name: 'Scripting', subtopics: ['Python', 'Bash', 'PowerShell', 'Automation'] }
          ]
        },
        {
          year: 'Phase 3',
          title: 'Defensive Security',
          topics: [
            { name: 'Security Operations', subtopics: ['SIEM', 'Log Analysis', 'Incident Response'] },
            { name: 'Threat Intelligence', subtopics: ['IOCs', 'Threat Hunting', 'Malware Analysis'] },
            { name: 'Security Architecture', subtopics: ['Zero Trust', 'Defense in Depth', 'Segmentation'] },
            { name: 'Compliance', subtopics: ['GDPR', 'HIPAA', 'PCI-DSS', 'ISO 27001'] }
          ]
        },
        {
          year: 'Phase 4',
          title: 'Advanced & Certifications',
          topics: [
            { name: 'Cloud Security', subtopics: ['AWS Security', 'Azure Security', 'Container Security'] },
            { name: 'Application Security', subtopics: ['OWASP', 'Secure Coding', 'DevSecOps'] },
            { name: 'Certifications', subtopics: ['CEH', 'OSCP', 'CISSP', 'Security+'] },
            { name: 'Career Development', subtopics: ['Bug Bounty', 'CTFs', 'Networking', 'Blogging'] }
          ]
        }
      ],
      resources: [
        { name: 'HackTheBox', url: 'https://hackthebox.com', type: 'Practice' },
        { name: 'TryHackMe', url: 'https://tryhackme.com', type: 'Learning' },
        { name: 'OWASP', url: 'https://owasp.org', type: 'Reference' },
        { name: 'Cybrary', url: 'https://cybrary.it', type: 'Course' }
      ]
    }
  };

  // Filter roadmaps based on search
  const filteredRoadmaps = Object.entries(roadmaps).filter(([field]) =>
    field.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="roadmaps-page">
      <div className="container">
        {/* Header */}
        <div className="roadmaps-header">
          <h1>🗺️ Course Roadmaps</h1>
          <p>Comprehensive learning paths for your chosen field of study</p>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search for a field of study..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {!selectedField ? (
          <>
            {/* Roadmap Cards Grid */}
            <div className="roadmaps-grid">
              {filteredRoadmaps.map(([field, data]) => (
                <div
                  key={field}
                  className="roadmap-card"
                  onClick={() => setSelectedField(field)}
                  style={{ borderColor: data.color }}
                >
                  <div className="card-icon" style={{ background: data.color }}>
                    {data.icon}
                  </div>
                  <h3>{field}</h3>
                  <p className="card-description">{data.description}</p>
                  <div className="card-meta">
                    <span className="meta-item">
                      <span className="meta-icon">⏱️</span>
                      {data.duration}
                    </span>
                    <span className="meta-item">
                      <span className="meta-icon">📈</span>
                      {data.difficulty}
                    </span>
                  </div>
                  <div className="card-careers">
                    <strong>Career Paths:</strong>
                    <div className="careers-list">
                      {data.careers.slice(0, 2).map((career, idx) => (
                        <span key={idx} className="career-tag">{career}</span>
                      ))}
                      {data.careers.length > 2 && (
                        <span className="career-tag">+{data.careers.length - 2} more</span>
                      )}
                    </div>
                  </div>
                  <button className="view-roadmap-btn">
                    View Roadmap →
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Detailed Roadmap View */}
            <div className="roadmap-detail">
              <button className="back-btn" onClick={() => setSelectedField(null)}>
                ← Back to All Roadmaps
              </button>

              <div className="detail-header" style={{ borderColor: roadmaps[selectedField].color }}>
                <div className="header-icon" style={{ background: roadmaps[selectedField].color }}>
                  {roadmaps[selectedField].icon}
                </div>
                <div className="header-content">
                  <h2>{selectedField}</h2>
                  <p>{roadmaps[selectedField].description}</p>
                  <div className="header-meta">
                    <span>⏱️ {roadmaps[selectedField].duration}</span>
                    <span>📈 {roadmaps[selectedField].difficulty}</span>
                  </div>
                </div>
              </div>

              {/* Career Paths */}
              <div className="careers-section">
                <h3>💼 Career Opportunities</h3>
                <div className="careers-grid">
                  {roadmaps[selectedField].careers.map((career, idx) => (
                    <div key={idx} className="career-card">
                      <span className="career-icon">🎯</span>
                      <span>{career}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Phases */}
              <div className="phases-section">
                <h3>📚 Learning Path</h3>
                {roadmaps[selectedField].phases.map((phase, phaseIdx) => (
                  <div key={phaseIdx} className="phase-card">
                    <div className="phase-header">
                      <div className="phase-number">{phaseIdx + 1}</div>
                      <div className="phase-info">
                        <h4>{phase.year}</h4>
                        <p>{phase.title}</p>
                      </div>
                    </div>
                    <div className="topics-grid">
                      {phase.topics.map((topic, topicIdx) => (
                        <div key={topicIdx} className="topic-card">
                          <h5>{topic.name}</h5>
                          <ul className="subtopics-list">
                            {topic.subtopics.map((subtopic, subIdx) => (
                              <li key={subIdx}>
                                <span className="check-icon">✓</span>
                                {subtopic}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Resources */}
              <div className="resources-section">
                <h3>🔗 Learning Resources</h3>
                <div className="resources-grid">
                  {roadmaps[selectedField].resources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-card"
                    >
                      <div className="resource-icon">🌐</div>
                      <div className="resource-info">
                        <h5>{resource.name}</h5>
                        <span className="resource-type">{resource.type}</span>
                      </div>
                      <span className="external-icon">↗</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Official Roadmap Link */}
              <div className="official-roadmap">
                <div className="official-card">
                  <h4>🗺️ Want More Details?</h4>
                  <p>Check out the official interactive roadmap on roadmap.sh</p>
                  <a
                    href={roadmaps[selectedField].roadmapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    View on Roadmap.sh →
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Roadmaps