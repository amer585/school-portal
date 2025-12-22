import React, { useState } from 'react';
import { StudentData } from '../App';
import { Users, BookOpen, Trash2, Edit2, Save, X } from 'lucide-react';

interface TeacherDashboardProps {
    students: StudentData[];
    teacherSubject: string;
    onUpdateStudent: (id: string, data: Partial<StudentData>) => void;
    onBulkUpdate: (updates: { id: string, data: Partial<StudentData> }[]) => void;
    onDeleteStudent: (id: string) => void;
    onLogout: () => void;
    triggerToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
    students,
    teacherSubject,
    onDeleteStudent,
    onUpdateStudent,
    onLogout
}) => {
    const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
    const [tempScore, setTempScore] = useState<string>('');

    const startEdit = (student: StudentData) => {
        // Find existing score for the first monthly exam of this subject, or default
        const exam = student.monthlyExams.find(e => e.subject === teacherSubject);
        setEditingGradeId(student.id);
        setTempScore(exam ? exam.score.toString() : '0');
    };

    const saveEdit = (student: StudentData) => {
        const score = parseFloat(tempScore);
        if (isNaN(score) || score < 0 || score > 100) {
            alert("Please enter a valid score (0-100)");
            return;
        }

        // Create or update the monthly exam record for this subject
        // We need to construct a proper MonthlyExam object updates
        // Since we are updating, we need to know if an exam exists to get its ID, or generate a temporary one for creation
        const existingExam = student.monthlyExams.find(e => e.subject === teacherSubject);
        const examId = existingExam ? existingExam.id : `m-${Date.now()}`;

        const updatedExams = [...student.monthlyExams];
        const examIndex = updatedExams.findIndex(e => e.subject === teacherSubject);

        const newExamRecord = {
            id: examId,
            subject: teacherSubject,
            score: score,
            maxScore: 100, // Default max
            status: 'present' as const,
            date: new Date().toISOString().split('T')[0]
        };

        if (examIndex >= 0) {
            updatedExams[examIndex] = { ...updatedExams[examIndex], ...newExamRecord };
        } else {
            updatedExams.push(newExamRecord);
        }

        onUpdateStudent(student.id, { monthlyExams: updatedExams });
        setEditingGradeId(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">إجمالي الطلاب</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{students.length}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">المادة الحالية</p>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{teacherSubject}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">قائمة الطلاب</h2>
                    <button onClick={onLogout} className="text-sm text-red-500 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        تسجيل الخروج
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 text-sm">
                            <tr>
                                <th className="p-4 rounded-tr-xl">اسم الطالب</th>
                                <th className="p-4">الرقم القومي</th>
                                <th className="p-4">الصف</th>
                                <th className="p-4">درجة الشهر ({teacherSubject})</th>
                                <th className="p-4 rounded-tl-xl">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            {students.map(student => {
                                const exam = student.monthlyExams.find(e => e.subject === teacherSubject);
                                const isEditing = editingGradeId === student.id;

                                return (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <td className="p-4 font-medium">{student.name}</td>
                                        <td className="p-4 font-mono text-xs">{student.id}</td>
                                        <td className="p-4 text-sm">{student.grade}</td>
                                        <td className="p-4">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={tempScore}
                                                    onChange={e => setTempScore(e.target.value)}
                                                    className="w-20 px-2 py-1 rounded border border-blue-500 focus:outline-none dark:bg-slate-800"
                                                />
                                            ) : (
                                                <span className={`px-2 py-1 rounded text-sm font-bold ${exam ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                                    {exam ? exam.score : '-'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <button onClick={() => saveEdit(student)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Save className="w-4 h-4" /></button>
                                                        <button onClick={() => setEditingGradeId(null)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => startEdit(student)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => onDeleteStudent(student.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
