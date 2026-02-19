
export interface User {
  id: string;
  username: string;
  gemini_api_key?: string | null;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Flashcard {
  id: string;
  user_id: string;
  subject_id: string;
  question: string;
  answer: string;
  created_at: string;
}
