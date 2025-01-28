import React, { useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Paper,
    useTheme,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
} from '@mui/material';

const ProbabilityDisplay = () => {
    const theme = useTheme();

    // Toggle for showing/hiding probabilities
    const [showProbabilities, setShowProbabilities] = useState(false);

    // Data for each play type/scenario
    const data = [
        {
            label: 'Straight',
            scenarios: [
                {
                    subLabel: 'Without Fireball',
                    combos: 216,
                    probability: '21.6% of 1,000 pass ranges',
                    rate: '1 every 4.63 draws',
                },
                {
                    subLabel: 'With Fireball',
                    combos: 216,
                    probability: '43.2% of 1,000 pass ranges',
                    rate: '1 every 2.31 draws',
                },
            ],
        },
        {
            label: 'Combo',
            scenarios: [
                {
                    subLabel: 'Without Fireball',
                    combos: 36,
                    probability: '21.6% of 1,000 pass ranges',
                    rate: '1 every 4.63 draws',
                },
                {
                    subLabel: 'With Fireball',
                    combos: 36,
                    probability: '43.2% of 1,000 pass ranges',
                    rate: '1 every 2.31 draws',
                },
            ],
        },
    ];

    return (
        <Box
            sx={{
                maxWidth: 800,
                mx: 'auto',   // centers horizontally
                mt: 4,
                mb: 4,
                px: 2,
            }}
        >
            {/* Centered Toggle Button */}
            <Box
                sx={{
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <Button
                    variant="contained"
                    onClick={() => setShowProbabilities((prev) => !prev)}
                    sx={{
                        backgroundColor: theme.palette.grey[800],
                        color: '#fff',
                        '&:hover': {
                            backgroundColor: theme.palette.grey[900],
                        },
                    }}
                >
                    {showProbabilities ? 'Hide Probabilities' : 'Show Probabilities'}
                </Button>
            </Box>

            {/* Conditionally render the probabilities data */}
            {showProbabilities && (
                <Grid container spacing={3}>
                    {data.map((betType) => (
                        <Grid item xs={12} md={6} key={betType.label}>
                            <Card
                                elevation={2}
                                sx={{
                                    height: '100%',
                                    backgroundColor: 'background.paper',
                                    '&:hover': {
                                        boxShadow: theme.shadows[4],
                                        transition: 'box-shadow 0.3s ease-in-out',
                                    },
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="h5"
                                        gutterBottom
                                        sx={{
                                            fontWeight: 600,
                                            color: 'primary.main',
                                            mb: 3,
                                            textAlign: 'center',
                                        }}
                                    >
                                        {betType.label}
                                    </Typography>

                                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Scenario</TableCell>
                                                    <TableCell align="right">Combos</TableCell>
                                                    <TableCell align="right">Probability</TableCell>
                                                    <TableCell align="right">Rate</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {betType.scenarios.map((scenario) => (
                                                    <TableRow key={scenario.subLabel}>
                                                        <TableCell>{scenario.subLabel}</TableCell>
                                                        <TableCell align="right">{scenario.combos}</TableCell>
                                                        <TableCell align="right">{scenario.probability}</TableCell>
                                                        <TableCell align="right">{scenario.rate}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default ProbabilityDisplay;
