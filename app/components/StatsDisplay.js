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
    IconButton,
    Container,
    Fade,
    useTheme,
} from '@mui/material';
import {
    TrendingUp,
    LocalFireDepartment,
    Pattern,
    Analytics,
    CachedRounded,
    CheckCircleOutline,
    BarChart,
    Insights,
    AutoAwesome
} from '@mui/icons-material';
import { setDisplayInfo } from "@/app/services/displayService";

// Enhanced styled components with better animations and visual appeal
const StyledCard = styled(Card)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(20px)',
    borderRadius: theme.spacing(3),
    border: `1px solid ${alpha('#ffffff', 0.1)}`,
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.05)',
        border: `1px solid ${alpha('#ffffff', 0.2)}`,
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    },
}));

const StyledStatCard = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.08) 100%)',
    backdropFilter: 'blur(10px)',
    borderRadius: theme.spacing(2),
    border: `1px solid ${alpha('#ffffff', 0.08)}`,
    height: '100%',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.08)',
        transform: 'translateY(-4px)',
        '&::before': {
            transform: 'translateX(100%)',
        },
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.1)}, transparent)`,
        transition: 'transform 0.6s ease',
    },
}));

const StatCard = ({ title, value, total, percentage, color = '#ffc300', icon: Icon, subText = '' }) => (
    <StyledStatCard elevation={0}>
        <Box sx={{ position: 'relative', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                {Icon && <Icon sx={{ fontSize: 32, color: color, mb: 1 }} />}
            </Box>
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
                variant="h3"
                sx={{
                    color: '#ffffff',
                    mb: 0.5,
                    fontWeight: 700,
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
            >
                {value !== undefined && total !== undefined ? `${value}/${total}` : 'N/A'}
            </Typography>
            {percentage !== undefined && (
                <Typography
                    variant="h5"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                    }}
                >
                    {percentage?.toFixed(1)}%
                    <TrendingUp sx={{ fontSize: 20, color: percentage > 50 ? '#4caf50' : '#ff9800' }} />
                </Typography>
            )}
            {subText && (
                <Typography
                    variant="caption"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        mt: 1,
                        display: 'block',
                    }}
                >
                    {subText}
                </Typography>
            )}
        </Box>
    </StyledStatCard>
);

const SimpleStatCard = ({ title, value, color = '#80deea', icon: Icon, subText = '' }) => (
    <StyledStatCard elevation={0}>
        <Box sx={{ position: 'relative', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                {Icon && <Icon sx={{ fontSize: 28, color: color, mb: 1 }} />}
            </Box>
            <Typography
                variant="subtitle1"
                sx={{
                    color: color,
                    mb: 1,
                    fontWeight: 600,
                }}
            >
                {title}
            </Typography>
            <Typography
                variant="h3"
                sx={{
                    color: '#ffffff',
                    fontWeight: 700,
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
            >
                {value !== undefined ? value : 'N/A'}
            </Typography>
            {subText && (
                <Typography
                    variant="caption"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        mt: 1,
                        display: 'block',
                    }}
                >
                    {subText}
                </Typography>
            )}
        </Box>
    </StyledStatCard>
);

const SectionHeader = ({ title, subtitle, icon: Icon }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 2 }}>
        {Icon && <Icon sx={{ fontSize: 28, color: '#ffc300', mr: 2 }} />}
        <Box>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                {title}
            </Typography>
            {subtitle && (
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    {subtitle}
                </Typography>
            )}
        </Box>
    </Box>
);

const MonthlyStats = ({ data, title }) => {
    if (!data) return (
        <StyledCard elevation={0}>
            <CardContent>
                <Typography variant="h4" sx={{ color: '#ffc300', mb: 3, textAlign: 'center', fontWeight: 700 }}>
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
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography
                        variant="h4"
                        sx={{
                            color: '#ffc300',
                            fontWeight: 700,
                            textShadow: '0 2px 8px rgba(255, 195, 0, 0.3)',
                        }}
                    >
                        {title} Statistics
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            color: 'rgba(255,255,255,0.6)',
                            mt: 1
                        }}
                    >
                        Total Draws: {data.totalDraws || 0}
                    </Typography>
                </Box>

                {/* Main Success Rates */}
                <SectionHeader
                    title="Overall Success Rates"
                    subtitle="Comparing regular draws vs fireball substitutions"
                    icon={Analytics}
                />

                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid item xs={12} sm={6}>
                        <StatCard
                            title="Regular Pass"
                            value={data.totalPassed}
                            total={data.totalDraws}
                            percentage={data.percentage}
                            color="#4caf50"
                            icon={CheckCircleOutline}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <StatCard
                            title="Fireball Pass"
                            value={data.totalFireballPassed}
                            total={data.totalDraws}
                            percentage={data.fireballPercentage}
                            color="#ff9800"
                            icon={LocalFireDepartment}
                        />
                    </Grid>
                </Grid>

                {/* Detailed Fireball Statistics */}
                <SectionHeader
                    title="Fireball Substitution Details"
                    subtitle="Deep dive into fireball performance"
                    icon={Insights}
                />

                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <SimpleStatCard
                            title="Total Substitutions Passed"
                            value={data.totalFireballSubstitutionsPassed}
                            color="#4caf50"
                            icon={BarChart}
                            subText={`Out of ${data.totalFireballSubstitutionsChecked || 0} checked`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <SimpleStatCard
                            title="Substitution Pass Rate"
                            value={`${data.fireballSubstitutionPassRate?.toFixed(1)}%`}
                            color="#ff5722"
                            icon={TrendingUp}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <SimpleStatCard
                            title="Average per Draw"
                            value={data.averageFireballPassesPerDraw?.toFixed(1)}
                            color="#2196f3"
                            icon={Pattern}
                            subText="Successful substitutions"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <SimpleStatCard
                            title="Draws with Any Pass"
                            value={data.drawsWithAtLeastOneFireballPass || data.totalFireballPassed}
                            color="#9c27b0"
                            icon={AutoAwesome}
                            subText={`${(((data.drawsWithAtLeastOneFireballPass || data.totalFireballPassed) / data.totalDraws * 100) || 0).toFixed(1)}%`}
                        />
                    </Grid>
                </Grid>

                {/* Pattern Distribution */}
                <SectionHeader
                    title="Pattern Distribution"
                    subtitle="BBA and BAA patterns breakdown"
                    icon={Pattern}
                />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <SimpleStatCard
                                    title="Regular BBA"
                                    value={data.countBBA}
                                    color="#90caf9"
                                    subText="From regular draws"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <SimpleStatCard
                                    title="Regular BAA"
                                    value={data.countBAA}
                                    color="#a5d6a7"
                                    subText="From regular draws"
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <SimpleStatCard
                                    title="Fireball BBA"
                                    value={data.fireballBBACount}
                                    color="#ffcc80"
                                    subText="From fireball substitutions"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <SimpleStatCard
                                    title="Fireball BAA"
                                    value={data.fireballBAACount}
                                    color="#80cbc4"
                                    subText="From fireball substitutions"
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Summary Box */}
                <Box
                    sx={{
                        mt: 4,
                        p: 3,
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: 2,
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                >
                    <Typography variant="h6" sx={{ color: '#ffc300', mb: 2, fontWeight: 600 }}>
                        Summary
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                <strong>Total Passed:</strong> {data.totalPassed + (data.totalFireballPassed || 0)}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                <strong>All BBA:</strong> {(data.countBBA || 0) + (data.fireballBBACount || 0)}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                <strong>All BAA:</strong> {(data.countBAA || 0) + (data.fireballBAACount || 0)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </StyledCard>
    );
};

const StatsDisplay = ({ display }) => {
    const [value, setValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    const handleDisplay = async () => {
        setLoading(true);
        try {
            await setDisplayInfo();
        } catch (error) {
            console.error('Failed to update stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const currentMonthData = display?.currentMonthStats;
    const previousMonthData = display?.previousMonthStats;
    const currentMonthTitle = currentMonthData?.monthYear || "Current Month";
    const previousMonthTitle = previousMonthData?.monthYear || "Previous Month";

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
            <Box sx={{ width: '100%' }}>
                <Box sx={{
                    borderBottom: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '16px 16px 0 0',
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #ffc300, #ff8f00, #ffc300)',
                        }}
                    />
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        variant="fullWidth"
                        textColor="inherit"
                        sx={{
                            '& .MuiTab-root': {
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                padding: theme.spacing(2, 4),
                                transition: 'all 0.3s ease',
                                '&.Mui-selected': {
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    background: 'rgba(255, 255, 255, 0.05)',
                                },
                                '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.03)',
                                },
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#ffc300',
                                height: '3px',
                                borderRadius: '3px 3px 0 0',
                            },
                        }}
                    >
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BarChart sx={{ fontSize: 20 }} />
                                    {currentMonthTitle}
                                </Box>
                            }
                        />
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Insights sx={{ fontSize: 20 }} />
                                    {previousMonthTitle}
                                </Box>
                            }
                        />
                    </Tabs>
                </Box>

                <Fade in={true} timeout={500}>
                    <Box>
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
                </Fade>

                <Box sx={{ textAlign: 'center', mt: 6 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleDisplay}
                        disabled={loading}
                        startIcon={loading ? <CachedRounded className="rotating-icon" /> : <Analytics />}
                        sx={{
                            minWidth: '250px',
                            height: '52px',
                            background: 'linear-gradient(45deg, #ffc300 30%, #ff8f00 90%)',
                            color: 'black',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            borderRadius: '26px',
                            boxShadow: '0 4px 20px rgba(255, 195, 0, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #ff8f00 30%, #ffc300 90%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 32px rgba(255, 195, 0, 0.4)',
                            },
                            '&:disabled': {
                                background: 'rgba(255, 195, 0, 0.3)',
                                color: 'rgba(0, 0, 0, 0.5)',
                            },
                            '& .rotating-icon': {
                                animation: 'rotate 1s linear infinite',
                            },
                        }}
                    >
                        {loading ? 'Updating...' : 'Update Stats'}
                    </Button>
                </Box>
            </Box>

            <style jsx>{`
                @keyframes rotate {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </Container>
    );
};

export default StatsDisplay;