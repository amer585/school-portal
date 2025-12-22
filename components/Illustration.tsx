import React from 'react';
import { CheckCircle2, TrendingUp, User } from 'lucide-react';

export const Illustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center perspective-[1000px]">

      {/* Abstract Background Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/50 rounded-full blur-3xl animate-pulse"></div>

      {/* Main Glass Card */}
      <div className="relative z-10 w-full bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl shadow-blue-900/10 p-6 flex flex-col gap-5 transform transition-transform hover:scale-[1.02] duration-500">

        {/* Header Mockup */}
        <div className="flex items-center gap-4 border-b border-slate-100/50 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 bg-slate-200 rounded-full"></div>
            <div className="h-2 w-1/4 bg-slate-100 rounded-full"></div>
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> منتظم
          </div>
        </div>

        {/* Chart Area Mockup */}
        <div className="flex items-end justify-between gap-2 h-32 px-2">
          {[40, 70, 55, 85, 60, 95].map((h, i) => (
            <div key={i} className="w-full bg-blue-50 rounded-t-xl relative group overflow-hidden">
              <div
                className="absolute bottom-0 left-0 w-full bg-blue-500/80 rounded-t-xl transition-all duration-1000 group-hover:bg-blue-600"
                style={{ height: `${h}%` }}
              ></div>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/80 p-3 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600"><TrendingUp className="w-4 h-4" /></div>
              <span className="text-[10px] text-slate-400 font-bold">الأداء العام</span>
            </div>
            <div className="text-2xl font-black text-slate-800">92%</div>
          </div>
          <div className="bg-white/80 p-3 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600"><CheckCircle2 className="w-4 h-4" /></div>
              <span className="text-[10px] text-slate-400 font-bold">الحضور</span>
            </div>
            <div className="text-2xl font-black text-slate-800">28<span className="text-xs text-slate-400 font-medium">/30</span></div>
          </div>
        </div>

      </div>

      {/* Floating Elements (Badges) */}


    </div>
  );
};