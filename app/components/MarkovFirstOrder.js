import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    Chip,
    styled,
    Paper, // Added for better visual separation
} from '@mui/material';
import { alpha } from '@mui/material/styles';

// --- Data Definition ---
// It's often cleaner to define static data outside the component
const transitionMatrix = [
    // Row index corresponds to 'from' state (0-8)
    // Column index corresponds to 'to' state (0-6)
    //       0     1     2     3     4     5     6   <- To State
        [0.26,0.28,0.12,0.13,0.10,0.04,0.04],
        [0.24,0.21,0.15,0.14,0.11,0.08,0.03],
        [0.31,0.17,0.17,0.12,0.12,0.07,0.02],
        [0.29,0.24,0.13,0.12,0.07,0.05,0.04],
        [0.28,0.21,0.20,0.11,0.08,0.06,0.02],
        [0.23,0.29,0.14,0.09,0.07,0.07,0.09],
        [0.19,0.19,0.29,0.13,0.13,0.06,0.00],
        [0.53,0.05,0.16,0.05,0.11,0.11,0.00],
        [0.67,0.00,0.00,0.00,0.00,0.00,0.33]
];


// Define the possible states the user can select ('from' states)
const fromStates = [0, 1, 2, 3, 4, 5, 6, 7, 8];
// Define the possible states that can be transitioned 'to'
const toStates = [0, 1, 2, 3, 4, 5, 6];

// Styled Chip for better visual feedback
const SelectableChip = styled(Chip)(({ theme, selected }) => ({
    margin: theme.spacing(0.5),
    cursor: 'pointer',
    backgroundColor: selected
        ? theme.palette.primary.main // Highlight selected
        : theme.palette.grey[300], // Default background
    color: selected ? theme.palette.primary.contrastText : 'inherit', // Text color
    '&:hover': {
        backgroundColor: selected
            ? alpha(theme.palette.primary.main, 0.8)
            : theme.palette.grey[400],
    },
}));


// The 'draws' prop seems unused based on the request,
// but kept it in the signature as per your initial code.
const MarkovFirstOrder = ({ draws }) => {
    // State to keep track of the currently selected 'from' state index
    const [selectedState, setSelectedState] = useState(null); // null means nothing selected initially

    // Handler function to update the selected state when a chip is clicked
    const handleStateClick = (stateIndex) => {
        setSelectedState(stateIndex);
    };

    // Get the probabilities for the currently selected state
    const selectedProbabilities = selectedState !== null ? transitionMatrix[selectedState] : null;

    return (
        <Card elevation={3}>
            <CardContent>
                <Typography variant="h6" gutterBottom component="div">
                    First-Order Markov Chain Transitions
                </Typography>

                {/* Section to select the 'From' State */}
                <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mb: 1 }}>
                        Select 'From' State:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        {fromStates.map((stateNum) => (
                            <SelectableChip
                                key={stateNum}
                                label={`State ${stateNum}`}
                                onClick={() => handleStateClick(stateNum)}
                                selected={selectedState === stateNum} // Pass selected status for styling
                            />
                        ))}
                    </Box>
                </Box>

                {/* Section to display probabilities for the selected state */}
                {selectedState !== null && selectedProbabilities ? (
                    <Paper elevation={1} sx={{ p: 2, backgroundColor: alpha('#e3f2fd', 0.3) }}> {/* Light blueish background */}
                        <Typography variant="subtitle1" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
                            Transition Probabilities from State {selectedState}:
                        </Typography>
                        <Grid container spacing={2}>
                            {selectedProbabilities.map((probability, toStateIndex) => (
                                <Grid item xs={6} sm={4} md={3} lg={1.7} key={toStateIndex}> {/* Adjust grid sizing as needed */}
                                    <Box sx={{ textAlign: 'center', p: 1, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            To State {toStates[toStateIndex]} {/* Use toStates array for label */}
                                        </Typography>
                                        <Typography variant="h6" component="div">
                                            {probability.toFixed(2)} {/* Format to 2 decimal places */}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        Please select a 'From' state above to see its transition probabilities.
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default MarkovFirstOrder;