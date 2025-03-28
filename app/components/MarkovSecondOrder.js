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
    "0,0": [0.28, 0.32, 0.14, 0.06, 0.05, 0.06, 0.03],
    "0,1": [0.18, 0.23, 0.14, 0.18, 0.09, 0.07, 0.06],
    "0,2": [0.35, 0.16, 0.13, 0.19, 0.10, 0.07, 0.00],
    "0,3": [0.34, 0.22, 0.09, 0.09, 0.06, 0.12, 0.03],
    "0,4": [0.20, 0.12, 0.27, 0.12, 0.12, 0.04, 0.04],
    "0,5": [0.42, 0.18, 0.18, 0.09, 0.01, 0.09, 0.01],
    "0,6": [0.34, 0.12, 0.23, 0.01, 0.12, 0.12, 0.01],
    "0,7": [0.44, 0.01, 0.16, 0.16, 0.16, 0.01, 0.01],
    "1,0": [0.20, 0.14, 0.16, 0.24, 0.12, 0.02, 0.10],
    "1,1": [0.32, 0.14, 0.18, 0.14, 0.07, 0.12, 0.00],
    "1,2": [0.29, 0.13, 0.20, 0.16, 0.07, 0.10, 0.04],
    "1,3": [0.20, 0.30, 0.14, 0.10, 0.10, 0.04, 0.04],
    "1,4": [0.38, 0.30, 0.13, 0.09, 0.00, 0.00, 0.05],
    "1,5": [0.12, 0.23, 0.12, 0.12, 0.17, 0.06, 0.12],
    "1,6": [0.01, 0.26, 0.26, 0.26, 0.01, 0.14, 0.01],
    "1,7": [0.35, 0.18, 0.02, 0.02, 0.02, 0.35, 0.02],
    "1,8": [0.55, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05],
    "1,9": [0.55, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05],
    "2,0": [0.25, 0.21, 0.12, 0.21, 0.12, 0.05, 0.02],
    "2,1": [0.36, 0.24, 0.00, 0.12, 0.08, 0.08, 0.00],
    "2,2": [0.36, 0.08, 0.24, 0.04, 0.08, 0.08, 0.08],
    "2,3": [0.34, 0.17, 0.12, 0.23, 0.06, 0.01, 0.01],
    "2,4": [0.12, 0.36, 0.18, 0.06, 0.12, 0.12, 0.01],
    "2,5": [0.21, 0.41, 0.21, 0.01, 0.11, 0.01, 0.01],
    "2,6": [0.28, 0.28, 0.28, 0.02, 0.02, 0.02, 0.02],
    "2,7": [0.70, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03],
    "3,0": [0.30, 0.39, 0.12, 0.03, 0.15, 0.00, 0.00],
    "3,1": [0.25, 0.15, 0.08, 0.04, 0.25, 0.11, 0.08],
    "3,2": [0.19, 0.26, 0.13, 0.26, 0.07, 0.07, 0.01],
    "3,3": [0.47, 0.21, 0.01, 0.07, 0.07, 0.07, 0.07],
    "3,4": [0.23, 0.01, 0.34, 0.12, 0.12, 0.12, 0.01],
    "3,5": [0.30, 0.16, 0.01, 0.16, 0.01, 0.16, 0.16],
    "3,6": [0.02, 0.18, 0.35, 0.18, 0.18, 0.02, 0.02],
    "3,7": [0.37, 0.03, 0.03, 0.03, 0.37, 0.03, 0.03],
    "3,8": [0.37, 0.03, 0.03, 0.03, 0.03, 0.03, 0.37],
    "4,0": [0.23, 0.35, 0.08, 0.08, 0.12, 0.08, 0.00],
    "4,1": [0.20, 0.20, 0.16, 0.26, 0.11, 0.06, 0.00],
    "4,2": [0.32, 0.22, 0.27, 0.01, 0.06, 0.01, 0.01],
    "4,3": [0.10, 0.28, 0.37, 0.10, 0.01, 0.01, 0.10],
    "4,4": [0.51, 0.01, 0.14, 0.01, 0.14, 0.14, 0.01]
    // Add other pairs if they exist in your full dataset
};

const pairCounts = {
    '0,1': 70,
    '0,0': 64,
    '1,0': 50,
    '1,1': 43,
    '2,0': 43,
    '3,0': 33,
    '0,3': 32,
    '0,2': 31,
    '1,2': 30,
    '1,3': 29,
    '3,1': 27,
    '4,0': 25,
    '0,4': 25,
    '2,1': 24,
    '2,2': 24,
    '1,4': 23,
    '4,1': 19,
    '4,2': 18,
    '2,3': 17,
    '1,5': 17,
    '5,1': 16,
    '2,4': 16,
    '3,2': 15,
    '3,3': 14,
    '5,0': 13,
    '0,5': 11,
    '4,3': 10,
    '7,0': 10,
    '2,5': 9,
    '0,6': 9,
    '6,2': 9,
    '5,2': 8,
    '3,4': 8,
    '1,6': 7,
    '4,4': 7,
    '0,7': 6,
    '3,5': 6,
    '6,0': 6,
    '6,1': 6,
    '5,3': 5
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