// app/api/export-draws/route.js - Export all draws to CSV format
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Convert month name to number
 */
const getMonthNumber = (monthName) => {
    const months = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    return months[monthName] || '01';
};

/**
 * Format date from draw data to YYYY-MM-DD
 */
const formatDate = (draw) => {
    try {
        // If we have a complete drawDate like "Mar 8, 2025"
        if (draw.drawDate && draw.drawDate.includes(',')) {
            const parts = draw.drawDate.split(' ');
            if (parts.length >= 3) {
                const month = parts[0]; // "Mar"
                const day = parts[1].replace(',', ''); // "8"
                const year = parts[2]; // "2025"
                
                const monthNum = getMonthNumber(month);
                const dayNum = day.padStart(2, '0');
                
                return `${year}/${monthNum}/${dayNum}`;
            }
        }
        
        // Fallback: use year and drawMonth if available
        if (draw.year && draw.drawMonth) {
            const monthNum = getMonthNumber(draw.drawMonth);
            // Default to 01 if no specific day
            return `${draw.year}/${monthNum}/01`;
        }
        
        // Last fallback
        return '2025/01/01';
    } catch (error) {
        console.warn('Error formatting date for draw:', draw.index || 'unknown', error);
        return '2025/01/01';
    }
};

export async function GET() {
    try {
        const firestore = adminDb.firestore();
        
        console.log('Fetching all draws for CSV export...');
        const snapshot = await firestore
            .collection('draws')
            .get();
        
        console.log(`Found ${snapshot.size} draws to export`);
        
        // Convert to array and filter valid draws
        const draws = [];
        snapshot.forEach(doc => {
            const draw = doc.data();
            
            // Only export draws with valid sorted numbers
            if (typeof draw.sortedFirstNumber === 'number' &&
                typeof draw.sortedSecondNumber === 'number' &&
                typeof draw.sortedThirdNumber === 'number' &&
                draw.sortedFirstNumber >= 0 && draw.sortedFirstNumber <= 9 &&
                draw.sortedSecondNumber >= 0 && draw.sortedSecondNumber <= 9 &&
                draw.sortedThirdNumber >= 0 && draw.sortedThirdNumber <= 9) {
                
                draws.push({ ...draw, docId: doc.id });
            }
        });
        
        console.log(`Filtered to ${draws.length} valid draws`);
        
        // Sort draws: year desc, month desc, index desc (2025 at top, 2024 at bottom)
        const monthOrder = {
            'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
            'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
        };
        
        draws.sort((a, b) => {
            // Compare year (desc: 2025 first, then 2024)
            const yearA = parseInt(a.year) || 2025;
            const yearB = parseInt(b.year) || 2025;
            if (yearA !== yearB) return yearB - yearA;
            
            // Compare month (desc: Dec first, then Nov, etc.)
            const monthA = monthOrder[a.drawMonth] || 1;
            const monthB = monthOrder[b.drawMonth] || 1;
            if (monthA !== monthB) return monthB - monthA;
            
            // Compare index (desc: higher index first)
            const indexA = parseInt(a.index) || 0;
            const indexB = parseInt(b.index) || 0;
            return indexB - indexA;
        });
        
        // Create CSV content
        let csvContent = 'draw_id,date,a,b,c\n'; // Header row
        
        draws.forEach(draw => {
            const drawId = draw.docId; // Use Firebase document ID for uniqueness
            const date = formatDate(draw);
            const a = draw.sortedFirstNumber;
            const b = draw.sortedSecondNumber;
            const c = draw.sortedThirdNumber;
            
            csvContent += `${drawId},${date},${a},${b},${c}\n`;
        });
        
        // Return CSV as downloadable file
        return new Response(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="lottery_draws.csv"',
                'Cache-Control': 'no-store, max-age=0'
            }
        });
        
    } catch (error) {
        console.error("Error exporting draws to CSV:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: "Failed to export draws",
                details: error.message
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}