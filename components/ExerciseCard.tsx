
import React from 'react';
import { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdateWeight: (weight: number) => void;
  onViewProgress: () => void;
  onEdit: () => void;
  darkMode: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onUpdateWeight, onViewProgress, onEdit, darkMode }) => {
  return (
    <div className={`p-4 rounded-2xl shadow-sm border mb-4 transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
      <div className="flex gap-4 items-start">
        {exercise.image ? (
          <img src={exercise.image} alt={exercise.name} className="w-20 h-20 rounded-xl object-cover bg-gray-100" />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-indigo-50 dark:bg-slate-700 flex items-center justify-center text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v8H2V8Z"/><path d="M6 12v.01"/><path d="M10 12v.01"/><path d="M14 12v.01"/></svg>
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold leading-tight">{exercise.name}</h3>
            <button onClick={onEdit} className="p-1 text-gray-400 hover:text-indigo-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
          </div>
          <div className="mt-1">
            <p className={`text-xs font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
              {exercise.muscleType} ({exercise.position})
            </p>
            {exercise.secondaryMuscles && exercise.secondaryMuscles.trim() !== '' && (
              <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                مساعدة: {exercise.secondaryMuscles}
              </p>
            )}
          </div>
          <div className="mt-2 flex gap-4 text-sm font-medium">
            <span className="flex items-center gap-1">
              <span className="text-indigo-500">جولات:</span> {exercise.sets}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-indigo-500">تكرار:</span> {exercise.reps}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold">الوزن:</label>
          <input 
            type="number" 
            value={exercise.weight || ''} 
            onChange={(e) => onUpdateWeight(parseFloat(e.target.value) || 0)}
            placeholder="0"
            className={`w-24 text-center py-2 rounded-xl text-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200 shadow-inner'}`}
          />
          <span className="text-xs text-gray-400">كغ</span>
        </div>
        <button 
          onClick={onViewProgress}
          className="flex items-center gap-2 text-indigo-500 font-bold px-3 py-2 rounded-xl active:bg-indigo-50 dark:active:bg-indigo-900/20 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 20-4-4-4 4"/><path d="m5 4 4 4 4-4"/><path d="M15 16H9V8h6Z"/></svg>
          التقدم
        </button>
      </div>
    </div>
  );
};

export default ExerciseCard;
