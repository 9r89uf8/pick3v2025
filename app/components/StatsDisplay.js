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
    Chip
} from '@mui/material';
import { setDisplayInfo } from "@/app/services/displayService";

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
    padding: theme.spacing(2),
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: theme.spacing(1),
    border: `1px solid ${alpha('#ffffff', 0.1)}`,
    height: '100%',
}));

const StatCard = ({ title, value, total, percentage, color = '#ffc300' }) => (
    <StyledStatCard elevation={0}>
        <Typography
            variant="h6"
            sx={{
                color: color,
                mb: 1,
                fontWeight: 600,
                textAlign: 'center'
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
            {value} / {total}
        </Typography>
        <Typography
            variant="h5"
            sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 500
            }}
        >
            {percentage?.toFixed(1)}%
        </Typography>
    </StyledStatCard>
);

const DistributionCard = ({ title, distributions, color = '#ffc300' }) => (
    <StyledStatCard elevation={0}>
        <Typography
            variant="h6"
            sx={{
                color: color,
                mb: 2,
                fontWeight: 600,
                textAlign: 'center'
            }}
        >
            {title}
        </Typography>
        <Grid container spacing={1}>
            {Object.entries(distributions || {}).map(([pattern, count]) => (
                <Grid item xs={4} key={pattern}>
                    <Chip
                        label={`${pattern}: ${count}`}
                        sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            width: '100%'
                        }}
                    />
                </Grid>
            ))}
        </Grid>
    </StyledStatCard>
);

const MonthlyStats = ({ data, title }) => {
    if (!data) return null;

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
                    {title}
                </Typography>

                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    Success Rates
                </Typography>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <StatCard
                            title="Regular Pass"
                            value={data.totalPassed}
                            total={data.totalDraws}
                            percentage={data.percentageOriginal}
                            color="#4caf50"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StatCard
                            title="Fireball Pass"
                            value={data.totalPassedWithFireball}
                            total={data.totalDraws}
                            percentage={data.percentageWithFireball}
                            color="#ff9800"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StatCard
                            title="Combined"
                            value={data.totalPassedCombined}
                            total={data.totalDraws}
                            percentage={data.percentageCombined}
                            color="#2196f3"
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', my: 3 }} />

                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    Distribution Patterns
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <DistributionCard
                            title="Regular Distributions"
                            distributions={data.distributions}
                            color="#4caf50"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <DistributionCard
                            title="Fireball Distributions"
                            distributions={data.fireballDistributions}
                            color="#ff9800"
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </StyledCard>
    );
};

const StatsDisplay = ({ display }) => {
    const [value, setValue] = useState(0);

    if (!display) return null;

    const handleDisplay = async () => {
        await setDisplayInfo()
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%', mt: 4 }}>
            <Box sx={{
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px 8px 0 0',
            }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTab-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&.Mui-selected': {
                                color: '#ffffff',
                            },
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#ffc300',
                        },
                    }}
                >
                    <Tab label="Current Month" />
                    <Tab label="Previous Month" />
                </Tabs>
            </Box>
            <Box sx={{ mt: 2 }}>
                {value === 0 && (
                    <MonthlyStats
                        data={display.currentMonth}
                        title={display.currentMonth?.month}
                    />
                )}
                {value === 1 && (
                    <MonthlyStats
                        data={display.previousMonth}
                        title={display.previousMonth?.month}
                    />
                )}
            </Box>

            <Button
                variant="contained"
                size="large"
                onClick={handleDisplay}
                sx={{
                    mt: 2,
                    background: 'linear-gradient(to right, #6c757d, #495057)',
                    color: 'white',
                    '&:hover': {
                        background: 'linear-gradient(to right, #495057, #343a40)',
                    }
                }}
            >
                Update Stats
            </Button>
        </Box>
    );
};

export default StatsDisplay;