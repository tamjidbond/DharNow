import React from 'react';

import Navbar from '../components/Navbar';
import { Outlet } from 'react-router';

const Root = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* The Navbar will now stay here forever */}
      <Navbar />

      {/* This is where Home, Register, and Lend will be rendered */}
      <main className="container mx-auto px-4 py-8 animate-fadeIn">
        <Outlet></Outlet>
      </main>

      {/* You can also add a Footer here later */}
    </div>
  );
};

export default Root;