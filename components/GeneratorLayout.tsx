import React from 'react';

interface GeneratorLayoutProps {
  title: string;
  description: string;
  controls: React.ReactNode;
  output: React.ReactNode;
}

const GeneratorLayout: React.FC<GeneratorLayoutProps> = ({ title, description, controls, output }) => {
  return (
    <div className="flex flex-col h-full gap-6">
      <header>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400">{description}</p>
      </header>

      <section aria-label="Controls">
        {controls}
      </section>

      <section aria-label="Output" className="flex-1 flex flex-col min-h-[300px] md:min-h-[400px]">
        {output}
      </section>
    </div>
  );
};

export default GeneratorLayout;
