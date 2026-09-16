import React from 'react';
import ERPHeader from './ERPHeader';
import ProductionSidebar from './ProductionSidebar';

export default function ProductionLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col">
      <ERPHeader module="production" />
      <div className="flex flex-1">
        <ProductionSidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
