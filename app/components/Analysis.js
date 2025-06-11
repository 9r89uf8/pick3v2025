import React, { useState } from 'react'; // Removed useEffect as it's no longer needed for the initial animation
import {
    createTheme,
    ThemeProvider,
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Avatar,
    Fade,
    CssBaseline,
    LinearProgress,
    Button,     // Added Button
    Collapse,   // Added Collapse
} from '@mui/material';
import { amber, blue, green, grey, purple, red } from '@mui/material/colors';
import InsightsIcon from '@mui/icons-material/Insights';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BarChartIcon from '@mui/icons-material/BarChart';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Define a professional and vibrant theme
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: blue,
        secondary: green,
        background: {
            default: '#f4f7f9',
            paper: '#ffffff',
        },
        text: {
            primary: '#2A3A4A',
            secondary: '#677583',
        },
        statColors: {
            total: blue[500],
            unique: purple[500],
            passing: green[500],
            expected: amber[800],
        },
        pattern: {
            BBA: blue[500],
            BAA: green[500],
            BBB: red[500],
            AAA: amber[800],
        },
    },
    typography: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        h1: {
            fontSize: '3rem',
            fontWeight: 700,
            letterSpacing: '-1.5px',
        },
        h2: {
            fontSize: '2.2rem',
            fontWeight: 700,
        },
        h3: {
            fontSize: '1.5rem',
            fontWeight: 600,
        },
        h4: {
            fontSize: '1.25rem',
            fontWeight: 600,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 25px rgba(0,0,0,0.1)`,
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                },
            },
        },
    },
});

// Helper function to determine number category and styling
const getNumberStyle = (num) => {
    const isB = num <= 4;
    return {
        category: isB ? 'B' : 'A',
        background: isB ? theme.palette.pattern.BBA : theme.palette.pattern.BBB,
    };
};

// --- Sub-components ---

const NumberDisplay = ({ num, size = 56 }) => {
    const styleInfo = getNumberStyle(num);
    return (
        <Avatar
            sx={{
                width: size,
                height: size,
                bgcolor: styleInfo.background,
                fontSize: size * 0.45,
                fontWeight: 'bold',
                boxShadow: 3,
            }}
        >
            {num}
        </Avatar>
    );
};

const StatCard = ({ icon, label, value, subtitle, color }) => (
    <Card sx={{ borderTop: `4px solid ${color}`, height: '100%' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                {icon}
                <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 1, textTransform: 'uppercase' }}>
                    {label}
                </Typography>
            </Box>
            <Typography variant="h2" component="div" sx={{ color, fontWeight: 700, mb: 1 }}>
                {value}
            </Typography>
            {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
                    {subtitle}
                </Typography>
            )}
        </CardContent>
    </Card>
);

const PatternBar = ({ pattern, value, label }) => (
    <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" fontWeight="medium">{pattern}</Typography>
            <Typography variant="body2" fontWeight="bold" color={theme.palette.pattern[pattern]}>{value}%</Typography>
        </Box>
        <LinearProgress
            variant="determinate"
            value={value}
            sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: grey[200],
                '& .MuiLinearProgress-bar': {
                    backgroundColor: theme.palette.pattern[pattern],
                },
            }}
        />
    </Box>
);

const InsightCard = ({ icon, title, children, borderColor }) => (
    <Card sx={{ borderTop: `4px solid ${borderColor}` }}>
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {icon}
                <Typography variant="h4" component="h3" sx={{ ml: 1.5, color: borderColor }}>
                    {title}
                </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
                {children}
            </Typography>
        </CardContent>
    </Card>
);

// --- Main Analysis Component ---

const Analysis = () => {
    // State to control the visibility of the collapsible data section
    const [isOpen, setIsOpen] = useState(false);

    // Function to toggle the visibility state
    const handleToggleVisibility = () => {
        setIsOpen((prev) => !prev);
    };

    return (
            <Container maxWidth="lg" sx={{ py: 3 }}>

                {/* --- Toggle Button --- */}
                <Box sx={{ textAlign: 'center', mb: 1 }}>
                    <Button
                        variant="contained"
                        onClick={handleToggleVisibility}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            textTransform: 'none',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            '&:hover': {
                                boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                            },
                        }}
                    >
                        {isOpen ? 'Hide' : 'Show'} COMBO Analysis
                    </Button>
                </Box>

                {/* --- Collapsible Data Section --- */}
                <Collapse in={isOpen}>
                    <Fade in={isOpen} timeout={800}>
                        <Paper elevation={4} sx={{ p: { xs: 2, sm: 4, md: 6 } }}>
                            {/* --- Header --- */}
                            <Box sx={{ textAlign: 'center', mb: 6 }}>
                                <Typography variant="h1" component="h1" sx={{
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                    Illinois Lottery COMBO Analysis
                                </Typography>
                                <Typography variant="h5" color="text.secondary" sx={{ mt: 1 }}>
                                    Unlocking Winning Patterns
                                </Typography>
                            </Box>

                            {/* --- How It Works --- */}
                            <Box sx={{ mb: 6 }}>
                                <Card sx={{ p: 4, bgcolor: 'rgba(0, 123, 255, 0.05)', border: `1px solid ${blue[100]}` }}>
                                    <Typography variant="h3" component="h2" sx={{ mb: 3, textAlign: 'center' }}>
                                        How COMBO Works
                                    </Typography>
                                    <Grid container spacing={2} alignItems="center" justifyContent="center">
                                        <Grid item xs={12} md="auto" sx={{ textAlign: 'center' }}>
                                            <Typography fontWeight="medium" sx={{ mb: 1 }}>Original Draw</Typography>
                                            <Box display="flex" justifyContent="center" gap={1.5}>
                                                <NumberDisplay num={8} /> <NumberDisplay num={1} /> <NumberDisplay num={4} />
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md="auto" sx={{ textAlign: 'center', my: { xs: 2, md: 0 } }}>
                                            <Typography variant="h3" color="primary.light">→</Typography>
                                        </Grid>
                                        <Grid item xs={12} md="auto" sx={{ textAlign: 'center' }}>
                                            <Typography fontWeight="medium" sx={{ mb: 1 }}>Sorted for COMBO</Typography>
                                            <Box display="flex" justifyContent="center" gap={1}>
                                                <NumberDisplay num={1} size={48} /> <NumberDisplay num={4} size={48} /> <NumberDisplay num={8} size={48} />
                                            </Box>
                                            <Box sx={{ mt: 2, display: 'inline-block', bgcolor: 'primary.main', color: 'white', px: 3, py: 1, borderRadius: '20px', fontWeight: 'bold' }}>
                                                Pattern: BBA
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Card>
                            </Box>

                            {/* --- Stats Grid --- */}
                            <Grid container spacing={3} sx={{ mb: 6 }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard icon={<BarChartIcon color="action"/>} label="Total Draws Analyzed" value="1,051" color={theme.palette.statColors.total} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard icon={<HelpOutlineIcon color="action"/>} label="Unique Number Draws" value="749" subtitle="71.3% of all draws" color={theme.palette.statColors.unique} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard icon={<CheckCircleOutlineIcon color="action"/>} label="Passing COMBO Plays" value="41.8%" subtitle="439 out of 1,051" color={theme.palette.statColors.passing} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard icon={<InsightsIcon color="action"/>} label="Expected Pass Rate" value="9.7%" subtitle="If truly random" color={theme.palette.statColors.expected} />
                                </Grid>
                            </Grid>

                            {/* --- Pattern Distribution --- */}
                            <Box sx={{ mb: 6 }}>
                                <Typography variant="h3" component="h2" sx={{ textAlign: 'center', mb: 4 }}>
                                    Pattern Distribution Comparison
                                </Typography>
                                <Grid container spacing={4} justifyContent="center">
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ p: 3, borderColor: 'rgba(255, 0, 0, 0.2)' }}>
                                            <Typography variant="h4" sx={{ textAlign: 'center', color: red[700], mb: 3 }}>Expected (Random)</Typography>
                                            <Box display="flex" flexDirection="column" gap={2}>
                                                <PatternBar pattern="BBB" value={3.1} />
                                                <PatternBar pattern="BBA" value={20.8} />
                                                <PatternBar pattern="BAA" value={20.8} />
                                                <PatternBar pattern="AAA" value={3.1} />
                                            </Box>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Card variant="outlined" sx={{ p: 3, borderColor: 'rgba(0, 200, 83, 0.3)' }}>
                                            <Typography variant="h4" sx={{ textAlign: 'center', color: green[800], mb: 3 }}>Observed (Illinois)</Typography>
                                            <Box display="flex" flexDirection="column" gap={2}>
                                                <PatternBar pattern="BBB" value={8.8} />
                                                <PatternBar pattern="BBA" value={41.4} />
                                                <PatternBar pattern="BAA" value={41.7} />
                                                <PatternBar pattern="AAA" value={8.1} />
                                            </Box>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* --- Key Discovery --- */}
                            <Box sx={{ mb: 6, p: 3, bgcolor: blue[50], borderRadius: 4, border: `2px solid ${blue[200]}` }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                    <InsightsIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                                    <Typography variant="h4" sx={{ color: 'primary.dark', ml: 1.5 }}>
                                        Key Discovery
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
                                    Illinois lottery draws produce <strong>BBA and BAA patterns 2x more often</strong> than random chance would predict. When combined with your difference rules (≤2), this gives COMBO players a <strong style={{color: theme.palette.secondary.dark}}>4.3x advantage</strong> over random selection!
                                </Typography>
                            </Box>

                            {/* --- Strategic Insights --- */}
                            <Box sx={{ mb: 6 }}>
                                <Typography variant="h3" component="h2" sx={{ textAlign: 'center', mb: 4 }}>
                                    What This Means for COMBO Players
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <InsightCard icon={<CheckCircleOutlineIcon fontSize="large" />} title="Your Rules Work!" borderColor={theme.palette.statColors.total}>
                                            By playing COMBO with BBA or BAA patterns where adjacent numbers differ by ≤2, you're targeting <strong>41.8%</strong> of all draws instead of just <strong>9.7%</strong>.
                                        </InsightCard>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <InsightCard icon={<BarChartIcon fontSize="large" />} title="Pattern Bias" borderColor={theme.palette.statColors.passing}>
                                            The lottery's number selection mechanism appears to favor "mixed" patterns (BBA/BAA) over "pure" patterns (BBB/AAA).
                                        </InsightCard>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <InsightCard icon={<InsightsIcon fontSize="large" />} title="Strategic Advantage" borderColor={theme.palette.statColors.expected}>
                                            Focus on the 70 valid combinations (35 BBA + 35 BAA) for the best odds when playing COMBO.
                                        </InsightCard>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* --- Bottom Line --- */}
                            <Box sx={{
                                textAlign: 'center',
                                p: 4,
                                borderRadius: 4,
                                color: 'white',
                                background: `linear-gradient(135deg, ${green[600]} 0%, ${green[800]} 100%)`,
                            }}>
                                <Typography variant="h3" component="h3" sx={{ mb: 2 }}>The Bottom Line</Typography>
                                <Typography variant="h6" component="p" sx={{ fontWeight: 'normal' }}>
                                    Your analysis perfectly captures the COMBO play advantage. The Illinois lottery's apparent bias
                                    makes your strategy <strong style={{ color: amber[300] }}>4.3 times more effective</strong> than random number selection!
                                </Typography>
                            </Box>

                        </Paper>
                    </Fade>
                </Collapse>
            </Container>
    );
};

export default Analysis;