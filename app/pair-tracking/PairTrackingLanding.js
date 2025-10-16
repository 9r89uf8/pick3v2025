'use client';
import React, { useEffect, useState } from 'react';
import PairTrackingGraph from '@/app/components/analysis/PairTrackingGraph';
import PairAnalysis from '@/app/components/pair-analysis/PairAnalysis';
import DrawsList from '@/app/components/shared/DrawsList';
import { fetchPosts } from '@/app/services/postService';
import { useStore } from '@/app/store/store';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const availableYears = ['2024', '2025'];

const selectBaseClasses =
    'mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40';

const toggleButtonClasses =
    'inline-flex items-center justify-center gap-2 rounded-xl border border-accent-gold/40 bg-accent-gold/15 px-4 py-2.5 text-sm font-semibold text-accent-gold transition hover:-translate-y-0.5 hover:border-accent-gold/80 hover:bg-accent-gold/25 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-accent-gold/40 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/5 disabled:text-slate-300/40 disabled:shadow-none';

const CalendarIcon = (props) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        {...props}
    >
        <path
            d="M7 3V6M17 3V6M5 11H19M5 8H19M8 15H8.01M12 15H12.01M16 15H16.01M7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const PairTrackingLanding = () => {
    const now = new Date();
    const currentMonth = monthNames[now.getMonth()];
    const currentYear = String(now.getFullYear());

    const { posts } = useStore();

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [showPairAnalysis, setShowPairAnalysis] = useState(false);
    const [showDraws, setShowDraws] = useState(false);
    const [drawsLoading, setDrawsLoading] = useState(false);
    const [hasLoadedDraws, setHasLoadedDraws] = useState(false);

    const handleCurrentMonth = () => {
        setSelectedMonth(currentMonth);
        setSelectedYear(currentYear);
    };

    const isViewingCurrent = selectedMonth === currentMonth && selectedYear === currentYear;

    useEffect(() => {
        if (posts && posts.length > 0) {
            setHasLoadedDraws(true);
        }
    }, [posts]);

    const handleTogglePairAnalysis = () => {
        setShowPairAnalysis((prev) => !prev);
    };

    const handleToggleDraws = async () => {
        if (showDraws) {
            setShowDraws(false);
            return;
        }

        setShowDraws(true);

        if (hasLoadedDraws) {
            return;
        }

        setDrawsLoading(true);

        try {
            await fetchPosts();
            setHasLoadedDraws(true);
        } catch (error) {
            console.error('Error loading draws:', error);
        } finally {
            setDrawsLoading(false);
        }
    };

    return (
        <div className="relative w-full min-h-screen overflow-hidden bg-background-primary text-foreground">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/90 to-slate-950" />
                <div className="page-grid-overlay absolute inset-0 opacity-60" />
                <div className="absolute -top-28 right-[-12%] h-80 w-80 rounded-full bg-sky-500/18 blur-3xl" />
                <div className="absolute bottom-[-16%] left-[-10%] h-96 w-96 rounded-full bg-accent-gold/20 blur-[140px]" />
            </div>

            <div className="relative z-10 pb-14 md:pb-20">

                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-12 space-y-10">
                    <section className="glass-card relative overflow-hidden rounded-3xl border border-white/10 p-6 md:p-8">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.08),transparent_55%)] opacity-70" />
                        <div className="relative grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            <div className="flex flex-col">
                                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300/80 transition">
                                    Month
                                </label>
                                <select
                                    className={selectBaseClasses}
                                    value={selectedMonth}
                                    onChange={(event) => setSelectedMonth(event.target.value)}
                                >
                                    {monthNames.map((month) => (
                                        <option key={month} value={month}>
                                            {month}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300/80">
                                    Year
                                </label>
                                <select
                                    className={selectBaseClasses}
                                    value={selectedYear}
                                    onChange={(event) => setSelectedYear(event.target.value)}
                                >
                                    {availableYears.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300/80">
                                    Quick Action
                                </span>
                                <button
                                    type="button"
                                    onClick={handleCurrentMonth}
                                    disabled={isViewingCurrent}
                                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-accent-gold/45 bg-accent-gold/15 px-3 py-2.5 text-sm font-semibold text-accent-gold transition hover:-translate-y-0.5 hover:border-accent-gold/70 hover:bg-accent-gold/25 hover:shadow-[0_18px_35px_-18px_rgba(251,191,36,0.7)] focus:outline-none focus:ring-2 focus:ring-accent-gold/40 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/5 disabled:text-slate-300/40 disabled:shadow-none"
                                >
                                    <CalendarIcon className="h-5 w-5" />
                                    Current Month
                                </button>
                            </div>

                            <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                    Viewing
                                </span>
                                <span className="mt-2 text-xl font-semibold text-white md:text-2xl">
                                    {selectedMonth} {selectedYear}
                                </span>
                                <p className="mt-2 text-xs text-slate-400">
                                    Tap the controls to jump across months and compare performance.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="glass-card rounded-3xl border border-white/10 p-2 sm:p-4 md:p-6">
                        <PairTrackingGraph selectedMonth={selectedMonth} selectedYear={selectedYear} />
                    </section>

                    <section className="glass-card rounded-3xl border border-white/10 p-6 md:p-8">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold text-white md:text-3xl">
                                    Deep Pair Analysis
                                </h2>
                                <p className="text-sm text-slate-300/90 md:text-base">
                                    Unlock the full pair frequency table, insights, and monthly tracking details when you&apos;re ready to dig deeper.
                                </p>
                            </div>
                            <button
                                type="button"
                                className={toggleButtonClasses}
                                onClick={handleTogglePairAnalysis}
                            >
                                {showPairAnalysis ? 'Hide Analysis' : 'Show Analysis'}
                            </button>
                        </div>

                        {showPairAnalysis ? (
                            <div className="mt-6 border-t border-white/10 pt-6">
                                <PairAnalysis />
                            </div>
                        ) : (
                            <p className="mt-4 text-sm text-slate-400">
                                Tap <span className="text-accent-gold font-semibold">Show Analysis</span> to load the full breakdown without crowding the dashboard.
                            </p>
                        )}
                    </section>

                    <section className="glass-card rounded-3xl border border-white/10 p-6 md:p-8">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold text-white md:text-3xl">
                                    Recent Draws Reference
                                </h2>
                                <p className="text-sm text-slate-300/90 md:text-base">
                                    Keep the latest draw history handy for context while you explore trends and combinations.
                                </p>
                            </div>
                            <button
                                type="button"
                                className={toggleButtonClasses}
                                onClick={handleToggleDraws}
                            >
                                {showDraws ? 'Hide Draws' : 'Show Draws'}
                            </button>
                        </div>

                        {showDraws ? (
                            <div className="mt-6 border-t border-white/10 pt-6">
                                <DrawsList draws={posts} loading={drawsLoading} />
                            </div>
                        ) : (
                            <p className="mt-4 text-sm text-slate-400">
                                Toggle <span className="text-accent-gold font-semibold">Show Draws</span> whenever you need the reference table.
                            </p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PairTrackingLanding;
