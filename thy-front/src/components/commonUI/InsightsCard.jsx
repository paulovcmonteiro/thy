import React from 'react';

const InsightsCard = ({ 
  title, 
  children, 
  variant = 'blue',
  icon = ''
}) => {
  // Configurações de cores por variante
  const variants = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-500',
      titleColor: 'text-orange-800',
      textColor: 'text-orange-700'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      titleColor: 'text-green-800',
      textColor: 'text-green-700'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      titleColor: 'text-yellow-800',
      textColor: 'text-yellow-700'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-500',
      titleColor: 'text-purple-800',
      textColor: 'text-purple-700'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      titleColor: 'text-red-800',
      textColor: 'text-red-700'
    }
  };

  const style = variants[variant] || variants.blue;

  return (
    <div className={`${style.bg} border-l-4 ${style.border} p-4 rounded-r-lg`}>
      <h3 className={`font-semibold ${style.titleColor} mb-2`}>
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h3>
      <div className={style.textColor}>
        {children}
      </div>
    </div>
  );
};

export default InsightsCard;