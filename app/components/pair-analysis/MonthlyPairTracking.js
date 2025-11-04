'use client';
import React from 'react';

// Icons as SVG components
const TimelineIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const ChevronDownIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const ChevronUpIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
);

const LoadingSpinner = ({ size = "w-5 h-5" }) => (
    <div className={`animate-spin rounded-full border-b-2 border-current ${size}`}></div>
);

const MonthlyPairTracking = ({
    selectedMonth,
    selectedYear,
    monthlyData,
    loadingMonthly,
    monthlyExpandedPairs,
    onMonthChange,
    onYearChange,
    onRefresh,
    onToggleExpand
}) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const years = ["2025", "2024", "2023"];

    return (
        <div className="glass-card p-4 md:p-6 mb-4 md:mb-6 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-yellow-400 flex items-center gap-2">
                    <TimelineIcon className="w-5 h-5 md:w-6 md:h-6" />
                    Monthly Pair Tracking
                </h2>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <select
                        value={selectedMonth}
                        onChange={onMonthChange}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 sm:min-w-[120px]"
                    >
                        {months.map(month => (
                            <option key={month} value={month} className="bg-gray-900">{month}</option>
                        ))}
                    </select>

                    <select
                        value={selectedYear}
                        onChange={onYearChange}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 sm:min-w-[100px]"
                    >
                        {years.map(year => (
                            <option key={year} value={year} className="bg-gray-900">{year}</option>
                        ))}
                    </select>

                    <button
                        onClick={onRefresh}
                        disabled={loadingMonthly}
                        className="px-4 py-2 bg-transparent border border-yellow-400 text-yellow-400 rounded-lg hover:bg-yellow-400/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-w-[100px]"
                    >
                        {loadingMonthly ? (
                            <>
                                <LoadingSpinner size="w-4 h-4" />
                                <span className="hidden sm:inline">Loading...</span>
                            </>
                        ) : (
                            <span>🔄 Refresh</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Monthly Summary Cards */}
            {monthlyData && (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                        <div className="glass-card bg-white/5 p-3 md:p-4 rounded-lg">
                            <p className="text-xs md:text-sm text-gray-400 mb-1">
                                Total Draws in {selectedMonth}
                            </p>
                            <p className="text-2xl md:text-4xl font-bold text-yellow-400">
                                {monthlyData.totalDraws}
                            </p>
                        </div>

                        <div className="glass-card bg-white/5 p-3 md:p-4 rounded-lg">
                            <p className="text-xs md:text-sm text-gray-400 mb-1">
                                Total Pair Occurrences
                            </p>
                            <p className="text-2xl md:text-4xl font-bold text-blue-400">
                                {monthlyData.summary.totalPairOccurrences}
                            </p>
                        </div>

                        <div className="glass-card bg-white/5 p-3 md:p-4 rounded-lg">
                            <p className="text-xs md:text-sm text-gray-400 mb-1">
                                Coverage
                            </p>
                            <p className="text-2xl md:text-4xl font-bold text-green-400">
                                {monthlyData.summary.coveragePercentage}%
                            </p>
                        </div>

                        <div className="glass-card bg-white/5 p-3 md:p-4 rounded-lg">
                            <p className="text-xs md:text-sm text-gray-400 mb-1">
                                Most Active Pair
                            </p>
                            <p className="text-2xl md:text-4xl font-bold text-orange-400">
                                {monthlyData.summary.mostActivePair?.pair || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-400">
                                {monthlyData.summary.mostActivePair?.count || 0} times
                            </p>
                        </div>
                    </div>

                    {/* Tracked Pairs Display */}
                    <h3 className="text-base md:text-lg lg:text-xl font-semibold text-yellow-400 mb-4 text-center md:text-left">
                        Tracked Pairs: (0,1) • (1,2) • (2,3) • (0,2) • (1,3)
                    </h3>

                    <div className="space-y-3">
                        {monthlyData.pairs.map((pair) => {
                            const isExpanded = monthlyExpandedPairs.has(pair.pair);
                            return (
                                <div
                                    key={pair.pair}
                                    className={`glass-card rounded-lg p-3 md:p-4 ${
                                        pair.count > 0
                                            ? 'bg-white/5 border border-green-500/30'
                                            : 'bg-white/5 border border-white/10'
                                    }`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm md:text-base font-bold text-center ${
                                                pair.count > 0
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                            }`}>
                                                {pair.pair}
                                            </span>

                                            <p className="text-base md:text-lg font-medium text-center sm:text-left">
                                                {pair.count} occurrences
                                            </p>

                                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold text-center ${
                                                parseFloat(pair.percentage) > 5
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {pair.percentage}%
                                            </span>

                                            <p className="text-xs md:text-sm text-gray-400 text-center sm:text-left">
                                                {pair.totalUniqueCombinations} unique combinations
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => onToggleExpand(pair.pair)}
                                            className="self-center md:self-auto p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                        </button>
                                    </div>

                                    {isExpanded && (
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <h4 className="text-sm font-semibold text-yellow-400 mb-3">
                                                Combinations with {pair.pair}:
                                            </h4>
                                            {pair.combinations.length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="border-b border-white/10">
                                                                <th className="text-left py-2 px-2 text-gray-400 font-medium">Combination</th>
                                                                <th className="text-center py-2 px-2 text-gray-400 font-medium">Count</th>
                                                                <th className="text-left py-2 px-2 text-gray-400 font-medium">Dates</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {pair.combinations.map((combo) => (
                                                                <tr key={combo.combo} className="border-b border-white/5">
                                                                    <td className="py-2 px-2">
                                                                        <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">
                                                                            {combo.combo}
                                                                        </span>
                                                                    </td>
                                                                    <td className="text-center py-2 px-2 font-bold">
                                                                        {combo.count}
                                                                    </td>
                                                                    <td className="py-2 px-2">
                                                                        <div className="text-xs text-gray-400 max-h-16 overflow-auto">
                                                                            {combo.dates.join(', ')}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400">
                                                    No occurrences in {selectedMonth} {selectedYear}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Top Combinations Summary */}
                    {monthlyData.summary.topCombinations && monthlyData.summary.topCombinations.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-yellow-400 mb-3">
                                Top Combinations Across All Tracked Pairs
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {monthlyData.summary.topCombinations.map((combo, idx) => (
                                    <span
                                        key={idx}
                                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                            idx === 0
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                        }`}
                                    >
                                        {combo.combo} ({combo.totalCount}x)
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {loadingMonthly && (
                <div className="flex justify-center items-center py-8">
                    <LoadingSpinner size="w-12 h-12" />
                </div>
            )}
        </div>
    );
};

export default MonthlyPairTracking;
