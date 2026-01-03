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
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s ease'
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
      outline: 'none',
      transition: 'box-shadow 0.3s ease'
    },
    searchButton: {
      padding: '0 25px',
      background: '#4361ee',
      color: 'white',
      border: 'none',
      borderRadius: '0 50px 50px 0',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all 0.3s ease'
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
      cursor: 'pointer',
      transition: 'all 0.3s ease'
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
      minWidth: '200px',
      transition: 'transform 0.3s ease'
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
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer'
    },
    cardImg: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      transition: 'transform 0.3s ease'
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
      width: 'calc(100% - 40px)',
      transition: 'all 0.3s ease'
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
      background: '#f8f9fa',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    featureIcon: {
      fontSize: '3rem',
      marginBottom: '20px',
      color: '#4361ee',
      transition: 'transform 0.3s ease'
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
      textAlign: 'center',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    countryImg: {
      height: '120px',
      width: '100%',
      objectFit: 'cover',
      transition: 'transform 0.3s ease'
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
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    feedbackAvatar: {
      width: '70px',
      height: '70px',
      borderRadius: '50%',
      objectFit: 'cover',
      marginBottom: '15px',
      transition: 'transform 0.3s ease'
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
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 6px 20px rgba(247, 37, 133, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
          }}
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
          onFocus={(e) => {
            e.target.style.boxShadow = '0 8px 25px rgba(67, 97, 238, 0.2)';
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
          }}
        />
        <button 
          onClick={handleSearch} 
          style={styles.searchButton}
          onMouseEnter={(e) => {
            e.target.style.background = '#3a0ca3';
            e.target.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#4361ee';
            e.target.style.transform = 'scale(1)';
          }}
        >
          🔍 Search
        </button>
      </div>

      {/* Stats Section */}
      <div style={styles.stats}>
        {[
          { value: stats.countries, label: 'Countries' },
          { value: stats.universities, label: 'Universities' },
          { value: stats.scholarships, label: 'Scholarships' },
          { value: stats.students, label: 'Students Placed' }
        ].map((stat, idx) => (
          <div 
            key={idx}
            style={styles.statBox}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <h3 style={styles.statH3}>{stat.value}</h3>
            <p style={styles.statP}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <section style={styles.sectionWhite}>
        <h2 style={styles.sectionTitle}>Why Choose Us</h2>
        <div style={styles.featuresGrid}>
          {[
            { icon: '💵', title: 'Scholarship Assistance', desc: 'Get guidance on thousands of scholarships tailored to your profile and needs.' },
            { icon: '🛂', title: 'Visa Support', desc: 'Expert assistance with visa applications and documentation for your study abroad journey.' },
            { icon: '🏠', title: 'Accommodation Help', desc: 'Find safe and affordable housing options near your university campus.' },
            { icon: '🎓', title: 'Career Guidance', desc: 'Connect with alumni and career counselors for post-study opportunities.' }
          ].map((feature, idx) => (
            <div 
              key={idx}
              style={styles.featureCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(67, 97, 238, 0.2)';
                e.currentTarget.querySelector('.feature-icon').style.transform = 'scale(1.2) rotate(5deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.querySelector('.feature-icon').style.transform = 'scale(1) rotate(0deg)';
              }}
            >
              <div className="feature-icon" style={styles.featureIcon}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p style={{ color: '#666' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Universities */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Top Universities</h2>
        <div style={styles.cardsContainer}>
          {[
            { img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', name: 'Oxford University', desc: 'Top-ranked programs in Science & Arts with centuries of academic excellence.' },
            { img: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', name: 'Harvard University', desc: 'Global leader in Business & Law studies with unparalleled networking opportunities.' },
            { img: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', name: 'MIT', desc: 'World-class Engineering & Technology programs at the forefront of innovation.' }
          ].map((uni, idx) => (
            <div 
              key={idx}
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.15)';
                e.currentTarget.querySelector('img').style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.08)';
                e.currentTarget.querySelector('img').style.transform = 'scale(1)';
              }}
            >
              <img src={uni.img} alt={uni.name} style={styles.cardImg} />
              <h3 style={styles.cardH3}>{uni.name}</h3>
              <p style={styles.cardP}>{uni.desc}</p>
              <button 
                style={styles.cardButton}
                onMouseEnter={(e) => {
                  e.target.style.background = '#3a0ca3';
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#4361ee';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <div style={styles.filters}>
        {[
          { value: selectedCountry, setter: setSelectedCountry, options: [
            { value: '', label: 'Choose Country' },
            { value: 'US', label: 'USA' },
            { value: 'UK', label: 'UK' },
            { value: 'CA', label: 'Canada' },
            { value: 'DE', label: 'Germany' },
            { value: 'AU', label: 'Australia' }
          ]},
          { value: selectedField, setter: setSelectedField, options: [
            { value: '', label: 'Field of Study' },
            { value: 'Engineering', label: 'Engineering' },
            { value: 'Business', label: 'Business' },
            { value: 'Medicine', label: 'Medicine' },
            { value: 'Arts', label: 'Arts' }
          ]},
          { value: selectedBudget, setter: setSelectedBudget, options: [
            { value: '', label: 'Budget Range' },
            { value: '0-10000', label: 'Under $10,000' },
            { value: '10000-30000', label: '$10,000 - $30,000' },
            { value: '30000+', label: '$30,000+' }
          ]},
          { value: selectedDegree, setter: setSelectedDegree, options: [
            { value: '', label: 'Degree Level' },
            { value: 'undergraduate', label: 'Undergraduate' },
            { value: 'graduate', label: 'Graduate' },
            { value: 'phd', label: 'PhD' }
          ]}
        ].map((filter, idx) => (
          <select 
            key={idx}
            value={filter.value} 
            onChange={(e) => filter.setter(e.target.value)} 
            style={styles.select}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#4361ee';
              e.target.style.boxShadow = '0 4px 15px rgba(67, 97, 238, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#ddd';
              e.target.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
            }}
          >
            {filter.options.map((opt, i) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ))}
      </div>

      {/* University Map Section */}
      <section style={{
        padding: '80px 5%',
        background: 'linear-gradient(135deg, #667eea 0%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '400px',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(80px)'
        }}></div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 20px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50px',
              marginBottom: '20px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>🌍 Interactive Map</span>
            </div>
            
            <h2 style={{
              fontSize: '3rem',
              fontWeight: 800,
              color: 'white',
              marginBottom: '15px',
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.2)'
            }}>
              Explore Universities Worldwide
            </h2>
            
            <div style={{
              width: '80px',
              height: '4px',
              background: 'linear-gradient(90deg, #f72585, #ffd60a)',
              margin: '0 auto 25px',
              borderRadius: '2px',
              boxShadow: '0 2px 10px rgba(247, 37, 133, 0.5)'
            }}></div>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontSize: '1.1rem',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              {selectedCountry
                ? `📍 Showing universities in ${selectedCountry === 'US' ? 'USA' : selectedCountry === 'UK' ? 'United Kingdom' : selectedCountry === 'CA' ? 'Canada' : selectedCountry === 'AU' ? 'Australia' : selectedCountry}`
                : '🗺️ Discover universities worldwide - Use the filters above to narrow down by country'}
            </p>
          </div>

          {/* Map Container with Enhanced Styling */}
          <div style={{
            background: 'white',
            borderRadius: '25px',
            padding: '30px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 25px 70px rgba(0, 0, 0, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
          }}>
            {/* Map Info Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '15px 20px',
              background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)',
              borderRadius: '15px',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>🎓</span>
                <span style={{ color: '#3a0ca3', fontWeight: 600 }}>Interactive University Explorer</span>
              </div>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '5px',
                  padding: '5px 12px',
                  background: 'white',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}>
                  <span style={{ color: '#4361ee' }}>●</span>
                  <span style={{ color: '#666' }}>Click markers for details</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '5px',
                  padding: '5px 12px',
                  background: 'white',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}>
                  <span style={{ color: '#f72585' }}>●</span>
                  <span style={{ color: '#666' }}>Zoom & pan enabled</span>
                </div>
              </div>
            </div>

            {/* Map Component */}
            <div style={{
              borderRadius: '15px',
              overflow: 'hidden',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
            }}>
              <UniversityMap
                selectedCountry={selectedCountry}
                height="600px"
                showControls={true}
              />
            </div>

            {/* Map Legend/Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '15px',
              marginTop: '25px'
            }}>
              {[
                { icon: '🏫', label: 'Total Universities', value: '500+' },
                { icon: '🌎', label: 'Countries', value: '30+' },
                { icon: '💰', label: 'Scholarships', value: '1000+' },
                { icon: '✈️', label: 'Success Stories', value: '10K+' }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  style={{
                    textAlign: 'center',
                    padding: '20px 15px',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
                    e.currentTarget.style.color = 'inherit';
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '5px' }}>{item.value}</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{
            textAlign: 'center',
            marginTop: '50px'
          }}>
            <button style={{
              padding: '15px 40px',
              background: 'white',
              color: '#3a0ca3',
              border: 'none',
              borderRadius: '50px',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.3)';
              e.target.style.background = '#f72585';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
              e.target.style.background = 'white';
              e.target.style.color = '#3a0ca3';
            }}>
              🚀 Get Personalized Recommendations
            </button>
          </div>
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
            <div 
              key={idx} 
              style={styles.countryCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
                e.currentTarget.querySelector('img').style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.08)';
                e.currentTarget.querySelector('img').style.transform = 'scale(1)';
              }}
            >
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
            <div 
              key={idx} 
              style={styles.feedbackCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.12)';
                e.currentTarget.querySelector('img').style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.05)';
                e.currentTarget.querySelector('img').style.transform = 'scale(1)';
              }}
            >
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