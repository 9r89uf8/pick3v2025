'use client';
import React, { useState, useEffect } from 'react';
import {
    checkCombinationHistory,
    getFrequencyColor,
    getStatusBadge,
    parsePattern,
    calculateSuggestions,
    validateCombination,
    calculatePairAnalysis
} from '@/app/services/combinationBuilderService';

// Icon components (SVG replacements)
const ClearIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const ExpandMoreIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const ExpandLessIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
);

const LoadingSpinner = () => (
    <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
    </div>
);

const CombinationBuilder = () => {
    const [selectedNumbers, setSelectedNumbers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [historyData, setHistoryData] = useState(null);
    const [error, setError] = useState(null);
    const [expandedSections, setExpandedSections] = useState({
        recent: true,
        monthly: false,
        insights: true
    });

    // Check history whenever numbers change (skip for pairs - use mathematical analysis instead)
    useEffect(() => {
        if (selectedNumbers.length > 0 && selectedNumbers.length !== 2) {
            checkHistory();
        } else {
            setHistoryData(null);
        }
    }, [selectedNumbers]);

    const checkHistory = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await checkCombinationHistory(selectedNumbers);

            if (result.success) {
                setHistoryData(result.data);
            } else {
                setError(result.error || 'Failed to check history');
            }
        } catch (err) {
            setError('Error checking combination history');
        } finally {
            setLoading(false);
        }
    };

    const handleNumberClick = (number) => {
        if (selectedNumbers.includes(number)) {
            // Remove number if already selected
            setSelectedNumbers(selectedNumbers.filter(n => n !== number));
        } else if (selectedNumbers.length < 3) {
            // Add number if less than 3 selected
            setSelectedNumbers([...selectedNumbers, number]);
        }
    };

    const handleClear = () => {
        setSelectedNumbers([]);
        setHistoryData(null);
        setError(null);
    };

    const handleRemoveNumber = (index) => {
        const newNumbers = [...selectedNumbers];
        newNumbers.splice(index, 1);
        setSelectedNumbers(newNumbers);
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const renderNumberPad = () => (
        <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => {
                const isSelected = selectedNumbers.includes(number);
                const isB = number <= 4;

                return (
                    <button
                        key={number}
                        onClick={() => handleNumberClick(number)}
                        disabled={!isSelected && selectedNumbers.length >= 3}
                        className={`
                            h-12 md:h-16
                            text-xl md:text-2xl
                            font-bold
                            rounded-lg
                            border-2
                            transition-all
                            duration-200
                            ${isSelected
                                ? isB
                                    ? 'bg-blue-500 border-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-orange-500 border-orange-500 text-white hover:bg-orange-600'
                                : isB
                                    ? 'bg-transparent border-blue-500 text-blue-500 hover:bg-blue-500/10'
                                    : 'bg-transparent border-orange-500 text-orange-500 hover:bg-orange-500/10'
                            }
                            ${!isSelected && selectedNumbers.length >= 3 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        {number}
                    </button>
                );
            })}
        </div>
    );

    const renderSelectedNumbers = () => (
        <div className="mb-6">
            <h6 className="text-lg font-semibold mb-4 text-white">
                Selected Combination
            </h6>
            <div className="flex gap-4 items-center flex-wrap">
                {[0, 1, 2].map(index => {
                    const number = selectedNumbers[index];
                    const hasNumber = number !== undefined;
                    const isB = hasNumber && number <= 4;

                    return (
                        <div
                            key={index}
                            className={`
                                w-16 h-16 md:w-20 md:h-20
                                flex flex-col items-center justify-center
                                rounded-lg
                                border-2
                                relative
                                transition-all
                                ${hasNumber
                                    ? `${isB ? 'border-blue-500' : 'border-orange-500'} bg-accent-gold/10 shadow-md`
                                    : 'border-dashed border-white/20 bg-transparent'
                                }
                            `}
                        >
                            {hasNumber ? (
                                <>
                                    <span className="text-3xl md:text-4xl font-bold">
                                        {number}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveNumber(index)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-white/10 hover:bg-red-500/30 rounded-full flex items-center justify-center transition-colors"
                                    >
                                        <ClearIcon />
                                    </button>
                                </>
                            ) : (
                                <span className="text-xs text-white/50">
                                    {index === 0 ? 'First' : index === 1 ? 'Second' : 'Third'}
                                </span>
                            )}
                        </div>
                    );
                })}

                {selectedNumbers.length > 0 && (
                    <div className="flex gap-2 ml-4 animate-fade-in-up">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-500 text-white">
                            {parsePattern(historyData?.pattern || '').label}
                        </span>
                        {validateCombination(selectedNumbers).valid && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-semantic-success text-white">
                                ✓ Valid
                            </span>
                        )}
                    </div>
                )}
            </div>

            {selectedNumbers.length === 3 && (
                <div className="mt-4 p-4 bg-primary-500/20 border border-primary-500/30 rounded-lg">
                    <p className="text-sm text-primary-300">
                        {validateCombination(selectedNumbers).message}
                    </p>
                </div>
            )}
        </div>
    );

    const renderFeedback = () => {
        // Show pair analysis for exactly 2 numbers
        if (selectedNumbers.length === 2) {
            const pairAnalysis = calculatePairAnalysis(selectedNumbers);
            if (!pairAnalysis) return null;

            return (
                <div className="mt-6">
                    <h6 className="text-lg font-semibold mb-4">
                        Pair Position Analysis
                    </h6>

                    <div className="glass-card p-6">
                        <p className="text-base font-bold mb-4">
                            Pair {pairAnalysis.pair} - Total Combinations: {pairAnalysis.totalCombinations}
                        </p>

                        {/* Analysis Table */}
                        <div className="grid grid-cols-3 gap-4 items-center mb-4">
                            {/* Headers */}
                            <div className="font-bold text-sm">Position</div>
                            <div className="font-bold text-sm text-center">Combinations</div>
                            <div className="font-bold text-sm text-center">Percentage</div>

                            {/* Data Rows */}
                            {pairAnalysis.configurations.map((config, index) => (
                                <React.Fragment key={index}>
                                    <div className="text-sm font-mono">{config.position}</div>
                                    <div className="text-sm text-center font-bold">{config.combinations}</div>
                                    <div className="text-sm text-center">{config.percentage.toFixed(1)}%</div>
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Dominant Configuration */}
                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>
                        <div className="mt-4 p-4 bg-primary-500/20 border border-primary-500/30 rounded-lg">
                            <p className="text-sm text-primary-300">
                                <strong>Dominant Configuration:</strong> {pairAnalysis.dominantConfiguration.position.replace(/\(.*\)/g, '').trim()}
                                ({pairAnalysis.dominantConfiguration.percentage.toFixed(1)}%)
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        // Original feedback for other cases (1 number or 3 numbers)
        if (!historyData) return null;

        const { statistics, insights, recentOccurrences, monthlyBreakdown } = historyData;

        return (
            <div className="mt-6">
                <h6 className="text-lg font-semibold mb-4">
                    Analysis Results
                </h6>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {selectedNumbers.length >= 1 && statistics.firstNumber && (
                        <div className="glass-card p-4">
                            <p className="text-sm text-white/70 mb-2">
                                First Number ({selectedNumbers[0]})
                            </p>
                            <p className="text-3xl md:text-4xl font-bold my-2">
                                {statistics.firstNumber.count}
                            </p>
                            <p className="text-sm">
                                {statistics.firstNumber.frequency}
                            </p>
                            {statistics.firstNumber.lastSeen && (
                                <p className="text-xs text-white/50 mt-2">
                                    Last: {statistics.firstNumber.lastSeen}
                                </p>
                            )}
                        </div>
                    )}

                    {selectedNumbers.length === 3 && statistics.fullCombination && (
                        <div className="glass-card p-4">
                            <p className="text-sm text-white/70 mb-2">
                                Full Combination
                            </p>
                            <p className="text-3xl md:text-4xl font-bold my-2">
                                {statistics.fullCombination.count}
                            </p>
                            <p className="text-sm">
                                {statistics.fullCombination.frequency}
                            </p>
                            {statistics.fullCombination.lastSeen && (
                                <p className="text-xs text-white/50 mt-2">
                                    Last: {statistics.fullCombination.lastSeen}
                                </p>
                            )}
                            {getStatusBadge(statistics.fullCombination) && (
                                <span
                                    className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium text-white"
                                    style={{ backgroundColor: getStatusBadge(statistics.fullCombination).color }}
                                >
                                    {getStatusBadge(statistics.fullCombination).label}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Insights Section */}
                {insights && insights.length > 0 && (
                    <div className="glass-card p-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <h6 className="text-base font-semibold">Insights</h6>
                            <button onClick={() => toggleSection('insights')} className="p-1 hover:bg-white/10 rounded transition-colors">
                                {expandedSections.insights ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </button>
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ${expandedSections.insights ? 'max-h-96' : 'max-h-0'}`}>
                            <ul className="space-y-2 mt-2">
                                {insights.map((insight, index) => (
                                    <li key={index} className="text-sm text-white/80">
                                        • {insight}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Recent Occurrences */}
                {recentOccurrences && recentOccurrences.length > 0 && (
                    <div className="glass-card p-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <h6 className="text-base font-semibold">Recent Occurrences</h6>
                            <button onClick={() => toggleSection('recent')} className="p-1 hover:bg-white/10 rounded transition-colors">
                                {expandedSections.recent ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </button>
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ${expandedSections.recent ? 'max-h-96' : 'max-h-0'}`}>
                            <ul className="space-y-2 mt-2">
                                {recentOccurrences.slice(0, 5).map((occ, index) => (
                                    <li key={index} className="text-sm">
                                        <div className="text-white/90">{occ.numbers.join('-')} on {occ.date}</div>
                                        <div className="text-xs text-white/50">
                                            Match Level: {occ.matchLevel === selectedNumbers.length ? 'Full' : 'Partial'}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="glass-card p-4 md:p-6">
            <div className="mb-6 flex justify-between items-center">
                <h5 className="text-xl md:text-2xl font-bold gradient-text">
                    Build Your Combination
                </h5>
                <button
                    onClick={handleClear}
                    className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors text-sm"
                >
                    <ClearIcon />
                    Clear All
                </button>
            </div>

            {renderSelectedNumbers()}

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6"></div>

            <div className="mb-6">
                <p className="text-sm text-white/70 mb-4">
                    Select Numbers (B: 0-4, A: 5-9)
                </p>
                {renderNumberPad()}
            </div>

            {loading && <LoadingSpinner />}

            {error && (
                <div className="mb-4 p-4 bg-semantic-error/20 border border-semantic-error/30 rounded-lg">
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}

            {!loading && renderFeedback()}
        </div>
    );
};

export default CombinationBuilder;
