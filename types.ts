
export type MuscleType = 'صدر' | 'ظهر' | 'أرجل' | 'أكتاف' | 'ذراع' | 'بطن';
export type Position = 'علوي' | 'وسط' | 'سفلي' | 'أمامي' | 'خلفي';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  image?: string;
  muscleType: MuscleType;
  secondaryMuscles?: string; 
  position: Position;
  history: WeightLog[];
}

export interface WeightLog {
  date: string;
  weight: number;
}

export interface DaySchedule {
  id: string;
  name: string;
  isRest: boolean;
  exercises: Exercise[];
}

export type ViewState = 'HOME' | 'DAY_DETAIL' | 'PROGRESS' | 'EDIT_EXERCISE' | 'SETTINGS';
