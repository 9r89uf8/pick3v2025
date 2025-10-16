'use client';
import React from 'react';

const PairAnalysisSummary = ({ data }) => {
    if (!data) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            <div className="glass-card bg-white/5 p-4 md:p-6 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">
                    Total Draws Analyzed
                </p>
                <p className="text-3xl md:text-4xl font-bold text-yellow-400">
                    {data.summary.totalDrawsAnalyzed.toLocaleString()}
                </p>
            </div>

            <div className="glass-card bg-white/5 p-4 md:p-6 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">
                    Unique Pairs Found
                </p>
                <p className="text-3xl md:text-4xl font-bold text-blue-400">
                    {data.summary.pairsFound} / 45
                </p>
            </div>

            <div className="glass-card bg-white/5 p-4 md:p-6 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">
                    High Frequency Pairs
                </p>
                <p className="text-3xl md:text-4xl font-bold text-green-400">
                    {data.insights.categoryStats.high}
                </p>
            </div>

            <div className="glass-card bg-white/5 p-4 md:p-6 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">
                    Low Frequency Pairs
                </p>
                <p className="text-3xl md:text-4xl font-bold text-red-400">
                    {data.insights.categoryStats.low}
                </p>
            </div>
        </div>
    );
};

export default PairAnalysisSummary;
