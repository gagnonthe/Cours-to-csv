
export interface QAPair {
  question: string;
  answer: string;
}

export interface GenerationStatus {
  loading: boolean;
  error: string | null;
  success: boolean;
}
