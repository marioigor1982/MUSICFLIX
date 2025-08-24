import React from 'react';
import { logoDataUrl } from '../assets/logo';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <img 
      src={logoDataUrl} 
      alt="MUSICFLIX Logo" 
      className={className}
    />
  );
};

export default Logo;
