import React, { useState, useCallback, useEffect } from 'react';
import { generateImage, enhancePrompt } from '../services/geminiService';
import GeneratorLayout from './GeneratorLayout';
import OutputDisplay from './OutputDisplay';
import { ClipboardIcon, CheckIcon } from './icons/Icons';

const aspectRatios = [
  { value: '1:1', label: 'مربع (1:1)' },
  { value: '16:9', label: 'عرضي (16:9)' },
  { value: '9:16', label: 'طولي (9:16)' },
  { value: '4:3', label: 'أفقي (4:3)' },
  { value: '3:4', label: 'عمودي (3:4)' },
];

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [enhance, setEnhance] = useState<boolean>(true);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isEnhancedPromptVisible, setIsEnhancedPromptVisible] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (enhancedPrompt && !isLoading) {
      const timer = setTimeout(() => setIsEnhancedPromptVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsEnhancedPromptVisible(false);
    }
  }, [enhancedPrompt, isLoading]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('الرجاء إدخال وصف للصورة.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    setEnhancedPrompt(null);

    try {
      let promptToUse = prompt;
      if (enhance) {
        const newEnhancedPrompt = await enhancePrompt(prompt);
        setEnhancedPrompt(newEnhancedPrompt);
        promptToUse = newEnhancedPrompt;
      }
      const result = await generateImage(promptToUse, aspectRatio);
      setImageUrl(result);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio, enhance]);

  const handleCopy = () => {
    if (enhancedPrompt) {
        navigator.clipboard.writeText(enhancedPrompt);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const controls = (
     <>
        <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="مثال: رائد فضاء يركب حصاناً في الفضاء بأسلوب فني..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 min-h-[100px] flex-1"
                    disabled={isLoading}
                />
                <p className="text-xs text-slate-400 mt-2 px-1">
                    لأفضل النتائج اكتب باللغة الإنجليزية. اذا لا تفهم الانجليزية يمكنك الانتقال الى{' '}
                    <a 
                        href="https://translate.google.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:underline"
                    >
                        جوجل للترجمة من هنا
                    </a>.
                </p>
            </div>
            <div className="flex flex-col gap-4">
                <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={isLoading}
                >
                    {aspectRatios.map(ratio => (
                        <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
                    ))}
                </select>
                <div className="flex items-center gap-2 px-1">
                    <input
                        type="checkbox"
                        id="enhance-prompt-checkbox"
                        checked={enhance}
                        onChange={(e) => setEnhance(e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-offset-slate-900"
                        disabled={isLoading}
                    />
                    <label 
                        htmlFor="enhance-prompt-checkbox" 
                        className={`text-sm cursor-pointer select-none transition-colors duration-300 ${
                            enhance ? 'text-purple-400 font-medium' : 'text-slate-300'
                        }`}
                    >
                        تحسين الوصف تلقائياً
                    </label>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-transform duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {isLoading ? 'جارِ التوليد...' : 'توليد الصورة'}
                </button>
            </div>
        </div>
        {enhancedPrompt && !isLoading && !error && (
            <div className={`mt-4 p-3 bg-slate-800/50 border border-slate-700 rounded-lg transition-all duration-500 ease-in-out ${
                isEnhancedPromptVisible ? 'opacity-100' : 'opacity-0'
            }`}>
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <p className="text-sm text-slate-400 mb-1">الوصف المحسّن الذي تم استخدامه:</p>
                        <p className="text-sm text-slate-200 font-mono dir-ltr text-left break-all">{enhancedPrompt}</p>
                    </div>
                     <button
                        onClick={handleCopy}
                        className="flex-shrink-0 p-2 rounded-md hover:bg-slate-700 transition-colors text-slate-400"
                        aria-label="Copy prompt"
                    >
                        {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        )}
     </>
  );

  return (
    <GeneratorLayout
        title="مولّد الصور (Imagen)"
        description="حوّل أفكارك إلى صور فنية عالية الدقة. مثالي للتصاميم الاحترافية والمحتوى البصري المتميز."
        controls={controls}
        output={
            <OutputDisplay
                isLoading={isLoading}
                error={error}
                resultUrl={imageUrl}
                resultType="image"
                loadingText="الإبداع يتشكل الآن..."
                emptyText="ستظهر صورتك المُولَّدة هنا."
            />
        }
    />
  );
};

export default ImageGenerator;