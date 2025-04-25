// app/api/posts/route.js
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/utils/firebaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                    */
/* ------------------------------------------------------------------ */

// 6 index-based names so you can exclude whole patterns if you want
const PERMUTATION_PATTERNS = {
    LMH: 0, // (L, M, H)
    LHM: 1, // (L, H, M)
    MLH: 2, // (M, L, H)
    MHL: 3, // (M, H, L)
    HLM: 4, // (H, L, M)
    HML: 5  // (H, M, L)
};

const hasRepeatingNumbers = (arr) => new Set(arr).size !== arr.length;

/**
 * Build *all* 6 permutations for the three numbers,
 * but allow caller to omit patterns by mnemonic ("LMH", "HML", …)
 */
function allPermutations([a, b, c], exclude = []) {
    const sorted = [a, b, c].slice().sort((x, y) => x - y); // L, M, H
    const [L, M, H] = sorted;

    const perms = [
        [L, M, H], // LMH
        [L, H, M], // LHM
        [M, L, H], // MLH
        [M, H, L], // MHL
        [H, L, M], // HLM
        [H, M, L]  // HML
    ];

    return perms.filter((_, i) => {
        const name = Object.keys(PERMUTATION_PATTERNS).find(
            (k) => PERMUTATION_PATTERNS[k] === i
        );
        return !exclude.includes(name);
    });
}

/**
 * Return a single *base* triple of distinct digits that doesn’t violate
 * any per-column exclusions.
 */
function randomBaseTriple(excludedDigits) {
    const pick = (already) => {
        let n;
        do n = Math.floor(Math.random() * 10);
        while (already.has(n));
        return n;
    };

    const firstBlocked  = new Set(excludedDigits.first);
    const secondBlocked = new Set(excludedDigits.second);
    const thirdBlocked  = new Set(excludedDigits.third);

    let attempts = 0;
    while (++attempts < 1_000) {
        const n1 = pick(firstBlocked);
        const n2 = pick(secondBlocked);
        const n3 = pick(thirdBlocked);

        if (!hasRepeatingNumbers([n1, n2, n3])) return [n1, n2, n3];
    }
    throw new Error('Could not find a valid base triple');
}

/**
 * Main: build `numDraws` triples so that
 *  • each draw respects excluded digits,
 *  • *across* all draws, every column digit is unique.
 */
function generateUniqueDraws({
                                 numDraws,
                                 excludedNumbers = { first: [], second: [], third: [] }
                             }) {
    const used = [
        new Set(excludedNumbers.first),
        new Set(excludedNumbers.second),
        new Set(excludedNumbers.third)
    ];

    const draws = [];
    let attempts = 0;

    while (draws.length < numDraws && attempts++ < 10_000) {
        // Generate a new random triple for each draw
        const triple = randomBaseTriple(excludedNumbers);

        // Check if every digit is unused in its column position
        const fits = triple.every((digit, idx) => !used[idx].has(digit));
        if (!fits) continue;

        // Accept draw
        draws.push(triple);
        triple.forEach((digit, idx) => used[idx].add(digit));
    }

    return draws;
}

/* ------------------------------------------------------------------ */
/*  API route                                                         */
/* ------------------------------------------------------------------ */

export async function POST(req) {
    try {
        const {
            numDraws = 6,
            excludePermutations = [],
            excludedNumbers = { first: [], second: [], third: [] }
        } = await req.json();

        const draws = generateUniqueDraws({
            numDraws,
            excludePermutations,
            excludedNumbers
        });

        console.log(draws)
        return NextResponse.json(draws, {
            status: 200,
            headers: { 'Cache-Control': 'no-store, max-age=0' }
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 });
    }
}
