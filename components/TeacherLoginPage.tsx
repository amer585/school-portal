import React, { useState } from 'react';
import { ArrowRight, Lock, BookOpen } from 'lucide-react';
import { SUBJECTS } from '../App';

interface TeacherLoginPageProps {
    onLoginSuccess: (subject: string) => void;
    onBackToStudent: () => void;
}

export const TeacherLoginPage: React.FC<TeacherLoginPageProps> = ({ onLoginSuccess, onBackToStudent }) => {
    const [password, setPassword] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string>(SUBJECTS[0]);
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '1234') { // Mock password
            onLoginSuccess(selectedSubject);
        } else {
            setError('كلمة المرور غير صحيحة');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="p-8 text-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <BookOpen className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">بوابة المعلمين</h2>
                    <p className="text-blue-100 text-sm">تسجيل الدخول لإدارة الدرجات والطلاب</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">المادة الدراسية</label>
                            <div className="relative">
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full pl-4 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white appearance-none cursor-pointer"
                                >
                                    {SUBJECTS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">كلمة المرور</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pr-10 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="أدخل كلمة المرور"
                                />
                            </div>
                            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                        >
                            تسجيل الدخول
                        </button>
                    </form>

                    <button
                        onClick={onBackToStudent}
                        className="w-full mt-4 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm py-2 flex items-center justify-center gap-2 transition-colors"
                    >
                        <ArrowRight className="w-4 h-4" />
                        العودة لبوابة الطلاب
                    </button>
                </div>
            </div>
            <p className="mt-8 text-slate-400 text-sm text-center">كلمة المرور التجريبية: 1234</p>
        </div>
    );
};
