'use client';
import React from 'react';
import { useStore } from '@/app/store/store';

// Icons as SVG components
const TrendingUpIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const TrendingDownIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
);

const NumbersIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
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

const StarIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

const StarBorderIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

const SortIcon = ({ active, direction }) => (
    <svg className={`w-4 h-4 ml-1 inline ${active ? 'text-blue-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {direction === 'asc' ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        )}
    </svg>
);

const PairFrequencyTable = ({
    sortedPairs,
    orderBy,
    order,
    expandedRows,
    onRequestSort,
    onToggleExpand,
    addingToFavorites
}) => {
    const { isFavorite } = useStore();

    const getCategoryColor = (category) => {
        switch (category) {
            case 'high': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'low': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'high': return <TrendingUpIcon className="w-4 h-4" />;
            case 'medium': return <NumbersIcon className="w-4 h-4" />;
            case 'low': return <TrendingDownIcon className="w-4 h-4" />;
            default: return null;
        }
    };

    const getPattern = (numbers) => {
        const bCount = numbers.filter(n => n <= 4).length;
        const aCount = numbers.filter(n => n > 4).length;

        if (bCount === 3) return 'BBB';
        if (bCount === 2) return 'BBA';
        if (bCount === 1) return 'BAA';
        if (bCount === 0) return 'AAA';
        return 'UNKNOWN';
    };

    const handleToggleFavorite = async (combo, pairData) => {
        const { addFavorite, removeFavorite, favorites } = useStore.getState();
        const numbers = combo.numbers;

        if (isFavorite(numbers)) {
            const favToRemove = favorites.find(fav => fav.combination.join('-') === numbers.join('-'));
            if (favToRemove) {
                removeFavorite(favToRemove.id);
            }
            return;
        }

        const pattern = getPattern(numbers);

        const favorite = {
            combination: numbers,
            combinationCount: combo.frequency,
            combinationPercentage: combo.percentage,
            pair: pairData.pair,
            pairCount: pairData.frequency,
            pairPercentage: pairData.percentage,
            pattern: pattern
        };

        addFavorite(favorite);
    };

    const TableHeader = ({ property, label }) => (
        <th
            className="py-3 px-4 text-left cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => onRequestSort(property)}
        >
            <div className="flex items-center gap-1 font-semibold text-gray-300">
                {label}
                <SortIcon active={orderBy === property} direction={orderBy === property ? order : 'asc'} />
            </div>
        </th>
    );

    return (
        <div className="glass-card bg-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="py-3 px-4 w-12"></th>
                            <TableHeader property="pair" label="Pair" />
                            <TableHeader property="frequency" label="Frequency" />
                            <TableHeader property="percentage" label="Percentage" />
                            <TableHeader property="possibleThirds" label="Possible 3rd Numbers" />
                            <th className="py-3 px-4 text-center font-semibold text-gray-300">Category</th>
                            <th className="py-3 px-4 text-center font-semibold text-gray-300">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sortedPairs.map((pair) => {
                            const isExpanded = expandedRows.has(pair.pair);
                            const rowBgClass = pair.category === 'high'
                                ? 'bg-green-500/5'
                                : pair.category === 'low'
                                ? 'bg-red-500/5'
                                : '';

                            return (
                                <React.Fragment key={pair.pair}>
                                    <tr className={`hover:bg-white/5 transition-colors ${rowBgClass}`}>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => onToggleExpand(pair.pair)}
                                                className="p-1 hover:bg-white/10 rounded transition-colors"
                                            >
                                                {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                            </button>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="font-bold text-base">
                                                {pair.pair}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="font-medium">
                                                {pair.frequency}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {pair.percentage.toFixed(2)}%
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                                pair.possibleThirds >= 7
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : pair.possibleThirds >= 4
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : 'bg-red-500/20 text-red-400'
                                            }`}>
                                                {pair.possibleThirds}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {getCategoryIcon(pair.category)}
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${getCategoryColor(pair.category)}`}>
                                                    {pair.category}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {pair.isRepeat && (
                                                <span className="text-xs text-gray-400">
                                                    Repeat pair
                                                </span>
                                            )}
                                        </td>
                                    </tr>

                                    {/* Expandable row for combinations */}
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan="7" className="p-0">
                                                <div className="bg-white/5 p-4 md:p-6 border-t border-white/10">
                                                    <h3 className="text-lg font-semibold mb-4">
                                                        Combinations for {pair.pair}
                                                    </h3>

                                                    {/* Previous Pattern Insights */}
                                                    {pair.previousPatterns && (
                                                        <div className="mb-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                                                            <h4 className="text-sm font-semibold text-yellow-400 mb-3">
                                                                Pattern Insights
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-sm text-gray-400 mb-1">
                                                                        Activity Score: {pair.previousPatterns.activityScore.toFixed(1)}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        First number activity: {pair.previousPatterns.firstNumberActivity} | Second number activity: {pair.previousPatterns.secondNumberActivity}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    {pair.previousPatterns.topPredecessors.length > 0 && (
                                                                        <>
                                                                            <p className="text-sm text-gray-400 mb-2">
                                                                                Common predecessors:
                                                                            </p>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {pair.previousPatterns.topPredecessors.map((pred, idx) => (
                                                                                    <span
                                                                                        key={idx}
                                                                                        className="inline-block px-2 py-1 bg-white/10 border border-white/20 rounded text-xs"
                                                                                    >
                                                                                        {pred.pair} ({pred.count}x)
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Combinations Table */}
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm">
                                                            <thead className="bg-white/5 border-b border-white/10">
                                                                <tr>
                                                                    <th className="py-2 px-3 text-left font-medium text-gray-300">Combination</th>
                                                                    <th className="py-2 px-3 text-center font-medium text-gray-300">Frequency</th>
                                                                    <th className="py-2 px-3 text-center font-medium text-gray-300">Percentage</th>
                                                                    <th className="py-2 px-3 text-center font-medium text-gray-300">Favorite</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-white/5">
                                                                {pair.combinations && pair.combinations.map((combo) => (
                                                                    <tr key={combo.combo} className="hover:bg-white/5">
                                                                        <td className="py-2 px-3">
                                                                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                                                                combo.frequency > 0
                                                                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                                                            }`}>
                                                                                {combo.combo}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-2 px-3 text-center">
                                                                            <span className={combo.frequency > 0 ? 'font-medium' : 'text-gray-500'}>
                                                                                {combo.frequency}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-2 px-3 text-center">
                                                                            <span className={combo.frequency > 0 ? '' : 'text-gray-500'}>
                                                                                {combo.percentage.toFixed(2)}%
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-2 px-3 text-center">
                                                                            <button
                                                                                onClick={() => handleToggleFavorite(combo, pair)}
                                                                                disabled={addingToFavorites}
                                                                                title={isFavorite(combo.numbers) ? "Remove from favorites" : "Add to favorites"}
                                                                                className={`p-1 hover:bg-white/10 rounded transition-colors ${
                                                                                    isFavorite(combo.numbers) ? 'text-yellow-400' : 'text-gray-400'
                                                                                } disabled:opacity-50`}
                                                                            >
                                                                                {isFavorite(combo.numbers) ? (
                                                                                    <StarIcon />
                                                                                ) : (
                                                                                    <StarBorderIcon />
                                                                                )}
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PairFrequencyTable;
