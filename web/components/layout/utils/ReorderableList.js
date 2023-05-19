import { useCallback, useState } from 'react'

const ReorderableList = ({ children, onChangeOrder, onOrderEnd }) => {
  const [sourceIndex, setSourceIndex] = useState(null)
  const handleDragStart = useCallback(
    (e, index) => {
      setSourceIndex(index)
    },
    [setSourceIndex]
  )

  const handleDragOver = useCallback(
    (e, targetIndex) => {
      e.preventDefault()
      if (targetIndex !== sourceIndex) {
        onChangeOrder(sourceIndex, targetIndex)
        setSourceIndex(targetIndex)
      }
    },
    [sourceIndex, onChangeOrder]
  )

  const handleDragEnd = useCallback(
    (e, index) => {
      setSourceIndex(null)
      if (onOrderEnd) {
        onOrderEnd(sourceIndex, index)
      }
    },
    [setSourceIndex, onOrderEnd, sourceIndex]
  )

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
  )
}

export default ReorderableList
