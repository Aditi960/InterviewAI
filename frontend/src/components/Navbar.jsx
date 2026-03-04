import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Menu, X } from 'lucide-react';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how', label: 'How It Works' },
  { href: '#students', label: 'For Students' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="relative bg-transparent px-6 md:px-10 py-4 flex items-center justify-between" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: '#06b6d4' }}>
          <Zap size={16} color="white" fill="white" />
        </div>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18 }}>InterviewAI</span>
      </div>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map(({ href, label }) => (
          <a key={href} href={href} className="text-slate-500 no-underline text-sm font-medium hover:text-slate-800 transition-colors">
            {label}
          </a>
        ))}
        <Link to="/login" className="text-slate-800 no-underline text-sm font-semibold">
          Log In
        </Link>
        <Link to="/register" className="text-white no-underline text-sm font-semibold px-5 py-2 rounded-xl" style={{ background: '#06b6d4' }}>
          Get Started
        </Link>
      </div>

      {/* Mobile hamburger button */}
      <button
        className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      >
        {menuOpen ? <X size={22} className="text-slate-700" /> : <Menu size={22} className="text-slate-700" />}
      </button>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-slate-100 flex flex-col z-50 md:hidden">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="px-6 py-3 text-slate-600 no-underline text-sm font-medium hover:bg-slate-50 transition-colors min-h-[44px] flex items-center"
            >
              {label}
            </a>
          ))}
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="px-6 py-3 text-slate-800 no-underline text-sm font-semibold hover:bg-slate-50 transition-colors min-h-[44px] flex items-center"
          >
            Log In
          </Link>
          <Link
            to="/register"
            onClick={() => setMenuOpen(false)}
            className="mx-4 my-3 text-center text-white no-underline text-sm font-semibold px-5 py-3 rounded-xl min-h-[44px] flex items-center justify-center"
            style={{ background: '#06b6d4' }}
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
