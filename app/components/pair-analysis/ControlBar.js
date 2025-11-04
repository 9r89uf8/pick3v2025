'use client';
import React from 'react';

// Icons as SVG components
const AnalyticsIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const CloseIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const LoadingSpinner = ({ size = "w-5 h-5" }) => (
    <div className={`animate-spin rounded-full border-b-2 border-current ${size}`}></div>
);

const DownloadIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l4-4m-4 4l-4-4m12 8H8a2 2 0 01-2-2V6" />
    </svg>
);

const ControlBar = ({
    loading,
    data,
    error,
    successMessage,
    pairType,
    onPairTypeChange,
    onAnalyzePairs,
    onClearSuccessMessage,
    onDownloadData
}) => {
    const pairTypeOptions = [
        { value: 'first-second', label: '1st & 2nd Numbers' },
        { value: 'first-third', label: '1st & 3rd Numbers' },
        { value: 'second-third', label: '2nd & 3rd Numbers' }
    ];

    return (
        <div className="glass-card bg-white/5 p-4 md:p-6 mb-4 md:mb-6 rounded-xl">
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
                <div className="flex-1 md:min-w-[220px]">
                    <label className="block text-sm font-medium text-gray-300 mb-2 md:hidden">
                        Pair Type
                    </label>
                    <select
                        value={pairType}
                        onChange={(e) => onPairTypeChange(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-2 md:py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {pairTypeOptions.map(option => (
                            <option key={option.value} value={option.value} className="bg-gray-900">
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <button
                        onClick={onAnalyzePairs}
                        disabled={loading}
                        className="w-full sm:w-auto px-6 py-2 md:py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[40px] md:min-h-[48px]"
                    >
                        {loading ? (
                            <>
                                <LoadingSpinner size="w-5 h-5" />
                                <span>Analyzing...</span>
                            </>
                        ) : (
                            <>
                                <AnalyticsIcon className="w-5 h-5 hidden sm:block" />
                                <span className="sm:hidden">📊 Analyze</span>
                                <span className="hidden sm:inline">Analyze Pairs</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={onDownloadData}
                        disabled={!data || loading}
                        className="w-full sm:w-auto px-6 py-2 md:py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[40px] md:min-h-[48px]"
                    >
                        <DownloadIcon className="w-5 h-5 hidden sm:block" />
                        <span className="sm:hidden">⬇️ Download</span>
                        <span className="hidden sm:inline">Download Data</span>
                    </button>
                </div>

                {data && (
                    <div className="text-sm text-gray-400 text-center md:text-left">
                        Analyzed {data.summary.totalDrawsAnalyzed} draws • Found {data.summary.pairsFound} unique pairs
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center justify-between">
                    <span>{successMessage}</span>
                    <button
                        onClick={onClearSuccessMessage}
                        className="ml-2 p-1 hover:bg-green-500/20 rounded transition-colors"
                    >
                        <CloseIcon />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ControlBar;
