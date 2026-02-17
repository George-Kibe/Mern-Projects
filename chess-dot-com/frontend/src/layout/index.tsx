import React from 'react';
// import Sidebar from '@/components/sidebar';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex border-collapse">
      {/* <Sidebar /> */}
      <main className="flex-1 pt-8 pb-1 mx-auto max-w-275">
        {children}
      </main>
    </div>
  );
};