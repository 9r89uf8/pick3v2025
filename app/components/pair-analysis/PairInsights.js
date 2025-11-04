'use client';
import React from 'react';

const PairInsights = ({ data }) => {
    if (!data) return null;

    const getPossibilityLabel = () => {
        switch(data.pairType) {
            case 'first-third':
                return 'possible middles';
            case 'second-third':
                return 'possible firsts';
            default:
                return 'possible thirds';
        }
    };

    return (
        <div className="glass-card bg-white/5 p-4 md:p-6 mb-6 rounded-xl">
            <h2 className="text-xl md:text-2xl font-bold text-yellow-400 mb-3">
                Key Pattern Discovery
            </h2>
            <p className="text-base text-gray-300 mb-6">
                {data.insights.correlationNote}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                        Most Frequent Pairs
                    </h3>
                    <div className="space-y-3 pl-4">
                        {data.insights.mostFrequent.slice(0, 5).map((pair, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm font-bold">
                                    {pair.pair}
                                </span>
                                <p className="text-sm text-gray-300">
                                    {pair.frequency} times ({pair.percentage}%) - {pair.possibleThirds} {getPossibilityLabel()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                        Least Frequent Pairs
                    </h3>
                    <div className="space-y-3 pl-4">
                        {data.insights.leastFrequent.slice(0, 5).map((pair, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <span className="inline-block px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm font-bold">
                                    {pair.pair}
                                </span>
                                <p className="text-sm text-gray-300">
                                    {pair.frequency} times ({pair.percentage}%) - {pair.possibleThirds} {getPossibilityLabel()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PairInsights;
