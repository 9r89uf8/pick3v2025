'use client';
import React from 'react';
import {
    Paper,
    Stack,
    Button,
    Typography,
    Alert,
    CircularProgress,
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
    onAnalyzePairs,
    onClearSuccessMessage
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                    {loading ? 'Analyzing...' : isSmallMobile ? '📊 Analyze All Pairs' : 'Analyze All Pairs'}
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
                        Last analyzed: {new Date(data.summary.analysisDate).toLocaleString()}
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