import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  isExpanded, 
  onToggle, 
  children,
  iconColor = "text-blue-600"
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg mb-8">
      <div 
        className="p-6 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          {Icon && <Icon className={iconColor} />}
          {title}
        </h2>
        {isExpanded ? 
          <ChevronUp className="text-gray-600" /> : 
          <ChevronDown className="text-gray-600" />
        }
      </div>
      
      {isExpanded && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;