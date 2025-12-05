import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  hasNext, 
  hasPrev,
  showPageNumbers = true,
  maxPageNumbers = 5 
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const halfRange = Math.floor(maxPageNumbers / 2);
    
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, currentPage + halfRange);
    
    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxPageNumbers) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxPageNumbers + 1);
      }
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }
    
    // Add page numbers in range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageClick = (page) => {
    if (page !== '...' && page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (hasPrev) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>
      
      <div className="pagination-controls">
        {/* Previous Button */}
        <button
          className={`pagination-btn prev ${!hasPrev ? 'disabled' : ''}`}
          onClick={handlePrevious}
          disabled={!hasPrev}
          title="Previous page"
        >
          ← Previous
        </button>

        {/* Page Numbers */}
        {showPageNumbers && (
          <div className="pagination-numbers">
            {pageNumbers.map((page, index) => (
              <button
                key={index}
                className={`pagination-number ${
                  page === currentPage ? 'active' : ''
                } ${page === '...' ? 'ellipsis' : ''}`}
                onClick={() => handlePageClick(page)}
                disabled={page === '...' || page === currentPage}
              >
                {page}
              </button>
            ))}
          </div>
        )}

        {/* Next Button */}
        <button
          className={`pagination-btn next ${!hasNext ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={!hasNext}
          title="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Pagination;