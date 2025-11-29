export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string; // Why this is the correct/incorrect answer (in English)
}

export interface LearningCard {
  word: string;
  phonetic?: string;
  definition: string; // English definition
  options: Option[];
  imageUrl?: string; // Base64 or URL of the generated image
}

export enum GameState {
  LOADING,
  PLAYING,
  SUCCESS,
  ERROR,
  FINISHED
}