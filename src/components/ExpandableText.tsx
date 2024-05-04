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
    content: string; // The prop to hold the text content
    children?: string | React.ReactNode; 
    text?: string;  // Keep the old 'text' prop optional for compatibility
    maxWidth?: number;
    title: string; 
    maxLength: number; 
}

const ExpandableText: React.FC<ExpandableTextProps> = ({
    children,
    content,
    text,
    maxWidth = 300,
    title,
  }) => (
    <CustomTooltip
      title={<Markdown>{title}</Markdown>}
      placement="topLeft"
      overlayStyle={{ maxWidth: '400px' }}
    >
      <TextContainer style={{ maxWidth: `${maxWidth}px` }}>
        {children || content || text}
      </TextContainer>
    </CustomTooltip>
  );
  

export default ExpandableText;
