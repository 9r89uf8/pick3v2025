import React, { useState, useEffect } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import {
    fetchPairAnalysis,
    formatPairDataForChart,
    getHighlightedPairs,
    calculatePairStats,
    exportPairDataToCSV
} from '@/app/services/pairAnalysisService';

// Download Icon SVG Component
const DownloadIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

// Loading Spinner Component
const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="relative w-12 h-12">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
    </div>
);

const CalendarStatsIcon = () => (
    <svg className="w-5 h-5 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
    </svg>
);

const StarGridIcon = () => (
    <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 7.5h.01M12 7.5h.01M18 7.5h.01M6 12h.01M12 12h.01M18 12h.01M6 16.5h.01M12 16.5h.01M18 16.5h.01M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7c0-1.1.9-2 2-2z" />
    </svg>
);

const TargetHitsIcon = () => (
    <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
    </svg>
);

const TimelineIcon = () => (
    <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m4-3a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const PairTrackingGraph = ({ selectedMonth = null, selectedYear = null }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [targetPairStats, setTargetPairStats] = useState({});
    const [targetPairTimeline, setTargetPairTimeline] = useState([]);
    const [colorMap, setColorMap] = useState({});
    const [error, setError] = useState(null);
    const [totalHits, setTotalHits] = useState(0);

    // Target pairs to track exclusively
    const TARGET_PAIRS = {
        '1st & 2nd': ['0-1', '0-2', '1-2', '3-4', '1-4'],
        '1st & 3rd': ['1-8', '1-9', '0-9', '0-7', '0-8'],
        '2nd & 3rd': ['7-8', '8-9', '6-7', '5-7', '5-8']
    };

    // Flatten all target pairs for easy checking
    const ALL_TARGET_PAIRS = [
        ...TARGET_PAIRS['1st & 2nd'],
        ...TARGET_PAIRS['1st & 3rd'],
        ...TARGET_PAIRS['2nd & 3rd']
    ];

    useEffect(() => {
        loadPairAnalysis();
    }, [selectedMonth, selectedYear]);

    const loadPairAnalysis = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchPairAnalysis(selectedMonth, selectedYear);

            if (result.success) {
                setData(result.data);

                const formatted = formatPairDataForChart(result, ALL_TARGET_PAIRS);
                setChartData(formatted.chartData);
                setTargetPairStats(formatted.targetPairStats);
                setTargetPairTimeline(formatted.targetPairTimeline);
                setColorMap(formatted.colorMap);
                setTotalHits(formatted.totalTargetPairHits);
            } else {
                setError(result.error || 'Failed to load pair analysis');
            }
        } catch (err) {
            setError('Error loading pair analysis');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (!targetPairStats) return;

        let csvContent = `Target Pair Analysis - ${data?.summary.month} ${data?.summary.year}\n`;
        csvContent += 'Pair,Position,Count,Draws\n';

        Object.entries(targetPairStats).forEach(([pair, stats]) => {
            const position = TARGET_PAIRS['1st & 2nd'].includes(pair) ? '1st & 2nd' :
                            TARGET_PAIRS['1st & 3rd'].includes(pair) ? '1st & 3rd' : '2nd & 3rd';
            const drawNumbers = stats.draws.map(d => d.drawIndex).join(';');
            csvContent += `${pair},${position},${stats.count},"${drawNumbers}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `target-pairs-${data?.summary.month}-${data?.summary.year}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    // Calculate distribution data for charts
    const getDistributionData = () => {
        if (!targetPairStats) return { pieData: [], barData: [] };

        const sectionTotals = {
            '1st & 2nd': 0,
            '1st & 3rd': 0,
            '2nd & 3rd': 0
        };

        // Calculate totals for each section
        Object.entries(TARGET_PAIRS).forEach(([position, pairs]) => {
            pairs.forEach(pair => {
                const stats = targetPairStats[pair];
                if (stats) {
                    sectionTotals[position] += stats.count;
                }
            });
        });

        const grandTotal = Object.values(sectionTotals).reduce((sum, count) => sum + count, 0);

        // Pie chart data
        const pieData = Object.entries(sectionTotals).map(([position, count]) => ({
            name: position,
            value: count,
            percentage: grandTotal > 0 ? ((count / grandTotal) * 100).toFixed(1) : 0,
            color: colorMap[position]
        })).filter(item => item.value > 0); // Only show sections with data

        // Bar chart data - individual pairs
        const barData = [];
        Object.entries(TARGET_PAIRS).forEach(([position, pairs]) => {
            pairs.forEach(pair => {
                const stats = targetPairStats[pair];
                barData.push({
                    pair,
                    count: stats?.count || 0,
                    position,
                    color: colorMap[position]
                });
            });
        });

        return { pieData, barData, sectionTotals, grandTotal };
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                {error}
            </div>
        );
    }

    if (!data) {
        return (
            <div className="rounded-3xl border border-blue-500/30 bg-blue-500/10 p-4 text-blue-300">
                No pair analysis data available
            </div>
        );
    }

    const summaryCards = [
        {
            label: 'Total Draws Reviewed',
            value: data.summary.totalDraws,
            valueClass: 'text-sky-300',
            accent: 'from-sky-400/15 via-slate-900/40 to-slate-900/80',
            icon: <CalendarStatsIcon />,
            helper: 'Monthly dataset processed'
        },
        {
            label: 'Target Pairs Monitored',
            value: ALL_TARGET_PAIRS.length,
            valueClass: 'text-amber-300',
            accent: 'from-amber-400/20 via-slate-900/40 to-slate-900/80',
            icon: <StarGridIcon />,
            helper: 'Most active combinations'
        },
        {
            label: 'Total Pair Hits',
            value: totalHits,
            valueClass: 'text-emerald-300',
            accent: 'from-emerald-400/20 via-slate-900/40 to-slate-900/80',
            icon: <TargetHitsIcon />,
            helper: 'Across all tracked positions'
        },
        {
            label: 'Draws With Hits',
            value: targetPairTimeline.length,
            valueClass: 'text-indigo-200',
            accent: 'from-indigo-400/20 via-slate-900/40 to-slate-900/80',
            icon: <TimelineIcon />,
            helper: 'Distinct draws producing hits'
        }
    ];

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-950/60 p-5 md:p-8 shadow-[0_35px_90px_-45px_rgba(15,23,42,1)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),transparent_60%)] opacity-70" />
            <div className="pointer-events-none absolute -top-32 right-[-20%] h-72 w-72 rounded-full bg-sky-500/18 blur-[140px]" />
            <div className="pointer-events-none absolute -bottom-36 left-[-18%] h-80 w-80 rounded-full bg-amber-400/18 blur-[140px]" />

            <div className="relative space-y-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-slate-300/70">Monthly Spotlight</p>
                        <h2 className="mt-2 text-3xl font-bold leading-tight text-white md:text-[2.5rem]">
                            <span className="gradient-text">Pair Tracking</span> · {data.summary.month} {data.summary.year}
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm text-slate-300/90 md:text-base">
                            Zero in on the highest-performing digit pairs by position, explore hit distribution patterns, and surface
                            the draws powering your strategy.
                        </p>
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-2 self-start rounded-xl border border-blue-400/40 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:-translate-y-0.5 hover:border-blue-300/70 hover:bg-blue-500/30 hover:shadow-[0_18px_35px_-18px_rgba(59,130,246,0.7)] focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                    >
                        <DownloadIcon />
                        <span>Export CSV</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card, index) => (
                        <div
                            key={index}
                            className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_20px_45px_-28px_rgba(15,23,42,0.95)] transition-all duration-200 hover:-translate-y-1 hover:border-accent-gold/30"
                        >
                            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent} blur-[80px] opacity-80`} />
                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-300/70">{card.label}</p>
                                    <p className={`mt-3 text-3xl font-semibold md:text-4xl ${card.valueClass}`}>{card.value}</p>
                                    <p className="mt-3 text-xs text-slate-400/90">{card.helper}</p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] shadow-inner shadow-black/30">
                                    {card.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {totalHits > 0 && (() => {
                    const { pieData, barData, sectionTotals, grandTotal } = getDistributionData();

                    return (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.95)]">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">Section Distribution</h3>
                                        <p className="mt-1 text-xs text-slate-400/90">Hit share across position groupings</p>
                                    </div>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-slate-300/70">
                                        {grandTotal} hits
                                    </span>
                                </div>
                                <div className="mt-6 h-[320px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <defs>
                                                {pieData.map((entry, index) => (
                                                    <linearGradient key={index} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                                                        <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                                                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.5} />
                                                    </linearGradient>
                                                ))}
                                            </defs>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={115}
                                                paddingAngle={4}
                                                dataKey="value"
                                                label={({ name, percentage }) => `${percentage}% · ${name}`}
                                                labelLine={false}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={`url(#pieGradient-${index})`} stroke="rgba(15,23,42,0.6)" strokeWidth={1.5} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(15, 23, 42, 0.88)',
                                                    borderRadius: '16px',
                                                    border: '1px solid rgba(148, 163, 184, 0.3)',
                                                    color: '#e2e8f0',
                                                    boxShadow: '0 18px 40px -28px rgba(15, 23, 42, 0.95)'
                                                }}
                                                formatter={(value, name) => [`${value} hits (${pieData.find(p => p.name === name)?.percentage}%)`, name]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-6 grid grid-cols-1 gap-3 text-xs text-slate-300/80 sm:grid-cols-3">
                                    {Object.entries(sectionTotals).map(([position, count]) => (
                                        <div key={position} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                                            <span
                                                className="h-3 w-3 rounded-full border border-white/40"
                                                style={{ backgroundColor: colorMap[position] }}
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-white/90">{position}</span>
                                                <span>{count} hits</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.95)]">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">Pair Performance</h3>
                                        <p className="mt-1 text-xs text-slate-400/90">Individual hit counts by pair</p>
                                    </div>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-slate-300/70">
                                        Focus pairs
                                    </span>
                                </div>
                                <div className="mt-6 h-[320px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData} margin={{ top: 20, right: 12, left: -10, bottom: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />
                                            <XAxis
                                                dataKey="pair"
                                                tick={{ fill: '#cbd5f5', fontSize: 11 }}
                                                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                                                tickLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                                            />
                                            <YAxis
                                                tick={{ fill: '#cbd5f5', fontSize: 12 }}
                                                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                                                tickLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(15, 23, 42, 0.88)',
                                                    borderRadius: '16px',
                                                    border: '1px solid rgba(148, 163, 184, 0.3)',
                                                    color: '#e2e8f0',
                                                    boxShadow: '0 18px 40px -28px rgba(15, 23, 42, 0.95)'
                                                }}
                                                formatter={(value, name, props) => [
                                                    `${value} hits`,
                                                    `${props.payload.pair} · ${props.payload.position}`
                                                ]}
                                            />
                                            <Bar dataKey="count" radius={[9, 9, 0, 0]} minPointSize={2}>
                                                {barData.map((entry, index) => (
                                                    <Cell key={`bar-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {targetPairTimeline.length > 0 && (
                    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.95)]">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-semibold text-white">Target Pairs Timeline</h3>
                                <p className="mt-1 text-xs text-slate-400/90">
                                    {totalHits} hits across {targetPairTimeline.length} draws, latest first
                                </p>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-slate-300/70">
                                Chronology
                            </span>
                        </div>
                        <div className="mt-5 max-h-[400px] space-y-3 overflow-y-auto pr-1">
                            {[...targetPairTimeline].reverse().map((draw, index) => (
                                <div
                                    key={index}
                                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-accent-gold/40"
                                >
                                    <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-accent-gold/85 via-accent-gold/45 to-transparent" />
                                    <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-sm text-slate-300/90">
                                                <span className="font-semibold text-white">Draw {draw.drawIndex}</span>
                                                <span className="mx-1 text-white/40">•</span>
                                                {draw.drawDate}
                                            </p>
                                            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-400/80">
                                                Numbers · {draw.numbers.join(' - ')}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(draw.targetPairs).map(([pair, positions]) => {
                                                const color = positions.includes('1st & 2nd') ? colorMap['1st & 2nd'] :
                                                             positions.includes('1st & 3rd') ? colorMap['1st & 3rd'] :
                                                             colorMap['2nd & 3rd'];
                                                return (
                                                    <span
                                                        key={pair}
                                                        className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white shadow-[0_10px_25px_-18px_rgba(15,23,42,1)]"
                                                        style={{ backgroundColor: color }}
                                                    >
                                                        {pair}
                                                        <span className="text-white/80">({positions.join(', ')})</span>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-white">Target Pairs At A Glance</h3>
                    <p className="text-sm text-slate-400/90">
                        Every tracked pair, grouped by position. Hot pairs glow brighter with each hit.
                    </p>
                </div>
                <div className="space-y-5">
                    {Object.entries(TARGET_PAIRS).map(([position, pairs]) => (
                        <div
                            key={position}
                            className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.95)]"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <span
                                        className="h-4 w-4 rounded-full border border-white/20 shadow-[0_0_0_4px_rgba(255,255,255,0.06)]"
                                        style={{ backgroundColor: colorMap[position] }}
                                    />
                                    <h4 className="text-lg font-semibold text-white">{position} Position Pairs</h4>
                                </div>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-slate-300/70">
                                    {pairs.length} pairs
                                </span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {pairs.map((pair) => {
                                    const stats = targetPairStats[pair];
                                    const count = stats?.count || 0;
                                    return (
                                        <span
                                            key={pair}
                                            className={`inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-xs text-white transition ${
                                                count > 0 ? 'font-semibold shadow-[0_18px_40px_-28px_rgba(15,23,42,1)]' : 'opacity-70'
                                            }`}
                                            style={{
                                                backgroundColor: count > 0 ? colorMap[position] : 'rgba(128, 128, 128, 0.3)'
                                            }}
                                        >
                                            {pair} ({count}x)
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PairTrackingGraph;
