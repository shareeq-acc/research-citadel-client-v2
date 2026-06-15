"use client";

import { useState, useEffect } from "react";
import { VaultMember, AuditLog } from "@/types";
import { Star, BarChart, Users, Zap, Award, Calendar, TrendingUp } from "lucide-react";
import { vaultService } from "@/services";

interface StatsTabProps {
  vaultId: string;
  members: VaultMember[];
  auditData: {
    total: number;
    graph: Array<{ date: string; count: number }>;
  } | null;
}

export default function StatsTab({ vaultId, members, auditData }: StatsTabProps) {
  const [userStats, setUserStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<{ name: string; count: number; x: number; y: number } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await vaultService.getStats(vaultId);
        if (res.success) {
          setUserStats(res.data as any[]);
        }
      } catch (err) {
        console.error("Failed to load vault stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [vaultId]);

  // Aggregate stats parameters
  const totalContributions = userStats.reduce((sum, item) => sum + item.totalCount, 0);
  const activeContributorsCount = userStats.filter((item) => item.totalCount > 0).length;
  const topContributor = userStats.length > 0 ? userStats[0] : null;

  // Render Contribution Heatmap cells (7 days by 12 weeks = 84 cells)
  const heatmapCells = auditData?.graph || [];

  const weekMonthLabels = Array.from({ length: 12 }, (_, w) => {
    if (heatmapCells.length === 0) return "";
    const dayIndex = w * 7;
    if (dayIndex >= heatmapCells.length) return "";
    const currentCellDate = heatmapCells[dayIndex].date;
    try {
      const d = new Date(currentCellDate);
      const mName = d.toLocaleDateString("en-US", { month: "short" });
      if (w === 0) return mName;
      const prevDayIndex = (w - 1) * 7;
      const prevCellDate = heatmapCells[prevDayIndex].date;
      const prevD = new Date(prevCellDate);
      const prevMName = prevD.toLocaleDateString("en-US", { month: "short" });
      if (mName !== prevMName) return mName;
    } catch {
      // ignores error
    }
    return "";
  });

  const formatDateFriendly = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Visual SVG chart calculation variables
  const chartHeight = 160;
  const barCount = userStats.length;
  const startX = 40; // Cozy start position on X axis (leaving room for labels)
  const barSpacing = 55; // Cozy spacing between adjacent bars
  const barWidth = 32; // Compact solid bar width
  const chartWidth = Math.max(450, startX + barCount * barSpacing + 20);
  const highestCount = userStats.length > 0 ? Math.max(...userStats.map((u) => u.totalCount || 0)) : 10;
  const maxVal = highestCount === 0 ? 10 : highestCount;

  return (
    <div className="space-y-6">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded neo-border neo-shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-stone-500 uppercase">Total Actions</div>
            <div className="text-4xl font-display font-extrabold mt-1 text-neo-dark">
              {loading ? "..." : totalContributions}
            </div>
            <p className="text-[10px] text-stone-500 mt-1 font-sans">Sources added, notes written, and edits made</p>
          </div>
          <div className="bg-neo-yellow p-3 rounded-sm border-2 border-neo-dark text-neo-dark shadow-[2px_2px_0px_#0A0A0A]">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded neo-border neo-shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-stone-500 uppercase">Members</div>
            <div className="text-4xl font-display font-extrabold mt-1 text-neo-dark">
              {members.length}
            </div>
            <p className="text-[10px] text-stone-500 mt-1 font-sans">Owners and contributors in this vault</p>
          </div>
          <div className="bg-neo-accent p-3 rounded-sm border-2 border-neo-dark text-neo-dark shadow-[2px_2px_0px_#0A0A0A]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded neo-border neo-shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-stone-500 uppercase">Top Contributor</div>
            <div className="text-xl font-display font-extrabold mt-2 text-neo-dark leading-tight line-clamp-1">
              {loading ? "..." : (topContributor ? topContributor.user.name : "N/A")}
            </div>
            <p className="text-[10px] text-stone-500 mt-1 font-sans">
              {topContributor ? `${topContributor.totalCount} actions recorded` : "No activity yet"}
            </p>
          </div>
          <div className="bg-neo-orange p-3 rounded-sm border-2 border-neo-dark text-white shadow-[2px_2px_0px_#0A0A0A]">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Heatmap + Line chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Heatmap column */}
        <div className="bg-white p-5 rounded neo-border neo-shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-neo-dark pb-2 mb-3">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-neo-dark flex items-center gap-2">
                <div className="p-1.5 bg-neo-yellow border-2 border-neo-dark rounded shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-neo-dark stroke-[2.5]" />
                </div>
                Contribution Heatmap
              </h3>
              <span className="text-[9px] font-mono font-bold bg-[#FAFAF9] px-2 py-0.5 border border-neo-dark text-stone-600 rounded">
                12 Weeks
              </span>
            </div>
            <p className="text-stone-500 text-xs mb-4 font-sans">
              Daily activity over the last 12 weeks.
            </p>
          </div>

          <div className="heatmap-container relative flex flex-col select-none w-full">
            {/* Cell Tooltip rendered absolute to container */}
            {hoveredCell && (
              <div
                className="absolute bg-neo-dark text-white border-2 border-neo-dark text-[10px] font-mono font-bold p-2 px-2.5 rounded shadow-[3px_3px_0px_rgba(0,0,0,1)] pointer-events-none z-30 whitespace-nowrap transition-all duration-75"
                style={{
                  left: `${hoveredCell.x}px`,
                  top: `${hoveredCell.y - 48}px`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="text-neo-yellow text-[9px] uppercase tracking-wider">
                  {formatDateFriendly(hoveredCell.date)}
                </div>
                <div className="text-[10px] mt-0.5 text-stone-100">
                {hoveredCell.count === 0 ? "No activity" : `${hoveredCell.count} action${hoveredCell.count !== 1 ? "s" : ""}`}
                </div>
                {/* Tooltip pointer notch */}
                <div className="w-1.5 h-1.5 bg-neo-dark border-r-2 border-b-2 border-neo-dark rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
              </div>
            )}

            {/* Heatmap Grid Wrapper with horizontal auto-scroll */}
            <div className="w-full overflow-x-auto pb-2 select-none neo-scroll-x">
              <div className="w-max flex flex-col gap-1.5 pr-1">
                {/* Months Row */}
                <div className="flex gap-2.5">
                  {/* Spacer for day label alignment */}
                  <div className="w-8 shrink-0" />
                  {/* Month headers grid */}
                  <div className="grid grid-cols-12 gap-[4px] w-[260px] text-[9px] font-mono font-black text-stone-400 uppercase tracking-tight">
                    {weekMonthLabels.map((lbl, idx) => (
                      <span key={idx} className="relative h-4 font-bold text-stone-500 uppercase" style={{ width: "18px" }}>
                        {lbl && (
                          <span className="absolute left-0 top-0 whitespace-nowrap text-[11px] font-black text-neo-dark tracking-normal">
                            {lbl}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Day labels + Grid layout */}
                <div className="flex gap-2.5 items-center">
                  {/* Day labels */}
                  <div className="grid grid-rows-7 gap-[4px] h-[150px] text-[10px] font-mono text-stone-500 justify-end pr-1.5 shrink-0 w-8 select-none">
                    <span className="flex items-center justify-end">Mon</span>
                    <span className="flex items-center justify-end opacity-0">Tue</span>
                    <span className="flex items-center justify-end">Wed</span>
                    <span className="flex items-center justify-end opacity-0">Thu</span>
                    <span className="flex items-center justify-end">Fri</span>
                    <span className="flex items-center justify-end opacity-0">Sat</span>
                    <span className="flex items-center justify-end">Sun</span>
                  </div>

                  {/* 7 Rows x 12 Columns Grid */}
                  <div className="grid grid-rows-7 grid-flow-col gap-[4px] h-[150px] items-center w-[260px]" style={{ width: "260px" }}>
                    {heatmapCells.map((cell, idx) => {
                      let colorClass = "bg-stone-50 border border-stone-200 hover:border-neo-dark hover:bg-stone-100 hover:scale-110";
                      if (cell.count > 5) {
                        colorClass = "bg-emerald-500 border border-neo-dark shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:bg-emerald-600 hover:scale-115 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]";
                      } else if (cell.count > 2) {
                        colorClass = "bg-emerald-300 border border-neo-dark shadow-[0.7px_0.7px_0px_rgba(0,0,0,1)] hover:bg-emerald-400 hover:scale-115 hover:shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]";
                      } else if (cell.count > 0) {
                        colorClass = "bg-[#D1FAE5] border border-neo-dark/70 shadow-[0.5px_0.5px_0px_rgba(0,0,0,1)] hover:bg-[#A7F3D0] hover:scale-115 hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]";
                      }

                      return (
                        <div
                          key={idx}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const container = e.currentTarget.closest(".heatmap-container");
                            if (container) {
                              const containerRect = container.getBoundingClientRect();
                              setHoveredCell({
                                date: cell.date,
                                count: cell.count,
                                x: rect.left - containerRect.left + rect.width / 2,
                                y: rect.top - containerRect.top,
                              });
                            }
                          }}
                          onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const container = e.currentTarget.closest(".heatmap-container");
                            if (container) {
                              const containerRect = container.getBoundingClientRect();
                              setHoveredCell({
                                date: cell.date,
                                count: cell.count,
                                x: rect.left - containerRect.left + rect.width / 2,
                                y: rect.top - containerRect.top,
                              });
                            }
                          }}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`w-[18px] h-[18px] rounded-xs transition-all duration-100 cursor-pointer relative ${colorClass}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Scale legend */}
            <div className="flex justify-end gap-2 items-center mt-3 text-[10px] text-neo-dark font-mono pr-2 select-none">
              <span className="font-bold text-stone-500">Less</span>
              <div className="w-3.5 h-3.5 bg-stone-50 border border-stone-200 rounded-xs" />
              <div className="w-3.5 h-3.5 bg-[#D1FAE5] border border-neo-dark/70 rounded-xs shadow-[0.5px_0.5px_0px_rgba(0,0,0,1)]" />
              <div className="w-3.5 h-3.5 bg-emerald-300 border border-neo-dark rounded-xs shadow-[1px_1px_0px_rgba(0,0,0,1)]" />
              <div className="w-3.5 h-3.5 bg-emerald-500 border border-neo-dark rounded-xs shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]" />
              <span className="font-black text-neo-dark">More</span>
            </div>
          </div>
        </div>

        {/* Custom neobrutalist line chart */}
        <div className="bg-white p-5 rounded neo-border neo-shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between border-b-2 border-neo-dark pb-2 mb-3">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-neo-dark flex items-center gap-2">
                <div className="p-1.5 bg-[#00D4AA] border-2 border-neo-dark rounded shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-neo-dark stroke-[2.5]" />
                </div>
                Activity by Member
              </h3>
              <span className="text-[9px] font-mono font-bold bg-[#FAFAF9] px-2 py-0.5 border border-neo-dark text-stone-600 rounded">
                Bar Chart
              </span>
            </div>
            <p className="text-stone-500 text-xs mb-3 font-sans">
              Total actions per member in this vault.
            </p>
          </div>

          {loading ? (
            <div className="h-40 space-y-3 p-4 flex flex-col justify-center animate-pulse border-2 border-dashed border-stone-300">
              <div className="h-4 bg-stone-200 border-2 border-neo-dark w-1/3" />
              <div className="h-4 bg-stone-200 border-2 border-neo-dark w-2/3" />
              <div className="h-4 bg-stone-200 border-2 border-neo-dark w-full" />
            </div>
          ) : userStats.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs italic text-stone-400">
              No activity to show yet.
            </div>
          ) : (
            <div className="chart-container relative w-full">
              {/* Tooltip rendered elements absolute to container */}
              {hoveredBar && (
                <div
                  className="absolute bg-neo-dark text-white border-2 border-neo-dark text-[10px] font-mono font-bold p-2 px-2.5 rounded shadow-[3px_3px_0px_rgba(0,0,0,1)] pointer-events-none z-10 whitespace-nowrap transition-all duration-75"
                  style={{
                    left: `${hoveredBar.x}px`,
                    top: `${hoveredBar.y - 48}px`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="text-neo-yellow uppercase tracking-wider">{hoveredBar.name}</div>
                  <div className="text-[9px] mt-0.5 text-stone-305">{hoveredBar.count} action{hoveredBar.count !== 1 ? "s" : ""}</div>
                  {/* Tooltip pointer notch */}
                  <div className="w-1.5 h-1.5 bg-neo-dark border-r-2 border-b-2 border-neo-dark rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                </div>
              )}

              {/* Scroll wrapper */}
              <div className="w-full overflow-x-auto pb-4 select-none neo-scroll-x">
                <div style={{ width: `${chartWidth}px` }} className="h-[175px] relative">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                    {/* Horizontal mesh grids */}
                    <line x1="28" y1="20" x2={chartWidth - 10} y2="20" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="28" y1="75" x2={chartWidth - 10} y2="75" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="28" y1="130" x2={chartWidth - 10} y2="130" stroke="#000" strokeWidth="3" />

                    {/* Vertical Y-axis */}
                    <line x1="28" y1="15" x2="28" y2="130" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" />

                    {/* Y-axis Labels */}
                    <text x="20" y="24" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#555555" textAnchor="end">
                      {Math.round(maxVal)}
                    </text>
                    <text x="20" y="79" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#555555" textAnchor="end">
                      {Math.round(maxVal / 2)}
                    </text>
                    <text x="20" y="134" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#555555" textAnchor="end">
                      0
                    </text>

                    {/* Bars generation and index indicators for all researchers */}
                    {userStats.map((stat, i) => {
                      const x = startX + i * barSpacing;
                      const barHeight = Math.max(8, (stat.totalCount / maxVal) * 110);
                      const y = 130 - barHeight;

                      const colors = ["#FFD700", "#FF6B35", "#00D4AA", "#7C3AED", "#EF4444"];
                      const col = colors[i % colors.length];

                      return (
                        <g 
                          key={stat.user.id} 
                          className="group cursor-pointer"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const container = e.currentTarget.closest(".chart-container");
                            if (container) {
                              const containerRect = container.getBoundingClientRect();
                              setHoveredBar({
                                name: stat.user.name,
                                count: stat.totalCount,
                                x: rect.left - containerRect.left + rect.width / 2,
                                y: rect.top - containerRect.top,
                              });
                            }
                          }}
                          onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const container = e.currentTarget.closest(".chart-container");
                            if (container) {
                              const containerRect = container.getBoundingClientRect();
                              setHoveredBar({
                                name: stat.user.name,
                                count: stat.totalCount,
                                x: rect.left - containerRect.left + rect.width / 2,
                                y: rect.top - containerRect.top,
                              });
                            }
                          }}
                          onMouseLeave={() => setHoveredBar(null)}
                        >
                          {/* Main bar */}
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            fill={col}
                            stroke="#0A0A0A"
                            strokeWidth="3"
                            rx="1"
                            className="transition-all duration-200 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                          {/* Black offset silhouette shadow for perfect neobrutalist theme */}
                          <rect
                            x={x + 3}
                            y={y + 3}
                            width={barWidth}
                            height={barHeight}
                            fill="none"
                            stroke="#0A0A0A"
                            strokeWidth="2"
                            className="opacity-20 pointer-events-none"
                          />

                          {/* X coordinates labels */}
                          <text
                            x={x + barWidth / 2}
                            y="148"
                            fontFamily="var(--font-sans)"
                            fontSize="9"
                            fontWeight="bold"
                            fill="#555555"
                            textAnchor="middle"
                            className="line-clamp-1 truncate pointer-events-none"
                          >
                            {stat.user.name.split(" ")[0]}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Member breakdown details table list */}
      <div className="bg-white rounded neo-border neo-shadow-sm overflow-hidden p-5">
        <div className="flex items-center gap-2 border-b-2 border-neo-dark pb-2 mb-4">
          <div className="p-1.5 bg-[#FF6B35] border-2 border-neo-dark rounded shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] flex items-center justify-center text-neo-dark">
            <Users className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          <h3 className="font-display font-black text-sm uppercase tracking-wider text-neo-dark">
            Members
          </h3>
        </div>
        {loading ? (
          <div className="p-4 space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="w-8 h-8 rounded-full bg-stone-200 border-2 border-neo-dark shrink-0" />
                  <div className="h-4 bg-stone-100 border-2 border-neo-dark w-1/4" />
                </div>
                <div className="h-4 bg-stone-100 border-2 border-neo-dark w-1/3" />
                <div className="h-4 bg-stone-200 border-2 border-neo-dark w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-4 border-neo-dark bg-stone-50 text-[10px] font-mono tracking-wider text-stone-500 uppercase">
                  <th className="p-3">Member</th>
                  <th className="p-3">Email</th>
                  <th className="p-3 text-center">Annotations</th>
                  <th className="p-3 text-center">Sources added</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b border-stone-200">
                {userStats.map((item) => {
                  const annAdded = item.actionCounts.ANNOTATION_ADDED || 0;
                  const annUpdated = item.actionCounts.ANNOTATION_UPDATED || 0;
                  const srcAdded = item.actionCounts.SOURCE_ADDED || 0;
                  const fileUp = item.actionCounts.FILE_UPLOADED || 0;

                  return (
                    <tr key={item.user.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3 flex items-center gap-2.5">
                        <img
                          src={item.user.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${item.user.name}`}
                          alt={item.user.name}
                          className="w-8 h-8 rounded-full border-2 border-neo-dark"
                        />
                        <div>
                          <div className="font-bold text-neo-dark">{item.user.name}</div>
                          <span className="text-[10px] bg-neo-muted border border-neo-dark px-1.5 py-0.5 rounded-sm font-mono font-bold mt-1 inline-block">
                            {item.user.id === "u-1" ? "Administrator" : "Researcher"}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-stone-600 text-xs">{item.user.email}</td>
                      <td className="p-3 text-center font-mono">
                        <span className="bg-amber-100 border border-neo-dark font-bold rounded px-1.5 py-0.5 text-xs text-amber-800">
                          {annAdded + annUpdated}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono">
                        <span className="bg-emerald-100 border border-neo-dark font-bold rounded px-1.5 py-0.5 text-xs text-emerald-800">
                          {srcAdded + fileUp}
                        </span>
                      </td>
                      <td className="p-3 text-right font-display font-black text-neo-dark">
                        {item.totalCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
