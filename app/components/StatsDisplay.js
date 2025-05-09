import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Tabs,
    Tab,
    Paper,
    alpha,
    styled,
    Button,
    Grid,
    Divider,
    // Chip // Chip is not used in the final version, can be removed if not needed elsewhere
} from '@mui/material';
import { setDisplayInfo } from "@/app/services/displayService"; // Assuming this service fetches the data

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: theme.spacing(2),
    border: `1px solid ${alpha('#ffffff', 0.2)}`,
}));

const StyledStatCard = styled(Paper)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', // Added for better vertical alignment if content height varies
    padding: theme.spacing(2),
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: theme.spacing(1),
    border: `1px solid ${alpha('#ffffff', 0.1)}`,
    height: '100%',
    textAlign: 'center', // Ensure text within is centered
}));

// Existing StatCard for success rates
const StatCard = ({ title, value, total, percentage, color = '#ffc300' }) => (
    <StyledStatCard elevation={0}>
        <Typography
            variant="h6"
            sx={{
                color: color,
                mb: 1,
                fontWeight: 600,
            }}
        >
            {title}
        </Typography>
        <Typography
            variant="h4"
            sx={{
                color: '#ffffff',
                mb: 1,
                fontWeight: 700
            }}
        >
            {value !== undefined && total !== undefined ? `${value} / ${total}` : 'N/A'}
        </Typography>
        <Typography
            variant="h5"
            sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 500
            }}
        >
            {percentage !== undefined ? `${percentage?.toFixed(1)}%` : ''}
        </Typography>
    </StyledStatCard>
);

// New component for displaying BBA and BAA counts
const DistributionCountCard = ({ title, count, color = '#80deea' }) => (
    <StyledStatCard elevation={0}>
        <Typography
            variant="subtitle1" // Using subtitle1 for a slightly smaller heading than StatCard
            sx={{
                color: color,
                mb: 1,
                fontWeight: 600,
            }}
        >
            {title}
        </Typography>
        <Typography
            variant="h4"
            sx={{
                color: '#ffffff',
                fontWeight: 700
            }}
        >
            {count !== undefined ? count : 'N/A'}
        </Typography>
    </StyledStatCard>
);


const MonthlyStats = ({ data, title }) => {
    if (!data) return (
        <StyledCard elevation={0}>
            <CardContent>
                <Typography variant="h5" sx={{ color: '#ffc300', mb: 3, textAlign: 'center', fontWeight: 600 }}>
                    {title}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                    No data available for this month.
                </Typography>
            </CardContent>
        </StyledCard>
    );

    return (
        <StyledCard elevation={0}>
            <CardContent>
                <Typography
                    variant="h5"
                    sx={{
                        color: '#ffc300',
                        mb: 3,
                        textAlign: 'center',
                        fontWeight: 600
                    }}
                >
                    {title} - Statistics
                </Typography>

                <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 500 }}>
                    Overall Success Rates
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}> {/* Adjusted grid for two items */}
                        <StatCard
                            title="Regular Pass"
                            value={data.totalPassed}
                            total={data.totalDraws}
                            percentage={data.percentage}
                            color="#4caf50" // Green
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}> {/* Adjusted grid for two items */}
                        <StatCard
                            title="Fireball Pass"
                            value={data.totalFireballPassed}
                            total={data.totalDraws}
                            percentage={data.fireballPercentage}
                            color="#ff9800" // Orange
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', my: 3 }} />

                <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 500 }}>
                    Winning Pattern Counts
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
                        (From passed regular draws)
                    </Typography>
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <DistributionCountCard
                            title="BBA Pattern"
                            count={data.countBBA}
                            color="#90caf9" // Light Blue
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DistributionCountCard
                            title="BAA Pattern"
                            count={data.countBAA}
                            color="#a5d6a7" // Light Green
                        />
                    </Grid>
                </Grid>
                {/* You can also display the total passed draws count here if needed */}
                <Box sx={{mt: 2, textAlign: 'center'}}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)'}}>
                        Total Passed Regular Draws: {data.totalPassed !== undefined ? data.totalPassed : 'N/A'}
                    </Typography>
                </Box>
            </CardContent>
        </StyledCard>
    );
};

const StatsDisplay = ({ display }) => {
    const [value, setValue] = useState(0);
    // The 'display' prop would be populated by a useEffect hook calling setDisplayInfo
    // For example:
    // const [displayData, setDisplayData] = useState(null);
    // const [isLoading, setIsLoading] = useState(true);
    // useEffect(() => {
    //     const fetchData = async () => {
    //         setIsLoading(true);
    //         const data = await getDisplayInfoFromApi(); // Replace with your actual fetch
    //         setDisplayData(data);
    //         setIsLoading(false);
    //     };
    //     fetchData();
    // }, []);
    //
    // if (isLoading) return <Typography sx={{color: 'white'}}>Loading stats...</Typography>;
    // if (!displayData) return <Typography sx={{color: 'white'}}>No stats to display.</Typography>;


    // This function should ideally trigger a re-fetch and update the 'display' prop
    const handleDisplay = async () => {
        alert("Initiating stats update... This component will refresh once data is fetched.");
        // Actual implementation would involve calling a service that updates the parent's state or context
        // For demo, we assume setDisplayInfo updates some global state or parent component re-fetches
        await setDisplayInfo(); // This might trigger a re-render if it updates state that 'display' depends on
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    // Use the passed 'display' prop
    const currentMonthData = display?.currentMonthStats;
    const previousMonthData = display?.previousMonthStats;

    // Extract month names for titles, providing fallbacks
    const currentMonthTitle = currentMonthData?.monthYear || "Current Month";
    const previousMonthTitle = previousMonthData?.monthYear || "Previous Month";


    return (
        <Box sx={{ width: '100%', mt: 4 }}>
            <Box sx={{
                borderBottom: 1,
                borderColor: 'rgba(255,255,255,0.2)', // Slightly more visible divider
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px 8px 0 0',
            }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="fullWidth"
                    textColor="inherit" // Ensures text color inherits for better theme integration
                    sx={{
                        '& .MuiTab-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontWeight: 500,
                            '&.Mui-selected': {
                                color: '#ffffff',
                                fontWeight: 700,
                            },
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#ffc300', // Gold accent
                            height: '3px',
                        },
                    }}
                >
                    <Tab label={currentMonthTitle} />
                    <Tab label={previousMonthTitle} />
                </Tabs>
            </Box>
            <Box sx={{ pt: 3 }}> {/* Added padding top for content separation */}
                {value === 0 && (
                    <MonthlyStats
                        data={currentMonthData}
                        title={currentMonthTitle}
                    />
                )}
                {value === 1 && (
                    <MonthlyStats
                        data={previousMonthData}
                        title={previousMonthTitle}
                    />
                )}
            </Box>

            {/* The update button might be better placed in a parent component
                or trigger a global state update / refetch more directly */}
            <Box textAlign="center"> {/* Center the button */}
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleDisplay}
                    sx={{
                        mt: 3, // Spacing from the content
                        mb: 2, // Spacing at the bottom
                        minWidth: '200px', // Give button a decent minimum width
                        background: 'linear-gradient(45deg, #ffc300 30%, #ff8f00 90%)', // Gold gradient
                        color: 'black', // Text color for contrast on gold
                        fontWeight: 'bold',
                        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)', // Subtle shadow
                        '&:hover': {
                            background: 'linear-gradient(45deg, #ff8f00 30%, #ffc300 90%)', // Reverse gradient on hover
                        }
                    }}
                >
                    Update Stats
                </Button>
            </Box>
        </Box>
    );
};

export default StatsDisplay;