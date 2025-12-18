export const SUBJECTS = [
    "اللغة العربية",
    "اللغة الإنجليزية",
    "الرياضيات",
    "العلوم",
    "الدراسات الاجتماعية",
    "التربية الدينية",
    "الحاسب الآلي",
    "التربية الفنية"
] as const;

export const GRADES = [
    "الاول الإعدادي",
    "الثاني الإعدادي",
    "الثالث الإعدادي"
] as const;

export interface Assessment {
    id: string;
    student_id?: string;
    subject: string;
    title: string;
    score: number;
    maxScore: number;
    status: 'present' | 'absent' | 'excused' | 'late';
    note?: string;
    date?: string;
}

export interface MonthlyExam {
    id: string;
    student_id?: string;
    subject: string;
    score: number;
    maxScore: number;
    status: 'present' | 'absent' | 'excused';
    note?: string;
    date?: string;
}

export interface AttendanceRecord {
    id: string;
    student_id?: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    lessonName?: string;
    note?: string;
    lateTime?: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
    author: string;
    importance: 'normal' | 'high';
    targetGrade: string;
}

export interface StudentData {
    id: string; // Internal UUID
    national_id: string; // The login ID
    name: string;
    grade: string;
    weeklyAssessments?: Assessment[];
    monthlyExams?: MonthlyExam[];
    attendanceRecords?: AttendanceRecord[];
    announcements?: Announcement[];
}
