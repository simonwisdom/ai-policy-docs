import React, { useState } from 'react';
import { Button } from "antd";

interface ExpandableTextProps {
  text: string;
  width?: number;  // This prop can be removed since we're using specific widths for expanded/collapsed states.
}

const ExpandableText: React.FC<ExpandableTextProps> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const MAX_LENGTH = 100;

  const textStyle = {
    width: isExpanded ? '400px' : '200px', // Dynamic width based on expanded state
    whiteSpace: isExpanded ? 'normal' : 'normal',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  if (!text) return <span>N/A</span>;

  return (
    <div>
      <div style={textStyle}>
        {isExpanded ? text : `${text.substring(0, MAX_LENGTH)}...`}
      </div>
      {text.length > MAX_LENGTH && (
        <Button type="link" onClick={toggleExpand}>
          {isExpanded ? 'Less' : 'More'}
        </Button>
      )}
    </div>
  );
};

export default ExpandableText;
