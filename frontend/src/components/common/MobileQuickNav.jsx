import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Award, MapPin, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileQuickNav() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Schemes', path: '/schemes', icon: Search },
    { label: 'Eligible', path: '/eligibility', icon: Award },
    { label: 'Radar', path: '/#radar', icon: MapPin },
    { label: user ? 'Dashboard' : 'Login', path: user ? '/dashboard' : '/login', icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-1.5 px-3 flex justify-around items-center shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path.startsWith('/#') && location.hash === '#radar');
        return (
          <Link
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
              isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-amber-400/10' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
