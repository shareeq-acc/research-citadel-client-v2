import React from "react";

interface SkeletonProps {
  className?: string;
}

export const SkeletonPulse: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-stone-200 border-2 border-neo-dark ${className}`} />
  );
};

export const SkeletonText: React.FC<SkeletonProps & { lines?: number }> = ({ className = "", lines = 3 }) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <div 
          key={idx}
          className="h-3.5 bg-stone-200 border-2 border-neo-dark animate-pulse rounded-none"
          style={{ width: idx === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
};

// FULL-SCREEN LEVEL SKELETONS (1:1 replacements for top-level pages)

export const SkeletonDashboardMain: React.FC = () => {
  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header Banner Skeleton */}
      <div className="bg-[#FFE44D]/25 rounded-sm border-4 border-neo-dark p-6 shadow-[5px_5px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl w-full">
          <div className="h-6 bg-stone-200 border-3 border-neo-dark w-1/2 animate-pulse" />
          <div className="h-3.5 bg-stone-100 border-2 border-neo-dark w-11/12 animate-pulse mt-1" />
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
        {/* Stat Card 1 */}
        <div className="bg-white border-4 border-neo-dark p-4 rounded-xs shadow-[3.5px_3.5px_0px_rgba(0,0,0,1)] space-y-3">
          <div className="h-3 bg-stone-200 border-2 border-neo-dark w-28 animate-pulse" />
          <div className="flex items-baseline gap-2 pt-1">
            <div className="h-7 bg-stone-200 border-2 border-neo-dark w-16 animate-pulse" />
            <div className="h-3 bg-stone-100 border border-stone-300 w-24 animate-pulse" />
          </div>
          <div className="h-2 bg-stone-200 border border-neo-dark w-full animate-pulse mt-3" />
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white border-4 border-neo-dark p-4 rounded-xs shadow-[3.5px_3.5px_0px_rgba(0,0,0,1)] space-y-3">
          <div className="h-3 bg-stone-200 border-2 border-neo-dark w-32 animate-pulse" />
          <div className="flex items-baseline gap-2 pt-1">
            <div className="h-7 bg-stone-200 border-2 border-neo-dark w-14 animate-pulse" />
            <div className="h-3 bg-stone-100 border border-stone-300 w-20 animate-pulse" />
          </div>
          <div className="h-2 bg-[#2DD4BF]/40 border border-teal-500 w-full animate-pulse mt-3" />
        </div>

        {/* Stat Card 3 */}
        <div className="bg-yellow-50/50 border-4 border-neo-dark p-4 rounded-xs shadow-[3.5px_3.5px_0px_rgba(0,0,0,1)] space-y-2.5">
          <div className="h-3 bg-stone-200 border-2 border-neo-dark w-24 animate-pulse" />
          <div className="flex items-baseline gap-2 pt-1">
            <div className="h-6 bg-stone-200 border-2 border-neo-dark w-28 animate-pulse" />
          </div>
          <div className="h-6 w-full bg-stone-100 border-2 border-neo-dark animate-pulse mt-1" />
        </div>
      </div>

      {/* Core split panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left pane - Library navigation index */}
        <div className="lg:col-span-4 bg-white border-4 border-neo-dark p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3.5">
          <div className="flex justify-between items-center border-b-2 border-neo-dark pb-2">
            <div className="h-4 bg-stone-200 border-2 border-neo-dark w-36 animate-pulse" />
            <div className="h-4 bg-stone-100 border border-stone-300 w-16 animate-pulse" />
          </div>
          <div className="h-9 w-full bg-stone-50 border-2 border-neo-dark animate-pulse" />
          <div className="space-y-2 pt-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3.5 bg-white border-2 border-neo-dark shadow-[2px_2px_0px_#0A0A0A] flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-stone-200 border border-neo-dark w-14 animate-pulse" />
                  <div className="h-3 bg-stone-100 border border-stone-200 w-12 animate-pulse" />
                </div>
                <div className="h-4 bg-stone-200 border-2 border-neo-dark w-3/4 animate-pulse mt-1" />
                <div className="h-3 bg-stone-100 border border-stone-300 w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Right pane - Welcome standard placeholder when no vault is loaded */}
        <div className="lg:col-span-8 bg-white border-4 border-neo-dark p-12 text-center shadow-[6px_6px_0px_#000] py-16 space-y-4">
          <div className="w-16 h-16 bg-stone-100 border-3 border-neo-dark rounded-full flex items-center justify-center mx-auto shadow-[2px_2px_0px_#0A0A0A] animate-pulse">
            <div className="w-8 h-8 rounded-full bg-stone-200" />
          </div>
          <div className="h-5 bg-stone-200 border-2 border-neo-dark w-1/2 mx-auto animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 bg-stone-100 border border-stone-200 w-3/4 mx-auto animate-pulse" />
            <div className="h-3 bg-stone-100 border border-stone-200 w-2/3 mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonSubscriptionPage: React.FC = () => {
  return (
    <div className="space-y-8 text-left animate-fadeIn">
      {/* Header section with Return Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-4 border-neo-dark bg-white p-6 rounded-xs shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="space-y-2 flex-1 w-full">
          <div className="h-3 bg-stone-100 border border-stone-300 w-36 animate-pulse" />
          <div className="h-7 bg-stone-200 border-3 border-neo-dark text-neo-dark w-2/3 animate-pulse" />
          <div className="h-3 bg-stone-100 border border-stone-200 w-1/2 animate-pulse" />
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="h-10 w-28 bg-[#FFE44D]/35 border-3 border-neo-dark shadow-[2.5px_2.5px_0px_#000] animate-pulse" />
        </div>
      </div>

      {/* Grid capacity indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-4 border-neo-dark bg-white p-5 rounded-xs shadow-[4px_4px_0px_#000] space-y-4">
            <div className="flex justify-between items-center border-b-2 border-neo-dark pb-2">
              <div className="h-3.5 bg-stone-200 border border-neo-dark w-28 animate-pulse" />
              <div className="h-4.5 bg-stone-100 border border-stone-200 w-16 animate-pulse" />
            </div>
            <div className="space-y-1.5 pt-1.5">
              <div className="h-7 bg-stone-200 border-2 border-neo-dark w-14 animate-pulse" />
              <div className="h-3 bg-stone-100 border border-stone-200 w-24 animate-pulse" />
            </div>
            <div className="h-3 bg-stone-200 border-2 border-neo-dark rounded-full w-full animate-pulse mt-2" />
          </div>
        ))}
      </div>

      {/* Grid cards tier comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* FREE TIER CARD SKELETON */}
        <div className="bg-white border-4 border-neo-dark rounded-xs p-6 shadow-[5px_5px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border-b-4 border-neo-dark pb-3">
              <div className="h-4.5 bg-stone-200 border-2 border-neo-dark w-20 animate-pulse mb-1.5" />
              <div className="h-7 bg-stone-200 border-2 border-neo-dark w-24 animate-pulse" />
            </div>
            <div className="space-y-2.5 pt-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex gap-2 items-center">
                  <div className="w-4 h-4 bg-[#2DD4BF]/25 border-2 border-neo-dark rounded-full shrink-0 animate-pulse" />
                  <div className="h-3 bg-stone-100 border border-stone-300 w-2/3 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="h-10 w-full bg-stone-200 border-3 border-neo-dark shadow-[3px_3px_0px_#000] animate-pulse" />
        </div>

        {/* PRO TIER CARD SKELETON */}
        <div className="bg-white border-4 border-[#FFAE1D] rounded-xs p-6 shadow-[5px_5px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-6 relative border-t-[12px]">
          <div className="space-y-4 animate-pulse">
            <div className="border-b-4 border-[#FFAE1D] pb-3">
              <div className="h-4.5 bg-stone-200 border-2 border-neo-dark w-24 mb-1.5" />
              <div className="h-7 bg-[#FFF2A3] border-2 border-neo-dark w-36" />
            </div>
            <div className="space-y-2.5 pt-2">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="flex gap-2 items-center">
                  <div className="w-4 h-4 bg-[#FF6B4A]/25 border-2 border-neo-dark rounded-full shrink-0" />
                  <div className="h-3 bg-stone-100 border border-stone-300 w-3/4" />
                </div>
              ))}
            </div>
          </div>
          <div className="h-10 w-full bg-[#FFAE1D] border-3 border-neo-dark shadow-[3px_3px_0px_#000] animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonSettingsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded neo-border neo-shadow-sm space-y-6 text-left animate-fadeIn">
      {/* Header bar back button */}
      <div className="border-b-4 border-neo-dark pb-3 flex justify-between items-center">
        <div className="space-y-1">
          <div className="h-5 bg-stone-200 border-2 border-neo-dark w-48 animate-pulse" />
        </div>
        <div className="h-7 bg-stone-100 border border-stone-400 w-20 animate-pulse" />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-9 flex-1 md:flex-none border-2 border-neo-dark bg-stone-50 animate-pulse shadow-[1px_1.5px_0px_#000] flex items-center justify-center md:justify-start px-3 py-2 gap-2">
              <div className="w-4 h-4 rounded-xs bg-stone-200" />
              <div className="h-3 bg-stone-200 w-16" />
            </div>
          ))}
        </div>

        {/* Form panel settings content */}
        <div className="flex-1 space-y-5 bg-stone-50 p-4 border-2 border-neo-dark rounded">
          <div className="space-y-1.5 border-b border-stone-200 pb-2">
            <div className="h-4 bg-stone-200 border border-neo-dark w-1/3 animate-pulse" />
            <div className="h-3.5 bg-stone-100 border border-stone-200 w-2/3 animate-pulse" />
          </div>

          {/* Canvas Preview Image Card */}
          <div className="bg-white border-2 border-neo-dark p-4 rounded shadow-[2px_2px_0px_rgba(0,0,0,0.15)] flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-stone-200 border-3 border-neo-dark shrink-0 animate-pulse" />
            <div className="space-y-2 flex-1 w-full text-center sm:text-left">
              <div className="h-3 bg-stone-200 border border-stone-300 w-24 mx-auto sm:mx-0 animate-pulse" />
              <div className="h-4.5 bg-stone-300 border-2 border-neo-dark w-44 mx-auto sm:mx-0 animate-pulse" />
              <div className="h-3 bg-stone-100 border border-stone-250 w-full animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <div className="h-3 bg-stone-200 border border-stone-300 w-24 animate-pulse" />
              <div className="h-9 w-full bg-white border-2 border-neo-dark animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 bg-stone-200 border border-stone-300 w-28 animate-pulse" />
              <div className="h-9 w-full bg-stone-100 border border-neo-dark border-dashed animate-pulse select-none" />
            </div>
          </div>

          {/* Footer controls */}
          <div className="pt-3 border-t-2 border-neo-dark flex justify-end">
            <div className="h-9 bg-stone-200 border-2 border-neo-dark w-32 shadow-[1.5px_1.5px_0px_#000] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonSourceDetailPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* Header breadcrumb bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-neo-dark pb-3">
        <div className="space-y-1.5 w-full max-w-xl">
          <div className="h-4 bg-stone-200 border border-stone-300 w-44 animate-pulse" />
          <div className="h-6 bg-stone-300 border-2 border-neo-dark w-3/4 animate-pulse mt-1" />
        </div>
        <div className="h-8 bg-stone-100 border border-neo-dark w-24 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Document details box */}
        <div className="lg:col-span-4 bg-white border-4 border-neo-dark p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="h-5 bg-stone-200 border border-neo-dark w-1/2 animate-pulse pb-1" />
          <div className="h-[200px] bg-stone-50 border-2 border-neo-dark border-dashed rounded animate-pulse" />
          <div className="space-y-2.5 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3.5 bg-stone-100 border border-stone-300 w-11/12 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Content viewer box */}
        <div className="lg:col-span-8 bg-white border-4 border-neo-dark p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex justify-between border-b pb-2">
            <div className="h-4 bg-stone-200 border border-neo-dark w-1/3 animate-pulse" />
            <div className="h-4 bg-stone-200 border border-neo-dark w-20 animate-pulse" />
          </div>
          <div className="space-y-3.5 pt-2">
            <div className="h-4 bg-stone-100 border border-stone-200 w-11/12 animate-pulse" />
            <div className="h-4 bg-stone-100 border border-stone-200 w-full animate-pulse" />
            <div className="h-4 bg-stone-100 border border-stone-200 w-10/12 animate-pulse" />
            <div className="h-4 bg-stone-100 border border-stone-200 w-11/12 animate-pulse" />
            <div className="h-4 bg-stone-100 border border-stone-200 w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonAnnotationDetailPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Breadcrumb row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-neo-dark pb-3">
        <div className="space-y-1 w-full max-w-lg">
          <div className="h-3.5 bg-stone-100 border border-stone-300 w-32 animate-pulse" />
          <div className="h-5.5 bg-stone-350 border-2 border-neo-dark w-10/12 animate-pulse" />
        </div>
        <div className="h-8 bg-stone-100 border border-neo-dark w-24 animate-pulse" />
      </div>

      <div className="max-w-3xl mx-auto bg-white border-4 border-neo-dark p-6 shadow-[5px_5px_0px_rgba(0,0,0,1)] space-y-6">
        {/* Quote Block block placeholder */}
        <div className="p-4 bg-amber-50/40 border-l-4 border-l-neo-orange border-2 border-neo-dark rounded-sm space-y-2">
          <div className="h-3.5 bg-stone-200 border border-neo-dark w-full animate-pulse" />
          <div className="h-3.5 bg-stone-100 border border-neo-dark w-11/12 animate-pulse" />
          <div className="h-3.5 bg-stone-100 border border-neo-dark w-2/3 animate-pulse" />
        </div>

        {/* Content Details */}
        <div className="space-y-3 pt-2">
          <div className="h-4 bg-stone-200 border-2 border-neo-dark w-1/4 animate-pulse" />
          <div className="h-16 bg-stone-50 border border-stone-300 animate-pulse rounded p-3" />
        </div>

        {/* Comment log simulator */}
        <div className="border-t-2 border-neo-dark pt-4 space-y-4">
          <div className="h-4 bg-stone-200 border border-neo-dark w-32 animate-pulse" />
          {[1, 2].map((i) => (
            <div key={i} className="p-3 bg-stone-50 border border-stone-200 rounded space-y-2">
              <div className="flex justify-between text-xs">
                <div className="h-3.5 bg-stone-200 border border-neo-dark w-20 animate-pulse" />
                <div className="h-3 bg-stone-100 border border-stone-250 w-12 animate-pulse" />
              </div>
              <div className="h-3 w-10/12 bg-stone-100 border border-stone-150 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// TAB CONTENT LEVEL SKELETONS (Accurate placeholders for tab panels in App.tsx)

export const SkeletonStatsTab: React.FC = () => {
  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Stat Cards 3-Row Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded border-2 border-neo-dark shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div className="space-y-1 w-2/3">
              <div className="h-3 bg-stone-200 border border-neo-dark w-24 animate-pulse" />
              <div className="h-7 bg-stone-250 border-2 border-neo-dark w-12 pt-1 animate-pulse" />
              <div className="h-2.5 bg-stone-100 border border-stone-200 w-full animate-pulse mt-1" />
            </div>
            <div className="bg-stone-150 p-3 rounded-sm border-2 border-neo-dark animate-pulse w-12 h-12 shadow-[2px_2px_0px_#0A0A0A]" />
          </div>
        ))}
      </div>

      {/* Grid: Heatmap + Line chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap column */}
        <div className="bg-white p-5 rounded border-2 border-neo-dark shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex justify-between items-center border-b-2 border-neo-dark pb-3">
            <div className="h-4.5 bg-stone-200 border-2 border-neo-dark w-36 animate-pulse" />
            <div className="h-4 bg-stone-100 border border-stone-300 w-24 animate-pulse" />
          </div>
          <div className="h-3.5 bg-stone-100 border border-stone-200 w-3/4 animate-pulse" />
          {/* Mock Grid */}
          <div className="p-4 bg-stone-50 border-2 border-neo-dark border-dashed animate-pulse h-36 flex flex-col justify-between">
            <div className="flex gap-2">
              {Array.from({ length: 12 }).map((_, j) => (
                <div key={j} className="h-4 bg-stone-200 w-6 border border-stone-350" />
              ))}
            </div>
            <div className="h-20 bg-stone-100 border border-stone-200 w-full rounded" />
          </div>
        </div>

        {/* Line Chart column */}
        <div className="bg-white p-5 rounded border-2 border-neo-dark shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex justify-between items-center border-b-2 border-neo-dark pb-3">
            <div className="h-4.5 bg-stone-200 border-2 border-neo-dark w-44 animate-pulse" />
            <div className="h-4 bg-stone-100 border border-stone-300 w-16 animate-pulse" />
          </div>
          <div className="h-3.5 bg-stone-100 border border-stone-200 w-2/3 animate-pulse" />
          <div className="h-36 bg-stone-50 border-2 border-neo-dark border-dashed animate-pulse flex items-center justify-center">
            <div className="h-4 bg-stone-200 border-2 border-neo-dark w-1/3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonSourcesList: React.FC = () => {
  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Search and Action Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
        <div className="relative flex-1 w-full">
          <div className="h-10 bg-white border-2 border-neo-dark shadow-[2px_2px_0px_rgba(0,0,0,1)] w-full animate-pulse flex items-center pl-10">
            <div className="h-3.5 bg-stone-200 border border-neo-dark w-2/5" />
          </div>
        </div>
        <div className="h-10 bg-stone-100 border-2 border-neo-dark shadow-[2px_2px_0px_#000] w-full md:w-44 animate-pulse shrink-0" />
      </div>

      {/* Sources Grid Card lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white p-5 rounded border-2 border-neo-dark shadow-[3px_3px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-56">
            <div>
              <div className="flex justify-between items-start gap-2 mb-3">
                <div className="h-5 bg-[#FFE44D]/40 border border-neo-dark w-12 animate-pulse shadow-[1px_1px_0px_#000]" />
                <div className="h-5 bg-stone-100 border border-neo-dark w-24 animate-pulse flex items-center px-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-stone-400 mr-1" />
                  <div className="h-2 bg-stone-200 w-full" />
                </div>
              </div>

              <div className="space-y-1.5 mt-2">
                <div className="h-4 bg-stone-200 border-2 border-neo-dark w-11/12 animate-pulse" />
                <div className="h-4 bg-stone-200 border-2 border-neo-dark w-2/3 animate-pulse" />
              </div>

              <div className="space-y-2.5 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-xs bg-stone-100 border border-stone-300 animate-pulse" />
                  <div className="h-3.5 bg-stone-150 border border-stone-200 w-2/3 animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-xs bg-stone-100 border border-stone-300 animate-pulse" />
                  <div className="h-3.5 bg-stone-150 border border-stone-200 w-1/2 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-dashed border-stone-200 flex justify-between items-center text-xs font-bold">
              <div className="h-3 bg-stone-200 border border-neo-dark w-28 animate-pulse" />
              <div className="h-3.5 w-3.5 bg-stone-200 border border-neo-dark animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonSourcesTab: React.FC = SkeletonSourcesList;

export const SkeletonAnnotationsList: React.FC = () => {
  return (
    <div className="space-y-4 text-left animate-fadeIn">
      {/* Title & stats loading block */}
      <div className="bg-white border-4 border-neo-dark p-4 rounded-xs shadow-[3.5px_3.5px_0px_rgba(0,0,0,1)] flex items-center justify-between mb-4">
        <div className="space-y-1.5 flex-1">
          <div className="h-4.5 bg-stone-200 border-2 border-neo-dark w-1/3 animate-pulse" />
          <div className="h-3 bg-stone-100 border border-stone-200 w-2/3 animate-pulse" />
        </div>
        <div className="w-10 h-10 bg-[#FF6B4A]/20 border-2 border-neo-dark rounded-sm animate-pulse" />
      </div>

      {[1, 2, 3].map((i) => (
        <div key={i} className="p-5 bg-white border-2 border-neo-dark shadow-[3.5px_3.5px_0px_rgba(0,0,0,1)] space-y-4 rounded-sm">
          {/* Top meta card row */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-stone-200 border-2 border-neo-dark rounded-full animate-pulse" />
              <div className="space-y-1">
                <div className="h-3.5 bg-stone-200 border-2 border-neo-dark w-24 animate-pulse" />
                <div className="h-2.5 bg-stone-100 border border-stone-200 w-16 animate-pulse" />
              </div>
            </div>
            <div className="h-5 bg-stone-50 border border-stone-300 w-20 animate-pulse text-[9px] uppercase font-mono px-1 rounded" />
          </div>

          {/* Quote Block selector placeholder */}
          <div className="p-3 bg-stone-50 border-l-4 border-l-neo-orange border-2 border-neo-dark relative rounded-xs space-y-1.5">
            <div className="h-3 bg-stone-200 border border-neo-dark w-10/12 animate-pulse" />
            <div className="h-3 bg-stone-100 border border-neo-dark w-11/12 animate-pulse" />
            <div className="h-3 bg-stone-100 border border-neo-dark w-2/3 animate-pulse" />
          </div>

          {/* Content block text lines */}
          <div className="space-y-2 pt-1">
            <div className="h-4 bg-stone-100 border border-stone-200 animate-pulse w-full" />
            <div className="h-4 bg-stone-100 border border-stone-200 animate-pulse w-11/12" />
          </div>

          <div className="flex justify-between items-center pt-3 border-t-2 border-dashed border-stone-200">
            <div className="h-6 bg-stone-100 border border-neo-dark w-32 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-7 bg-stone-100 border border-neo-dark w-14 animate-pulse" />
              <div className="h-7 bg-[#2DD4BF]/30 border-2 border-neo-dark w-16 animate-pulse shadow-[1px_1px_0px_#000]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonAnnotationsTab: React.FC = SkeletonAnnotationsList;

export interface SkeletonMembersTabProps {
  myRole?: string;
}

export const SkeletonMembersTab: React.FC<SkeletonMembersTabProps> = ({ myRole = "OWNER" }) => {
  const isOwner = myRole === "OWNER";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left animate-fadeIn">
      {/* Invite Personnel Form Skeleton */}
      <div className="md:col-span-1 bg-white p-4 rounded-sm border-4 border-neo-dark shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
        <h3 className="font-display font-black text-xs uppercase tracking-wider text-stone-500 border-b-2 border-stone-200 pb-2.5 flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-emerald-600/30 border border-emerald-700 animate-pulse shrink-0" />
          <div className="h-3.5 bg-stone-200 border border-neo-dark w-28 animate-pulse" />
        </h3>

        {isOwner ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="h-3 bg-stone-200 border border-stone-300 w-36 animate-pulse" />
              <div className="h-9 w-full bg-white border-2 border-neo-dark rounded animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <div className="h-3 bg-stone-200 border border-stone-300 w-32 animate-pulse" />
              <div className="h-9 w-full bg-white border-2 border-neo-dark rounded animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="bg-amber-50/50 border-2 border-neo-dark rounded-sm p-3.5 shadow-[2.5px_2.5px_0px_#000] flex items-start gap-3 animate-pulse">
            <div className="w-7 h-7 rounded border-2 border-neo-dark bg-amber-200/50 animate-pulse shrink-0" />
            <div className="space-y-1.5 flex-1 select-none">
              <div className="h-2 bg-stone-300 w-1/2 animate-pulse" />
              <div className="h-3 bg-stone-200 w-full animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Personnel List Skeleton */}
      <div className="md:col-span-2 bg-white p-4 rounded-sm border-4 border-neo-dark shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
        <h3 className="font-display font-black text-xs uppercase tracking-wider text-stone-500 border-b-2 border-stone-200 pb-2.5 flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-rose-500/30 border border-rose-600 animate-pulse shrink-0" />
          <div className="h-3.5 bg-stone-200 border border-neo-dark w-44 animate-pulse" />
        </h3>

        <div className="divide-y-2 divide-stone-100 pr-1 space-y-3 pt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-200 border-2 border-neo-dark animate-pulse shrink-0" />
                <div className="space-y-1">
                  <div className="h-3.5 bg-stone-250 border border-neo-dark w-28 animate-pulse" />
                  <div className="h-2.5 bg-stone-100 border border-stone-200 w-36 animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-16 bg-[#FFE44D]/25 border-2 border-neo-dark rounded-sm animate-pulse shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SkeletonChatTab: React.FC = () => {
  return (
    <div className="bg-white rounded border-4 border-neo-dark p-4 shadow-[4px_4px_0px_#000] space-y-4 text-left animate-fadeIn h-[500px] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b-2 border-stone-250 pb-2 mb-3">
          <div className="h-4.5 bg-stone-200 border-2 border-neo-dark w-36 animate-pulse" />
          <div className="h-5 bg-stone-100 border border-stone-200 w-16" />
        </div>

        {/* Message streams */}
        <div className="space-y-3 pt-1">
          {/* Left Bubble */}
          <div className="flex items-start gap-2.5 max-w-sm">
            <div className="w-7 h-7 bg-stone-200 border-2 border-neo-dark rounded-full shrink-0 animate-pulse" />
            <div className="bg-stone-100 border-2 border-neo-dark p-2.5 rounded shadow-[1px_1px_0px_#000] w-full space-y-1.5 animate-pulse">
              <div className="h-3 bg-stone-200 w-3/4" />
              <div className="h-2.5 bg-stone-150 w-2/3" />
            </div>
          </div>
          {/* Right Bubble */}
          <div className="flex items-start gap-2.5 max-w-sm ml-auto flex-row-reverse">
            <div className="w-7 h-7 bg-stone-200 border-2 border-neo-dark rounded-full shrink-0 animate-pulse" />
            <div className="bg-[#FFE44D]/20 border-2 border-neo-dark p-2.5 rounded shadow-[1px_1px_0px_#000] w-full space-y-1.5 animate-pulse">
              <div className="h-3 bg-stone-255 w-5/6" />
              <div className="h-2.5 bg-stone-150 w-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Input row */}
      <div className="flex gap-2 pt-2 border-t-2 border-neo-dark">
        <div className="h-10 bg-white border-2 border-neo-dark flex-1 animate-pulse" />
        <div className="h-10 bg-[#FF6B4A]/20 border-2 border-neo-dark w-20 animate-pulse shrink-0" />
      </div>
    </div>
  );
};

export const SkeletonQALayout: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[740px] items-stretch animate-fadeIn text-left">
      {/* Search context settings sidebar */}
      <div className="w-full lg:w-80 shrink-0 bg-white border-2 border-neo-dark p-4 h-auto lg:h-full flex flex-col justify-between overflow-y-auto shadow-[3.5px_3.5px_0px_rgba(0,0,0,1)] min-h-[350px]">
        <div>
          <div className="flex items-start justify-between mb-4 border-b border-stone-200 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#FF6B4A]/20 border border-neo-dark rounded-xs animate-pulse" />
              <div className="h-4 w-28 bg-stone-200 border border-neo-dark animate-pulse" />
            </div>
            <div className="w-6 h-6 bg-stone-100 border border-stone-300 rounded-xs animate-pulse" />
          </div>
          
          <div className="space-y-1.5 mb-5">
            <div className="h-3 bg-stone-100 border border-stone-200 w-full animate-pulse" />
            <div className="h-3 bg-stone-100 border border-stone-200 w-11/12 animate-pulse" />
          </div>

          <div className="space-y-3">
            <div className="h-3 bg-stone-200 border border-stone-300 w-28 animate-pulse" />
            <div className="grid grid-cols-1 gap-3 pt-1.55">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-start gap-3.5 p-3.5 rounded-xs border-2 bg-white border-stone-200 animate-pulse">
                  <div className="w-5 h-5 rounded-xs border-2 border-neo-dark bg-stone-50 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-stone-200 border border-stone-300 w-11/12 animate-pulse" />
                    <div className="h-2.5 bg-stone-100 border border-stone-200 w-2/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3.5 bg-[#FFFbeb]/60 border-2 border-neo-dark rounded-xs shadow-[2px_2px_0px_#0A0A0A] space-y-1.5">
            <div className="h-3 bg-neo-orange/20 border border-neo-dark w-1/3 animate-pulse" />
            <div className="h-2.5 bg-stone-150 w-full animate-pulse" />
          </div>
        </div>

        <div className="h-10 bg-stone-150 border-2 border-neo-dark w-full animate-pulse mt-4 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] text-xs font-bold shrink-0" />
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 bg-white border-2 border-neo-dark flex flex-col h-[550px] lg:h-full overflow-hidden shadow-[3.5px_3.5px_0px_rgba(0,0,0,1)]">
        {/* Messages feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex flex-col max-w-[85%] mr-auto items-start">
            <div className="p-3.5 bg-amber-50/20 border-2 border-neo-dark rounded-r-lg rounded-tl-lg shadow-[1.5px_1.5px_0px_#0A0A0A] w-[450px] max-w-full space-y-2 animate-pulse">
              <div className="h-4 bg-stone-200 border-2 border-neo-dark w-11/12" />
              <div className="h-3.5 bg-stone-100 border border-stone-200 w-10/12" />
              <div className="h-3.5 bg-stone-100 border border-stone-200 w-2/3" />
            </div>
            <div className="h-2.5 bg-stone-100 border border-stone-200 w-10 mt-1 animate-pulse" />
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex flex-wrap gap-2 items-center">
          <div className="h-3.5 bg-stone-200 border border-stone-300 w-16 animate-pulse" />
          <div className="h-7 w-48 bg-white border border-neo-dark shadow-[1px_1px_0px_#0A0A0A] animate-pulse" />
          <div className="h-7 w-36 bg-white border border-neo-dark shadow-[1px_1px_0px_#0A0A0A] animate-pulse" />
        </div>

        {/* Input area */}
        <div className="p-3 border-t-4 border-neo-dark bg-stone-50 flex gap-2 items-center">
          <div className="flex-1 h-10 bg-white border-2 border-neo-dark animate-pulse" />
          <div className="w-10 h-10 bg-[#FF6B4A]/20 border-2 border-neo-dark flex items-center justify-center shadow-[1.5px_1.5px_0px_#000] shrink-0 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonAuditTrail: React.FC = () => {
  return (
    <div className="bg-white rounded border-4 border-neo-dark p-5 shadow-[4px_4px_0px_#000] space-y-4 text-left animate-fadeIn">
      <div className="border-b-2 border-stone-250 pb-2 flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-4.5 bg-stone-200 border-2 border-neo-dark w-36 animate-pulse" />
          <div className="h-3 bg-stone-100 border border-stone-250 w-48 animate-pulse mt-0.5" />
        </div>
        <div className="h-5 bg-stone-100 border border-stone-300 w-24 text-xs font-mono" />
      </div>

      {/* Row columns list */}
      <div className="space-y-2 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between items-center p-2.5 border border-stone-200 odd:bg-stone-50/50">
            <div className="flex items-center gap-3 w-3/4">
              <div className="w-5 h-5 bg-stone-250 rounded border border-neo-dark animate-pulse" />
              <div className="space-y-1 w-full">
                <div className="h-3.5 bg-stone-200 border border-neo-dark w-2/3 animate-pulse" />
                <div className="h-2 bg-stone-100 w-1/4 animate-pulse" />
              </div>
            </div>
            <div className="h-3 bg-stone-100 border border-stone-300 w-14 animate-pulse text-[10px]" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonVaultSettings: React.FC = () => {
  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* DESKTOP FLEX LAYOUT */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* COLLAPSIBLE SIDEBAR: Desktop only */}
        <div className="hidden md:flex flex-col shrink-0 bg-white border-4 border-neo-dark rounded-sm p-4 shadow-[4px_4px_0px_#000] w-64">
          <div className="border-b-2 border-stone-200 pb-3 mb-4 flex items-center justify-between">
            <div className="text-left space-y-1.5 w-max">
              <div className="h-4 bg-stone-200 border border-neo-dark w-24 animate-pulse" />
              <div className="h-2.5 bg-stone-100 border border-stone-200 w-16 animate-pulse" />
            </div>
          </div>

          {/* Sidebar Tab Options */}
          <div className="space-y-2 flex-1 relative z-10">
            <div className="h-10 w-full bg-[#FFE44D]/25 border-2 border-neo-dark rounded shadow-[1.5px_1.5px_0px_#000] animate-pulse flex items-center px-3 gap-2.5">
              <div className="w-4 h-4 rounded-xs bg-neo-dark/30 animate-pulse" />
              <div className="h-3.5 bg-neo-dark/20 w-32 animate-pulse" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-full bg-stone-50 border-2 border-neo-dark rounded shadow-[1.5px_1.5px_0px_#000] animate-pulse flex items-center px-3 gap-2.5">
                <div className="w-4 h-4 rounded-xs bg-stone-300 animate-pulse" />
                <div className="h-3.5 bg-stone-200 w-24 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Collapse Trigger line */}
          <div className="pt-4 border-t-2 border-dashed border-stone-200 mt-6 flex justify-center">
            <div className="h-6 w-full bg-stone-100 border-2 border-neo-dark rounded animate-pulse" />
          </div>
        </div>

        {/* CONTENT VIEWPORT */}
        <div className="flex-1 w-full space-y-6">
          <div className="bg-white rounded-sm border-4 border-neo-dark p-5 shadow-[4px_4px_0px_#000] space-y-5 text-left">
            <div className="border-b-2 border-stone-200 pb-2 flex items-center justify-between flex-wrap gap-2 pb-3 mb-1">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-stone-250 border border-stone-300 rounded shrink-0 animate-pulse" />
                <div className="h-4 bg-stone-200 border border-neo-dark w-44 animate-pulse" />
              </div>
              <div className="h-5 w-24 bg-[#FFE44D]/30 border-2 border-neo-dark rounded animate-pulse shadow-[1px_1px_0px_#000]" />
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border-2 border-neo-dark p-4 rounded shadow-[2.5px_2.5px_0px_#000] flex justify-between items-center gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-stone-200 border border-neo-dark w-1/3 animate-pulse" />
                    <div className="h-3.5 bg-stone-100 border border-stone-200 w-2/3 animate-pulse" />
                  </div>
                  {/* Toggle button on the right */}
                  <div className="h-8 w-20 bg-stone-100 border-2 border-neo-dark rounded animate-pulse shrink-0" />
                </div>
              ))}
              {/* Yellow info card skeleton */}
              <div className="p-4 bg-amber-50/80 border-2 border-neo-dark rounded shadow-[2.5px_2.5px_0px_#000] flex gap-3 animate-pulse">
                <div className="w-5 h-5 bg-amber-250 border border-neo-dark rounded shrink-0 animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-stone-200 border border-stone-300 w-11/12 animate-pulse" />
                  <div className="h-3.5 bg-stone-100 border border-stone-200 w-2/3 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
