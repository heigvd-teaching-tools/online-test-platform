import React, { useState } from 'react';
import { Chip, Stack, Typography } from '@mui/material';

const QuestionTagsViewer = ({ tags = [], size = 'medium', collapseAfter = Infinity }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const displayedTags = isHovered ? tags : tags.slice(0, collapseAfter);

  return (
    <Stack 
      direction={'row'} 
      rowGap={1} 
      flexWrap="wrap"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {displayedTags.map((tag, index) => (
        <Chip
          size={size}
          key={tag.label}
          color={'info'}
          variant="filled"
          label={<Typography variant={'caption'}>{tag.label}</Typography>}
          sx={{ mr: 1 }}
        />
      ))}
      {!isHovered && tags.length > collapseAfter && (
        <Chip
          size={size}
          key="more"
          variant="outlined"
          label={<Typography variant={'caption'}>{`+${tags.length - collapseAfter}`}</Typography>}
          sx={{ mr: 1 }}
        />
      )}
    </Stack>
  );
};

export default QuestionTagsViewer;
