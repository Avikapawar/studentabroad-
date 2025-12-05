import React from 'react';

const SkeletonLoader = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  count = 1,
  className = '',
  style = {}
}) => {
  const skeletonStyle = {
    width,
    height,
    borderRadius,
    backgroundColor: '#f3f4f6',
    backgroundImage: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
    marginBottom: count > 1 ? '8px' : '0',
    ...style
  };

  return (
    <div className={`skeleton-container ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="skeleton-item"
          style={skeletonStyle}
          aria-label="Loading content"
        />
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

// Predefined skeleton components for common use cases
export const UniversityCardSkeleton = () => (
  <div style={{
    padding: '1.5rem',
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    backgroundColor: '#fff'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <SkeletonLoader width="60%" height="24px" />
      <SkeletonLoader width="60px" height="24px" borderRadius="12px" />
    </div>
    <SkeletonLoader width="40%" height="16px" style={{ marginBottom: '0.5rem' }} />
    <SkeletonLoader width="80%" height="16px" style={{ marginBottom: '1rem' }} />
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
      <SkeletonLoader width="80px" height="32px" borderRadius="16px" />
      <SkeletonLoader width="80px" height="32px" borderRadius="16px" />
      <SkeletonLoader width="80px" height="32px" borderRadius="16px" />
    </div>
    <SkeletonLoader width="100%" height="40px" borderRadius="8px" />
  </div>
);

export const RecommendationSkeleton = () => (
  <div style={{
    padding: '2rem',
    border: '1px solid #e9ecef',
    borderRadius: '16px',
    backgroundColor: '#fff',
    marginBottom: '1rem'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
      <SkeletonLoader width="50px" height="50px" borderRadius="50%" style={{ marginRight: '1rem' }} />
      <div style={{ flex: 1 }}>
        <SkeletonLoader width="70%" height="20px" style={{ marginBottom: '0.5rem' }} />
        <SkeletonLoader width="40%" height="16px" />
      </div>
      <SkeletonLoader width="80px" height="30px" borderRadius="15px" />
    </div>
    <SkeletonLoader width="100%" height="100px" borderRadius="8px" style={{ marginBottom: '1rem' }} />
    <div style={{ display: 'flex', gap: '1rem' }}>
      <SkeletonLoader width="120px" height="36px" borderRadius="18px" />
      <SkeletonLoader width="120px" height="36px" borderRadius="18px" />
      <SkeletonLoader width="120px" height="36px" borderRadius="18px" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div style={{ padding: '2rem' }}>
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <SkeletonLoader width="100px" height="100px" borderRadius="50%" style={{ margin: '0 auto 1rem' }} />
      <SkeletonLoader width="200px" height="24px" style={{ margin: '0 auto 0.5rem' }} />
      <SkeletonLoader width="150px" height="16px" style={{ margin: '0 auto' }} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} style={{ padding: '1rem', border: '1px solid #e9ecef', borderRadius: '8px' }}>
          <SkeletonLoader width="60%" height="16px" style={{ marginBottom: '0.5rem' }} />
          <SkeletonLoader width="100%" height="40px" borderRadius="4px" />
        </div>
      ))}
    </div>
  </div>
);

export default SkeletonLoader;