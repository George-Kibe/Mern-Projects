import { useEffect, useRef, useState } from "react";
import DynamicYearSection from "./DynamicYearSection";

interface LazyLoadSectionProps {
  year: number;
}

export default function LazyLoadSection({ year }: LazyLoadSectionProps) {
  const [isVisible, setIsVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = containerRef.current;

    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  });

  return (
    <div ref={containerRef}>
      {isVisible ? (
        <DynamicYearSection year={year} />
      ) : (
        <div className="space-y-6">
          <div className="border-b border-purple-950 pb-4">
            <h2 className="text-2xl font-bold text-gray-100">
              {year} Analytics
            </h2>
            <p className="text-gray-400 mt-1">Scroll to load data...</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-100 border border-purple-950 rounded-sm bg-slate-900/50 animate-pulse" />
            <div className="h-100 border border-purple-950 rounded-sm bg-slate-900/50 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
