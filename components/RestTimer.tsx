
import React, { useState, useEffect, useRef } from 'react';

const RestTimer: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // طلب إذن الإشعارات عند بدء التشغيل أو محاولة تفعيل المؤقت
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      handleTimerComplete();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, seconds]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // 1. إرسال إشعار متصفح
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('انتهى وقت الراحة! 💪', {
        body: 'حان وقت الجولة التالية، استعد!',
        icon: 'https://cdn-icons-png.flaticon.com/512/3043/3043888.png', // أيقونة تعبيرية
        silent: false,
      });
    }

    // 2. تفعيل الاهتزاز (إذا كان مدعوماً في الهاتف)
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 200, 500]); // اهتزاز مرتين
    }

    // 3. تنبيه صوتي بسيط (اختياري)
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio alert not supported');
    }
  };

  const startTimer = (secs: number) => {
    requestNotificationPermission();
    setSeconds(secs);
    setIsActive(true);
  };

  const stopTimer = () => {
    setIsActive(false);
    setSeconds(0);
  };

  if (seconds === 0 && !isActive) {
    return (
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[100]">
        <button 
          onClick={() => startTimer(60)}
          className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center font-bold active:scale-90 transition-transform"
        >
          60ث
        </button>
        <button 
          onClick={() => startTimer(90)}
          className="w-14 h-14 bg-indigo-500 text-white rounded-full shadow-lg flex items-center justify-center font-bold active:scale-90 transition-transform"
        >
          90ث
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-2xl flex flex-col items-center gap-2 z-[100] animate-bounce-short ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-100'}`}>
      <div className="text-3xl font-mono font-bold text-indigo-600">
        {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
      </div>
      <button 
        onClick={stopTimer}
        className="px-4 py-1 bg-red-500 text-white rounded-lg text-sm font-bold"
      >
        إلغاء
      </button>
      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-short {
          animation: bounce-short 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default RestTimer;
