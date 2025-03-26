import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    Chip,
    Button, // Import Button
    Divider, // Import Divider
    styled,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

// Data based on your provided text
const transitionProbabilities = {
    // Pair (x, y): [P(0|x,y), P(1|x,y), P(2|x,y), P(3|x,y), P(4|x,y), P(5|x,y), P(6|x,y)]
    '0,0': [0.16, 0.36, 0.11, 0.11, 0.06, 0.11, 0.06],
    '0,1': [0.11, 0.25, 0.14, 0.25, 0.11, 0.04, 0.07],
    '0,2': [0.27, 0.01, 0.01, 0.39, 0.14, 0.14, 0.01],
    '0,3': [0.26, 0.19, 0.19, 0.01, 0.13, 0.13, 0.01],
    '0,4': [0.21, 0.11, 0.31, 0.11, 0.01, 0.11, 0.01],
    '0,5': [0.38, 0.03, 0.03, 0.03, 0.03, 0.38, 0.03],
    '0,6': [0.43, 0.02, 0.02, 0.02, 0.22, 0.22, 0.02],
    '0,7': [0.58, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05], // Note: Pairs go up to 8, probs only to 6
    '1,0': [0.18, 0.12, 0.12, 0.30, 0.12, 0.01, 0.12],
    '1,1': [0.34, 0.17, 0.23, 0.06, 0.06, 0.12, 0.01],
    '1,2': [0.22, 0.15, 0.15, 0.22, 0.08, 0.08, 0.08],
    '1,3': [0.08, 0.22, 0.22, 0.08, 0.22, 0.01, 0.08],
    '1,4': [0.41, 0.11, 0.21, 0.11, 0.01, 0.01, 0.01],
    '1,5': [0.22, 0.43, 0.02, 0.02, 0.02, 0.02, 0.22],
    '1,6': [0.03, 0.03, 0.28, 0.54, 0.03, 0.03, 0.03],
    '1,7': [0.38, 0.03, 0.03, 0.03, 0.03, 0.38, 0.03],
    '1,8': [0.58, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05],
    '2,0': [0.32, 0.24, 0.09, 0.24, 0.09, 0.01, 0.01],
    '2,1': [0.34, 0.26, 0.01, 0.18, 0.01, 0.09, 0.01],
    '2,2': [0.19, 0.10, 0.47, 0.10, 0.01, 0.10, 0.01],
    '2,3': [0.28, 0.01, 0.10, 0.38, 0.10, 0.01, 0.01],
    '2,4': [0.02, 0.43, 0.22, 0.22, 0.02, 0.02, 0.02],
    '2,5': [0.03, 0.54, 0.28, 0.03, 0.03, 0.03, 0.03],
    '2,6': [0.05, 0.05, 0.58, 0.05, 0.05, 0.05, 0.05],
    '2,7': [0.58, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05],
    '3,0': [0.22, 0.51, 0.01, 0.01, 0.22, 0.01, 0.01],
    '3,1': [0.10, 0.01, 0.19, 0.10, 0.38, 0.01, 0.10],
    '3,2': [0.31, 0.21, 0.11, 0.21, 0.11, 0.01, 0.01],
    '3,3': [0.59, 0.16, 0.01, 0.01, 0.01, 0.16, 0.01],
    '3,4': [0.30, 0.01, 0.30, 0.01, 0.16, 0.16, 0.01],
    '3,5': [0.28, 0.28, 0.03, 0.03, 0.03, 0.03, 0.28],
    '3,6': [0.03, 0.38, 0.03, 0.38, 0.03, 0.03, 0.03],
    '3,7': [0.38, 0.03, 0.03, 0.03, 0.38, 0.03, 0.03],
    '3,8': [0.58, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05],
    '4,0': [0.18, 0.43, 0.09, 0.18, 0.09, 0.01, 0.01],
    '4,1': [0.19, 0.36, 0.02, 0.19, 0.19, 0.02, 0.02],
    '4,2': [0.12, 0.35, 0.24, 0.01, 0.12, 0.01, 0.01],
    '4,3': [0.02, 0.22, 0.43, 0.02, 0.02, 0.02, 0.22],
    '4,4': [0.58, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05],
    '4,5': [0.03, 0.38, 0.38, 0.03, 0.03, 0.03, 0.03],
    // Add other pairs if they exist in your full dataset
};

const pairCounts = {
    '0,1': 28,
    '0,0': 19,
    '1,1': 17,
    '1,0': 16,
    '0,3': 15,
    '1,2': 13,
    '1,3': 13,
    '3,0': 13,
    '2,0': 12,
    '2,1': 11,
    '4,0': 11,
    '3,1': 10,
    '2,3': 10,
    '2,2': 10,
    '3,2': 10,
    '1,4': 9,
    '0,4': 9,
    '4,2': 8,
    '0,2': 7,
    '3,3': 6,
    // Add other counts if available
};

// Determine the range of numbers needed based on the keys
const allNumbers = new Set();
Object.keys(transitionProbabilities).forEach(key => {
    const [n1, n2] = key.split(',').map(Number);
    allNumbers.add(n1);
    allNumbers.add(n2);
});
Object.keys(pairCounts).forEach(key => {
    const [n1, n2] = key.split(',').map(Number);
    allNumbers.add(n1);
    allNumbers.add(n2);
});
// Add numbers 0-6 explicitly as they are the result states
for (let i = 0; i <= 6; i++) {
    allNumbers.add(i);
}

const numberRange = Array.from(allNumbers).sort((a, b) => a - b); // e.g., [0, 1, 2, 3, 4, 5, 6, 7, 8]
const nextStates = [0, 1, 2, 3, 4, 5, 6]; // The columns in your probability table
// --- Paste the Data Preparation code from above here ---
// const transitionProbabilities = { ... };
// const pairCounts = { ... };
// const allNumbers = new Set(); ...
// const numberRange = Array.from(allNumbers).sort((a, b) => a - b);
// const nextStates = [0, 1, 2, 3, 4, 5, 6];
// --- End of Data Preparation code ---

const SelectionButton = styled(Button)(({ theme, selected, isfirst }) => ({
    margin: theme.spacing(0.5),
    minWidth: '40px',
    borderColor: selected
        ? (isfirst ? theme.palette.primary.main : theme.palette.secondary.main)
        : undefined,
    borderWidth: selected ? '2px' : '1px',
    borderStyle: 'solid',
    backgroundColor: selected
        ? alpha(isfirst ? theme.palette.primary.light : theme.palette.secondary.light, 0.3)
        : undefined,
}));

const MarkovSecondOrder = () => {
    const [firstSelection, setFirstSelection] = useState(null);
    const [secondSelection, setSecondSelection] = useState(null);
    const [selectedPair, setSelectedPair] = useState(null); // Stores the pair [num1, num2]

    const handleNumberClick = (num) => {
        if (firstSelection === null) {
            // First number selection
            setFirstSelection(num);
            setSecondSelection(null); // Reset second if starting over
            setSelectedPair(null); // Clear results
        } else if (secondSelection === null) {
            // Second number selection
            setSecondSelection(num);
            setSelectedPair([firstSelection, num]); // Set the final pair
        } else {
            // Both already selected, start a new pair
            setFirstSelection(num);
            setSecondSelection(null);
            setSelectedPair(null); // Clear results
        }
    };

    const getPairData = () => {
        if (!selectedPair) return null;

        const pairKey = `${selectedPair[0]},${selectedPair[1]}`;
        const probabilities = transitionProbabilities[pairKey];
        const count = pairCounts[pairKey];

        return {
            pair: selectedPair,
            probabilities,
            count,
            pairKey, // For display/debugging
        };
    };

    const pairData = getPairData();

    const getInstructionText = () => {
        if (selectedPair) {
            return `Selected Pair: (${selectedPair[0]}, ${selectedPair[1]}). Click another number to start a new pair.`;
        }
        if (firstSelection !== null && secondSelection === null) {
            return `First number selected: ${firstSelection}. Click the second number.`;
        }
        return 'Click the first number of the pair.';
    };

    return (
        <Card sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom component="div">
                    Second-Order Markov Chain Explorer
                </Typography>

                {/* --- Selection Area --- */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Select Previous State Pair (t-2, t-1):
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {getInstructionText()}
                    </Typography>
                    <Box>
                        {numberRange.map((num) => (
                            <SelectionButton
                                key={num}
                                variant="outlined"
                                size="small"
                                onClick={() => handleNumberClick(num)}
                                selected={num === firstSelection || num === secondSelection}
                                isfirst={num === firstSelection ? 1 : 0} // Pass isfirst as 1 or 0
                            >
                                {num}
                            </SelectionButton>
                        ))}
                    </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* --- Results Area --- */}
                <Box sx={{ minHeight: 150 }}> {/* Added minHeight for consistent layout */}
                    {pairData ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Results for Pair ({pairData.pair[0]}, {pairData.pair[1]})
                            </Typography>

                            {/* Display Count */}
                            {pairData.count !== undefined ? (
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    Observed Count: <Chip label={pairData.count} size="small" color="info" />
                                </Typography>
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Count data not available for this specific pair in the top list.
                                </Typography>
                            )}

                            {/* Display Probabilities */}
                            <Typography variant="subtitle1" gutterBottom>
                                Transition Probabilities to Next State (t):
                            </Typography>
                            {pairData.probabilities ? (
                                <Grid container spacing={1}>
                                    {pairData.probabilities.map((prob, index) => (
                                        <Grid item key={nextStates[index]}>
                                            <Chip
                                                label={`${nextStates[index]}: ${prob.toFixed(2)}`} // Format probability
                                                variant="outlined"
                                                color="primary"
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Typography variant="body2" color="error">
                                    No transition probability data found for the pair ({pairData.pair[0]}, {pairData.pair[1]}).
                                </Typography>
                            )}
                        </>
                    ) : (
                        firstSelection !== null && secondSelection === null ? (
                            <Typography color="text.secondary">Select the second number to see results.</Typography>
                        ) : (
                            <Typography color="text.secondary">Select a pair above to view its data.</Typography>
                        )
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default MarkovSecondOrder;