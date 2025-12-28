export interface SurveyResult {
  id: string; // Internal UUID
  studentId: string; // User entered Student ID
  timestamp: string;
  Q11: number | null;
  Q12: number | null;
  Q13: number | null;
  Q14: number | null;
  Q15: number | null;
  Q16: number | null;
  Q17: number | null;
  Q18: number | null;
  Q19: number | null;
  Q20: number | null;
  Q21: number | null;
  Q22: number | null;
  Q23: number | null;
  Q24: number | null;
  [key: string]: number | string | null | string[];
}

export interface Side2Result {
  id: string; // Internal UUID
  studentId: string;
  timestamp: string;
  Q1: number; // Count
  Q2: string; // Time per time
  Q3: string; // Reason
  Q4: string[]; // Thoughts (Multi-select)
  Q5: string; // Measures
  Q6: number | null; // Self rating 1-5
  Q7: number | null; // Impact 1-5
  Q8: string; // Focus
  Q9: string; // Distraction
  Q10: number | null; // Lecture interest 1-5
  [key: string]: number | string | null | string[];
}

export type ProcessingStatus = 'idle' | 'capturing' | 'processing' | 'success' | 'error';