import React, { ReactNode } from 'react';

interface TerminalProps {
  path?: string;
  className?: string;
  children: ReactNode;
}

const Terminal = ({ path = "~/kaapi $", children, className = "" }: TerminalProps) => {
  return (
    <div className={`terminal-window flex flex-col ${className}`}>
      <div className="terminal-header flex items-center p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="ml-4 text-sm text-gray-400 font-mono">{path}</div>
      </div>
      <div className="terminal-body flex-1 bg-dark p-6 font-mono text-sm overflow-x-auto">
        {children}
      </div>
    </div>
  );
};

export default Terminal;
