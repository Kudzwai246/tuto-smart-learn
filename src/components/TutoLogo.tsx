
import React from 'react';
import { GraduationCap } from 'lucide-react';

interface TutoLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const TutoLogo: React.FC<TutoLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-primary rounded-full flex items-center justify-center shadow-lg`}>
        <GraduationCap className="text-white w-1/2 h-1/2" />
      </div>
      {showText && (
        <span className={`font-bold text-primary ${textSizeClasses[size]}`}>
          Tuto
        </span>
      )}
    </div>
  );
};

export default TutoLogo;
