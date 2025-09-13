import React, { useState, useCallback, useEffect } from 'react';
import { editImage, fileToBase64 } from '../services/geminiService';
import { UploadIcon, ClipboardIcon, CheckIcon } from './icons/Icons';
import GeneratorLayout from './GeneratorLayout';
import OutputDisplay from './OutputDisplay';

const FastImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [baseImage, setBaseImage] = useState<{ file: File; url: string; base64: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (baseImage) {
      const timer = setTimeout(() => setIsPreviewVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsPreviewVisible(false);
    }
  }, [baseImage]);
  
  const handleCopy = () => {
    if (prompt) {
        navigator.clipboard.writeText(prompt);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setError(null);
      setResultImageUrl(null);
      const url = URL.createObjectURL(file);
      try {
        const base64 = await fileToBase64(file);
        setBaseImage({ file, url, base64 });
      } catch (e) {
        setError("فشل في قراءة ملف الصورة.");
      }
    } else if (file) {
      setError("الرجاء اختيار ملف صورة صالح.");
    }
  };
  
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || !baseImage) {
      setError('الرجاء تحميل صورة وإدخال وصف للتعديل.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResultImageUrl(null);
    try {
      const result = await editImage(baseImage.base64, baseImage.file.type, prompt);
      setResultImageUrl(result);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, baseImage]);

  const controls = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
         <div className="relative">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="مثال: اجعل السماء مليئة بالنجوم، أضف قطة على السياج..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 pr-12 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 min-h-[100px]"
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
            disabled={isLoading || !prompt.trim() || !baseImage}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-transform duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
            {isLoading ? 'جارِ التعديل...' : 'تعديل الصورة'}
        </button>
      </div>
      <div 
        className={`relative border-2 border-dashed rounded-lg p-4 flex items-center justify-center text-center h-full min-h-[200px] overflow-hidden transition-colors duration-200 ${
          isDragOver ? 'border-purple-500 bg-slate-800/50' : 'border-slate-600'
        }`}
        onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const syntheticEvent = { target: e.dataTransfer } as unknown as React.ChangeEvent<HTMLInputElement>;
          handleFileChange(syntheticEvent);
        }}
      >
        {baseImage ? (
            <img 
              src={baseImage.url} 
              alt="Preview" 
              className={`max-h-full max-w-full object-contain rounded-md transition-all duration-500 ease-in-out ${
                isPreviewVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            />
        ) : (
            <div className="text-slate-500 pointer-events-none">
                <UploadIcon className="w-12 h-12 mx-auto mb-2" />
                <p>اسحب وأفلت صورة هنا، أو انقر للاختيار</p>
            </div>
        )}
         <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isLoading} />
      </div>
    </div>
  );

  return (
    <GeneratorLayout
        title="المولّد السريع (Nano Banana)"
        description="أداة سريعة لتعديل الصور وتجربة الأفكار الأولية. حمّل صورة واطلب تعديلاً عليها."
        controls={controls}
        output={
            <OutputDisplay
                isLoading={isLoading}
                error={error}
                resultUrl={resultImageUrl}
                resultType="image"
                loadingText="نضيف لمستك الإبداعية..."
                emptyText="ستظهر صورتك المعدّلة هنا."
            />
        }
    />
  );
};

export default FastImageGenerator;