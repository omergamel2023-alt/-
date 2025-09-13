import React, { useState } from 'react';
import { GenerationMode } from './types';
import { isApiKeyAvailable } from './services/geminiService';
import Sidebar from './components/Sidebar';
import ImageGenerator from './components/ImageGenerator';
import FastImageGenerator from './components/FastImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import { AlertTriangleIcon } from './components/icons/Icons';

const ApiKeyErrorScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
    <AlertTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
    <h1 className="text-3xl font-bold text-white mb-2">خطأ في الإعدادات</h1>
    <p className="text-slate-400 max-w-md">
      تعذر العثور على مفتاح واجهة برمجة التطبيقات (API Key). يرجى التأكد من أن متغير البيئة API_KEY قد تم إعداده بشكل صحيح لتتمكن من استخدام التطبيق.
    </p>
  </div>
);

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<GenerationMode>(GenerationMode.IMAGE);

  if (!isApiKeyAvailable) {
    return <ApiKeyErrorScreen />;
  }

  const renderActiveGenerator = () => {
    switch (activeMode) {
      case GenerationMode.IMAGE:
        return <ImageGenerator />;
      case GenerationMode.FAST_IMAGE:
        return <FastImageGenerator />;
      case GenerationMode.VIDEO:
        return <VideoGenerator />;
      default:
        return <ImageGenerator />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col md:flex-row">
      <Sidebar activeMode={activeMode} setActiveMode={setActiveMode} />
      <main className="flex-1 flex flex-col pb-20 md:pb-0">
        {/* Header is now part of Sidebar for mobile */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div key={activeMode} className="animate-fadeIn">
            {renderActiveGenerator()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;