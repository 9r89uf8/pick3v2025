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
    TablePagination,
    Divider, // Keep Divider
    Stack,
    Button
} from '@mui/material';
import { alpha } from '@mui/material/styles';
// Icons can be kept if used elsewhere or removed if not
// import { Today, AccessTime, Repeat, BarChart } from '@mui/icons-material';

// --- Your Static Data ---
const yourStaticData = {
    0: { occurrencesPercentage: '24.85%', averageWait: '4.02' },
    1: { occurrencesPercentage: '22.81%', averageWait: '4.25' },
    2: { occurrencesPercentage: '15.50%', averageWait: '6.48' },
    3: { occurrencesPercentage: '15.50%', averageWait: '6.48' },
    4: { occurrencesPercentage: '9.65%', averageWait: '10.06' },
    5: { occurrencesPercentage: '4.97%', averageWait: '20.31' },
    6: { occurrencesPercentage: '3.80%', averageWait: '25.25' },
    7: { occurrencesPercentage: '2.34%', averageWait: '36.43' },
    8: { occurrencesPercentage: '0.58%', averageWait: '108.00' },
};

// --- Styled Chip (no changes) ---
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
    const [selectedNumber, setSelectedNumber] = useState(0); // Start with 0 selected

    useEffect(() => {
        if (draws && typeof draws === 'object' && Object.keys(draws).length > 0) {
            setNumberStats(draws);
        } else {
            setNumberStats({});
        }
        // Optionally reset selection if draws data changes
        // setSelectedNumber(0); // Keep 0 selected or change to null if preferred
        // setPage(0);
    }, [draws]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleNumberSelect = (number) => {
        setSelectedNumber(prevSelected => (prevSelected === number ? null : number));
        setPage(0);
    };

    const numberEntries = Object.entries(numberStats)
        .map(([number, stats]) => ({
            number: parseInt(number),
            ...stats
        }))
        .filter(item => selectedNumber === null || item.number === selectedNumber)
        .sort((a, b) => a.number - b.number);

    const filterNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // Your specific numbers

    return (
        <Grid container spacing={3} sx={{ p: 3 }}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        {/* Header and Buttons */}
                        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mb={3} gap={2}>
                            <Typography variant="h5" component="div">
                                Number Statistics
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" justifyContent="center">
                                <Button
                                    key="all"
                                    variant={selectedNumber === null ? "contained" : "outlined"}
                                    size="small"
                                    onClick={() => handleNumberSelect(null)}
                                >
                                    All
                                </Button>
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
                        {/* End Header and Buttons */}

                        {/* Display Area */}
                        <Box sx={{ mt: 2 }}>
                            {numberEntries.length > 0 ? (
                                numberEntries
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((entry) => {
                                        // Get your static data for the current number
                                        const staticEntry = yourStaticData[entry.number];

                                        return (
                                            <React.Fragment key={entry.number}>
                                                <Paper elevation={0} sx={{ p: 1.5, mb: 1.5, border: theme => `1px solid ${theme.palette.divider}` }}>
                                                    <Stack spacing={1.5}> {/* Increased spacing slightly */}
                                                        {/* Row 1: Number and Key Stats (Current) */}
                                                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                                                            <Typography variant="h6" component="span" color="primary.main" sx={{ fontWeight: 'bold', minWidth: '50px' }}>
                                                                {entry.number}
                                                            </Typography>
                                                            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
                                                                <Typography variant="body2" title="Data from 'draws' prop">
                                                                    Occurrences: <strong>{entry.totalOccurrences}</strong>
                                                                </Typography>
                                                                <Typography variant="body2" title="Data from 'draws' prop">
                                                                    Current %: <strong>{entry.occurrencesPercentage}%</strong>
                                                                </Typography>
                                                                <Typography variant="body2" title="Data from 'draws' prop">
                                                                    Current Avg Wait: <strong>{entry.averageWaitTime}</strong>
                                                                </Typography>
                                                                <Typography variant="body2" title="Data from 'draws' prop">
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
                                                            </Stack>
                                                        </Box>

                                                        {/* --- ADDED: Display Your Static Data --- */}
                                                        {staticEntry && (
                                                            <Box sx={{ pl: '50px' }}> {/* Indent slightly to align under stats */}
                                                                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
                                                                    <Typography variant="body2" color="text.secondary" title="Your provided static data">
                                                                        Historical %: <strong>{staticEntry.occurrencesPercentage}</strong>
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary" title="Your provided static data">
                                                                        Historical Avg Wait: <strong>{staticEntry.averageWait}</strong>
                                                                    </Typography>
                                                                </Stack>
                                                            </Box>
                                                        )}
                                                        {/* --- End Static Data --- */}

                                                        {/* Divider */}
                                                        <Divider light sx={{ my: 0.5 }}/>

                                                        {/* Row 3: Wait Pattern (Current) */}
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                                                Current Wait Pattern:
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
                                            </React.Fragment>
                                        );
                                    })
                            ) : (
                                <Typography sx={{ textAlign: 'center', p: 3 }}>
                                    {selectedNumber !== null
                                        ? `No statistics found for number "${selectedNumber}".`
                                        : Object.keys(numberStats).length === 0
                                            ? "No statistics data available."
                                            : "No matching statistics found."
                                    }
                                </Typography>
                            )}
                        </Box>

                        {/* Pagination */}
                        {numberEntries.length > rowsPerPage && (
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