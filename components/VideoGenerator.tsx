import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateVideo } from '../services/geminiService';
import GeneratorLayout from './GeneratorLayout';
import OutputDisplay from './OutputDisplay';
import { ClipboardIcon, CheckIcon } from './icons/Icons';

const loadingMessages = [
    "جارِ تهيئة النموذج...",
    "يتم الآن تركيب المشاهد...",
    "نضيف المؤثرات البصرية...",
    "الذكاء الاصطناعي يعمل بسحر...",
    "لمسة فنية أخيرة...",
    "قد يستغرق الأمر بضع دقائق...",
];

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>(loadingMessages[0]);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      intervalRef.current = window.setInterval(() => {
        setCurrentMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 5000); // Change message every 5 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLoading]);
  
  const handleCopy = () => {
    if (prompt) {
        navigator.clipboard.writeText(prompt);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('الرجاء إدخال وصف للفيديو.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    setCurrentMessage(loadingMessages[0]);
    
    try {
      const result = await generateVideo(prompt);
      setVideoUrl(result);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const controls = (
      <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="مثال: لقطة سينمائية لسيارة رياضية تسير على طريق ساحلي عند غروب الشمس..."
                className="w-full h-full bg-slate-800 border border-slate-700 rounded-lg p-3 pr-12 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 min-h-[100px]"
                disabled={isLoading}
              />
              <button
                  onClick={handleCopy}
                  disabled={!prompt.trim()}
                  className="absolute top-3 right-3 p-2 rounded-md hover:bg-slate-700 transition-colors text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Copy prompt"
              >
                  {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
              </button>
            </div>
          <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-transform duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
              {isLoading ? 'جارِ التوليد...' : 'توليد الفيديو'}
          </button>
      </div>
  );

  return (
    <GeneratorLayout
      title="مولّد القصص المرئية (Veo)"
      description="حوّل الكلمات إلى مقاطع فيديو قصيرة ومبهرة. مثالي لمنشورات وسائل التواصل الاجتماعي."
      controls={controls}
      output={
        <OutputDisplay
          isLoading={isLoading}
          error={error}
          resultUrl={videoUrl}
          resultType="video"
          loadingText={currentMessage}
          emptyText="سيظهر الفيديو المُولَّد هنا."
        />
      }
    />
  );
};

export default VideoGenerator;