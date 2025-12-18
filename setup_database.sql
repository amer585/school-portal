-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    national_id VARCHAR(14) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create assessments table (weekly assessments)
CREATE TABLE IF NOT EXISTS assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    score DECIMAL(5,2) NOT NULL DEFAULT 0,
    max_score DECIMAL(5,2) NOT NULL DEFAULT 100,
    status VARCHAR(20) NOT NULL DEFAULT 'present',
    note TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create monthly_exams table
CREATE TABLE IF NOT EXISTS monthly_exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    score DECIMAL(5,2) NOT NULL DEFAULT 0,
    max_score DECIMAL(5,2) NOT NULL DEFAULT 100,
    status VARCHAR(20) NOT NULL DEFAULT 'present',
    note TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'present',
    lesson_name VARCHAR(255),
    note TEXT,
    late_time VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    author VARCHAR(255) NOT NULL,
    importance VARCHAR(20) NOT NULL DEFAULT 'normal',
    target_grade VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (read all)
CREATE POLICY "Allow anonymous read access" ON students FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON assessments FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON monthly_exams FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON attendance_records FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON announcements FOR SELECT USING (true);

-- Create policies for authenticated insert/update/delete
CREATE POLICY "Allow authenticated full access" ON students FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access" ON assessments FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access" ON monthly_exams FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access" ON attendance_records FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access" ON announcements FOR ALL USING (true);

-- Insert sample data for testing
INSERT INTO students (national_id, name, grade) VALUES 
    ('12345678901234', 'أحمد محمد علي', 'الاول الإعدادي'),
    ('12345678901235', 'محمد أحمد حسن', 'الثاني الإعدادي'),
    ('12345678901236', 'سارة محمود إبراهيم', 'الثالث الإعدادي');

-- Insert sample announcement
INSERT INTO announcements (title, content, author, importance, target_grade) VALUES
    ('إعلان هام', 'مرحباً بكم في بوابة مدرستنا الإلكترونية', 'إدارة المدرسة', 'high', 'الكل');
