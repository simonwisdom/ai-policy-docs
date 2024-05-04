// components/FlatButton.tsx

import React from 'react';

interface FlatButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  color?: string; // Keep the color prop optional
}


const FlatButton = ({ onClick, children, color = '#007BFF' }: FlatButtonProps) => {
  const style = {
    padding: '4px 8px',
    border: `1px solid ${color}`,
    borderRadius: '4px',
    color: color,
    backgroundColor: 'white', // Flat style with contrasting background
    textDecoration: 'none',
    cursor: 'pointer',
    display: 'inline-block'
  };

  return (
    <button onClick={onClick} style={style}>
      {children}
    </button>
  );
};

export default FlatButton;
