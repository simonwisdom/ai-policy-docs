import React from 'react';
import { Tooltip } from 'antd';
import styled from 'styled-components';
import Markdown from 'markdown-to-jsx';

// Custom styled tooltip
const CustomTooltip = styled(Tooltip)`
  .ant-tooltip-inner {
    background-color: #d7ba9b; // Brown beige background
    color: black; // Black text color
  }
  .ant-tooltip-arrow-content {
    background-color: #d7ba9b; // Arrow color matching the tooltip background
  }
`;

// Style for the text container with multiline truncation
const TextContainer = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  max-height: 54px; // Height enough for three lines
  line-height: 18px;
  max-width: 200px; // Adjust based on your layout needs
`;

// TypeScript interface for component props
interface ExpandableTextProps {
  text: string;
  maxWidth?: number;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  maxWidth = 200 // Default value for maxWidth
}) => (
  <CustomTooltip 
    title={<Markdown>{text}</Markdown>}
    placement="topLeft"
    overlayStyle={{ maxWidth: '400px' }} // Tooltip content max width
  >
    <TextContainer style={{ maxWidth: `${maxWidth}px` }}>
      {text}
    </TextContainer>
  </CustomTooltip>
);

export default ExpandableText;
