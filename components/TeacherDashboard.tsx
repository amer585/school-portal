import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Save, User, ChevronLeft, LayoutDashboard, Calculator, BookOpen, Plus, Trash2, ChevronRight, AlertCircle, Calendar, Edit2, X, HelpCircle, GraduationCap, Check, Download, Users, RotateCcw, RotateCw, Filter, ArrowUpDown, MoreVertical, FileDown, PieChart, TrendingUp, AlertTriangle, Megaphone, Send } from 'lucide-react';
import type { StudentData, Assessment, AttendanceRecord, Announcement, MonthlyExam } from '../src/types';
import { SUBJECTS, GRADES } from '../src/types'; // Import Constants
import { HelpModal } from './HelpModal';

interface TeacherDashboardProps {
    students: StudentData[];
    teacherSubject: string; // Receive logged-in teacher subject
    onUpdateStudent: (id: string, data: Partial<StudentData>) => void;
    onBulkUpdate: (updates: { id: string, data: Partial<StudentData> }[]) => void;
    onDeleteStudent: (id: string) => void;
    onLogout: () => void;
    triggerToast: (msg: string) => void;
}

// --- SUB-COMPONENTS ---

const ConfirmationModal = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "حذف",
    cancelText = "إلغاء",
    isDanger = true
}: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col ring-1 ring-white/20">
                <div className="p-6 text-center">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
                    <p className="text-sm text-slate-500 mb-6">{message}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-colors shadow-lg ${isDanger ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StudentListItem = React.memo(({
    student,
    isSelected,
    onSelect
}: {
    student: StudentData,
    isSelected: boolean,
    onSelect: (id: string) => void
}) => {
    // Calc brief performance for the snippet
    const { perf, isRisk } = useMemo(() => {
        const present = student.weeklyAssessments.filter(w => w.status === 'present');
        const perfVal = present.length ? Math.round((present.reduce((acc, curr) => acc + (curr.score / curr.maxScore), 0) / present.length) * 100) : 0;

        // Risk Logic: Low Performance (<50%) OR High Absence (>20% approx >6 days in 30 days allowance)
        const absentCount = student.attendanceRecords.filter(r => r.status === 'absent').length;
        const risk = perfVal < 50 || absentCount > 6;

        return { perf: perfVal, isRisk: risk };
    }, [student.weeklyAssessments, student.attendanceRecords]);

    return (
        <button
            onClick={() => onSelect(student.id)}
            className={`w-full text-right p-3 mb-2 rounded-2xl transition-all duration-200 flex justify-between items-center group relative border
            ${isSelected
                    ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200 scale-[1.02] z-10'
                    : 'bg-white border-slate-100 text-slate-600 hover:border-violet-200 hover:shadow-md'
                }
            `}
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm relative ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {student.name.charAt(0)}
                    {isRisk && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm z-10">
                            <AlertCircle className="w-2.5 h-2.5 text-white" />
                            <span className="sr-only">At Risk</span>
                        </div>
                    )}
                </div>
                <div>
                    <p className={`font-bold text-sm leading-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                        {student.name}
                    </p>
                    <p className={`text-[10px] mt-0.5 font-mono ${isSelected ? 'text-violet-200' : 'text-slate-400'}`}>{student.id}</p>
                </div>
            </div>

            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-black/20 text-white' : 'bg-slate-50 text-slate-400'}`}>
                {perf}%
            </div>
        </button>
    );
});

const AssessmentEditor = ({
    item,
    onSave,
    onClose
}: {
    item: Assessment,
    onSave: (updated: Assessment) => void,
    onClose: () => void
}) => {
    const [score, setScore] = useState(item.score);
    const [max, setMax] = useState(item.maxScore);
    const [status, setStatus] = useState(item.status);
    const [note, setNote] = useState(item.note || '');
    const [date, setDate] = useState(item.date || new Date().toISOString().split('T')[0]);
    const [subject, setSubject] = useState(item.subject);

    const handleSave = () => {
        onSave({ ...item, subject, score, maxScore: max, status, note, date });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col ring-1 ring-white/20">
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><Edit2 className="w-4 h-4 text-violet-600" /> تعديل التقييم</h3>
                    <button onClick={onClose} className="hover:bg-slate-200 p-2 rounded-full transition-colors text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-6 space-y-5">

                    {/* Subject & Date */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">المادة</label>
                            <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none">
                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">التاريخ</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none" />
                        </div>
                    </div>

                    {/* Status Selection */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">الحالة</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['present', 'absent', 'excused'] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatus(s)}
                                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${status === s
                                        ? s === 'present' ? 'bg-green-50 border-green-200 text-green-700 shadow-sm ring-1 ring-green-200'
                                            : s === 'absent' ? 'bg-red-50 border-red-200 text-red-700 shadow-sm ring-1 ring-red-200'
                                                : 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm ring-1 ring-amber-200'
                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    {s === 'present' ? 'حاضر' : s === 'absent' ? 'غائب' : 'عذر'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Scores (Only if Present) */}
                    {status === 'present' && (
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">الدرجة</label>
                                <input
                                    type="number"
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-center font-black text-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    value={score}
                                    onChange={e => setScore(Number(e.target.value))}
                                />
                            </div>
                            <div className="flex items-center pt-6 text-slate-300 font-bold text-lg">/</div>
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">العظمى</label>
                                <input
                                    type="number"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-black text-2xl text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    value={max}
                                    onChange={e => setMax(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">ملاحظات</label>
                        <textarea
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                            placeholder="اكتب ملاحظة..."
                            rows={2}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 mt-2 flex justify-center items-center gap-2 active:scale-[0.98]"
                    >
                        <Save className="w-4 h-4" />
                        حفظ التغييرات
                    </button>
                </div>
            </div>
        </div>
    );
};

const MonthlyExamEditor = ({
    item,
    onSave,
    onClose
}: {
    item: MonthlyExam,
    onSave: (updated: MonthlyExam) => void,
    onClose: () => void
}) => {
    const [score, setScore] = useState(item.score);
    const [max, setMax] = useState(item.maxScore);
    const [status, setStatus] = useState(item.status);
    const [note, setNote] = useState(item.note || '');
    const [date, setDate] = useState(item.date || new Date().toISOString().split('T')[0]);
    const [subject, setSubject] = useState(item.subject);

    const handleSave = () => {
        onSave({ ...item, subject, score, maxScore: max, status, note, date });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col ring-1 ring-white/20">
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><Edit2 className="w-4 h-4 text-blue-600" /> تعديل الامتحان الشهري</h3>
                    <button onClick={onClose} className="hover:bg-slate-200 p-2 rounded-full transition-colors text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-6 space-y-5">

                    {/* Subject */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">المادة</label>
                        <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">التاريخ</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                    </div>

                    {/* Status Selection */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">الحالة</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['present', 'absent', 'excused'] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatus(s)}
                                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${status === s
                                        ? s === 'present' ? 'bg-green-50 border-green-200 text-green-700 shadow-sm ring-1 ring-green-200'
                                            : s === 'absent' ? 'bg-red-50 border-red-200 text-red-700 shadow-sm ring-1 ring-red-200'
                                                : 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm ring-1 ring-amber-200'
                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    {s === 'present' ? 'حاضر' : s === 'absent' ? 'غائب' : 'عذر'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Scores (Only if Present) */}
                    {status === 'present' && (
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">الدرجة</label>
                                <input
                                    type="number"
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-center font-black text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    value={score}
                                    onChange={e => setScore(Number(e.target.value))}
                                />
                            </div>
                            <div className="flex items-center pt-6 text-slate-300 font-bold text-lg">/</div>
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">العظمى</label>
                                <input
                                    type="number"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-black text-2xl text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    value={max}
                                    onChange={e => setMax(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">ملاحظات</label>
                        <textarea
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                            placeholder="اكتب ملاحظة..."
                            rows={2}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 mt-2 flex justify-center items-center gap-2 active:scale-[0.98]"
                    >
                        <Save className="w-4 h-4" />
                        حفظ التغييرات
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- CLASS OVERVIEW ---
const ClassOverview = ({
    students,
    onAddAnnouncement
}: {
    students: StudentData[],
    onAddAnnouncement: (title: string, content: string, importance: 'normal' | 'high', targetGrade: string) => void
}) => {
    const totalStudents = students.length;
    let totalScore = 0;
    let totalMax = 0;
    students.forEach(s => {
        s.weeklyAssessments.forEach(w => { if (w.status === 'present') { totalScore += w.score; totalMax += w.maxScore; } });
        s.monthlyExams.forEach(m => { if (m.status === 'present') { totalScore += m.score; totalMax += m.maxScore; } });
    });
    const avgPerformance = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
    const atRisk = students.filter(s => {
        let sScore = 0, sMax = 0;
        s.weeklyAssessments.forEach(w => { if (w.status === 'present') { sScore += w.score; sMax += w.maxScore; } });
        const perf = sMax > 0 ? (sScore / sMax) : 0;
        const absent = s.attendanceRecords.filter(r => r.status === 'absent').length;
        return perf < 0.5 || absent > 6;
    });

    const [annTitle, setAnnTitle] = useState('');
    const [annContent, setAnnContent] = useState('');
    const [annImp, setAnnImp] = useState<'normal' | 'high'>('normal');
    const [annGrade, setAnnGrade] = useState<string>('الكل');

    const handlePost = () => {
        if (!annTitle || !annContent) return;
        onAddAnnouncement(annTitle, annContent, annImp, annGrade);
        setAnnTitle('');
        setAnnContent('');
        setAnnImp('normal');
        setAnnGrade('الكل');
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <LayoutDashboard className="w-7 h-7 text-violet-600" />
                لوحة التحكم العامة
            </h2>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-4"><Users className="w-8 h-8" /></div>
                    <div className="text-4xl font-black text-slate-800 mb-1">{totalStudents}</div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">إجمالي الطلاب</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-4"><TrendingUp className="w-8 h-8" /></div>
                    <div className="text-4xl font-black text-slate-800 mb-1">{avgPerformance}<span className="text-xl text-slate-400">%</span></div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">متوسط الأداء</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl mb-4"><AlertCircle className="w-8 h-8" /></div>
                    <div className="text-4xl font-black text-rose-600 mb-1">{atRisk.length}</div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">بحاجة لمتابعة</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* At Risk List */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <div className="w-2 h-6 bg-rose-500 rounded-full"></div>
                            تنبيهات الأداء والغياب
                        </h3>
                        <span className="text-xs bg-rose-50 text-rose-600 px-2 py-1 rounded-lg font-bold">{atRisk.length} طلاب</span>
                    </div>
                    {atRisk.length > 0 ? (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {atRisk.map(s => (
                                <div key={s.id} className="p-3 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-xs text-slate-400 border border-slate-200">{s.name.charAt(0)}</div>
                                        <span className="font-bold text-slate-700 text-sm">{s.name}</span>
                                    </div>
                                    <span className="text-rose-600 text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> في خطر</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-400 text-sm">ممتاز! لا يوجد طلاب في دائرة الخطر حالياً.</div>
                    )}
                </div>

                {/* Announcement Creator */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                            إضافة إعلان جديد
                        </h3>
                        <Megaphone className="w-5 h-5 text-blue-500" />
                    </div>

                    <div className="space-y-4 flex-1">
                        <input
                            type="text"
                            placeholder="عنوان الإعلان"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={annTitle}
                            onChange={(e) => setAnnTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="محتوى الإعلان..."
                            rows={3}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                            value={annContent}
                            onChange={(e) => setAnnContent(e.target.value)}
                        />

                        <div className="flex gap-2">
                            <select
                                value={annGrade}
                                onChange={(e) => setAnnGrade(e.target.value)}
                                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none"
                            >
                                <option value="الكل">جميع الصفوف (الكل)</option>
                                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100">
                                <input
                                    type="checkbox"
                                    checked={annImp === 'high'}
                                    onChange={(e) => setAnnImp(e.target.checked ? 'high' : 'normal')}
                                    className="accent-red-500 w-4 h-4"
                                />
                                هام جداً
                            </label>
                            <button
                                onClick={handlePost}
                                disabled={!annTitle || !annContent}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
                            >
                                <Send className="w-3 h-3" /> نشر للجميع
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
    students, teacherSubject, onUpdateStudent, onBulkUpdate, onDeleteStudent, onLogout, triggerToast
}) => {
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [tab, setTab] = useState<'academics' | 'attendance'>('academics');
    const [mode, setMode] = useState<'details' | 'global_attendance'>('details');
    const [showHelp, setShowHelp] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'id' | 'performance'>('name');
    const [viewSubject, setViewSubject] = useState(teacherSubject); // Local state for filtering, default to teacher's subject
    const [lastSavedId, setLastSavedId] = useState<string | null>(null); // For shimmer effect

    // Edit States
    const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
    const [editingMonthlyExam, setEditingMonthlyExam] = useState<MonthlyExam | null>(null);

    // Confirmation Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Global Attendance State
    const [globalAttDate, setGlobalAttDate] = useState(new Date().toISOString().split('T')[0]);
    const [globalAttLesson, setGlobalAttLesson] = useState('');



    const processedStudents = useMemo(() => {
        let filtered = students.filter(s => s.name.includes(searchTerm) || s.id.includes(searchTerm));
        return filtered.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name, 'ar');
            if (sortBy === 'id') return a.id.localeCompare(b.id);
            const getPerf = (s: StudentData) => {
                const present = s.weeklyAssessments.filter(w => w.status === 'present');
                if (!present.length) return 0;
                return present.reduce((acc, curr) => acc + (curr.score / curr.maxScore), 0) / present.length;
            }
            return getPerf(b) - getPerf(a);
        });
    }, [students, searchTerm, sortBy]);

    const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);

    // Filter assessments based on selected view subject
    const filteredWeeklyAssessments = useMemo(() => {
        if (!selectedStudent) return [];
        if (viewSubject === 'الكل') return selectedStudent.weeklyAssessments;
        return selectedStudent.weeklyAssessments.filter(w => w.subject === viewSubject);
    }, [selectedStudent, viewSubject]);

    const filteredMonthlyExams = useMemo(() => {
        if (!selectedStudent) return [];
        if (viewSubject === 'الكل') return selectedStudent.monthlyExams;
        return selectedStudent.monthlyExams.filter(m => m.subject === viewSubject);
    }, [selectedStudent, viewSubject]);

    // Stable handler for student selection to ensure React.memo works in StudentListItem
    const handleStudentSelect = useCallback((id: string) => {
        setMode('details');
        setSelectedStudentId(id);
    }, []);

    const saveAssessment = useCallback((updated: Assessment) => {
        if (!selectedStudent) return;
        const newWeekly = selectedStudent.weeklyAssessments.map(w => w.id === updated.id ? updated : w);
        onUpdateStudent(selectedStudent.id, { weeklyAssessments: newWeekly });
        setEditingAssessment(null);
        setLastSavedId(updated.id);
        setTimeout(() => setLastSavedId(null), 2000);
        triggerToast('تم الحفظ بنجاح');
    }, [selectedStudent, onUpdateStudent, triggerToast]);

    const saveMonthlyExam = useCallback((updated: MonthlyExam) => {
        if (!selectedStudent) return;
        const newMonthly = selectedStudent.monthlyExams.map(m => m.id === updated.id ? updated : m);
        onUpdateStudent(selectedStudent.id, { monthlyExams: newMonthly });
        setEditingMonthlyExam(null);
        setLastSavedId(updated.id);
        setTimeout(() => setLastSavedId(null), 2000);
        triggerToast('تم تحديث الامتحان الشهري');
    }, [selectedStudent, onUpdateStudent, triggerToast]);

    const addWeek = () => {
        if (!selectedStudent) return;
        const subj = viewSubject === 'الكل' ? teacherSubject : viewSubject;
        const newWeek: Assessment = { id: `new-${Date.now()}`, subject: subj, title: `أسبوع جديد`, score: 0, maxScore: 10, status: 'present', date: new Date().toISOString().split('T')[0] };
        onUpdateStudent(selectedStudent.id, { weeklyAssessments: [...selectedStudent.weeklyAssessments, newWeek] });
        triggerToast('تم إضافة أسبوع جديد');
    };

    const addMonthlyExam = () => {
        if (!selectedStudent) return;
        const subj = viewSubject === 'الكل' ? teacherSubject : viewSubject;
        const newExam: MonthlyExam = { id: `mex-${Date.now()}`, subject: subj, score: 0, maxScore: 50, status: 'present', date: new Date().toISOString().split('T')[0] };
        onUpdateStudent(selectedStudent.id, { monthlyExams: [...selectedStudent.monthlyExams, newExam] });
        triggerToast('تم إضافة امتحان جديد');
    };

    const addAttendanceRecord = (newDate: string, newStatus: any, newLesson: string, newNote?: string, newLateTime?: string) => {
        if (!selectedStudent) return;
        const newRecord: AttendanceRecord = {
            id: `att-${Date.now()}`,
            date: newDate,
            status: newStatus,
            lessonName: newLesson,
            note: newNote,
            lateTime: newLateTime
        };
        onUpdateStudent(selectedStudent.id, { attendanceRecords: [newRecord, ...selectedStudent.attendanceRecords] });
        triggerToast('تم تسجيل الحضور');
    };

    const confirmDeleteStudent = () => {
        if (!selectedStudentId) return;
        onDeleteStudent(selectedStudentId);
        setDeleteModalOpen(false);
        setSelectedStudentId(null);
    };

    const handleAddGlobalAnnouncement = (title: string, content: string, importance: 'normal' | 'high', targetGrade: string) => {
        const newAnnouncement: Announcement = {
            id: `ann-${Date.now()}`,
            title,
            content,
            date: new Date().toISOString().split('T')[0],
            author: 'الإدارة',
            importance,
            targetGrade
        };

        const updates = students.map(s => ({
            id: s.id,
            data: {
                announcements: [newAnnouncement, ...(s.announcements || [])]
            }
        }));
        onBulkUpdate(updates);
        triggerToast('تم نشر الإعلان بنجاح');
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "madrasatuna_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        triggerToast('تم تحميل ملف النسخة الاحتياطية');
    };

    const markGlobalAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;
        const existingRecordIndex = student.attendanceRecords.findIndex(r => r.date === globalAttDate);
        let newRecords = [...student.attendanceRecords];
        const newRecord: AttendanceRecord = {
            id: existingRecordIndex >= 0 ? student.attendanceRecords[existingRecordIndex].id : `att-${Date.now()}-${Math.random()}`,
            date: globalAttDate,
            status: status,
            lessonName: globalAttLesson
        };
        if (existingRecordIndex >= 0) newRecords[existingRecordIndex] = newRecord;
        else newRecords = [newRecord, ...newRecords];
        onUpdateStudent(studentId, { attendanceRecords: newRecords });
    };

    const markAllGlobal = (status: 'present' | 'absent') => {
        const updates = students.map(s => {
            const existingRecordIndex = s.attendanceRecords.findIndex(r => r.date === globalAttDate);
            let newRecords = [...s.attendanceRecords];
            const newRecord: AttendanceRecord = {
                id: existingRecordIndex >= 0 ? s.attendanceRecords[existingRecordIndex].id : `att-${Date.now()}-${Math.random()}`,
                date: globalAttDate,
                status: status,
                lessonName: globalAttLesson
            };
            if (existingRecordIndex >= 0) newRecords[existingRecordIndex] = newRecord;
            else newRecords = [newRecord, ...newRecords];
            return { id: s.id, data: { attendanceRecords: newRecords } };
        });
        onBulkUpdate(updates);
        triggerToast('تم تحديث حالة الجميع');
    };

    const shiftGlobalDate = (days: number) => {
        const date = new Date(globalAttDate);
        date.setDate(date.getDate() + days);
        setGlobalAttDate(date.toISOString().split('T')[0]);
    };

    return (
        <>
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
            {editingAssessment && (
                <AssessmentEditor
                    item={editingAssessment}
                    onClose={() => setEditingAssessment(null)}
                    onSave={saveAssessment}
                />
            )}
            {editingMonthlyExam && (
                <MonthlyExamEditor
                    item={editingMonthlyExam}
                    onClose={() => setEditingMonthlyExam(null)}
                    onSave={saveMonthlyExam}
                />
            )}

            <ConfirmationModal
                isOpen={deleteModalOpen}
                title="حذف سجل الطالب"
                message="هل أنت متأكد من حذف هذا الطالب وجميع بياناته؟ لا يمكن التراجع عن هذا الإجراء."
                onConfirm={confirmDeleteStudent}
                onCancel={() => setDeleteModalOpen(false)}
            />

            <div className="flex flex-col md:flex-row gap-8 h-[85vh] relative animate-in fade-in duration-500">

                {/* ---------------- SIDEBAR ---------------- */}
                <div className={`
        bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col
        w-full md:w-80 md:shrink-0 transition-all duration-300 absolute inset-0 z-20 md:static overflow-hidden
        ${(selectedStudentId && mode === 'details') ? 'translate-x-full opacity-0 pointer-events-none md:translate-x-0 md:opacity-100 md:pointer-events-auto' : 'translate-x-0 opacity-100'}
      `}>

                    {/* Sidebar Header */}
                    <div className="p-6 pb-2 space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-200">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-800 leading-none">الطلاب</h2>
                                    <span className="text-[10px] text-slate-400 font-bold tracking-wide">ادارة الفصل</span>
                                </div>
                            </div>


                        </div>

                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="بحث..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-sm font-bold transition-all placeholder:text-slate-400"
                            />
                            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                        </div>

                        <div className="flex gap-2">
                            {/* Class Overview Button - Allow returning to overview state */}
                            <button
                                onClick={() => { setSelectedStudentId(null); setMode('details'); }}
                                className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-2 ${!selectedStudentId && mode === 'details' ? 'bg-violet-600 text-white border-violet-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                            >
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                نظرة عامة
                            </button>

                            <button
                                onClick={() => setMode(mode === 'details' ? 'global_attendance' : 'details')}
                                className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-2 ${mode === 'global_attendance' ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                رصد جماعي
                            </button>
                        </div>

                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="w-full appearance-none pl-7 pr-3 py-2.5 rounded-xl text-[10px] font-bold border border-slate-200 bg-white hover:bg-slate-50 focus:outline-none text-slate-500 cursor-pointer"
                            >
                                <option value="name">ترتيب: الاسم</option>
                                <option value="id">ترتيب: الرقم</option>
                                <option value="performance">ترتيب: الأداء</option>
                            </select>
                            <ArrowUpDown className="absolute left-3 top-3 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Student List */}
                    <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                        {processedStudents.map(student => (
                            <StudentListItem
                                key={student.id}
                                student={student}
                                isSelected={selectedStudentId === student.id && mode === 'details'}
                                onSelect={handleStudentSelect}
                            />
                        ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                        <button onClick={handleExport} className="flex-1 py-3 text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-colors" title="تصدير">
                            <FileDown className="w-4 h-4" /> النسخ
                        </button>
                        <button onClick={() => setShowHelp(true)} className="flex-1 py-3 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-colors">
                            <HelpCircle className="w-4 h-4" /> مساعدة
                        </button>
                        <button onClick={onLogout} className="flex-1 py-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-colors">
                            <LayoutDashboard className="w-4 h-4" /> خروج
                        </button>
                    </div>
                </div>

                {/* ---------------- MAIN CONTENT ---------------- */}
                <div className={`
         flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col relative
         w-full h-full transition-all duration-300 md:translate-x-0 md:opacity-100
         ${(!selectedStudentId && mode === 'details') ? 'translate-x-[-100%] opacity-0 pointer-events-none md:pointer-events-auto md:translate-x-0 md:opacity-100' : 'translate-x-0 opacity-100'}
      `}>

                    {/* MODE: STUDENT DETAILS */}
                    {mode === 'details' && selectedStudent && (
                        <>
                            {/* Header */}
                            <div className="px-8 py-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-5 w-full md:w-auto">
                                    <button
                                        onClick={() => setSelectedStudentId(null)}
                                        className="md:hidden p-2.5 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-violet-200">
                                            {selectedStudent.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800 leading-none mb-1">
                                                {selectedStudent.name}
                                            </h2>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{selectedStudent.grade}</span>
                                                <span className="text-[10px] font-mono text-slate-300">{selectedStudent.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                    <div className="flex bg-slate-100/80 p-1.5 rounded-2xl w-full md:w-auto">
                                        <button
                                            onClick={() => setTab('academics')}
                                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === 'academics' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            الدرجات
                                        </button>
                                        <button
                                            onClick={() => setTab('attendance')}
                                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === 'attendance' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            الحضور
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setDeleteModalOpen(true)}
                                        className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl transition-colors border border-red-100"
                                        title="حذف الطالب"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
                                {tab === 'academics' && (
                                    <div className="space-y-8">
                                        {/* Filter Bar */}
                                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                                            <div className="p-2 bg-violet-50 text-violet-600 rounded-lg"><Filter className="w-4 h-4" /></div>
                                            <span className="text-xs font-bold text-slate-500">عرض مادة:</span>
                                            <select
                                                value={viewSubject}
                                                onChange={(e) => setViewSubject(e.target.value)}
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl text-sm p-2 font-bold text-slate-700 focus:outline-none"
                                            >
                                                <option value="الكل">الكل</option>
                                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>

                                        {/* Weekly Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                                    <span className="w-2 h-6 bg-violet-500 rounded-full"></span>
                                                    التقييمات الأسبوعية {viewSubject !== 'الكل' ? `(${viewSubject})` : ''}
                                                </h3>
                                                <button onClick={addWeek} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center gap-2 transition-all shadow-lg shadow-slate-200 active:scale-95">
                                                    <Plus className="w-4 h-4" /> أسبوع جديد
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                                {filteredWeeklyAssessments.map((w, idx) => (
                                                    <button
                                                        key={w.id}
                                                        onClick={() => setEditingAssessment(w)}
                                                        className={`
                                        relative p-5 rounded-3xl border transition-all hover:-translate-y-1 hover:shadow-xl group text-right flex flex-col justify-between h-36
                                        ${lastSavedId === w.id ? 'ring-4 ring-green-300 animate-pulse bg-green-50 border-green-300' : ''}
                                        ${w.status === 'present' ? 'bg-white border-slate-100 hover:border-violet-200 hover:shadow-violet-100' :
                                                                w.status === 'absent' ? 'bg-red-50/30 border-red-100 hover:border-red-200' : 'bg-amber-50/30 border-amber-100 hover:border-amber-200'}
                                    `}
                                                    >
                                                        <div className="flex justify-between items-start w-full">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[80px]">{w.subject}</span>
                                                            {w.status === 'present' && <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_theme('colors.green.400')]"></div>}
                                                        </div>
                                                        <div className="text-[9px] font-bold text-slate-800 mt-1">{w.title}</div>

                                                        <div className="self-center">
                                                            {w.status === 'present' ? (
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-4xl font-black text-slate-800">{w.score}</span>
                                                                    <span className="text-xs text-slate-400 font-bold">/{w.maxScore}</span>
                                                                </div>
                                                            ) : (
                                                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${w.status === 'absent' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                                                    {w.status === 'absent' ? 'غائب' : 'عذر'}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex justify-between items-end w-full">
                                                            <span className="text-[9px] text-slate-300 font-mono tracking-widest">{w.date ? w.date.slice(5) : '--'}</span>
                                                            <Edit2 className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </button>
                                                ))}
                                                {filteredWeeklyAssessments.length === 0 && (
                                                    <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-sm">
                                                        لا توجد تقييمات لهذه المادة
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Monthly Section */}
                                        <div className="space-y-4 pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                                                    الامتحانات الشهرية {viewSubject !== 'الكل' ? `(${viewSubject})` : ''}
                                                </h3>
                                                <button onClick={addMonthlyExam} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 flex items-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95">
                                                    <Plus className="w-4 h-4" /> امتحان جديد
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                {filteredMonthlyExams.map((m, idx) => (
                                                    <button
                                                        key={m.id}
                                                        onClick={() => setEditingMonthlyExam(m)}
                                                        className={`
                                        bg-white p-5 rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/50 transition-all group flex items-center justify-between text-right
                                        ${lastSavedId === m.id ? 'ring-4 ring-blue-300 animate-pulse bg-blue-50 border-blue-300' : ''}
                                    `}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                                <BookOpen className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-800 text-sm mb-1">{m.subject}</h4>
                                                                {m.status === 'present' ? (
                                                                    <div className="flex items-baseline gap-1 text-xs">
                                                                        <span className="font-black text-slate-900 text-lg">{m.score}</span>
                                                                        <span className="text-slate-400 font-bold">من {m.maxScore}</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-red-500 font-bold">غائب</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Edit2 className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                ))}
                                                {filteredMonthlyExams.length === 0 && (
                                                    <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-sm">
                                                        لا توجد امتحانات مسجلة
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {tab === 'attendance' && (
                                    <AttendanceSingleView student={selectedStudent} onAdd={addAttendanceRecord} />
                                )}
                            </div>
                        </>
                    )}

                    {/* MODE: GLOBAL ATTENDANCE */}
                    {mode === 'global_attendance' && (
                        <div className="flex flex-col h-full bg-slate-50/50">
                            <div className="px-8 py-8 bg-white border-b border-slate-100 flex flex-col gap-6 sticky top-0 z-30">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">الرصد الجماعي</h2>
                                        <p className="text-slate-500 text-sm">قم بتسجيل الحضور للجميع دفعة واحدة أو بشكل فردي.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => markAllGlobal('present')} className="px-5 py-2.5 bg-white text-green-700 border border-slate-200 rounded-xl text-xs font-bold hover:bg-green-50 hover:border-green-200 transition-colors shadow-sm">الكل حاضر</button>
                                        <button onClick={() => markAllGlobal('absent')} className="px-5 py-2.5 bg-white text-red-700 border border-slate-200 rounded-xl text-xs font-bold hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm">الكل غائب</button>
                                    </div>
                                </div>

                                <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 items-center">
                                    <button onClick={() => shiftGlobalDate(-1)} className="p-2.5 bg-white hover:bg-slate-50 rounded-xl transition-all shadow-sm border border-slate-200 text-slate-500 hover:text-slate-800"><ChevronRight className="w-4 h-4" /></button>
                                    <input type="date" value={globalAttDate} onChange={e => setGlobalAttDate(e.target.value)} className="flex-1 p-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-bold text-slate-600 shadow-sm" />
                                    <button onClick={() => shiftGlobalDate(1)} className="p-2.5 bg-white hover:bg-slate-50 rounded-xl transition-all shadow-sm border border-slate-200 text-slate-500 hover:text-slate-800"><ChevronLeft className="w-4 h-4" /></button>

                                    <input type="text" placeholder="اسم الحصة (اختياري)..." value={globalAttLesson} onChange={e => setGlobalAttLesson(e.target.value)} className="flex-[2] p-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 shadow-sm" />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                                    <table className="w-full text-right">
                                        <thead className="bg-slate-50/80 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 backdrop-blur-sm sticky top-0">
                                            <tr>
                                                <th className="px-6 py-5">الطالب</th>
                                                <th className="px-6 py-5">الحالة الحالية</th>
                                                <th className="px-6 py-5 text-center">تغيير الحالة</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {students.map(s => {
                                                const record = s.attendanceRecords.find(r => r.date === globalAttDate);
                                                const status = record ? record.status : 'pending';
                                                return (
                                                    <tr key={s.id} className="hover:bg-blue-50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-700 text-sm">{s.name}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.id}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${status === 'present' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                status === 'absent' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    status === 'late' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                        'bg-slate-100 text-slate-400 border-slate-200'
                                                                }`}>
                                                                {status === 'present' && <Check className="w-3 h-3" />}
                                                                {status === 'absent' && <X className="w-3 h-3" />}
                                                                {status === 'pending' ? 'غير مسجل' : status === 'present' ? 'حاضر' : status === 'absent' ? 'غائب' : 'متأخر'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => markGlobalAttendance(s.id, 'present')} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${status === 'present' ? 'bg-green-500 text-white shadow-md border-green-600 scale-110' : 'bg-white text-slate-400 border-slate-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200'}`} title="حاضر"><Check className="w-4 h-4" /></button>
                                                                <button onClick={() => markGlobalAttendance(s.id, 'absent')} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${status === 'absent' ? 'bg-red-500 text-white shadow-md border-red-600 scale-110' : 'bg-white text-slate-400 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'}`} title="غائب"><X className="w-4 h-4" /></button>
                                                                <button onClick={() => markGlobalAttendance(s.id, 'late')} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${status === 'late' ? 'bg-amber-500 text-white shadow-md border-amber-600 scale-110' : 'bg-white text-slate-400 border-slate-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200'}`} title="متأخر"><ClockIcon /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* EMPTY STATE - REPLACED WITH CLASS OVERVIEW */}
                    {mode === 'details' && !selectedStudent && (
                        <ClassOverview students={students} onAddAnnouncement={handleAddGlobalAnnouncement} />
                    )}
                </div>
            </div>
        </>
    );
};

const AttendanceSingleView = ({ student, onAdd }: { student: StudentData, onAdd: (d: string, s: any, l: string, n?: string, t?: string) => void }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState('present');
    const [lesson, setLesson] = useState('');
    const [note, setNote] = useState('');
    const [lateTime, setLateTime] = useState('');

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">
                <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Plus className="w-4 h-4" /></div>
                    تسجيل حضور جديد
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">التاريخ</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">الحالة</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium">
                            <option value="present">حاضر</option>
                            <option value="absent">غائب</option>
                            <option value="late">متأخر</option>
                            <option value="excused">عذر</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">اسم الحصة / الدرس</label>
                        <input type="text" value={lesson} onChange={e => setLesson(e.target.value)} placeholder="مثال: جبر" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium" />
                    </div>

                    {/* Conditional Input for Late Time */}
                    {status === 'late' && (
                        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                            <label className="block text-[10px] font-bold text-amber-500 mb-2 uppercase tracking-wide">وقت الحضور</label>
                            <input
                                type="time"
                                value={lateTime}
                                onChange={e => setLateTime(e.target.value)}
                                className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-bold text-amber-700"
                            />
                        </div>
                    )}

                    <div className={status === 'late' ? 'col-span-full' : ''}>
                        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">ملاحظة (سبب الغياب)</label>
                        <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="مثال: مرضي" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium" />
                    </div>
                </div>
                <button onClick={() => onAdd(date, status, lesson, note, lateTime)} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]">
                    إضافة للسجل
                </button>
            </div>

            <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-500 px-2">السجل السابق</h3>
                {student.attendanceRecords && student.attendanceRecords.length > 0 ? (
                    student.attendanceRecords.map(rec => (
                        <div key={rec.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-slate-300 transition-colors group shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="font-mono text-slate-500 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 group-hover:bg-white transition-colors">{rec.date}</div>
                                <div>
                                    <div className="font-bold text-slate-700 text-sm">{rec.lessonName || '-'}</div>
                                    {(rec.status === 'absent' || rec.status === 'excused' || rec.status === 'late') && (rec.note || rec.lateTime) && (
                                        <div className="flex gap-2 mt-1">
                                            {rec.note && <div className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded inline-block border border-slate-100">{rec.note}</div>}
                                            {rec.lateTime && <div className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded inline-block border border-amber-100 font-mono font-bold">{rec.lateTime}</div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                {rec.status === 'present' && <span className="text-green-600 bg-green-50 px-3 py-1 rounded-lg text-xs font-bold border border-green-100">حاضر</span>}
                                {rec.status === 'absent' && <span className="text-red-600 bg-red-50 px-3 py-1 rounded-lg text-xs font-bold border border-red-100">غائب</span>}
                                {rec.status === 'late' && <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-xs font-bold border border-amber-100">متأخر</span>}
                                {rec.status === 'excused' && <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100">بعذر</span>}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-sm">لا يوجد سجلات حضور</div>
                )}
            </div>
        </div>
    );
};

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);