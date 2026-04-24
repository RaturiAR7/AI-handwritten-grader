export interface ExtractedAnswer {
  questionId: string;
  studentAnswer: string;
  questionText?: string;
}

export interface GradeResult {
  questionId: string;
  studentAnswer: string;
  correctAnswer: string;
  score: number;
  feedback: string;
}

export interface graderNodeParams {
  questionId: string;
  studentAnswer: string;
  correctAnswer: string | null;
  questionText?: string;
}
