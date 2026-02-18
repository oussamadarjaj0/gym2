
import { DaySchedule } from './types';

export const INITIAL_DAYS: DaySchedule[] = [
  { id: 'mon', name: 'الاثنين', isRest: false, exercises: [] },
  { id: 'tue', name: 'الثلاثاء', isRest: false, exercises: [] },
  { id: 'wed', name: 'الأربعاء', isRest: false, exercises: [] },
  { id: 'thu', name: 'الخميس', isRest: false, exercises: [] },
  { id: 'fri', name: 'الجمعة', isRest: false, exercises: [] },
  { id: 'sat', name: 'السبت', isRest: false, exercises: [] },
  { id: 'sun', name: 'الأحد (راحة)', isRest: true, exercises: [] },
];

export const MUSCLE_TYPES = ['صدر', 'ظهر', 'أرجل', 'أكتاف', 'ذراع', 'بطن'] as const;
export const POSITIONS = ['علوي', 'وسط', 'سفلي', 'أمامي', 'خلفي'] as const;
