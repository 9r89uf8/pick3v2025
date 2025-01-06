import React from 'react';

const ConnectionsVisualizer = ({numbers}) => {
    const totalHeight = 1570;
    const totalWidth = 975;
    const margin = 60;
    const usableHeight = totalHeight - 2 * margin;
    const numberXOffset = 78;
    const numberYOffset = 27;

    const usedNumbers = numbers.reduce((acc, combination) => {
        combination.forEach((num, index) => {
            if (!acc[index]) acc[index] = new Set();
            acc[index].add(num);
        });
        return acc;
    }, []);

    const getYPosition = (number) => {
        const position = number / 9;
        return totalHeight - (position * usableHeight + margin) + 8;
    };

    const getXPosition = (columnIndex) => {
        return 195 + columnIndex * 293;
    };

    const getNumberXPosition = (columnIndex) => {
        if (columnIndex === 0) {
            return getXPosition(columnIndex) - numberXOffset;
        }
        if (columnIndex === 1) {
            return getXPosition(columnIndex);
        }
        return getXPosition(columnIndex) + numberXOffset;
    };

    const colors = [
        '#2db101', // blue
        '#f309d3', // emerald
        '#f5a30b', // amber
        '#EF4444', // red
        '#8B5CF6', // purple
        '#EC4899', // pink
        '#ffffff', // white
        '#ffdd00'  // yellow
    ];

    const isNumberUsed = (number, columnIndex) => {
        return usedNumbers[columnIndex]?.has(number);
    };

    const shouldHaveSpecialFill = (number, columnIndex) => {
        if (columnIndex === 0) return number >= 0 && number <= 3;
        if (columnIndex === 1) return number >= 2 && number <= 7;
        if (columnIndex === 2) return number >= 6 && number <= 9;
        return false;
    };

    return (
        <div style={{ width: '100%', maxWidth: '1560px', margin: '0 auto' }}>
            <svg
                viewBox={`0 0 ${totalWidth} ${totalHeight}`}
                style={{ width: '100%', height: '100%' }}
            >
                {/* Draw vertical lines for each column */}
                {[0, 1, 2].map((columnIndex) => (
                    <line
                        key={`vline-${columnIndex}`}
                        x1={getXPosition(columnIndex)}
                        y1={margin}
                        x2={getXPosition(columnIndex)}
                        y2={totalHeight - margin}
                        stroke="#e5e7eb"
                        strokeWidth="7"
                    />
                ))}

                {/* Draw connections for each combination FIRST */}
                {numbers.map((combination, combIndex) => (
                    <g key={`combination-${combIndex}`}>
                        <line
                            x1={getXPosition(0)}
                            y1={getYPosition(combination[0])}
                            x2={getXPosition(1)}
                            y2={getYPosition(combination[1])}
                            stroke={colors[combIndex % colors.length]}
                            strokeWidth="7"
                            strokeOpacity="0.6"
                        />
                        <line
                            x1={getXPosition(1)}
                            y1={getYPosition(combination[1])}
                            x2={getXPosition(2)}
                            y2={getYPosition(combination[2])}
                            stroke={colors[combIndex % colors.length]}
                            strokeWidth="7"
                            strokeOpacity="0.6"
                        />
                    </g>
                ))}

                {/* Draw all numbers and circles for each column LAST */}
                {[0, 1, 2].map((columnIndex) => (
                    <React.Fragment key={`col-${columnIndex}`}>
                        {/* Draw highlight circles for selected numbers on top */}
                        {numbers.map((combination, combIndex) => (
                            <circle
                                key={`point-${combIndex}-${combination[columnIndex]}`}
                                cx={getXPosition(columnIndex)}
                                cy={getYPosition(combination[columnIndex])}
                                r="16"
                                fill={colors[combIndex % colors.length]}
                                opacity="0.8"
                            />
                        ))}
                        {[...Array(10)].map((_, i) => (
                            <g key={`text-${columnIndex}-${i}`}>
                                {/* White circle background */}
                                <circle
                                    cx={getNumberXPosition(columnIndex)}
                                    cy={getYPosition(i) - 28 + numberYOffset}
                                    r="45"
                                    fill={shouldHaveSpecialFill(i, columnIndex) ? '#3B82F6' : 'white'}
                                />
                                <text
                                    x={getNumberXPosition(columnIndex)}
                                    y={getYPosition(i) + numberYOffset}
                                    textAnchor="middle"
                                    style={{
                                        fill: isNumberUsed(i, columnIndex) ? '#f8f8fa' : '#c3c3c3',
                                        fontSize: '85px',
                                        fontFamily: 'sans-serif'
                                    }}
                                >
                                    {i}
                                </text>
                            </g>
                        ))}
                    </React.Fragment>
                ))}
            </svg>
        </div>
    );
};

export default ConnectionsVisualizer;

