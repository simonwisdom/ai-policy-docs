import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Modal, Button } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const TextContainer = styled.div`
  overflow: hidden;
  position: relative;
  line-height: ${({ $lineHeight }) => `${$lineHeight}em`};
  font-size: ${({ $fontSize }) => `${$fontSize}px`};
`;

const ContentContainer = styled.div`
  max-height: ${({ $maxHeight }) => `${$maxHeight}px`};
`;

const FadeGradient = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 30px;
  background: linear-gradient(to bottom, transparent, white);
`;

const ExpandableText = ({
  text = '',
  maxLines = 4,
  fontSize = 12,
  lineHeight = 2.5,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textContainerRef = useRef(null);

  useEffect(() => {
    const textContainer = textContainerRef.current;
    if (textContainer) {
      const isOverflowing = textContainer.scrollHeight > textContainer.clientHeight;
      setIsTruncated(isOverflowing);
    }
  }, [text]); // Depending on the use case, you might want to watch other dependencies like fontSize or lineHeight

  return (
    <>
      <TextContainer>
        <ContentContainer ref={textContainerRef} $maxHeight={maxLines * fontSize * lineHeight}>
          <ReactMarkdown>{text}</ReactMarkdown>
          {isTruncated && <FadeGradient />}
        </ContentContainer>
        {isTruncated && (
          <Button onClick={() => setIsModalOpen(true)} icon={<ExpandOutlined />} aria-label="Read more about this text">
            Read More
          </Button>
        )}
      </TextContainer>
      <Modal
        title="Full Text"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width="50%"
      >
        <ReactMarkdown>{text}</ReactMarkdown>
      </Modal>
    </>
  );
};

export default ExpandableText;
