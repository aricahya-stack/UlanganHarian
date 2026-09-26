export type Role = 'super_admin' | 'teacher' | 'student';
export type ExamStatus = 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'CLOSED';
export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
export type ResultVisibility = 'immediate' | 'after_exam_closed' | 'manual_publish' | 'hidden';
export type SaveStatus = 'synced' | 'syncing' | 'offline' | 'error' | 'local-only';

export interface User {
  userId: string;
  name: string;
  username: string;
  className?: string;
  subject?: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Session {
  token: string;
  user: User;
  expiresAt: string;
}

export interface ExamSummary {
  examId: string;
  title: string;
  subject: string;
  className: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  questionCount: number;
  status: ExamStatus;
  resultVisibility: ResultVisibility;
  attemptStatus?: AttemptStatus;
  attemptId?: string;
  score?: number | null;
  tokenRequired?: boolean;
}

export interface ExamConfig extends ExamSummary {
  instructions: string;
  randomizeQuestion: boolean;
  randomizeOption: boolean;
  attemptPolicy: 'single' | 'allow_reset_by_admin';
}

export interface QuestionOption {
  key: string;
  label: string;
}

export interface Question {
  questionId: string;
  number: number;
  text: string;
  options: QuestionOption[];
  imageUrl?: string | null;
  imageFileId?: string | null;
  difficulty?: string;
  tag?: string;
}

export interface Attempt {
  attemptId: string;
  examId: string;
  studentId: string;
  startedAt: string;
  expiresAt: string;
  serverTime: string;
  revision: number;
  status: AttemptStatus;
  questionCount: number;
  batchSize: number;
  exam: ExamConfig;
}

export interface StartExamResponse {
  attempt: Attempt;
  initialQuestions: Question[];
  offset: number;
  hasMore: boolean;
}

export interface ResumeAttemptResponse {
  attempt: Attempt;
  answers: Record<string, string>;
  questions: Question[];
  offset: number;
  hasMore: boolean;
}

export interface SaveAnswersResponse {
  attemptId: string;
  revision: number;
  lastSyncAt: string;
}

export interface SubmitResponse {
  submissionId: string;
  attemptId: string;
  accepted: boolean;
  alreadySubmitted?: boolean;
  submittedAt: string;
  result?: ExamResult | null;
}

export interface ExamResult {
  examId: string;
  attemptId: string;
  title: string;
  subject: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  questionCount: number;
  submittedAt: string;
  visible: boolean;
}

export interface PreflightResult {
  online: boolean;
  storageAvailable: boolean;
  indexedDbAvailable: boolean;
  quotaBytes?: number;
  usageBytes?: number;
  message?: string;
}

export interface DashboardStats {
  activeExams: number;
  upcomingExams: number;
  students: number;
  inProgress: number;
  submitted: number;
  notSubmitted: number;
}

export interface ExamRecord extends ExamConfig {
  token?: string;
  instructions: string;
  ownerId?: string;
  ownerName?: string;
}

export interface QuestionRecord {
  questionId: string;
  examId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer?: string;
  score?: number;
  imageFileId?: string;
  imageUrl?: string;
  difficulty: string;
  tag: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface StudentRecord extends User {
  className: string;
}

export interface TeacherRecord extends User {
  subject: string;
}

export interface TeacherInput {
  userId?: string;
  name: string;
  username: string;
  subject: string;
  password?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface MonitoringRow {
  attemptId: string;
  studentId: string;
  studentName: string;
  className: string;
  examId: string;
  examTitle: string;
  status: AttemptStatus;
  startedAt: string;
  lastSyncAt: string;
  revision: number;
  submittedAt?: string;
}

export interface AdminResultRow {
  submissionId: string;
  attemptId: string;
  studentId: string;
  studentName: string;
  className: string;
  examId: string;
  examTitle: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  submittedAt: string;
}

export interface AdminExamInput {
  examId?: string;
  ownerId?: string;
  title: string;
  subject: string;
  className: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  questionCount: number;
  status: ExamStatus;
  randomizeQuestion: boolean;
  randomizeOption: boolean;
  resultVisibility: ResultVisibility;
  token?: string;
  attemptPolicy: 'single' | 'allow_reset_by_admin';
  instructions: string;
}

export interface AdminQuestionInput {
  questionId?: string;
  examId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  score: number;
  imageFileId?: string;
  difficulty: string;
  tag: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AdminStudentInput {
  userId?: string;
  name: string;
  username: string;
  className: string;
  password?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UploadImageResponse {
  fileId: string;
  imageUrl: string;
  name: string;
}
