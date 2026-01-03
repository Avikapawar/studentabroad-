import React, { useState, useRef, useEffect } from 'react';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  style = {},
  placeholder = null,
  lazy = true,
  quality = 80,
  sizes = null,
  srcSet = null,
  onLoad = null,
  onError = null,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, isInView]);

  const handleLoad = (event) => {
    setIsLoaded(true);
    if (onLoad) onLoad(event);
  };

  const handleError = (event) => {
    setHasError(true);
    if (onError) onError(event);
  };

  // Generate optimized image URL (this would typically be handled by your CDN/image service)
  const getOptimizedSrc = (originalSrc, width, height, quality) => {
    // In a real application, you would use a service like Cloudinary, ImageKit, or similar
    // For now, we'll just return the original src
    return originalSrc;
  };

  const optimizedSrc = getOptimizedSrc(src, width, height, quality);

  // Placeholder styles
  const placeholderStyle = {
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    fontSize: '0.875rem',
    ...style
  };

  // Image container styles
  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    ...style
  };

  // Loading animation styles
  const loadingStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f3f4f6',
    backgroundImage: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s ease-in-out infinite'
  };

  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={`optimized-image-error ${className}`}
        style={placeholderStyle}
        {...props}
      >
        <span>Failed to load image</span>
      </div>
    );
  }

  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`optimized-image-placeholder ${className}`}
        style={placeholderStyle}
        {...props}
      >
        {placeholder || <span>Loading...</span>}
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`optimized-image-container ${className}`} style={containerStyle}>
      {!isLoaded && (
        <div style={loadingStyle}>
          <style jsx>{`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}</style>
        </div>
      )}
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        srcSet={srcSet}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          ...style,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          display: 'block',
          maxWidth: '100%',
          height: 'auto'
        }}
        {...props}
      />
    </div>
  );
};

// Higher-order component for progressive image enhancement
export const withProgressiveImage = (Component) => {
  return React.forwardRef((props, ref) => {
    const { src, lowQualitySrc, ...otherProps } = props;
    const [highQualityLoaded, setHighQualityLoaded] = useState(false);

    useEffect(() => {
      if (src) {
        const img = new Image();
        img.onload = () => setHighQualityLoaded(true);
        img.src = src;
      }
    }, [src]);

    return (
      <Component
        ref={ref}
        src={highQualityLoaded ? src : lowQualitySrc || src}
        {...otherProps}
      />
    );
  });
};

// Progressive image component
export const ProgressiveImage = withProgressiveImage(OptimizedImage);

// Avatar component with optimized loading
export const OptimizedAvatar = ({
  src,
  alt,
  size = 40,
  fallback = null,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError || !src) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: size * 0.4,
          fontWeight: 'bold'
        }}
        {...props}
      >
        {fallback || alt?.charAt(0)?.toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={handleError}
      style={{
        borderRadius: '50%',
        objectFit: 'cover'
      }}
      {...props}
    />
  );
};

// Image gallery component with lazy loading
export const ImageGallery = ({ images, columns = 3, gap = '1rem' }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        width: '100%'
      }}
    >
      {images.map((image, index) => (
        <OptimizedImage
          key={index}
          src={image.src}
          alt={image.alt}
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '8px'
          }}
          lazy={true}
        />
      ))}
    </div>
  );
};

export default OptimizedImage;