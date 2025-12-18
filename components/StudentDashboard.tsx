import React, { useState, useMemo } from 'react';
import { Calendar, BookOpen, LogOut, TrendingUp, Award, Star, Clock, AlertTriangle, CheckCircle, ArrowUpRight, ShieldAlert, ShieldCheck, Zap, BarChart3, Layout, Trophy, Crown, Sparkles, Bell, Megaphone, ChevronDown, ChevronUp } from 'lucide-react';
import type { StudentData, Assessment, MonthlyExam } from '../src/types';
import { SUBJECTS } from '../src/types';

interface StudentDashboardProps {
    student: StudentData;
    onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'subjects' | 'attendance' | 'analytics' | 'schedule' | 'announcements'>('subjects');
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

    // --- MEMOIZED CALCULATIONS ---
    const stats = useMemo(() => {
        const MAX_ALLOWED_ABSENCE = 30; // Max allowed days per year
        const absentCount = student.attendanceRecords.filter(r => r.status === 'absent').length;
        const remainingDays = Math.max(0, MAX_ALLOWED_ABSENCE - absentCount);
        const absencePercentage = Math.min(100, (absentCount / MAX_ALLOWED_ABSENCE) * 100);

        // Determine risk level
        let riskLevel: 'safe' | 'warning' | 'critical' = 'safe';
        if (remainingDays === 0) riskLevel = 'critical';
        else if (remainingDays <= 7) riskLevel = 'warning';

        const calculatePercentage = (score: number, max: number) => {
            if (max === 0) return 0;
            return (score / max) * 100;
        };

        const presentWeeks = student.weeklyAssessments.filter(w => w.status === 'present');
        const weeklyAvg = presentWeeks.length > 0
            ? Math.round((presentWeeks.reduce((a, b) => a + calculatePercentage(b.score, b.maxScore), 0) / presentWeeks.length))
            : 0;

        const presentExams = student.monthlyExams.filter(e => e.status === 'present');
        const monthlyAvg = presentExams.length > 0
            ? Math.round((presentExams.reduce((a, b) => a + calculatePercentage(b.score, b.maxScore), 0) / presentExams.length))
            : 0;

        return {
            MAX_ALLOWED_ABSENCE,
            absentCount,
            remainingDays,
            absencePercentage,
            riskLevel,
            calculatePercentage,
            weeklyAvg,
            monthlyAvg
        };
    }, [student]);

    // --- ACHIEVEMENTS LOGIC ---
    const achievements = useMemo(() => {
        const list = [];
        if (stats.absentCount === 0) list.push({ icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', title: 'التزام تام', desc: 'لم تغب أي يوم' });
        if (stats.weeklyAvg >= 90) list.push({ icon: Crown, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', title: 'ملك الأسبوع', desc: 'أداء أسبوعي ممتاز' });
        if (stats.monthlyAvg >= 85) list.push({ icon: Star, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30', title: 'نجم الشهر', desc: 'درجات شهرية عالية' });
        const mathScore = student.monthlyExams.find(e => e.subject.includes('الرياضيات'))?.score || 0;
        const mathMax = student.monthlyExams.find(e => e.subject.includes('الرياضيات'))?.maxScore || 1;
        if ((mathScore / mathMax) >= 0.9) list.push({ icon: Zap, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', title: 'عبقري الرياضيات', desc: 'درجة نهائية في الرياضيات' });
        return list;
    }, [stats.absentCount, stats.weeklyAvg, stats.monthlyAvg, student.monthlyExams]);

    const StatusBadge = ({ status, note }: { status: string, note?: string }) => {
        if (status === 'present') return null;

        let color = 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800';
        let text = 'غائب';
        let icon = <AlertTriangle className="w-3 h-3" />;

        if (status === 'excused') {
            color = 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
            text = 'عذر';
            icon = <Clock className="w-3 h-3" />;
        } else if (status === 'late') {
            color = 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
            text = 'تأخير';
        }

        return (
            <div className="flex flex-col items-center gap-2 w-full">
                <span className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold border ${color}`}>
                    {icon} {text}
                </span>
                {note && <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-100 dark:border-slate-800 w-full text-center truncate">{note}</span>}
            </div>
        );
    };

    const isRecent = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

            {/* --- HERO PROFILE CARD --- */}
            <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden group transition-colors duration-300">

                {/* Decorative Gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-80 group-hover:scale-105 transition-transform duration-1000"></div>

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-3xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center text-4xl font-black shadow-xl shadow-slate-200 dark:shadow-none transform -rotate-3 group-hover:rotate-0 transition-transform duration-300 border dark:border-slate-700">
                                {student.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white dark:border-slate-900 w-6 h-6 rounded-full"></div>
                        </div>

                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-tight mb-2">{student.name}</h1>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700">{student.grade}</span>
                                <span className="px-3 py-1 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 rounded-full text-xs font-mono border border-slate-200 dark:border-slate-800 shadow-sm">ID: {student.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Achievements Row */}
                    {achievements.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 max-w-full">
                            {achievements.map((badge, idx) => (
                                <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent ${badge.bg} ${badge.color} min-w-fit`}>
                                    <badge.icon className="w-4 h-4" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-wider leading-none mb-0.5">{badge.title}</span>
                                        <span className="text-[9px] opacity-80 leading-none">{badge.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick Stats Grid */}
                    <div className="flex gap-4 md:gap-8 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 dark:border-slate-700 min-w-[120px]">
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> التقييم العام
                            </div>
                            <div className="text-3xl font-black text-slate-800 dark:text-white flex items-start">
                                {Math.max(stats.weeklyAvg, stats.monthlyAvg)}
                                <span className="text-sm text-slate-400 dark:text-slate-600 mt-1 ml-0.5">%</span>
                            </div>
                        </div>

                        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 dark:border-slate-700 min-w-[120px]">
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> الحضور
                            </div>
                            <div className="text-3xl font-black text-slate-800 dark:text-white flex items-start">
                                {student.attendanceRecords.filter(r => r.status === 'present').length}
                                <span className="text-sm text-slate-400 dark:text-slate-600 mt-1 ml-0.5 font-medium">يوم</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- TABS --- */}
            <div className="flex justify-center sticky top-24 z-20 overflow-x-auto py-2">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200/60 dark:border-slate-700 inline-flex min-w-fit">
                    {(['subjects', 'attendance', 'analytics', 'schedule', 'announcements'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 relative overflow-hidden whitespace-nowrap
                    ${activeTab === t
                                    ? 'text-white shadow-md'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                                }
                `}
                        >
                            {activeTab === t && <div className="absolute inset-0 bg-slate-900 dark:bg-blue-600 z-0"></div>}
                            <span className="relative z-10 flex items-center gap-2">
                                {t === 'subjects' && <BookOpen className="w-3.5 h-3.5" />}
                                {t === 'attendance' && <Clock className="w-3.5 h-3.5" />}
                                {t === 'analytics' && <BarChart3 className="w-3.5 h-3.5" />}
                                {t === 'schedule' && <Layout className="w-3.5 h-3.5" />}
                                {t === 'announcements' && <Megaphone className="w-3.5 h-3.5" />}

                                {t === 'subjects' ? 'المواد الدراسية' :
                                    t === 'attendance' ? 'سجل الحضور' :
                                        t === 'analytics' ? 'تحليل الأداء' :
                                            t === 'announcements' ? 'الإعلانات' : 'الجدول الدراسي'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="min-h-[400px]">

                {/* SUBJECTS TAB (Combined Weekly & Monthly) */}
                {activeTab === 'subjects' && (
                    <div className="space-y-6">
                        {SUBJECTS.map((subject) => {
                            const subjectWeekly = student.weeklyAssessments.filter(w => w.subject === subject);
                            const subjectMonthly = student.monthlyExams.filter(m => m.subject === subject);

                            // Skip if no data
                            if (subjectWeekly.length === 0 && subjectMonthly.length === 0) return null;

                            const isExpanded = expandedSubject === subject;

                            // Calculate Subject Score
                            const weeklyScore = subjectWeekly.reduce((acc, curr) => acc + (curr.status === 'present' ? curr.score : 0), 0);
                            const weeklyMax = subjectWeekly.reduce((acc, curr) => acc + curr.maxScore, 0);
                            const monthlyScore = subjectMonthly.reduce((acc, curr) => acc + (curr.status === 'present' ? curr.score : 0), 0);
                            const monthlyMax = subjectMonthly.reduce((acc, curr) => acc + curr.maxScore, 0);

                            const totalMax = weeklyMax + monthlyMax;
                            const totalScore = weeklyScore + monthlyScore;
                            const percentage = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;

                            return (
                                <div key={subject} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                    {/* Header / Summary Card */}
                                    <div
                                        className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between"
                                        onClick={() => setExpandedSubject(isExpanded ? null : subject)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-md ${percentage >= 85 ? 'bg-gradient-to-br from-emerald-500 to-teal-400' :
                                                percentage >= 70 ? 'bg-gradient-to-br from-blue-500 to-indigo-400' :
                                                    percentage >= 50 ? 'bg-gradient-to-br from-amber-500 to-orange-400' :
                                                        'bg-gradient-to-br from-red-500 to-rose-400'
                                                }`}>
                                                {percentage.toFixed(0)}%
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{subject}</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                                    {subjectWeekly.length} تقييم أسبوعي • {subjectMonthly.length} امتحان شهري
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
                                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </div>
                                    </div>

                                    {/* Detailed Content (Collapsible) */}
                                    {isExpanded && (
                                        <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 animate-in slide-in-from-top-2">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                                                {/* Weekly Column */}
                                                <div>
                                                    <h4 className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 mb-4 text-sm uppercase tracking-wide">
                                                        <Calendar className="w-4 h-4 text-violet-500" />
                                                        التقييمات الأسبوعية
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {subjectWeekly.map(w => (
                                                            <div key={w.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                                                <div>
                                                                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500">{w.title}</div>
                                                                    {w.date && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{w.date}</div>}
                                                                </div>
                                                                <div>
                                                                    {w.status === 'present' ? (
                                                                        <div className="flex items-baseline gap-1">
                                                                            <span className="text-xl font-black text-slate-800 dark:text-white">{w.score}</span>
                                                                            <span className="text-[10px] font-bold text-slate-400">/{w.maxScore}</span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className={`text-[10px] px-2 py-1 rounded font-bold ${w.status === 'absent' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                                                            {w.status === 'absent' ? 'غائب' : 'عذر'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {subjectWeekly.length === 0 && <div className="text-center py-6 text-slate-400 text-xs">لا توجد بيانات</div>}
                                                    </div>
                                                </div>

                                                {/* Monthly Column */}
                                                <div>
                                                    <h4 className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 mb-4 text-sm uppercase tracking-wide">
                                                        <Award className="w-4 h-4 text-blue-500" />
                                                        الامتحانات الشهرية
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {subjectMonthly.map(m => (
                                                            <div key={m.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                                                <div>
                                                                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500">امتحان شهري</div>
                                                                    {m.date && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{m.date}</div>}
                                                                </div>
                                                                <div>
                                                                    {m.status === 'present' ? (
                                                                        <div className="flex items-baseline gap-1">
                                                                            <span className="text-xl font-black text-slate-800 dark:text-white">{m.score}</span>
                                                                            <span className="text-[10px] font-bold text-slate-400">/{m.maxScore}</span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className={`text-[10px] px-2 py-1 rounded font-bold ${m.status === 'absent' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                                                            {m.status === 'absent' ? 'غائب' : 'عذر'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {subjectMonthly.length === 0 && <div className="text-center py-6 text-slate-400 text-xs">لا توجد بيانات</div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ATTENDANCE TAB */}
                {activeTab === 'attendance' && (
                    <div className="space-y-6">
                        {/* --- ABSENCE ALLOWANCE TRACKER --- */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-full h-full bg-slate-50/50 dark:bg-slate-800/20 -z-0"></div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex items-start gap-4">
                                    <div className={`p-4 rounded-2xl shadow-sm ${stats.riskLevel === 'safe' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                        stats.riskLevel === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                            'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                                        }`}>
                                        {stats.riskLevel === 'safe' ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">رصيد الغياب المسموح</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                                            {stats.riskLevel === 'safe' ? 'أنت في المنطقة الآمنة. حافظ على التزامك بالحضور.' :
                                                stats.riskLevel === 'warning' ? 'انتبه! لقد اقتربت من تجاوز الحد المسموح للغياب.' :
                                                    'تحذير! لقد استنفذت رصيد الغياب، قد تتعرض للمساءلة.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full md:w-1/3 space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الرصيد المستخدم</span>
                                        <div className="text-right">
                                            <span className={`text-2xl font-black ${stats.riskLevel === 'safe' ? 'text-green-600 dark:text-green-400' :
                                                stats.riskLevel === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                                                    'text-rose-600 dark:text-rose-400'
                                                }`}>{stats.remainingDays}</span>
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1">يوم متبقي</span>
                                        </div>
                                    </div>

                                    <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner relative">
                                        {/* Ticks for visual aid */}
                                        <div className="absolute inset-0 flex justify-between px-1">
                                            {[...Array(5)].map((_, i) => <div key={i} className="w-px h-full bg-white/50 dark:bg-slate-700/50"></div>)}
                                        </div>
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-out relative ${stats.riskLevel === 'safe' ? 'bg-green-500' :
                                                stats.riskLevel === 'warning' ? 'bg-amber-500' :
                                                    'bg-rose-500'
                                                }`}
                                            style={{ width: `${stats.absencePercentage}%` }}
                                        >
                                            <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                        <span>0 يوم</span>
                                        <span>الحد الأقصى: {stats.MAX_ALLOWED_ABSENCE} يوم</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                <span className="font-bold text-slate-600 dark:text-slate-300 text-sm">سجل الحضور الكامل</span>
                            </div>
                            {student.attendanceRecords.length > 0 ? (
                                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {student.attendanceRecords.map(rec => (
                                        <div key={rec.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <div className="flex items-center gap-6">
                                                <div className="font-mono text-slate-400 dark:text-slate-500 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl group-hover:border-blue-200 dark:group-hover:border-slate-600 group-hover:text-blue-500 transition-colors">{rec.date}</div>
                                                <div>
                                                    <div className="font-bold text-slate-700 dark:text-slate-200 text-base">{rec.lessonName || 'يوم دراسي'}</div>
                                                    {rec.status === 'late' && rec.lateTime && (
                                                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1">حضور: {rec.lateTime}</div>
                                                    )}
                                                </div>
                                            </div>
                                            {rec.status === 'present' && <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-1.5 rounded-full text-xs font-bold border border-green-100 dark:border-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> حاضر</span>}
                                            {rec.status === 'absent' && <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-4 py-1.5 rounded-full text-xs font-bold border border-rose-100 dark:border-rose-800 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> غائب</span>}
                                            {rec.status === 'late' && <span className="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-4 py-1.5 rounded-full text-xs font-bold border border-orange-100 dark:border-orange-800 flex items-center gap-1"><Clock className="w-3 h-3" /> متأخر</span>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-16"><EmptyState icon={<Clock className="w-10 h-10 text-slate-300 dark:text-slate-600" />} text="سجل الحضور فارغ" /></div>
                            )}
                        </div>
                    </div>
                )}

                {/* ANALYTICS TAB */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between h-64">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <TrendingUp className="w-40 h-40 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">تطور الأداء الأسبوعي</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">نظرة عامة على درجاتك خلال الأسابيع الماضية</p>
                                </div>

                                {/* SVG Line Chart */}
                                <div className="w-full h-32 flex items-end justify-between px-2 gap-2 mt-4">
                                    {student.weeklyAssessments.slice(-8).map((a, i) => {
                                        const pct = stats.calculatePercentage(a.score, a.maxScore);
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-default">
                                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative h-24 flex items-end overflow-hidden">
                                                    <div
                                                        className="w-full bg-blue-500/80 group-hover:bg-blue-600 transition-all duration-500 rounded-t-lg relative"
                                                        style={{ height: `${pct}%` }}
                                                    >
                                                        {/* Tooltip */}
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                            {a.score}/{a.maxScore}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-mono rotate-45 origin-left translate-y-2">{a.title.split(' ')[1]}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-rows-2 gap-6">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-between relative overflow-hidden">
                                    <div className="relative z-10">
                                        <span className="text-indigo-100 text-xs font-bold uppercase tracking-wider">أفضل أداء</span>
                                        <div className="text-3xl font-black mt-1">الرياضيات</div>
                                        <div className="mt-2 inline-block px-2 py-1 bg-white/20 rounded-lg text-[10px] font-bold">الدرجة النهائية مرتين</div>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                                        <Trophy className="w-8 h-8 text-yellow-300" />
                                    </div>
                                    <Sparkles className="absolute top-0 left-0 text-white/10 w-32 h-32 -translate-x-1/2 -translate-y-1/2" />
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                    <div>
                                        <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">عدد الاختبارات</span>
                                        <div className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                                            {student.weeklyAssessments.length + student.monthlyExams.length}
                                            <span className="text-sm font-medium text-slate-400 dark:text-slate-500 mr-1">اختبار</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-slate-400 dark:text-slate-500">
                                        <BookOpen className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SCHEDULE TAB */}
                {activeTab === 'schedule' && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Layout className="w-5 h-5 text-blue-500" />
                                الجدول الدراسي الأسبوعي
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right min-w-[600px]">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">اليوم</th>
                                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">الحصة الأولى</th>
                                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">الحصة الثانية</th>
                                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">فسحة</th>
                                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">الحصة الثالثة</th>
                                        <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">الحصة الرابعة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {[
                                        { day: 'الأحد', c1: 'لغة عربية', c2: 'رياضيات', c3: 'لغة إنجليزية', c4: 'علوم' },
                                        { day: 'الأثنين', c1: 'دراسات', c2: 'لغة عربية', c3: 'رياضيات', c4: 'حاسب آلي' },
                                        { day: 'الثلاثاء', c1: 'لغة إنجليزية', c2: 'علوم', c3: 'لغة عربية', c4: 'دين' },
                                        { day: 'الأربعاء', c1: 'رياضيات', c2: 'دراسات', c3: 'فنية', c4: 'لغة عربية' },
                                        { day: 'الخميس', c1: 'علوم', c2: 'لغة إنجليزية', c3: 'نشاط', c4: 'رياضيات' },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{row.day}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{row.c1}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{row.c2}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-300 dark:text-slate-600 bg-slate-50/50 dark:bg-slate-900/50 text-center">---</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{row.c3}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{row.c4}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ANNOUNCEMENTS TAB */}
                {activeTab === 'announcements' && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-2xl flex items-start gap-3">
                            <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                            <div>
                                <h3 className="font-bold text-blue-800 dark:text-blue-300">لوحة الإعلانات المدرسية</h3>
                                <p className="text-sm text-blue-600 dark:text-blue-400">تابع هنا كل ما هو جديد من تنبيهات وأخبار من إدارة المدرسة والمعلمين.</p>
                            </div>
                        </div>

                        {student.announcements && student.announcements.length > 0 ? (
                            student.announcements.filter(a => a.targetGrade === 'الكل' || a.targetGrade === student.grade).map(announcement => {
                                const isNew = isRecent(announcement.date);
                                return (
                                    <div key={announcement.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all relative overflow-hidden group">
                                        {announcement.importance === 'high' && (
                                            <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500"></div>
                                        )}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-black text-slate-800 dark:text-white">{announcement.title}</h3>
                                                {isNew && (
                                                    <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse font-bold">جديد</span>
                                                )}
                                                {announcement.importance === 'high' && (
                                                    <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" /> هام
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-slate-400 font-bold border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg">{announcement.targetGrade}</span>
                                            </div>
                                            <span className="text-[10px] bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg text-slate-400 font-mono font-bold tracking-wide">{announcement.date}</span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 pl-4">{announcement.content}</p>
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px]">{announcement.author.charAt(0)}</div>
                                            <span className="text-slate-500 dark:text-slate-400">{announcement.author}</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <EmptyState icon={<Bell className="w-10 h-10 text-slate-300 dark:text-slate-600" />} text="لا توجد إعلانات حالياً" />
                        )}
                        {student.announcements.filter(a => a.targetGrade === 'الكل' || a.targetGrade === student.grade).length === 0 && student.announcements.length > 0 && (
                            <div className="text-center py-4 text-xs text-slate-400">توجد إعلانات لصفوف أخرى، ولكن لا شيء لصفك حالياً.</div>
                        )}
                    </div>
                )}

            </div>

            <div className="flex justify-center pt-8">
                <button onClick={onLogout} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-2 text-xs font-bold px-6 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-transparent hover:border-red-100 dark:hover:border-red-800">
                    <LogOut className="w-4 h-4" />
                    تسجيل خروج
                </button>
            </div>
        </div>
    );
};

const EmptyState = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-300 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
        <div className="mb-4 opacity-50 bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm">{icon}</div>
        <p className="text-sm font-bold text-slate-400 dark:text-slate-500">{text}</p>
    </div>
);