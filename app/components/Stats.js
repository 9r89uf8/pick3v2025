import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    Chip,
    styled,
    Paper,
    TablePagination, // Keep Pagination
    // TextField, // Remove TextField
    // InputAdornment, // Remove InputAdornment
    Divider, // Add Divider for visual separation
    Stack,  // Add Stack for easier layout within items
    Button // Import Button
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Today, AccessTime, /* Search, */ Repeat, BarChart } from '@mui/icons-material'; // Remove Search icon if not needed elsewhere

// --- Styled Chip (no changes needed) ---
const StatsChip = styled(Chip)(({ theme, color }) => ({
    backgroundColor: alpha(theme.palette[color || 'primary'].main, 0.1),
    color: theme.palette[color || 'primary'].main,
    fontWeight: 'bold',
    '& .MuiChip-icon': {
        color: theme.palette[color || 'primary'].main,
    },
}));

// --- Component ---
const Stats = ({ draws }) => {
    const [numberStats, setNumberStats] = useState({});
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    // --- NEW STATE: Track selected number ---
    // Use null to represent "show all" initially
    const [selectedNumber, setSelectedNumber] = useState(0);

    useEffect(() => {
        if (draws && typeof draws === 'object' && Object.keys(draws).length > 0) {
            // Ensure draws is the processed stats object/map
            setNumberStats(draws);
        } else {
            // Handle cases where draws might be empty or not in the expected format
            setNumberStats({});
        }
        // Reset selection if draws data changes fundamentally
        setSelectedNumber(0);
        setPage(0);
    }, [draws]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // --- NEW HANDLER: Handle button click ---
    const handleNumberSelect = (number) => {
        // If clicking the already selected button, deselect it (show all)
        // Otherwise, select the new number
        setSelectedNumber(prevSelected => (prevSelected === number ? null : number));
        setPage(0); // Reset page when filter changes
    };

    // Data preparation: Filter based on selectedNumber
    const numberEntries = Object.entries(numberStats)
        .map(([number, stats]) => ({
            number: parseInt(number),
            ...stats
        }))
        // --- UPDATED FILTER ---
        // Show all if selectedNumber is null, otherwise show only the matching number
        .filter(item => selectedNumber === null || item.number === selectedNumber)
        .sort((a, b) => a.number - b.number);

    // Array for button generation
    const filterNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    return (
        <Grid container spacing={3} sx={{ p: 3 }}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        {/* --- Header and Buttons --- */}
                        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mb={3} gap={2}>
                            <Typography variant="h5" component="div">
                                Number Statistics
                            </Typography>
                            {/* --- Button Group --- */}
                            <Stack direction="row" flexWrap="wrap" justifyContent="center">
                                {/* "All" Button */}
                                <Button
                                    key="all"
                                    variant={selectedNumber === null ? "contained" : "outlined"}
                                    size="small"
                                    onClick={() => handleNumberSelect(null)} // Pass null to show all
                                >
                                    All
                                </Button>
                                {/* Number Buttons */}
                                {filterNumbers.map(num => (
                                    <Button
                                        key={num}
                                        variant={selectedNumber === num ? "contained" : "outlined"}
                                        size="small"
                                        onClick={() => handleNumberSelect(num)}
                                    >
                                        {num}
                                    </Button>
                                ))}
                            </Stack>
                        </Box>
                        {/* --- End Header and Buttons --- */}

                        {/* Display Area (no changes needed inside) */}
                        <Box sx={{ mt: 2 }}>
                            {numberEntries.length > 0 ? (
                                numberEntries
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((entry, index) => (
                                        <React.Fragment key={entry.number}>
                                            <Paper elevation={0} sx={{ p: 1.5, mb: 1, border: theme => `1px solid ${theme.palette.divider}` }}>
                                                <Stack spacing={1}>
                                                    {/* Row 1: Number and Key Stats */}
                                                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                                                        <Typography variant="h6" component="span" color="primary.main" sx={{ fontWeight: 'bold', minWidth: '50px' }}>
                                                            {entry.number}
                                                        </Typography>
                                                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
                                                            <Typography variant="body2">
                                                                Occurrences: <strong>{entry.totalOccurrences}</strong>
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                Last Seen: {entry.timeSinceLastOccurrence === 0 ? (
                                                                <StatsChip
                                                                    label="Current"
                                                                    color="success"
                                                                    size="small"
                                                                    sx={{ ml: 0.5 }}
                                                                />
                                                            ) : (
                                                                <strong>{entry.timeSinceLastOccurrence} draws ago</strong>
                                                            )}
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                Avg Wait: <strong>{entry.averageWaitTime}</strong>
                                                            </Typography>
                                                        </Stack>
                                                    </Box>

                                                    {/* Row 2: Wait Pattern */}
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                                            Wait Pattern:
                                                        </Typography>
                                                        {Array.isArray(entry.recurrenceDistances) && entry.recurrenceDistances.length > 0 && entry.recurrenceDistances[0] !== "Only occurs once" ? (
                                                            <Box sx={{ display: 'inline-flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {entry.recurrenceDistances.slice(0, 25).map((distance, idx) => (
                                                                    <Chip
                                                                        key={idx}
                                                                        label={distance}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                ))}
                                                                {entry.recurrenceDistances.length > 25 && (
                                                                    <Chip label="..." size="small" variant="outlined" />
                                                                )}
                                                            </Box>
                                                        ) : (
                                                            <Typography variant="caption" color="text.secondary" component="span">
                                                                Only seen once or insufficient data
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Stack>
                                            </Paper>
                                            {/* Optional Divider */}
                                            {/* {index < (numberEntries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length - 1) && <Divider />} */}
                                        </React.Fragment>
                                    ))
                            ) : (
                                // Updated "No results" message
                                <Typography sx={{ textAlign: 'center', p: 3 }}>
                                    {selectedNumber !== null
                                        ? `No statistics found for number "${selectedNumber}".`
                                        : Object.keys(numberStats).length === 0
                                            ? "No statistics data available." // If the initial data is empty
                                            : "No matching statistics found." // Should not happen with 'All' unless data is empty
                                    }
                                </Typography>
                            )}
                        </Box>

                        {/* Pagination remains */}
                        {numberEntries.length > rowsPerPage && ( // Only show pagination if needed
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                component="div"
                                count={numberEntries.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default Stats;