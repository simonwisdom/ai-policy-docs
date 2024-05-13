// components/ExpandableText.tsx
import React from 'react';
import styled from 'styled-components';

// Style for the text container with multiline truncation and scrollability
const TextContainer = styled.div`
  display: block; // Changed from -webkit-box to block for scroll
  overflow: auto; // Enables scrolling
  cursor: pointer;
  max-height: 54px; // Height enough for three lines
  line-height: 18px;
  max-width: 400px;
  white-space: pre-wrap; // To respect new lines and spaces
  text-align: left;
  font-size: 12px;
  padding: 5px 10px; // Manageable padding within the cell
  box-sizing: border-box; // Includes padding in height calculation
`;

interface ExpandableTextProps {
  content: string;
  onClick: () => void;
  maxWidth?: number;
  maxHeight?: number; // Optionally control max height
}

const ExpandableText: React.FC<ExpandableTextProps> = ({
  content,
  maxWidth = 400,
  maxHeight = 54,
  onClick,
}) => {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevents triggering the parent click event
    onClick();
  };

  return (
    <TextContainer
      style={{ maxWidth: `${maxWidth}px`, maxHeight: `${maxHeight}px` }}
      onClick={handleClick}
    >
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </TextContainer>
  );
};

export default ExpandableText;
