'use client';
import React, { useState } from 'react';

// Icon components
const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

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
        <div className="min-h-screen flex items-center justify-center p-4 bg-background-primary">
            <div className="w-full max-w-lg glass-card p-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-accent-gold">
                    📊 Export Lottery Draws
                </h1>

                <p className="mb-6 text-white/70 leading-relaxed">
                    This will download all ~1200 lottery draws as a CSV file with columns:<br/>
                    <strong className="text-white">draw_id, date, a, b, c</strong><br/>
                    where a ≤ b ≤ c (sorted numbers)
                </p>

                <button
                    onClick={downloadCSV}
                    disabled={loading}
                    className={`
                        flex items-center justify-center gap-2
                        w-full max-w-xs mx-auto
                        px-6 py-3
                        text-lg font-semibold
                        rounded-lg
                        transition-all
                        duration-200
                        ${loading
                            ? 'bg-accent-gold/50 cursor-not-allowed'
                            : 'bg-accent-gold hover:bg-accent-gold-light text-black hover:shadow-glow'
                        }
                    `}
                >
                    {loading ? (
                        <>
                            <LoadingSpinner />
                            <span>Downloading...</span>
                        </>
                    ) : (
                        <>
                            <DownloadIcon />
                            <span>Download CSV File</span>
                        </>
                    )}
                </button>

                {status && (
                    <div className="mt-6">
                        <div
                            className={`
                                relative
                                p-4
                                rounded-lg
                                border
                                ${status.type === 'error'
                                    ? 'bg-semantic-error/10 border-semantic-error/30 text-red-300'
                                    : status.type === 'success'
                                        ? 'bg-semantic-success/10 border-semantic-success/30 text-green-300'
                                        : 'bg-primary-500/10 border-primary-500/30 text-blue-300'
                                }
                            `}
                        >
                            <button
                                onClick={() => setStatus(null)}
                                className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded transition-colors"
                                aria-label="Close"
                            >
                                <CloseIcon />
                            </button>
                            <p className="pr-8">{status.message}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportCSVPage;
