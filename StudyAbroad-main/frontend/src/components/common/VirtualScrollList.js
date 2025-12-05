import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

const VirtualScrollList = ({
  items = [],
  itemHeight = 100,
  containerHeight = 400,
  renderItem,
  overscan = 5,
  onScroll = null,
  onEndReached = null,
  endReachedThreshold = 0.8,
  className = '',
  style = {},
  loading = false,
  loadingComponent = null,
  emptyComponent = null,
  estimatedItemHeight = null
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: containerHeight });
  const containerRef = useRef(null);
  const scrollElementRef = useRef(null);
  const itemHeights = useRef(new Map());
  const resizeObserver = useRef(null);

  // Calculate dynamic item heights if estimatedItemHeight is provided
  const getItemHeight = useCallback((index) => {
    if (estimatedItemHeight) {
      return itemHeights.current.get(index) || estimatedItemHeight;
    }
    return itemHeight;
  }, [itemHeight, estimatedItemHeight]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    if (estimatedItemHeight) {
      let height = 0;
      for (let i = 0; i < items.length; i++) {
        height += getItemHeight(i);
      }
      return height;
    }
    return items.length * itemHeight;
  }, [items.length, itemHeight, estimatedItemHeight, getItemHeight]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (items.length === 0) return { start: 0, end: 0 };

    let start = 0;
    let end = 0;
    let accumulatedHeight = 0;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const currentItemHeight = getItemHeight(i);
      if (accumulatedHeight + currentItemHeight > scrollTop) {
        start = Math.max(0, i - overscan);
        break;
      }
      accumulatedHeight += currentItemHeight;
    }

    // Find end index
    accumulatedHeight = 0;
    for (let i = 0; i < items.length; i++) {
      const currentItemHeight = getItemHeight(i);
      accumulatedHeight += currentItemHeight;
      if (accumulatedHeight > scrollTop + containerSize.height) {
        end = Math.min(items.length, i + overscan + 1);
        break;
      }
    }

    if (end === 0) end = items.length;

    return { start, end };
  }, [scrollTop, containerSize.height, items.length, overscan, getItemHeight]);

  // Calculate offset for visible items
  const offsetY = useMemo(() => {
    let offset = 0;
    for (let i = 0; i < visibleRange.start; i++) {
      offset += getItemHeight(i);
    }
    return offset;
  }, [visibleRange.start, getItemHeight]);

  // Handle scroll
  const handleScroll = useCallback((event) => {
    const newScrollTop = event.target.scrollTop;
    setScrollTop(newScrollTop);

    if (onScroll) {
      onScroll(event);
    }

    // Check if we've reached the end
    if (onEndReached) {
      const scrollHeight = event.target.scrollHeight;
      const clientHeight = event.target.clientHeight;
      const scrollPosition = newScrollTop + clientHeight;
      const threshold = scrollHeight * endReachedThreshold;

      if (scrollPosition >= threshold) {
        onEndReached();
      }
    }
  }, [onScroll, onEndReached, endReachedThreshold]);

  // Set up resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    resizeObserver.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.current.observe(containerRef.current);

    return () => {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
    };
  }, []);

  // Update item height when using dynamic heights
  const updateItemHeight = useCallback((index, height) => {
    if (estimatedItemHeight && height !== itemHeights.current.get(index)) {
      itemHeights.current.set(index, height);
      // Force re-render to update calculations
      setScrollTop(prev => prev);
    }
  }, [estimatedItemHeight]);

  // Render visible items
  const visibleItems = useMemo(() => {
    const items_to_render = [];
    
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      if (i >= items.length) break;
      
      const item = items[i];
      const itemElement = renderItem({
        item,
        index: i,
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: estimatedItemHeight ? 'auto' : itemHeight
        },
        onHeightChange: estimatedItemHeight ? 
          (height) => updateItemHeight(i, height) : undefined
      });

      items_to_render.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            top: estimatedItemHeight ? 
              Array.from({ length: i }, (_, idx) => getItemHeight(idx))
                .reduce((sum, h) => sum + h, 0) - offsetY :
              (i - visibleRange.start) * itemHeight,
            left: 0,
            right: 0,
            height: estimatedItemHeight ? 'auto' : itemHeight
          }}
        >
          {itemElement}
        </div>
      );
    }

    return items_to_render;
  }, [
    visibleRange,
    items,
    renderItem,
    itemHeight,
    estimatedItemHeight,
    offsetY,
    getItemHeight,
    updateItemHeight
  ]);

  // Empty state
  if (items.length === 0 && !loading) {
    return (
      <div
        ref={containerRef}
        className={`virtual-scroll-empty ${className}`}
        style={{
          height: containerHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
      >
        {emptyComponent || <div>No items to display</div>}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`virtual-scroll-container ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        ...style
      }}
      onScroll={handleScroll}
    >
      <div
        ref={scrollElementRef}
        style={{
          height: totalHeight,
          position: 'relative'
        }}
      >
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'relative'
          }}
        >
          {visibleItems}
        </div>
      </div>
      
      {loading && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1rem',
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}
        >
          {loadingComponent || <div>Loading more items...</div>}
        </div>
      )}
    </div>
  );
};

// Higher-order component for measuring item heights
export const withItemHeightMeasurement = (ItemComponent) => {
  return React.forwardRef(({ onHeightChange, ...props }, ref) => {
    const itemRef = useRef(null);
    const resizeObserver = useRef(null);

    useEffect(() => {
      if (!itemRef.current || !onHeightChange) return;

      resizeObserver.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          onHeightChange(entry.contentRect.height);
        }
      });

      resizeObserver.current.observe(itemRef.current);

      return () => {
        if (resizeObserver.current) {
          resizeObserver.current.disconnect();
        }
      };
    }, [onHeightChange]);

    return (
      <div ref={itemRef}>
        <ItemComponent ref={ref} {...props} />
      </div>
    );
  });
};

// Hook for virtual scrolling with infinite loading
export const useVirtualScroll = ({
  items,
  loadMore,
  hasMore = true,
  loading = false
}) => {
  const [allItems, setAllItems] = useState(items || []);
  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => {
    setAllItems(items || []);
  }, [items]);

  const handleEndReached = useCallback(async () => {
    if (isLoading || !hasMore || !loadMore) return;

    setIsLoading(true);
    try {
      const newItems = await loadMore();
      if (newItems && newItems.length > 0) {
        setAllItems(prev => [...prev, ...newItems]);
      }
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, loadMore]);

  return {
    items: allItems,
    loading: isLoading,
    onEndReached: handleEndReached
  };
};

// Grid virtual scrolling component
export const VirtualScrollGrid = ({
  items = [],
  itemWidth = 200,
  itemHeight = 200,
  containerWidth = '100%',
  containerHeight = 400,
  gap = 16,
  renderItem,
  ...props
}) => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: containerHeight });
  const containerRef = useRef(null);

  // Calculate columns based on container width
  const columns = useMemo(() => {
    if (containerSize.width === 0) return 1;
    return Math.floor((containerSize.width + gap) / (itemWidth + gap));
  }, [containerSize.width, itemWidth, gap]);

  // Convert items to rows for virtual scrolling
  const rows = useMemo(() => {
    const rowData = [];
    for (let i = 0; i < items.length; i += columns) {
      rowData.push(items.slice(i, i + columns));
    }
    return rowData;
  }, [items, columns]);

  const renderRow = useCallback(({ item: rowItems, index, style }) => {
    return (
      <div style={{ ...style, display: 'flex', gap: `${gap}px` }}>
        {rowItems.map((item, colIndex) => (
          <div
            key={index * columns + colIndex}
            style={{
              width: itemWidth,
              height: itemHeight,
              flexShrink: 0
            }}
          >
            {renderItem({ item, index: index * columns + colIndex })}
          </div>
        ))}
      </div>
    );
  }, [renderItem, columns, itemWidth, itemHeight, gap]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: containerWidth, height: containerHeight }}>
      <VirtualScrollList
        items={rows}
        itemHeight={itemHeight + gap}
        containerHeight={containerHeight}
        renderItem={renderRow}
        {...props}
      />
    </div>
  );
};

export default VirtualScrollList;