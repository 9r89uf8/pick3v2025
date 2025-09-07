'use client';
import React from 'react';
import {
    Paper,
    Stack,
    Button,
    Typography,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Analytics as AnalyticsIcon
} from '@mui/icons-material';

const ControlBar = ({
    loading,
    data,
    error,
    successMessage,
    pairType,
    onPairTypeChange,
    onAnalyzePairs,
    onClearSuccessMessage
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const pairTypeOptions = [
        { value: 'first-second', label: '1st & 2nd Numbers' },
        { value: 'first-third', label: '1st & 3rd Numbers' },
        { value: 'second-third', label: '2nd & 3rd Numbers' }
    ];

    return (
        <Paper sx={{ 
            p: { xs: 2, md: 3 }, 
            mb: { xs: 2, md: 3 }, 
            background: 'rgba(255, 255, 255, 0.02)' 
        }}>
            <Stack 
                direction={isMobile ? "column" : "row"} 
                spacing={2} 
                alignItems={isMobile ? "stretch" : "center"}
            >
                <FormControl 
                    size={isMobile ? "medium" : "small"}
                    sx={{ minWidth: { xs: '100%', sm: 200, md: 220 } }}
                >
                    <InputLabel>Pair Type</InputLabel>
                    <Select
                        value={pairType}
                        onChange={(e) => onPairTypeChange(e.target.value)}
                        label="Pair Type"
                        disabled={loading}
                    >
                        {pairTypeOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                
                <Button
                    variant="contained"
                    color="primary"
                    size={isMobile ? "medium" : "large"}
                    startIcon={loading ? <CircularProgress size={20} /> : !isSmallMobile && <AnalyticsIcon />}
                    onClick={onAnalyzePairs}
                    disabled={loading}
                    fullWidth={isMobile}
                    sx={{ minHeight: { xs: 40, sm: 48 } }}
                >
                    {loading ? 'Analyzing...' : isSmallMobile ? '📊 Analyze Pairs' : 'Analyze Pairs'}
                </Button>
                
                {data && (
                    <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{ 
                            textAlign: isMobile ? 'center' : 'left',
                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }}
                    >
                        Analyzed {data.summary.totalDrawsAnalyzed} draws • Found {data.summary.pairsFound} unique pairs
                    </Typography>
                )}
            </Stack>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {successMessage && (
                <Alert severity="success" sx={{ mt: 2 }} onClose={onClearSuccessMessage}>
                    {successMessage}
                </Alert>
            )}
        </Paper>
    );
};

export default ControlBar;