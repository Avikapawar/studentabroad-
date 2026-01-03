
import React, { useState, useEffect } from 'react';

const ComparisonPage = () => {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    // Simulate loading comparison data
    setTimeout(() => {
      setComparisonData({
        universities: [
          {
            id: 1,
            name: 'Stanford University',
            city: 'Stanford',
            country: 'USA',
            ranking: 3,
            tuition_fee: 56169,
            acceptance_rate: 4.3,
            min_cgpa: 3.7,
            min_gre: 325,
            min_ielts: 7.0,
            min_toefl: 100,
            application_fee: 125,
            living_cost: 24000,
            student_population: 17249,
            international_students: 23
          },
          {
            id: 2,
            name: 'MIT',
            city: 'Cambridge',
            country: 'USA',
            ranking: 1,
            tuition_fee: 57986,
            acceptance_rate: 3.9,
            min_cgpa: 3.8,
            min_gre: 328,
            min_ielts: 7.5,
            min_toefl: 105,
            application_fee: 95,
            living_cost: 22000,
            student_population: 11934,
            international_students: 31
          },
          {
            id: 3,
            name: 'UC Berkeley',
            city: 'Berkeley',
            country: 'USA',
            ranking: 5,
            tuition_fee: 48465,
            acceptance_rate: 11.4,
            min_cgpa: 3.5,
            min_gre: 320,
            min_ielts: 6.5,
            min_toefl: 95,
            application_fee: 145,
            living_cost: 26000,
            student_population: 45057,
            international_students: 18
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const comparisonFields = [
    { key: 'name', label: 'University Name', type: 'text' },
    { key: 'location', label: 'Location', type: 'location' },
    { key: 'ranking', label: 'World Ranking', type: 'number' },
    { key: 'tuition_fee', label: 'Tuition Fee (USD)', type: 'currency' },
    { key: 'acceptance_rate', label: 'Acceptance Rate', type: 'percentage' },
    { key: 'min_cgpa', label: 'Minimum CGPA', type: 'decimal' },
    { key: 'min_gre', label: 'Minimum GRE', type: 'number' },
    { key: 'min_ielts', label: 'Minimum IELTS', type: 'decimal' },
    { key: 'min_toefl', label: 'Minimum TOEFL', type: 'number' },
    { key: 'application_fee', label: 'Application Fee', type: 'currency' },
    { key: 'living_cost', label: 'Living Cost', type: 'currency' },
    { key: 'student_population', label: 'Student Population', type: 'number' },
    { key: 'international_students', label: 'International Students', type: 'percentage' }
  ];

  const formatValue = (value, type, university) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    
    switch (type) {
      case 'currency':
        return `$${Number(value).toLocaleString()}`;
      case 'percentage':
        return `${value}%`;
      case 'decimal':
        return Number(value).toFixed(1);
      case 'number':
        return Number(value).toLocaleString();
      case 'location':
        return `${university.city}, ${university.country}`;
      default:
        return value;
    }
  };

  const getBestValue = (field, universities) => {
    const values = universities.map(uni => uni[field.key]).filter(val => val !== null && val !== undefined && val !== '');
    if (values.length === 0) return null;
    
    switch (field.key) {
      case 'ranking':
        return Math.min(...values);
      case 'tuition_fee':
      case 'application_fee':
      case 'living_cost':
        return Math.min(...values);
      case 'acceptance_rate':
        return Math.max(...values);
      case 'min_cgpa':
      case 'min_gre':
      case 'min_ielts':
      case 'min_toefl':
        return Math.min(...values);
      case 'student_population':
      case 'international_students':
        return Math.max(...values);
      default:
        return null;
    }
  };

  const isHighlighted = (value, field, universities) => {
    const bestValue = getBestValue(field, universities);
    return bestValue !== null && value === bestValue;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ffffffff 0%)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          border: '6px solid rgba(255,255,255,0.3)',
          borderTop: '6px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'white', fontSize: '1.2rem', marginTop: '1rem', fontWeight: '600' }}>
          Loading comparison...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!comparisonData || !comparisonData.universities || comparisonData.universities.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ffffffff 0%)',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '500px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'fadeInScale 0.5s ease-out'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'bounce 1s infinite' }}>📊</div>
          <h2 style={{ color: '#3a0ca3', marginBottom: '1rem', fontSize: '1.8rem' }}>No Universities to Compare</h2>
          <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>
            Please select universities from the search page to compare them here.
          </p>
          <button style={{
            padding: '15px 40px',
            background: 'linear-gradient(135deg, #667eea 0%)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1.1rem',
            boxShadow: '0 5px 20px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 5px 20px rgba(102, 126, 234, 0.4)';
          }}>
            🔍 Go to Search
          </button>
        </div>
        <style>{`
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    );
  }

  const universities = comparisonData.universities;

  return (
    <div style={{
      padding: '2rem',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffffffff 0%)',
      position: 'relative'
    }}>
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.2);
        }
        .table-row {
          transition: all 0.3s ease;
        }
        .table-row:hover {
          background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%) !important;
          transform: scale(1.01);
        }
        .best-value-cell {
          position: relative;
          overflow: hidden;
        }
        .best-value-cell::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s ease;
        }
        .best-value-cell:hover::before {
          left: 100%;
        }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'fadeInDown 0.8s ease-out' }}>
          <button style={{
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            padding: '12px 25px',
            background: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            color: '#667eea',
            fontWeight: '600',
            boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            zIndex: 100
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateX(-5px)';
            e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateX(0)';
            e.target.style.boxShadow = '0 5px 20px rgba(0,0,0,0.2)';
          }}>
            ← Back to Search
          </button>
          
          <h1 style={{
            color: 'black',
            fontSize: '3rem',
            marginBottom: '0.5rem',
            textShadow: '2px 2px 20px rgba(0,0,0,0.3)',
            letterSpacing: '1px'
          }}>
            University Comparison
          </h1>
          <p style={{ color: 'black', fontSize: '1.2rem', marginBottom: '0.5rem', opacity: 0.9 }}>
            Comparing {universities.length} universities side by side
          </p>
          <p style={{ color: 'black', fontSize: '1rem', opacity: 0.8 }}>
            💡 Green highlights with stars indicate the best value in each category
          </p>
        </div>

        {/* Comparison Table */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflowX: 'auto',
          animation: 'fadeInUp 0.8s ease-out 0.2s both',
          marginBottom: '2rem'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)' }}>
                <th style={{
                  padding: '1.5rem 1rem',
                  color: 'white',
                  fontWeight: '700',
                  textAlign: 'left',
                  minWidth: '220px',
                  position: 'sticky',
                  left: 0,
                  background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
                  zIndex: 10,
                  fontSize: '1.1rem',
                  letterSpacing: '0.5px'
                }}>
                  Criteria
                </th>
                {universities.map((uni, index) => (
                  <th key={uni.id} style={{
                    padding: '1.5rem 1rem',
                    color: 'white',
                    fontWeight: '700',
                    textAlign: 'center',
                    minWidth: '220px',
                    animation: `fadeInDown 0.5s ease-out ${0.3 + index * 0.1}s both`
                  }}>
                    <div style={{
                      marginBottom: '0.5rem',
                      fontSize: '1.1rem',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
                      {uni.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                      📍 {uni.city}, {uni.country}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFields.map((field, fieldIndex) => (
                <tr key={field.key} className="table-row" style={{
                  background: fieldIndex % 2 === 0 ? '#f8f9fa' : 'white',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <td style={{
                    padding: '1.2rem 1rem',
                    fontWeight: '700',
                    color: '#3a0ca3',
                    position: 'sticky',
                    left: 0,
                    background: fieldIndex % 2 === 0 ? '#f8f9fa' : 'white',
                    zIndex: 5,
                    borderRight: '2px solid #e9ecef',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}>
                    {field.label}
                  </td>
                  {universities.map((uni) => {
                    const value = field.key === 'location' ? uni : uni[field.key];
                    const formattedValue = formatValue(value, field.type, uni);
                    const highlighted = isHighlighted(uni[field.key], field, universities);
                    const cellKey = `${uni.id}-${field.key}`;
                    
                    return (
                      <td
                        key={cellKey}
                        className={highlighted ? 'best-value-cell' : ''}
                        style={{
                          padding: '1.2rem 1rem',
                          textAlign: 'center',
                          background: highlighted
                            ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)'
                            : 'transparent',
                          color: highlighted ? '#155724' : '#495057',
                          fontWeight: highlighted ? '700' : '500',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontSize: '0.95rem',
                          transform: hoveredCell === cellKey ? 'scale(1.05)' : 'scale(1)'
                        }}
                        onMouseEnter={() => setHoveredCell(cellKey)}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {highlighted && (
                          <span style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            fontSize: '1rem',
                            animation: 'pulse 2s infinite'
                          }}>
                            ⭐
                          </span>
                        )}
                        <span style={{
                          transition: 'all 0.3s ease',
                          display: 'inline-block',
                          transform: hoveredCell === cellKey ? 'scale(1.1)' : 'scale(1)'
                        }}>
                          {formattedValue}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div style={{
          textAlign: 'center',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2rem',
          animation: 'fadeInUp 0.8s ease-out 0.4s both'
        }}>
          {[
            { label: '🗑️ Clear Comparison', color: '#dc3545', hoverColor: '#c82333' },
            { label: '🖨️ Print Comparison', color: '#28a745', hoverColor: '#218838' },
            { label: '➕ Add More Universities', color: '#4361ee', hoverColor: '#3651de' }
          ].map((btn, index) => (
            <button
              key={index}
              style={{
                padding: '15px 30px',
                background: `linear-gradient(135deg, ${btn.color} 0%, ${btn.hoverColor} 100%)`,
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '1rem',
                boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px) scale(1.05)';
                e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 5px 20px rgba(0,0,0,0.2)';
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'fadeInUp 0.8s ease-out 0.6s both'
        }}>
          <h3 style={{
            color: '#3a0ca3',
            marginBottom: '1.5rem',
            fontSize: '1.8rem',
            textAlign: 'center',
            fontWeight: '700'
          }}>
            📋 Quick Summary
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {universities.map((uni, index) => (
              <div
                key={uni.id}
                className="hover-lift"
                style={{
                  padding: '1.5rem',
                  border: '3px solid transparent',
                  borderRadius: '15px',
                  background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box',
                  animation: `slideInLeft 0.5s ease-out ${0.7 + index * 0.1}s both`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'linear-gradient(45deg, transparent, rgba(102, 126, 234, 0.1), transparent)',
                  transform: 'rotate(45deg)',
                  pointerEvents: 'none'
                }} />
                
                <h4 style={{
                  color: '#3a0ca3',
                  marginBottom: '1rem',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  transition: 'color 0.3s ease'
                }}>
                  {uni.name}
                </h4>
                <div style={{ fontSize: '1rem', color: '#666', lineHeight: '2' }}>
                  <div style={{ transition: 'transform 0.3s ease' }}>
                    🏆 <strong>Rank:</strong> #{uni.ranking || 'N/A'}
                  </div>
                  <div style={{ transition: 'transform 0.3s ease' }}>
                    💰 <strong>Tuition:</strong> ${uni.tuition_fee?.toLocaleString() || 'N/A'}
                  </div>
                  <div style={{ transition: 'transform 0.3s ease' }}>
                    📊 <strong>Acceptance:</strong> {uni.acceptance_rate || 'N/A'}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage; 