import React, { createContext, useContext, useState } from 'react';

type TabsContextType = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function Tabs({ 
  children, 
  value, 
  onValueChange,
  className = '' 
}: { 
  children: React.ReactNode; 
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ 
  children,
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex space-x-2 border-b ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ 
  children, 
  value,
  className = '' 
}: { 
  children: React.ReactNode; 
  value: string;
  className?: string;
}) {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }
  
  const isActive = context.value === value;
  
  return (
    <button
      className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
        isActive 
          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      } ${className}`}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ 
  children, 
  value,
  className = '' 
}: { 
  children: React.ReactNode; 
  value: string;
  className?: string;
}) {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }
  
  if (context.value !== value) {
    return null;
  }
  
  return <div className={className}>{children}</div>;
}