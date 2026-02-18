
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeightLog } from '../types';

interface ProgressChartProps {
  history: WeightLog[];
  darkMode: boolean;
}

type Period = 'all' | 'week' | 'month' | '3months' | 'custom';

const ProgressChart: React.FC<ProgressChartProps> = ({ history, darkMode }) => {
  const [period, setPeriod] = useState<Period>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredHistory = useMemo(() => {
    if (period === 'all') return history;

    if (period === 'custom') {
      return history.filter(h => {
        const hDate = new Date(h.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && end) {
          // Normalize times for date comparison
          const check = hDate.getTime();
          return check >= start.getTime() && check <= end.getTime();
        } else if (start) {
          return hDate.getTime() >= start.getTime();
        } else if (end) {
          return hDate.getTime() <= end.getTime();
        }
        return true;
      });
    }

    const now = new Date();
    let cutoff = new Date();

    if (period === 'week') cutoff.setDate(now.getDate() - 7);
    else if (period === 'month') cutoff.setMonth(now.getMonth() - 1);
    else if (period === '3months') cutoff.setMonth(now.getMonth() - 3);

    return history.filter(h => new Date(h.date) >= cutoff);
  }, [history, period, startDate, endDate]);

  if (history.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-gray-500 italic">
        لا توجد سجلات بعد
      </div>
    );
  }

  const stats = useMemo(() => {
    const data = filteredHistory.length > 0 ? filteredHistory : history;
    const maxWeight = Math.max(...data.map(h => h.weight));
    const lastWeight = data[data.length - 1].weight;
    const firstWeight = data[0].weight;
    const improvement = firstWeight > 0 ? ((lastWeight - firstWeight) / firstWeight * 100).toFixed(1) : '0';
    return { maxWeight, lastWeight, improvement };
  }, [filteredHistory, history]);

  const chartData = filteredHistory.map(h => ({
    date: new Date(h.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
    وزن: h.weight,
    fullDate: h.date
  }));

  const periods: { label: string; value: Period }[] = [
    { label: 'الكل', value: 'all' },
    { label: 'أسبوع', value: 'week' },
    { label: 'شهر', value: 'month' },
    { label: '3 أشهر', value: '3months' },
    { label: 'مخصص', value: 'custom' },
  ];

  return (
    <div className="mt-4">
      {/* Period Selector */}
      <div className={`flex p-1 rounded-2xl mb-4 transition-colors ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all ${
              period === p.value
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-500 hover:text-indigo-500'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range Picker */}
      {period === 'custom' && (
        <div className={`mb-6 p-4 rounded-[2rem] border grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 mr-2">من تاريخ</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full p-2 text-xs rounded-xl border outline-none focus:ring-1 focus:ring-indigo-500 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-100'}`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 mr-2">إلى تاريخ</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`w-full p-2 text-xs rounded-xl border outline-none focus:ring-1 focus:ring-indigo-500 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-100'}`}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className={`p-3 rounded-2xl text-center border transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
          <p className="text-[10px] text-gray-400 mb-1">أعلى وزن</p>
          <p className="text-lg font-black text-indigo-500">{stats.maxWeight}<span className="text-[10px] font-normal mr-1 text-gray-400">كغ</span></p>
        </div>
        <div className={`p-3 rounded-2xl text-center border transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
          <p className="text-[10px] text-gray-400 mb-1">آخر وزن</p>
          <p className="text-lg font-black text-emerald-500">{stats.lastWeight}<span className="text-[10px] font-normal mr-1 text-gray-400">كغ</span></p>
        </div>
        <div className={`p-3 rounded-2xl text-center border transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
          <p className="text-[10px] text-gray-400 mb-1">التحسن</p>
          <p className={`text-lg font-black ${parseFloat(stats.improvement) >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
            %{stats.improvement}
          </p>
        </div>
      </div>

      <div className={`p-4 rounded-3xl h-64 border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
        {filteredHistory.length < 2 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-2"><path d="M12 20v-5"/><path d="M9 20v-2"/><path d="M15 20v-8"/><path d="M18 20V8"/><path d="M6 20v-1"/></svg>
            <p className="text-xs text-gray-400 italic">بيانات غير كافية لرسم المخطط في هذه الفترة</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#f1f5f9'} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: darkMode ? '#64748b' : '#94a3b8', fontWeight: 'bold' }} 
                axisLine={false}
                tickLine={false}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: darkMode ? '#64748b' : '#94a3b8', fontWeight: 'bold' }} 
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  backgroundColor: darkMode ? '#1e293b' : '#fff',
                  color: darkMode ? '#fff' : '#000',
                  direction: 'rtl'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="وزن" 
                stroke="#6366f1" 
                strokeWidth={4} 
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ProgressChart;
