import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface SidebarProps {
  items: MenuItem[];
  currentKey: string;
  onChange: (key: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  currentKey,
  onChange
}) => {
  const location = useLocation();
  
  // 从localStorage读取侧边栏展开状态，默认为false
  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem('admin-sidebar-expanded');
    return saved ? JSON.parse(saved) : false;
  });

  // 当展开状态改变时，保存到localStorage
  useEffect(() => {
    localStorage.setItem('admin-sidebar-expanded', JSON.stringify(expanded));
  }, [expanded]);

  return (
    <div className={`h-full bg-white border-r border-gray-200 transition-all duration-300 relative
      ${expanded ? 'w-64' : 'w-20'}`}>
      <nav className="pt-4 relative h-full">
        {items.map((item) => (
          <Link
            key={item.key}
            to={item.path}
            onClick={() => onChange(item.key)}
            className={`
              flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer no-underline
              border-l-4 
              ${(currentKey === item.key || location.pathname === item.path)
                ? 'bg-gray-100 border-blue-500'
                : 'border-transparent'}
            `}
          >
            <span className="text-xl">{item.icon}</span>
            {expanded && <span className="ml-3 truncate">{item.label}</span>}
          </Link>
        ))}
        <button
          onClick={() => setExpanded(!expanded)}
          className="absolute bottom-5 -right-3 p-2 hover:bg-gray-100 rounded-full 
          bg-white border border-gray-200 shadow-sm z-50 w-6 h-6 
          flex items-center justify-center text-sm"
        >
          {expanded ? '←' : '→'}
        </button>

      </nav>
    </div>
  );
};