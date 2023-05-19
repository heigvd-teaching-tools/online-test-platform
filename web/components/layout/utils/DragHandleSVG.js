const DragHandleSVG = ({ fill = '#333333' }) => {
  return (
    <svg width="10" height="16">
      <circle cx="2" cy="2" r="2" fill={fill} />
      <circle cx="2" cy="8" r="2" fill={fill} />
      <circle cx="2" cy="14" r="2" fill={fill} />
      <circle cx="8" cy="2" r="2" fill={fill} />
      <circle cx="8" cy="8" r="2" fill={fill} />
      <circle cx="8" cy="14" r="2" fill={fill} />
    </svg>
  )
}

export default DragHandleSVG
