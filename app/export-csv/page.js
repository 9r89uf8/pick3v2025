'use client';
import React, { useState } from 'react';
import { 
    Container, 
    Paper, 
    Typography, 
    Button, 
    Alert,
    CircularProgress,
    Box
} from '@mui/material';
import {
    Download as DownloadIcon
} from '@mui/icons-material';

const ExportCSVPage = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const downloadCSV = async () => {
        try {
            setLoading(true);
            setStatus({ type: 'info', message: 'Fetching draws from database...' });

            const response = await fetch('/api/export-draws');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Check if response is CSV (successful) or JSON (error)
            const contentType = response.headers.get('content-type');
            
            if (contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to export draws');
            }

            // Get the CSV content
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lottery_draws.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            setStatus({ type: 'success', message: '✅ CSV file downloaded successfully!' });
            
        } catch (error) {
            console.error('Download error:', error);
            setStatus({ type: 'error', message: `❌ Error: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 5 }}>
            <Paper sx={{ p: 4, textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)' }}>
                <Typography variant="h4" gutterBottom sx={{ color: '#FFC300' }}>
                    📊 Export Lottery Draws
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                    This will download all ~1200 lottery draws as a CSV file with columns:<br/>
                    <strong>draw_id, date, a, b, c</strong><br/>
                    where a ≤ b ≤ c (sorted numbers)
                </Typography>
                
                <Button
                    variant="contained"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                    onClick={downloadCSV}
                    disabled={loading}
                    sx={{ 
                        mb: 3,
                        minWidth: 200,
                        backgroundColor: '#FFC300',
                        color: '#000',
                        '&:hover': {
                            backgroundColor: '#FFD700'
                        }
                    }}
                >
                    {loading ? 'Downloading...' : 'Download CSV File'}
                </Button>
                
                {status && (
                    <Box sx={{ mt: 3 }}>
                        <Alert 
                            severity={status.type === 'error' ? 'error' : status.type === 'success' ? 'success' : 'info'}
                            onClose={() => setStatus(null)}
                        >
                            {status.message}
                        </Alert>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default ExportCSVPage;