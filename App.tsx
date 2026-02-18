
import React, { useState, useEffect, useCallback } from 'react';
import { DaySchedule, ViewState, Exercise, MuscleType, Position } from './types';
import { INITIAL_DAYS, MUSCLE_TYPES, POSITIONS } from './constants';
import { saveToLocal, loadFromLocal, saveSettings, loadSettings, clearAllData } from './utils/storage';
import Layout from './components/Layout';
import ExerciseCard from './components/ExerciseCard';
import RestTimer from './components/RestTimer';
import ProgressChart from './components/ProgressChart';

const App: React.FC = () => {
  const [days, setDays] = useState<DaySchedule[]>(INITIAL_DAYS);
  const [darkMode, setDarkMode] = useState(false);
  const [viewState, setViewState] = useState<ViewState>('HOME');
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [isEditingNames, setIsEditingNames] = useState(false);
  
  // Exercise Form State
  const [formExercise, setFormExercise] = useState<Partial<Exercise>>({
    name: '',
    sets: 3,
    reps: 12,
    muscleType: 'صدر',
    secondaryMuscles: '',
    position: 'وسط',
    weight: 0
  });

  // Load Data & Settings
  useEffect(() => {
    const saved = loadFromLocal();
    if (saved) setDays(saved);
    
    const settings = loadSettings();
    if (settings) setDarkMode(settings.darkMode);
  }, []);

  // Sync Data
  useEffect(() => {
    saveToLocal(days);
  }, [days]);

  // Sync Settings
  useEffect(() => {
    saveSettings({ darkMode });
  }, [darkMode]);

  const activeDay = days.find(d => d.id === selectedDayId);
  const activeExercise = activeDay?.exercises.find(e => e.id === selectedExerciseId);

  const updateWeight = (dayId: string, exerciseId: string, weight: number) => {
    setDays(prev => prev.map(d => {
      if (d.id !== dayId) return d;
      return {
        ...d,
        exercises: d.exercises.map(e => {
          if (e.id !== exerciseId) return e;
          const lastLog = e.history[e.history.length - 1];
          const newHistory = [...e.history];
          const today = new Date().toISOString().split('T')[0];
          
          if (!lastLog || lastLog.date !== today) {
            newHistory.push({ date: today, weight });
          } else {
            newHistory[newHistory.length - 1].weight = weight;
          }
          
          return { ...e, weight, history: newHistory };
        })
      };
    }));
  };

  const handleAddOrUpdateExercise = () => {
    if (!formExercise.name || !selectedDayId) return;

    setDays(prev => prev.map(d => {
      if (d.id !== selectedDayId) return d;
      
      const newExercise: Exercise = {
        id: formExercise.id || Math.random().toString(36).substr(2, 9),
        name: formExercise.name!,
        sets: formExercise.sets!,
        reps: formExercise.reps!,
        muscleType: formExercise.muscleType!,
        secondaryMuscles: formExercise.secondaryMuscles || '',
        position: formExercise.position!,
        weight: formExercise.weight || 0,
        image: formExercise.image,
        history: formExercise.history || []
      };

      const existingIndex = d.exercises.findIndex(e => e.id === formExercise.id);
      let newExercises = [...d.exercises];
      
      if (existingIndex > -1) {
        newExercises[existingIndex] = newExercise;
      } else {
        newExercises.push(newExercise);
      }

      return { ...d, exercises: newExercises };
    }));

    setViewState('DAY_DETAIL');
    setFormExercise({ name: '', sets: 3, reps: 12, muscleType: 'صدر', secondaryMuscles: '', position: 'وسط', weight: 0 });
  };

  const deleteExercise = (dayId: string, exerciseId: string) => {
    if (!confirm('هل أنت متأكد من حذف التمرين؟')) return;
    setDays(prev => prev.map(d => {
      if (d.id !== dayId) return d;
      return { ...d, exercises: d.exercises.filter(e => e.id !== exerciseId) };
    }));
    setViewState('DAY_DETAIL');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormExercise(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renameDay = (id: string, newName: string) => {
    setDays(prev => prev.map(d => d.id === id ? { ...d, name: newName } : d));
  };

  const toggleRestDay = (id: string) => {
    setDays(prev => prev.map(d => d.id === id ? { ...d, isRest: !d.isRest } : d));
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(days));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `gym_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          setDays(json);
          alert('تم استيراد البيانات بنجاح');
        }
      } catch (err) {
        alert('خطأ في تنسيق الملف');
      }
    };
    reader.readAsText(file);
  };

  // Rendering logic
  const renderHome = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4 px-2">
        <div>
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">
            {isEditingNames ? 'تعديل الجدول' : 'برنامجك الأسبوعي'}
          </h2>
          {isEditingNames && <p className="text-[10px] text-indigo-500 font-bold">اكتب الاسم مباشرة في الخانة</p>}
        </div>
        <button 
          onClick={() => setIsEditingNames(!isEditingNames)}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm ${
            isEditingNames 
            ? 'bg-indigo-600 text-white shadow-indigo-200' 
            : 'bg-white dark:bg-slate-800 text-indigo-600 border border-indigo-100 dark:border-slate-700'
          }`}
        >
          {isEditingNames ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              حفظ
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              تعديل النظام
            </>
          )}
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {days.map((day) => (
          <div key={day.id} className={`relative transition-all ${isEditingNames ? 'scale-[1.02]' : ''}`}>
            <div
              className={`w-full p-5 rounded-[2rem] flex items-center justify-between transition-all text-right border-2 ${
                day.isRest 
                ? (darkMode ? 'bg-slate-800/30 text-slate-600 border-slate-700/30' : 'bg-gray-100/50 text-gray-400 border-gray-200/50 opacity-80')
                : (darkMode ? 'bg-slate-800 border-slate-700 shadow-lg' : 'bg-white border-white shadow-xl shadow-indigo-100/50')
              }`}
            >
              <div 
                className={`flex items-center gap-4 flex-1`}
                onClick={() => {
                  if (!isEditingNames && !day.isRest) {
                    setSelectedDayId(day.id);
                    setViewState('DAY_DETAIL');
                  }
                }}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${day.isRest ? 'bg-gray-200 dark:bg-slate-700' : 'bg-indigo-600 text-white'}`}>
                  {day.isRest ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16Z"/><path d="M7 10h10"/><path d="M7 14h10"/></svg>
                  ) : (
                    <span className="text-lg font-black">{day.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  {isEditingNames ? (
                    <input 
                      type="text"
                      value={day.name}
                      onChange={(e) => renameDay(day.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-lg font-black w-full bg-transparent border-b border-indigo-500 outline-none ${day.isRest ? 'text-slate-600' : 'text-indigo-950 dark:text-white'}`}
                      placeholder="اسم اليوم..."
                    />
                  ) : (
                    <h3 className={`text-lg font-black truncate ${day.isRest ? '' : 'text-indigo-950 dark:text-white'}`}>
                      {day.name}
                    </h3>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${day.isRest ? 'bg-gray-200 dark:bg-slate-700 text-gray-500' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500'}`}>
                      {day.isRest ? 'يوم راحة' : `${day.exercises.length} تمارين`}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isEditingNames ? (
                  <button 
                    onClick={() => toggleRestDay(day.id)}
                    className={`p-3 rounded-2xl transition-all font-bold text-xs flex items-center gap-2 ${
                      day.isRest 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none' 
                      : 'bg-indigo-50 text-indigo-600 dark:bg-slate-700 dark:text-indigo-300'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M2 12h20"/></svg>
                    {day.isRest ? 'تفعيل' : 'راحة'}
                  </button>
                ) : (
                  !day.isRest && (
                    <button 
                      onClick={() => { setSelectedDayId(day.id); setViewState('DAY_DETAIL'); }}
                      className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 active:scale-90 transition-transform"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDayDetail = () => {
    if (!activeDay) return null;
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
             <h2 className="text-2xl font-black">{activeDay.name}</h2>
             <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{activeDay.exercises.length} تمرين مسجل</p>
          </div>
          <button 
            onClick={() => {
              setFormExercise({ name: '', sets: 3, reps: 12, muscleType: 'صدر', secondaryMuscles: '', position: 'وسط', weight: 0 });
              setViewState('EDIT_EXERCISE');
            }}
            className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-200 dark:shadow-none active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            تمرين جديد
          </button>
        </div>

        {activeDay.exercises.length === 0 ? (
          <div className={`text-center py-24 rounded-[3rem] border-2 border-dashed ${darkMode ? 'border-slate-800 text-slate-600' : 'border-gray-200 text-gray-400'}`}>
            <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v8H2V8Z"/><path d="M6 12v.01"/><path d="M10 12v.01"/><path d="M14 12v.01"/></svg>
            </div>
            <p className="text-lg font-bold">لا توجد تمارين لهذا اليوم</p>
            <p className="text-sm mt-1">ابدأ بإضافة تمرينك الأول الآن</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeDay.exercises.map(ex => (
              <ExerciseCard 
                key={ex.id}
                exercise={ex}
                darkMode={darkMode}
                onUpdateWeight={(w) => updateWeight(activeDay.id, ex.id, w)}
                onViewProgress={() => {
                  setSelectedExerciseId(ex.id);
                  setViewState('PROGRESS');
                }}
                onEdit={() => {
                  setFormExercise(ex);
                  setViewState('EDIT_EXERCISE');
                }}
              />
            ))}
          </div>
        )}
        <RestTimer darkMode={darkMode} />
      </div>
    );
  };

  const renderProgress = () => {
    if (!activeExercise) return null;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
          {activeExercise.image ? (
            <img src={activeExercise.image} className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-slate-700 flex items-center justify-center text-indigo-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v8H2V8Z"/></svg>
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">{activeExercise.name}</h2>
            <p className="text-xs text-gray-500">{activeExercise.muscleType} ({activeExercise.position})</p>
          </div>
        </div>

        <ProgressChart history={activeExercise.history} darkMode={darkMode} />

        <div className="mt-6">
          <h3 className="font-bold mb-4 text-gray-400 text-xs uppercase tracking-wider px-2">سجل الأوزان السابقة</h3>
          <div className={`rounded-3xl overflow-hidden border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
            {activeExercise.history.length === 0 ? (
               <p className="p-8 text-center text-gray-400 italic">لا يوجد سجل تاريخي بعد</p>
            ) : (
              activeExercise.history.slice().reverse().map((log, idx) => (
                <div key={idx} className="flex justify-between items-center px-5 py-4 border-b last:border-b-0 border-gray-50 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-sm font-medium">{new Date(log.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <span className="font-bold text-lg">{log.weight} <span className="text-xs font-normal text-gray-400">كغ</span></span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <div className="space-y-6 pb-10">
      <div className="space-y-5">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm">
          <label className="block text-sm font-black mb-3 px-1">اسم التمرين</label>
          <input 
            type="text" 
            value={formExercise.name}
            onChange={e => setFormExercise(p => ({ ...p, name: e.target.value }))}
            className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
            placeholder="مثلاً: تجميع صدر دمبل"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm text-center">
            <label className="block text-xs font-bold text-gray-400 mb-3">عدد الجولات</label>
            <div className="flex items-center justify-between">
              <button onClick={() => setFormExercise(p => ({ ...p, sets: Math.max(1, (p.sets || 0) - 1) }))} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center font-bold">-</button>
              <span className="text-xl font-black">{formExercise.sets}</span>
              <button onClick={() => setFormExercise(p => ({ ...p, sets: (p.sets || 0) + 1 }))} className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">+</button>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm text-center">
            <label className="block text-xs font-bold text-gray-400 mb-3">عدد التكرارات</label>
            <div className="flex items-center justify-between">
              <button onClick={() => setFormExercise(p => ({ ...p, reps: Math.max(1, (p.reps || 0) - 1) }))} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center font-bold">-</button>
              <span className="text-xl font-black">{formExercise.reps}</span>
              <button onClick={() => setFormExercise(p => ({ ...p, reps: (p.reps || 0) + 1 }))} className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">+</button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm">
          <label className="block text-sm font-black mb-3 px-1">العضلة المستهدفة (أساسي)</label>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_TYPES.map(m => (
              <button 
                key={m}
                onClick={() => setFormExercise(p => ({ ...p, muscleType: m }))}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  formExercise.muscleType === m 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : (darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-100 border-gray-200 text-gray-500')
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm">
          <label className="block text-sm font-black mb-3 px-1">عضلات مساعدة (يدوي)</label>
          <input 
            type="text" 
            value={formExercise.secondaryMuscles}
            onChange={e => setFormExercise(p => ({ ...p, secondaryMuscles: e.target.value }))}
            className={`w-full p-4 rounded-2xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
            placeholder="مثلاً: بايسبس، ساعد..."
          />
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm">
          <label className="block text-sm font-black mb-3 px-1">الموضع المفضل</label>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map(p => (
              <button 
                key={p}
                onClick={() => setFormExercise(prev => ({ ...prev, position: p as Position }))}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  formExercise.position === p 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : (darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-100 border-gray-200 text-gray-500')
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm">
          <label className="block text-sm font-black mb-3 px-1">صورة التمرين</label>
          <div className="flex items-center gap-4">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="img-upload" />
            <label htmlFor="img-upload" className={`flex-1 p-6 border-2 border-dashed rounded-[1.5rem] text-center cursor-pointer transition-all ${darkMode ? 'border-slate-700 bg-slate-900/50' : 'border-gray-200 bg-gray-50/50'}`}>
              {formExercise.image ? (
                <div className="flex items-center gap-3 justify-center">
                  <img src={formExercise.image} className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm" />
                  <span className="font-bold">تغيير الصورة</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-indigo-500"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  <span className="text-xs font-bold text-gray-400">تحميل صورة توضيحية</span>
                </div>
              )}
            </label>
            {formExercise.image && (
              <button onClick={() => setFormExercise(p => ({ ...p, image: undefined }))} className="w-14 h-14 bg-red-50 text-red-500 border border-red-100 rounded-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6 space-y-4">
        <button 
          onClick={handleAddOrUpdateExercise}
          className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-200 dark:shadow-none active:scale-[0.98] transition-all"
        >
          {formExercise.id ? 'تحديث التمرين' : 'إضافة التمرين'}
        </button>
        {formExercise.id && (
          <button 
            onClick={() => deleteExercise(selectedDayId!, formExercise.id!)}
            className="w-full bg-red-50 text-red-600 py-4 rounded-[1.5rem] font-bold border border-red-100"
          >
            حذف التمرين نهائياً
          </button>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className={`p-6 rounded-[2rem] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
        <h3 className="text-lg font-black mb-4">إدارة البيانات</h3>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          جميع بياناتك مخزنة محلياً في ذاكرة الهاتف. يمكنك تصديرها كملف احتياطي أو استعادتها لاحقاً.
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={handleExport}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold active:scale-95 transition-all"
          >
            <span>تصدير نسخة احتياطية (JSON)</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          </button>
          
          <label className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold active:scale-95 transition-all cursor-pointer">
            <span>استيراد من ملف</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-700">
            <button 
              onClick={() => {
                if(confirm('سيتم مسح جميع التمارين والسجلات نهائياً. هل أنت متأكد؟')) clearAllData();
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold active:scale-95 transition-all"
            >
              <span>مسح جميع البيانات والبدء من جديد</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-[2rem] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
        <h3 className="text-lg font-black mb-4">عن التطبيق</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          مدربي الشخصي هو تطبيق بسيط لتنظيم تمارينك اليومية ومراقبة تقدمك في رفع الأوزان. صمم ليكون سريعاً وسهل الاستخدام داخل صالة الجيم.
        </p>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center text-[10px] text-gray-400">
          <span>الإصدار 1.0.0</span>
          <span>صنع بكل حب 💪</span>
        </div>
      </div>
    </div>
  );

  const getTitle = () => {
    switch(viewState) {
      case 'HOME': return 'مدربي الشخصي';
      case 'DAY_DETAIL': return activeDay?.name || 'تمارين اليوم';
      case 'PROGRESS': return 'مخطط التقدم';
      case 'EDIT_EXERCISE': return formExercise.id ? 'تعديل التمرين' : 'تمرين جديد';
      case 'SETTINGS': return 'الإعدادات';
      default: return 'تطبيق الجيم';
    }
  };

  const onBack = viewState === 'HOME' ? undefined : () => {
    if (viewState === 'SETTINGS') setViewState('HOME');
    else if (viewState === 'DAY_DETAIL') setViewState('HOME');
    else if (viewState === 'PROGRESS') setViewState('DAY_DETAIL');
    else if (viewState === 'EDIT_EXERCISE') setViewState('DAY_DETAIL');
  };

  const onSettings = viewState === 'HOME' ? () => setViewState('SETTINGS') : undefined;

  return (
    <Layout 
      darkMode={darkMode} 
      setDarkMode={setDarkMode} 
      title={getTitle()} 
      onBack={onBack}
      onSettings={onSettings}
    >
      {viewState === 'HOME' && renderHome()}
      {viewState === 'DAY_DETAIL' && renderDayDetail()}
      {viewState === 'PROGRESS' && renderProgress()}
      {viewState === 'EDIT_EXERCISE' && renderForm()}
      {viewState === 'SETTINGS' && renderSettings()}
    </Layout>
  );
};

export default App;
