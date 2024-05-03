// components/FlatButton.jsx

import React from 'react';

const FlatButton = ({ onClick, children, color = '#007BFF' }) => {
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
