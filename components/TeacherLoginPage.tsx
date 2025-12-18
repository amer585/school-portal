import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, GraduationCap, BookOpen } from 'lucide-react';
import { SUBJECTS } from '../src/types';

interface TeacherLoginPageProps {
  onLoginSuccess: (subject: string) => void;
  onBackToStudent: () => void;
}

export const TeacherLoginPage: React.FC<TeacherLoginPageProps> = ({ onLoginSuccess, onBackToStudent }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(subject);
      }, 1500);
    }
  };

  return (
    <div className="w-full flex justify-center items-center py-12 animate-in fade-in duration-500">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 relative overflow-hidden backdrop-blur-sm bg-white/90">

        {/* Decorative top accent - Purple for teachers to distinguish */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 to-indigo-500"></div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-purple-50 rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">دخول المعلمين</h2>
          <p className="text-slate-500 text-lg">أدخل بياناتك واختر المادة التي تدرسها</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="sr-only">البريد الإلكتروني</label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني المدرسى"
                className="block w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-lg font-medium"
                dir="rtl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="sr-only">كلمة المرور</label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="block w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-lg font-medium"
                dir="rtl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-500 mb-1">المادة التي تدرسها</label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <BookOpen className="h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
              </div>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="block w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-lg font-medium appearance-none cursor-pointer"
              >
                {SUBJECTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] group mt-4"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span>تسجيل الدخول</span>
                <ArrowRight className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onBackToStudent}
            className="text-slate-500 hover:text-slate-800 font-medium transition-colors text-sm"
          >
            العودة لتسجيل دخول الطلاب
          </button>
        </div>
      </div>
    </div>
  );
};