/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useCallback, useRef, useState } from 'react'

const ReorderableList = ({ children, onChangeOrder, onOrderEnd, disabled }) => {
  const [sourceIndex, setSourceIndex] = useState(null)
  const lastTargetIndex = useRef(null)

  const handleOrderChange = useCallback(
    (targetIndex) => {
      if (
        !disabled && // Prevent order changes if disabled
        targetIndex !== sourceIndex &&
        sourceIndex !== null &&
        targetIndex !== null
      ) {
        if (targetIndex !== lastTargetIndex.current) {
          onChangeOrder(sourceIndex, targetIndex)
          lastTargetIndex.current = targetIndex
          setSourceIndex(targetIndex) // Update the sourceIndex after changing the order
        }
      }
    },
    [sourceIndex, onChangeOrder, disabled],
  )

  const handleDragStart = useCallback(
    (e, index) => {
      if (!disabled) {
        setSourceIndex(index)
        lastTargetIndex.current = null // Reset the last target index on drag start
      }
    },
    [disabled],
  )

  const handleDragOver = useCallback(
    (e, targetIndex) => {
      if (!disabled) {
        e.preventDefault()
        handleOrderChange(targetIndex)
      }
    },
    [handleOrderChange, disabled],
  )

  const handleDragEnd = useCallback(() => {
    if (!disabled) {
      setSourceIndex(null)
      if (onOrderEnd) {
        onOrderEnd(lastTargetIndex.current) // Use lastTargetIndex.current for the final position
      }
    }
  }, [onOrderEnd, disabled])

  return (
    children &&
    children.map((child, index) => (
      <div
        key={index}
        draggable={!disabled} // Disable dragging if disabled
        onDragStart={(e) => handleDragStart(e, index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragEnd={(e) => handleDragEnd(e, index)}
        style={{ cursor: disabled ? 'not-allowed' : 'grab' }} // Optional: Change cursor to indicate disabled state
      >
        {child}
      </div>
    ))
  )
}

export default ReorderableList
