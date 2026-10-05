import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USERS, CAMPUS_OPTIONS } from '../../services/storage';
import { UserRole } from '../../types';
import { ShieldCheck, Store, User, BookOpen, PenTool, ChevronDown, Sparkles, Building2 } from 'lucide-react';

interface RoleSwitcherBarProps {
  onOpenDashboard: (tab?: string) => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({ onOpenDashboard }) => {
  const { currentUser, currentRole, switchUserRole, selectedCampus, setSelectedCampus } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const roleMeta: Record<UserRole, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
    customer: {
      label: 'Customer / Buyer',
      icon: <User className="w-3.5 h-3.5" />,
      color: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
      desc: 'Browse, buy, track orders & review products'
    },
    seller: {
      label: 'Seller / Store Owner',
      icon: <Store className="w-3.5 h-3.5" />,
      color: 'bg-indigo-500/10 text-indigo-700 border-indigo-300',
      desc: "Manage Ay's Tech Store, add products & fulfill orders"
    },
    editor: {
      label: 'Editor',
      icon: <PenTool className="w-3.5 h-3.5" />,
      color: 'bg-amber-500/10 text-amber-700 border-amber-300',
      desc: 'Moderate listings, handle user reports & feature items'
    },
    author: {
      label: 'Author',
      icon: <BookOpen className="w-3.5 h-3.5" />,
      color: 'bg-cyan-500/10 text-cyan-700 border-cyan-300',
      desc: 'Write campus founder stories & publish guides'
    },
    admin: {
      label: 'Administrator',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      color: 'bg-purple-500/10 text-purple-700 border-purple-300',
      desc: 'Full platform oversight, role management & settings'
    }
  };

  return (
    <div className="bg-stone-900 text-stone-200 text-xs border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-stone-300 tracking-wider text-[11px] uppercase">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Testing Mode:
          </span>
          <span className="hidden sm:inline text-stone-400">Switch role to test permissions:</span>
          
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {DEMO_USERS.map((demo) => {
              const active = currentUser?.id === demo.id;
              return (
                <button
                  key={demo.id}
                  onClick={() => switchUserRole(demo.role)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                    active
                      ? 'bg-stone-100 text-stone-900 shadow-sm'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                  title={`${demo.full_name} (${roleMeta[demo.role].label}): ${roleMeta[demo.role].desc}`}
                >
                  {roleMeta[demo.role].icon}
                  <span className="capitalize">{demo.role}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Campus Selector */}
          <div className="flex items-center gap-1 text-stone-300">
            <Building2 className="w-3 h-3 text-stone-400" />
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="bg-stone-800 text-stone-200 text-[11px] border border-stone-700 rounded px-1.5 py-0.5 focus:outline-none focus:border-stone-500"
            >
              {CAMPUS_OPTIONS.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.short_code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Dashboard Link */}
          {currentUser && (
            <button
              onClick={() => onOpenDashboard()}
              className="text-[11px] text-amber-300 hover:text-amber-200 underline font-medium flex items-center gap-0.5"
            >
              Go to {roleMeta[currentRole].label.split('/')[0].trim()} Dashboard &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
