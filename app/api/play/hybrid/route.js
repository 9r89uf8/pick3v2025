// app/api/posts/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '@/app/utils/firebaseAdmin';   // still here in case you later save draws

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/* -------------------------------------------------- */
/* helper: make one BUU draw with no repeated digits  */
/* -------------------------------------------------- */
function makeSingleBUUDraw() {
    // choose 1 bottom digit (0‑4)
    const b = Math.floor(Math.random() * 5);          // 0‑4

    // choose 2 distinct upper digits (5‑9)
    let u1 = 5 + Math.floor(Math.random() * 5);       // 5‑9
    let u2;
    do {
        u2 = 5 + Math.floor(Math.random() * 5);
    } while (u2 === u1);                              // ensure u1 ≠ u2

    // sort ascending so the draw is always “least → greatest”
    return [b, u1, u2].sort((x, y) => x - y);         // guaranteed BUU
}

/* -------------------------------------------------- */
/* POST handler                                       */
/* -------------------------------------------------- */
export async function POST(request) {
    try {


        const draws = [];
        const seen = new Set();                          // for uniqueness

        while (draws.length < 50) {
            const draw = makeSingleBUUDraw();
            const key = draw.join(',');                    // e.g. "2,6,9"

            if (!seen.has(key)) {
                seen.add(key);
                draws.push(draw);                            // store as [b,u1,u2]
            }
        }

        console.log(draws);

        return new Response(JSON.stringify({ draws }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (err) {
        console.error(err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

