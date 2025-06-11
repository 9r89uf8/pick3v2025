import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Card,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    GlobalStyles,
    CssBaseline,
    ThemeProvider,
    createTheme,
    keyframes,
    Button,
    Collapse
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import CasinoIcon from '@mui/icons-material/Casino';

// Define the pulse animation using MUI's keyframes utility
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  50% {
    transform: scale(1.08);
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  }
`;

// Define a custom theme to set the default font
const theme = createTheme({
    typography: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
});

// Helper component for the circular number display
const NumberDisplay = ({ children, color, pulsing = false }) => (
    <Box
        sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            height: 60,
            borderRadius: '50%',
            fontSize: 24,
            fontWeight: 'bold',
            margin: '0 5px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
            background: color,
            animation: pulsing ? `${pulse} 2s infinite` : 'none',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            },
        }}
    >
        {children}
    </Box>
);

// Main Component
function FireballAnalysis() {
    const [isVisible, setIsVisible] = useState(false);

    const handleToggleVisibility = () => {
        setIsVisible(prev => !prev);
    };

    return (
            <Container maxWidth="lg" sx={{ my: 2 }}>
                {/* Toggle Button */}
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
                        {isVisible ? 'Hide' : 'Show'} COMBO + Fireball Analysis
                    </Button>
                </Box>

                {/* Collapsible Content */}
                <Collapse in={isVisible}>
                    <Paper
                        elevation={12}
                        sx={{
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        }}
                    >
                        {/* Header */}
                        <Box
                            sx={{
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                color: 'white',
                                padding: { xs: 3, md: 5 },
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                                🔥 Illinois Pick 3 Fireball Advantage
                            </Typography>
                            <Typography variant="h6" component="p" sx={{ opacity: 0.95 }}>
                                How Fireball Supercharges Your Pattern Strategy
                            </Typography>
                        </Box>

                        {/* Content */}
                        <Box sx={{ p: { xs: 2, md: 5 } }}>

                            {/* Fireball Demo Section */}
                            <Paper
                                elevation={0}
                                sx={{
                                    background: '#f8f9fa',
                                    borderRadius: '16px',
                                    p: 4,
                                    mb: 5,
                                    border: '2px solid #e9ecef',
                                }}
                            >
                                <Typography variant="h4" component="h2" align="center" sx={{ color: '#495057', mb: 3, fontWeight: '600' }}>
                                    How Fireball Works
                                </Typography>
                                <Grid container alignItems="center" justifyContent="center" spacing={2} sx={{ textAlign: 'center' }}>
                                    <Grid item>
                                        <Typography sx={{ mb: 1 }}>Your COMBO Numbers:</Typography>
                                        <NumberDisplay color="#3498db">1</NumberDisplay>
                                        <NumberDisplay color="#3498db">4</NumberDisplay>
                                        <NumberDisplay color="#3498db">8</NumberDisplay>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="h4" sx={{ color: '#7f8c8d', mx: 2 }}>+</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography sx={{ mb: 1 }}>Fireball Drawn:</Typography>
                                        <NumberDisplay color="#e74c3c" pulsing>5</NumberDisplay>
                                    </Grid>
                                </Grid>

                                <Typography variant="h5" align="center" sx={{ mt: 5, mb: 3, color: '#495057' }}>
                                    Creates 3 Additional Ways to Win:
                                </Typography>

                                <Grid container spacing={2} justifyContent="center">
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
                                            <Typography variant="h6" sx={{ color: '#9b59b6', mb: 1 }}>Replace 1st Position</Typography>
                                            <Box>
                                                <NumberDisplay color="#9b59b6">5</NumberDisplay>
                                                <NumberDisplay color="#3498db">4</NumberDisplay>
                                                <NumberDisplay color="#3498db">8</NumberDisplay>
                                            </Box>
                                            <Typography sx={{ mt: 1, color: '#666' }}>New combo: 4-5-8</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
                                            <Typography variant="h6" sx={{ color: '#9b59b6', mb: 1 }}>Replace 2nd Position</Typography>
                                            <Box>
                                                <NumberDisplay color="#3498db">1</NumberDisplay>
                                                <NumberDisplay color="#9b59b6">5</NumberDisplay>
                                                <NumberDisplay color="#3498db">8</NumberDisplay>
                                            </Box>
                                            <Typography sx={{ mt: 1, color: '#666' }}>New combo: 1-5-8</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
                                            <Typography variant="h6" sx={{ color: '#9b59b6', mb: 1 }}>Replace 3rd Position</Typography>
                                            <Box>
                                                <NumberDisplay color="#3498db">1</NumberDisplay>
                                                <NumberDisplay color="#3498db">4</NumberDisplay>
                                                <NumberDisplay color="#9b59b6">5</NumberDisplay>
                                            </Box>
                                            <Typography sx={{ mt: 1, color: '#666' }}>New combo: 1-4-5</Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Results Grid */}
                            <Grid container spacing={4} sx={{ my: 5 }}>
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ p: 4, textAlign: 'center', borderRadius: '16px', border: '2px solid #3498db', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' } }}>
                                        <Typography variant="h5" sx={{ color: '#3498db', mb: 1, fontWeight: '600' }}>Without Fireball</Typography>
                                        <Typography sx={{ fontSize: '4em', fontWeight: 'bold', my: 2, background: 'linear-gradient(45deg, #3498db, #2980b9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>41.8%</Typography>
                                        <Typography variant="h6" sx={{ color: '#666' }}>439 out of 1,051 draws</Typography>
                                        <Box sx={{ position: 'relative', height: '40px', background: '#ecf0f1', borderRadius: '20px', overflow: 'hidden', my: 2 }}>
                                            <Box sx={{ position: 'absolute', height: '100%', width: '41.8%', background: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 2, color: 'white', fontWeight: 'bold' }}>41.8%</Box>
                                        </Box>
                                        <Typography sx={{ mt: 2 }}>Playing COMBO with your pattern strategy</Typography>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ p: 4, textAlign: 'center', borderRadius: '16px', border: '2px solid #e74c3c', background: 'linear-gradient(135deg, #fff 0%, #fee 100%)', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' } }}>
                                        <Typography variant="h5" sx={{ color: '#e74c3c', mb: 1, fontWeight: '600' }}>With Fireball 🔥</Typography>
                                        <Typography sx={{ fontSize: '4em', fontWeight: 'bold', my: 2, background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>70.0%</Typography>
                                        <Typography variant="h6" sx={{ color: '#666' }}>736 out of 1,051 draws</Typography>
                                        <Box sx={{ position: 'relative', height: '40px', background: '#ecf0f1', borderRadius: '20px', overflow: 'hidden', my: 2 }}>
                                            <Box sx={{ position: 'absolute', height: '100%', width: '70%', background: 'linear-gradient(90deg, #e74c3c, #f39c12)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 2, color: 'white', fontWeight: 'bold' }}>70.0%</Box>
                                        </Box>
                                        <Typography sx={{ mt: 2 }}>COMBO + Fireball with pattern strategy</Typography>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Improvement Box */}
                            <Box sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', borderRadius: '16px', p: 4, my: 4, textAlign: 'center' }}>
                                <Typography variant="h4" component="h2" sx={{ mb: 2, color: '#495057' }}>Improvement Factor</Typography>
                                <Typography sx={{ fontSize: '5em', fontWeight: 'bold', color: '#e74c3c', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>1.68×</Typography>
                                <Typography variant="h5" sx={{ color: '#666' }}>Your chances increase by 68% when adding Fireball!</Typography>
                                <Typography variant="h6" sx={{ mt: 1.5, opacity: 0.9 }}>That's an additional <strong>28.3 percentage points</strong> of winning draws</Typography>
                            </Box>

                            {/* Strategy Comparison Table */}
                            <Paper elevation={0} sx={{ background: '#f8f9fa', borderRadius: '16px', p: { xs: 2, md: 4 }, my: 4 }}>
                                <Typography variant="h4" component="h2" align="center" sx={{ mb: 2 }}>Complete Strategy Comparison</Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead sx={{ background: '#e9ecef' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: '600', color: '#495057' }}>Strategy</TableCell>
                                                <TableCell sx={{ fontWeight: '600', color: '#495057' }}>Win Rate</TableCell>
                                                <TableCell sx={{ fontWeight: '600', color: '#495057' }}>vs Random</TableCell>
                                                <TableCell sx={{ fontWeight: '600', color: '#495057' }}>Cost Multiple</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow hover>
                                                <TableCell>Random COMBO Selection</TableCell>
                                                <TableCell>9.7%</TableCell>
                                                <TableCell>1.0×</TableCell>
                                                <TableCell>1×</TableCell>
                                            </TableRow>
                                            <TableRow hover>
                                                <TableCell>Your Pattern Strategy (COMBO)</TableCell>
                                                <TableCell>41.8%</TableCell>
                                                <TableCell>4.3×</TableCell>
                                                <TableCell>1×</TableCell>
                                            </TableRow>
                                            <TableRow hover sx={{ background: '#d4edda !important', fontWeight: 'bold' }}>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Pattern Strategy + Fireball</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>70.0%</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>7.2×</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>~2×</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>

                            {/* Why Fireball Works Section */}
                            <Box sx={{ background: '#d4edda', border: '2px solid #c3e6cb', borderRadius: '16px', p: 4, mt: 4 }}>
                                <Typography variant="h4" component="h2" align="center" sx={{ color: '#155724', mb: 3 }}>🎯 Why Fireball Works So Well With Your Strategy</Typography>
                                <Grid container spacing={3} sx={{ mt: 2, textAlign: 'center' }}>
                                    <Grid item xs={12} md={4}>
                                        <EmojiEventsIcon sx={{ fontSize: '3em', color: '#155724' }} />
                                        <Typography variant="h6" sx={{ color: '#155724', fontWeight: 'bold' }}>Fixes Near-Misses</Typography>
                                        <Typography>Turns patterns with diff=3 into valid diff=2</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <AllInclusiveIcon sx={{ fontSize: '3em', color: '#155724' }} />
                                        <Typography variant="h6" sx={{ color: '#155724', fontWeight: 'bold' }}>Pattern Conversion</Typography>
                                        <Typography>Changes BBB→BBA or AAA→BAA</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <CasinoIcon sx={{ fontSize: '3em', color: '#155724' }} />
                                        <Typography variant="h6" sx={{ color: '#155724', fontWeight: 'bold' }}>Triple Coverage</Typography>
                                        <Typography>3 substitutions × 6 orders = 18 extra chances</Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Bottom Line */}
                            <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '16px', p: 5, mt: 4, textAlign: 'center' }}>
                                <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>The Bottom Line</Typography>
                                <Typography variant="h6" component="p" sx={{ lineHeight: 1.8 }}>
                                    Playing <strong>COMBO + Fireball</strong> with your BBA/BAA pattern strategy gives you a
                                    <Typography component="span" sx={{ display: 'block', my:1, fontSize: '1.7em', fontWeight: 'bold', color: '#FFD700' }}>70% win rate</Typography> —
                                    that's winning <strong>7 out of every 10 draws!</strong>
                                </Typography>
                                <Typography sx={{ mt: 2, fontSize: '1.1em', opacity: 0.9 }}>
                                    This is 7.2× better than random selection and costs only 2× more.
                                </Typography>
                            </Box>

                        </Box>
                    </Paper>
                </Collapse>
            </Container>
    );
}

export default FireballAnalysis;