export interface Choice {
  id: string;
  choiceText: string;
  createdAt: string;
}

export interface Response {
  id: string;
  responseText: string;
  createdAt: string;
  choice?: {
    id: string;
    choiceText: string;
  };
  question: {
    id: string;
    questionText: string;
  };
}

export interface Question {
  id: string;
  questionText: string;
  questionType: string;
  pubDate: string;
  editDate: string | null;
  choices: Choice[];
  responses: Response[];
}

export interface CacheData {
  questions: Question[];
}

export type Order = 'asc' | 'desc';
export type OrderBy = 'pubDate' | 'editDate' | 'questionType'; 