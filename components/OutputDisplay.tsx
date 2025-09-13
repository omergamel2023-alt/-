import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { DownloadIcon, SparklesIcon } from './icons/Icons';

interface OutputDisplayProps {
  isLoading: boolean;
  error: string | null;
  resultUrl: string | null;
  resultType: 'image' | 'video';
  loadingText: string;
  emptyText: string;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({
  isLoading,
  error,
  resultUrl,
  resultType,
  loadingText,
  emptyText,
}) => {
  const [isResultVisible, setIsResultVisible] = useState(false);

  useEffect(() => {
    if (resultUrl && !isLoading) {
      const timer = setTimeout(() => setIsResultVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsResultVisible(false);
    }
  }, [resultUrl, isLoading]);

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement('a');
    link.href = resultUrl;
    const extension = resultType === 'image' ? 'jpg' : 'mp4';
    link.download = `ebdaa-ai-result.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner text={loadingText} />;
    }
    if (error) {
      return <div className="text-red-400 text-center p-4">{error}</div>;
    }
    if (resultUrl) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <div className="relative w-full flex-1 group flex items-center justify-center min-h-0">
            {resultType === 'image' ? (
              <img
                src={resultUrl}
                alt="Generated Art"
                className={`max-w-full max-h-full object-contain rounded-md transition-all duration-500 ease-in-out ${
                  isResultVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              />
            ) : (
              <video
                src={resultUrl}
                controls
                autoPlay
                loop
                className={`max-w-full max-h-full rounded-md transition-all duration-500 ease-in-out ${
                  isResultVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              />
            )}
            <button
                  onClick={handleDownload}
                  className="absolute top-3 right-3 bg-slate-900/50 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-purple-600/70 hidden md:flex"
                  aria-label="Download"
              >
                  <DownloadIcon className="w-5 h-5" />
              </button>
          </div>
          <div className="flex-shrink-0 w-full flex justify-center">
             <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition-transform duration-200 transform hover:scale-105"
            >
                <DownloadIcon className="w-5 h-5 rtl:ml-2 ltr:mr-2" />
                <span>تحميل {resultType === 'image' ? 'الصورة' : 'الفيديو'}</span>
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <SparklesIcon className="w-12 h-12 text-slate-600" />
        <p>{emptyText}</p>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-slate-800/50 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center p-4 overflow-hidden">
      {renderContent()}
    </div>
  );
};

export default OutputDisplay;