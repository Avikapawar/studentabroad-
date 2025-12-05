import React, { useState, useEffect } from 'react';
import UniversityMap from '../components/UniversityMap';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('');


  const [currentIndex, setCurrentIndex] = useState(0);

  const typingStrings = ["USA 🇺🇸", "UK 🇬🇧", "Canada 🇨🇦", "Germany 🇩🇪", "Australia 🇦🇺"];

  const [stats, setStats] = useState({
    countries: 0,
    universities: 0,
    scholarships: 0,
    students: 0
  });

  useEffect(() => {
    let currentString = typingStrings[currentIndex];
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId = null;

    const typeEffect = () => {
      if (!isDeleting && charIndex < currentString.length) {
        charIndex++;
        timeoutId = setTimeout(typeEffect, 250);
      } else if (isDeleting && charIndex > 0) {
        charIndex--;
        timeoutId = setTimeout(typeEffect, 150);
      } else if (!isDeleting && charIndex === currentString.length) {
        timeoutId = setTimeout(() => {
          isDeleting = true;
          typeEffect();
        }, 5000);
      } else if (isDeleting && charIndex === 0) {
        setCurrentIndex((prev) => (prev + 1) % typingStrings.length);
      }
    };

    typeEffect();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentIndex]);

  useEffect(() => {
    const targetStats = {
      countries: 30,
      universities: 500,
      scholarships: 1000,
      students: 10000
    };

    const animateStats = () => {
      Object.keys(targetStats).forEach(key => {
        let count = 0;
        const target = targetStats[key];
        const increment = Math.ceil(target / 100);

        const timer = setInterval(() => {
          count += increment;
          if (count >= target) {
            count = target;
            clearInterval(timer);
          }
          setStats(prev => ({ ...prev, [key]: count }));
        }, 40);
      });
    };

    const timer = setTimeout(animateStats, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    alert(`Searching with: ${searchQuery || 'all universities'}`);
  };

  const styles = {
    hero: {
      height: '85vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '0 5%',
      background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    },
    heroOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: 'url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: 0.2,
      zIndex: 0
    },
    heroH1: {
      fontSize: '3.5rem',
      marginBottom: '1.5rem',
      zIndex: 1,
      position: 'relative'
    },
    heroP: {
      fontSize: '1.2rem',
      maxWidth: '600px',
      marginBottom: '2rem',
      zIndex: 1,
      position: 'relative'
    },
    heroButton: {
      padding: '12px 30px',
      background: '#f72585',
      color: 'white',
      border: 'none',
      borderRadius: '50px',
      fontSize: '1.1rem',
      fontWeight: 600,
      cursor: 'pointer',
      zIndex: 1,
      position: 'relative',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
    },
    typedText: {
      color: '#f72585',
      fontWeight: 800
    },
    searchBar: {
      display: 'flex',
      justifyContent: 'center',
      margin: '-30px auto 30px',
      maxWidth: '700px',
      padding: '0 5%',
      zIndex: 10,
      position: 'relative'
    },
    searchInput: {
      flex: 1,
      padding: '15px 20px',
      border: 'none',
      borderRadius: '50px 0 0 50px',
      fontSize: '1rem',
      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
      outline: 'none'
    },
    searchButton: {
      padding: '0 25px',
      background: '#4361ee',
      color: 'white',
      border: 'none',
      borderRadius: '0 50px 50px 0',
      cursor: 'pointer',
      fontWeight: 600
    },
    filters: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      margin: '30px auto',
      padding: '0 5%',
      flexWrap: 'wrap'
    },
    select: {
      padding: '12px 20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      background: 'white',
      fontSize: '1rem',
      minWidth: '180px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
      cursor: 'pointer'
    },
    stats: {
      display: 'flex',
      justifyContent: 'space-around',
      margin: '60px auto',
      padding: '40px 5%',
      background: 'white',
      borderRadius: '15px',
      boxShadow: '0 5px 25px rgba(0, 0, 0, 0.08)',
      maxWidth: '1200px',
      flexWrap: 'wrap'
    },
    statBox: {
      textAlign: 'center',
      padding: '20px',
      flex: 1,
      minWidth: '200px'
    },
    statH3: {
      fontSize: '3rem',
      color: '#4361ee',
      marginBottom: '10px'
    },
    statP: {
      color: '#666',
      fontWeight: 500
    },
    section: {
      padding: '80px 5%',
      background: '#f0f4ff'
    },
    sectionWhite: {
      padding: '80px 5%',
      background: 'white'
    },
    sectionTitle: {
      textAlign: 'center',
      fontSize: '2.5rem',
      marginBottom: '50px',
      color: '#3a0ca3',
      position: 'relative'
    },
    cardsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '30px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    card: {
      background: 'white',
      borderRadius: '15px',
      overflow: 'hidden',
      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.08)',
      transition: 'transform 0.3s, box-shadow 0.3s'
    },
    cardImg: {
      width: '100%',
      height: '200px',
      objectFit: 'cover'
    },
    cardH3: {
      padding: '20px 20px 10px',
      color: '#3a0ca3'
    },
    cardP: {
      padding: '0 20px',
      color: '#666',
      marginBottom: '20px'
    },
    cardButton: {
      margin: '0 20px 20px',
      padding: '10px 20px',
      background: '#4361ee',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 500,
      width: 'calc(100% - 40px)'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '30px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    featureCard: {
      textAlign: 'center',
      padding: '30px 20px',
      borderRadius: '15px',
      background: '#f8f9fa'
    },
    featureIcon: {
      fontSize: '3rem',
      marginBottom: '20px',
      color: '#4361ee'
    },
    countriesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    countryCard: {
      background: 'white',
      borderRadius: '15px',
      overflow: 'hidden',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
      textAlign: 'center'
    },
    countryImg: {
      height: '120px',
      width: '100%',
      objectFit: 'cover'
    },
    countryName: {
      padding: '15px',
      fontWeight: 600,
      color: '#3a0ca3'
    },
    feedbackGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '30px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    feedbackCard: {
      background: '#f8f9fa',
      borderRadius: '15px',
      padding: '30px',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)'
    },
    feedbackAvatar: {
      width: '70px',
      height: '70px',
      borderRadius: '50%',
      objectFit: 'cover',
      marginBottom: '15px'
    },
    feedbackName: {
      fontWeight: 600,
      marginBottom: '10px',
      color: '#3a0ca3'
    },
    stars: {
      marginBottom: '15px',
      color: '#ffc107'
    },
    feedbackText: {
      color: '#555',
      fontStyle: 'italic'
    }
  };

  return (
    <div style={{ backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <h1 style={styles.heroH1}>
          Study Abroad
        </h1>
        <p style={styles.heroP}>
          Explore top universities, scholarships, and programs that match your goals. Your global education journey starts here.
        </p>
        <button
          style={styles.heroButton}
          onClick={() => window.location.href = '/recommendations'}
        >
          Find My Match
        </button>
      </section>

      {/* Search Bar */}
      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="Search universities, courses, scholarships..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <button onClick={handleSearch} style={styles.searchButton}>
          🔍 Search
        </button>
      </div>



      {/* Stats Section */}
      <div style={styles.stats}>
        <div style={styles.statBox}>
          <h3 style={styles.statH3}>{stats.countries}</h3>
          <p style={styles.statP}>Countries</p>
        </div>
        <div style={styles.statBox}>
          <h3 style={styles.statH3}>{stats.universities}</h3>
          <p style={styles.statP}>Universities</p>
        </div>
        <div style={styles.statBox}>
          <h3 style={styles.statH3}>{stats.scholarships}</h3>
          <p style={styles.statP}>Scholarships</p>
        </div>
        <div style={styles.statBox}>
          <h3 style={styles.statH3}>{stats.students}</h3>
          <p style={styles.statP}>Students Placed</p>
        </div>
      </div>

      {/* Features Section */}
      <section style={styles.sectionWhite}>
        <h2 style={styles.sectionTitle}>Why Choose Us</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>💵</div>
            <h3>Scholarship Assistance</h3>
            <p style={{ color: '#666' }}>Get guidance on thousands of scholarships tailored to your profile and needs.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🛂</div>
            <h3>Visa Support</h3>
            <p style={{ color: '#666' }}>Expert assistance with visa applications and documentation for your study abroad journey.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🏠</div>
            <h3>Accommodation Help</h3>
            <p style={{ color: '#666' }}>Find safe and affordable housing options near your university campus.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🎓</div>
            <h3>Career Guidance</h3>
            <p style={{ color: '#666' }}>Connect with alumni and career counselors for post-study opportunities.</p>
          </div>
        </div>
      </section>

      {/* Top Universities */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Top Universities</h2>
        <div style={styles.cardsContainer}>
          <div style={styles.card}>
            <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Oxford" style={styles.cardImg} />
            <h3 style={styles.cardH3}>Oxford University</h3>
            <p style={styles.cardP}>Top-ranked programs in Science & Arts with centuries of academic excellence.</p>
            <button style={styles.cardButton}>Apply Now</button>
          </div>
          <div style={styles.card}>
            <img src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Harvard" style={styles.cardImg} />
            <h3 style={styles.cardH3}>Harvard University</h3>
            <p style={styles.cardP}>Global leader in Business & Law studies with unparalleled networking opportunities.</p>
            <button style={styles.cardButton}>Apply Now</button>
          </div>
          <div style={styles.card}>
            <img src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="MIT" style={styles.cardImg} />
            <h3 style={styles.cardH3}>MIT</h3>
            <p style={styles.cardP}>World-class Engineering & Technology programs at the forefront of innovation.</p>
            <button style={styles.cardButton}>Apply Now</button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div style={styles.filters}>
        <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} style={styles.select}>
          <option value="">Choose Country</option>
          <option value="US">USA</option>
          <option value="UK">UK</option>
          <option value="CA">Canada</option>
          <option value="DE">Germany</option>
          <option value="AU">Australia</option>
        </select>

        <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)} style={styles.select}>
          <option value="">Field of Study</option>
          <option value="Engineering">Engineering</option>
          <option value="Business">Business</option>
          <option value="Medicine">Medicine</option>
          <option value="Arts">Arts</option>
        </select>

        <select value={selectedBudget} onChange={(e) => setSelectedBudget(e.target.value)} style={styles.select}>
          <option value="">Budget Range</option>
          <option value="0-10000">Under $10,000</option>
          <option value="10000-30000">$10,000 - $30,000</option>
          <option value="30000+">$30,000+</option>
        </select>

        <select value={selectedDegree} onChange={(e) => setSelectedDegree(e.target.value)} style={styles.select}>
          <option value="">Degree Level</option>
          <option value="undergraduate">Undergraduate</option>
          <option value="graduate">Graduate</option>
          <option value="phd">PhD</option>
        </select>
      </div>

      {/* University Map Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-indigo-900">Explore Universities Worldwide</h2>
          <div className="w-20 h-1 bg-pink-500 mx-auto mb-12"></div>
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              {selectedCountry
                ? `Showing universities in ${selectedCountry === 'US' ? 'USA' : selectedCountry === 'UK' ? 'United Kingdom' : selectedCountry === 'CA' ? 'Canada' : selectedCountry === 'AU' ? 'Australia' : selectedCountry}`
                : 'Showing universities worldwide - Use the filters above to narrow down by country'}
            </p>
          </div>
          <UniversityMap
            selectedCountry={selectedCountry}
            height="600px"
            showControls={true}
          />
        </div>
      </section>

      {/* Popular Destinations */}
      <section style={styles.sectionWhite}>
        <h2 style={styles.sectionTitle}>Popular Destinations</h2>
        <div style={styles.countriesGrid}>
          {[
            { name: 'United States', img: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
            { name: 'United Kingdom', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
            { name: 'Canada', img: 'https://images.unsplash.com/photo-1519832979-6fa011b87667?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
            { name: 'Australia', img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }
          ].map((country, idx) => (
            <div key={idx} style={styles.countryCard}>
              <img src={country.img} alt={country.name} style={styles.countryImg} />
              <div style={styles.countryName}>{country.name}</div>
            </div>
          ))}
        </div>
      </section>




      {/* Student Testimonials */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Student Experiences</h2>
        <div style={styles.feedbackGrid}>
          {[
            { name: 'Ananya Sharma', img: 'https://randomuser.me/api/portraits/women/68.jpg', text: 'This platform helped me secure admission in my dream university in the UK! The scholarship guidance was particularly helpful.' },
            { name: 'Rahul Verma', img: 'https://randomuser.me/api/portraits/men/32.jpg', text: 'User-friendly and reliable, with all details in one place. The visa assistance made the process so much smoother.' },
            { name: 'Priya Patel', img: 'https://randomuser.me/api/portraits/women/44.jpg', text: 'The accommodation service helped me find a perfect place near my campus. I couldn\'t have done it without StudentAbroad!' }
          ].map((review, idx) => (
            <div key={idx} style={styles.feedbackCard}>
              <img src={review.img} alt={review.name} style={styles.feedbackAvatar} />
              <div style={styles.feedbackName}>{review.name}</div>
              <div style={styles.stars}>⭐⭐⭐⭐⭐</div>
              <div style={styles.feedbackText}>"{review.text}"</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;