import React from 'react';

export default function SpecialShowtimeBadge({ type, specialTypes, size = 'md' }) {
  if (!type) return null;
  
  const special = specialTypes?.find(t => t.value === type);
  if (!special) return null;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        background: `${special.color}20`,
        color: special.color,
        border: `1px solid ${special.color}40`
      }}
      title={`Suất chiếu ${special.label.toLowerCase()}`}
    >
      <span>{special.icon}</span>
      <span>{special.label}</span>
    </span>
  );
}