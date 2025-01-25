import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box
} from '@mui/material';

export default function ProbabilityTable() {
    // Pre-calculate or define probabilities
    // "Straight" (specific order: A-B-C)
    const straightPercentage = 216;  // ~ 36/1000
    const straightOneIn       = 4.6; // 1 / 0.036 = ~ 27.78

    // "Combo" (any order: one digit from each range)
    const comboPercentage = 36; // ~ 216/1000
    const comboOneIn      = 4.6; // 1 / 0.216 = ~ 4.63

    return (
        <Box sx={{ maxWidth: 500, margin: 'auto', mt: 4 }}>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Bet Type</strong></TableCell>
                            <TableCell><strong>combinations</strong></TableCell>
                            <TableCell><strong>Approx. “1 in N”</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Straight</TableCell>
                            <TableCell style={{fontSize: 20}}>{straightPercentage}</TableCell>
                            <TableCell style={{fontSize: 20}}>1 in {straightOneIn}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Combo</TableCell>
                            <TableCell style={{fontSize: 20}}>{comboPercentage}</TableCell>
                            <TableCell style={{fontSize: 20}}>1 in {comboOneIn}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
