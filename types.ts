export interface ReviewData {
  date: string;
  sentiment: number; // 0 to 100
  snippet: string;
}

export interface ActionableItem {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface WordFrequency {
  text: string;
  value: number; // Frequency or weight
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface AnalysisResult {
  reviews: ReviewData[];
  summary: ActionableItem[];
  wordCloud: WordFrequency[];
  overallSentiment: number;
  totalReviews: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  isThinking?: boolean;
}