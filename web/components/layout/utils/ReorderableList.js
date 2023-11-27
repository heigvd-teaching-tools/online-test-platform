import { useCallback, useRef, useState } from 'react'

const ReorderableList = ({ children, onChangeOrder, onOrderEnd }) => {

  const [sourceIndex, setSourceIndex] = useState(null)
  const lastTargetIndex = useRef(null);
  
  const handleOrderChange = useCallback((targetIndex) => {
    if (targetIndex !== sourceIndex && sourceIndex !== null && targetIndex !== null) {
      if (targetIndex !== lastTargetIndex.current) {
        onChangeOrder(sourceIndex, targetIndex);
        lastTargetIndex.current = targetIndex;
        setSourceIndex(targetIndex); // Update the sourceIndex after changing the order
      }
    }
  }, [sourceIndex, onChangeOrder]);

  const handleDragStart = useCallback((e, index) => {
    setSourceIndex(index);
    lastTargetIndex.current = null; // Reset the last target index on drag start
  }, []);

  const handleDragOver = useCallback((e, targetIndex) => {
    e.preventDefault();
    handleOrderChange(targetIndex);
  }, [handleOrderChange]);

  const handleDragEnd = useCallback(() => {
    setSourceIndex(null);
    if (onOrderEnd) {
      onOrderEnd(lastTargetIndex.current); // Use lastTargetIndex.current for the final position
    }
  }, [onOrderEnd]);

  return (
    children &&
    children.map((child, index) => (
      <div
        key={index}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragEnd={(e) => handleDragEnd(e, index)}
      >
        {child}
      </div>
    ))
  );
}

export default ReorderableList
