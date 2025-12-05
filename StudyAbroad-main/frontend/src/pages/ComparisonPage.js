import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ComparisonPage = () => {
  const navigate = useNavigate();
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load comparison data from localStorage
    const storedData = localStorage.getItem('universityComparison');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setComparisonData(data);
      } catch (error) {
        console.error('Error parsing comparison data:', error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #4361ee',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p>Loading comparison...</p>
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
      <div style={{ padding: '2rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
        <h2 style={{ color: '#3a0ca3', marginBottom: '1rem' }}>No Universities to Compare</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Please select universities from the search page to compare them here.
        </p>
        <button
          onClick={() => navigate('/search')}
          style={{
            padding: '12px 30px',
            background: '#4361ee',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem'
          }}
        >
          🔍 Go to Search
        </button>
      </div>
    );
  }

  const universities = comparisonData.universities;

  const comparisonFields = [
    { key: 'name', label: '🎓 University Name', type: 'text' },
    { key: 'location', label: '📍 Location', type: 'location' },
    { key: 'ranking', label: '🏆 World Ranking', type: 'number' },
    { key: 'tuition_fee', label: '💰 Tuition Fee (USD)', type: 'currency' },
    { key: 'acceptance_rate', label: '📊 Acceptance Rate', type: 'percentage' },
    { key: 'min_cgpa', label: '🎯 Minimum CGPA', type: 'decimal' },
    { key: 'min_gre', label: '📝 Minimum GRE', type: 'number' },
    { key: 'min_ielts', label: '🗣️ Minimum IELTS', type: 'decimal' },
    { key: 'min_toefl', label: '🗣️ Minimum TOEFL', type: 'number' },
    { key: 'application_fee', label: '💳 Application Fee', type: 'currency' },
    { key: 'living_cost', label: '🏠 Living Cost', type: 'currency' },
    { key: 'student_population', label: '👥 Student Population', type: 'number' },
    { key: 'international_students', label: '🌍 International Students', type: 'percentage' }
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
        return Math.min(...values); // Lower ranking is better
      case 'tuition_fee':
      case 'application_fee':
      case 'living_cost':
        return Math.min(...values); // Lower cost is better
      case 'acceptance_rate':
        return Math.max(...values); // Higher acceptance rate is better
      case 'min_cgpa':
      case 'min_gre':
      case 'min_ielts':
      case 'min_toefl':
        return Math.min(...values); // Lower requirements are better
      case 'student_population':
      case 'international_students':
        return Math.max(...values); // Higher numbers might be better
      default:
        return null;
    }
  };

  const isHighlighted = (value, field, universities) => {
    const bestValue = getBestValue(field, universities);
    return bestValue !== null && value === bestValue;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/search')}
          style={{
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            padding: '10px 20px',
            background: 'white',
            border: '2px solid #4361ee',
            borderRadius: '50px',
            cursor: 'pointer',
            color: '#4361ee',
            fontWeight: '600'
          }}
        >
          ← Back to Search
        </button>
        
        <h1 style={{ color: '#3a0ca3', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          📊 University Comparison
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Comparing {universities.length} universities side by side
        </p>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>
          💡 Green highlights indicate the best value in each category
        </p>
      </div>

      {/* Comparison Table */}
      <div style={{ 
        background: 'white', 
        borderRadius: '15px', 
        overflow: 'hidden',
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)' }}>
              <th style={{ 
                padding: '1.5rem 1rem', 
                color: 'white', 
                fontWeight: '600',
                textAlign: 'left',
                minWidth: '200px',
                position: 'sticky',
                left: 0,
                background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
                zIndex: 10
              }}>
                Criteria
              </th>
              {universities.map((uni, index) => (
                <th key={uni.id} style={{ 
                  padding: '1.5rem 1rem', 
                  color: 'white', 
                  fontWeight: '600',
                  textAlign: 'center',
                  minWidth: '200px'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>{uni.name}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                    {uni.city}, {uni.country}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonFields.map((field, fieldIndex) => (
              <tr key={field.key} style={{ 
                background: fieldIndex % 2 === 0 ? '#f8f9fa' : 'white',
                borderBottom: '1px solid #e9ecef'
              }}>
                <td style={{ 
                  padding: '1rem', 
                  fontWeight: '600',
                  color: '#3a0ca3',
                  position: 'sticky',
                  left: 0,
                  background: fieldIndex % 2 === 0 ? '#f8f9fa' : 'white',
                  zIndex: 5,
                  borderRight: '2px solid #e9ecef'
                }}>
                  {field.label}
                </td>
                {universities.map((uni) => {
                  const value = field.key === 'location' ? uni : uni[field.key];
                  const formattedValue = formatValue(value, field.type, uni);
                  const highlighted = isHighlighted(uni[field.key], field, universities);
                  
                  return (
                    <td key={`${uni.id}-${field.key}`} style={{ 
                      padding: '1rem', 
                      textAlign: 'center',
                      background: highlighted ? '#d4edda' : 'transparent',
                      color: highlighted ? '#155724' : '#495057',
                      fontWeight: highlighted ? '600' : '400',
                      position: 'relative'
                    }}>
                      {highlighted && (
                        <span style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          fontSize: '0.8rem'
                        }}>
                          ⭐
                        </span>
                      )}
                      {formattedValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => {
            localStorage.removeItem('universityComparison');
            navigate('/search');
          }}
          style={{
            padding: '12px 25px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem'
          }}
        >
          🗑️ Clear Comparison
        </button>
        
        <button
          onClick={() => window.print()}
          style={{
            padding: '12px 25px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem'
          }}
        >
          🖨️ Print Comparison
        </button>
        
        <button
          onClick={() => navigate('/search')}
          style={{
            padding: '12px 25px',
            background: '#4361ee',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem'
          }}
        >
          ➕ Add More Universities
        </button>
      </div>

      {/* Summary */}
      <div style={{ 
        marginTop: '2rem', 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: '15px',
        boxShadow: '0 3px 12px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#3a0ca3', marginBottom: '1rem' }}>📋 Quick Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {universities.map((uni) => (
            <div key={uni.id} style={{ 
              padding: '1rem', 
              border: '2px solid #e9ecef', 
              borderRadius: '10px',
              background: '#f8f9fa'
            }}>
              <h4 style={{ color: '#3a0ca3', marginBottom: '0.5rem' }}>{uni.name}</h4>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                <div>🏆 Rank: #{uni.ranking || 'N/A'}</div>
                <div>💰 Tuition: ${uni.tuition_fee?.toLocaleString() || 'N/A'}</div>
                <div>📊 Acceptance: {uni.acceptance_rate || 'N/A'}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;