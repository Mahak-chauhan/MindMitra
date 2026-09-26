import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Shield, Info, Check, Minus } from 'lucide-react';

const DataQualityIndicator = ({ dataQuality }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!dataQuality) {
    return (
      <div className="flex items-center text-gray-500 text-sm">
        <Shield className="w-4 h-4 mr-2" />
        Data quality unavailable
      </div>
    );
  }

  const { level, percentage, summary, sources } = dataQuality;
  
  let Icon = Shield;
  let colorClass = "text-gray-500";
  let bgClass = "bg-gray-50 border-gray-200";

  if (level === 'high') {
    Icon = ShieldCheck;
    colorClass = "text-green-700";
    bgClass = "bg-green-50 border-green-200";
  } else if (level === 'moderate') {
    Icon = Shield;
    colorClass = "text-brand-amber";
    bgClass = "bg-amber-50 border-amber-200";
  } else {
    Icon = ShieldAlert;
    colorClass = "text-brand-terracotta";
    bgClass = "bg-red-50 border-red-200";
  }

  return (
    <div className={`relative border rounded-lg p-4 ${bgClass} transition-all`}>
      <div className="flex items-start justify-between cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
        <div className="flex items-center">
          <Icon className={`w-5 h-5 mr-2 ${colorClass}`} />
          <div>
            <h4 className={`font-semibold text-sm ${colorClass}`}>Data Quality: {percentage}%</h4>
            {!showDetails && <p className="text-xs mt-1 text-gray-600 line-clamp-1">{summary}</p>}
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 focus:outline-none p-1">
          <Info className="w-4 h-4" />
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-black/5 animate-in fade-in duration-200">
          <p className="text-sm text-gray-700 mb-4">{summary}</p>
          
          <div className="bg-white/60 rounded p-3 mb-4">
            <h5 className="text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-2">Source Breakdown</h5>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Check-in</span>
                {sources.userInput > 0 ? <Check className="w-4 h-4 text-green-600" /> : <Minus className="w-4 h-4 text-gray-400" />}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Profile</span>
                {sources.userProfile > 0 ? <Check className="w-4 h-4 text-green-600" /> : <Minus className="w-4 h-4 text-gray-400" />}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Digital Wellbeing</span>
                {sources.digitalWellbeing > 0 ? <Check className="w-4 h-4 text-green-600" /> : <Minus className="w-4 h-4 text-gray-400" />}
              </div>
              <div className="flex justify-between items-center text-gray-500 pt-1 border-t border-black/5 mt-1">
                <span>System Defaults</span>
                <span className="text-xs font-medium">{sources.defaults} {sources.defaults === 1 ? 'field' : 'fields'}</span>
              </div>
            </div>
          </div>

          {sources.defaults > 0 && (
            <div className="bg-white rounded border border-brand-beige p-3 text-sm text-gray-600">
              <span className="font-medium text-brand-charcoal block mb-1">Missing Data?</span>
              Complete your profile or add today's Digital Wellbeing data to give MindMitra more personal information.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataQualityIndicator;
