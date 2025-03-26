'use client';
import React, { useEffect, useState } from 'react';
import { fetchPosts } from "@/app/services/postService";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Typography, Box } from '@mui/material';
import { useStore } from '@/app/store/store';

const First = () => {
    const posts = useStore((state) => state.posts);
    const [chartData, setChartData] = useState([]);

    // Function to compute the median of sortedFirstNumber values
    const getMedian = (posts) => {
        if (!posts || posts.length === 0) return 0;
        // Extract the sortedFirstNumber values
        const numbers = posts.map(post => post.sortedFirstNumber);
        // Sort the numbers in ascending order
        const sortedNumbers = [...numbers].sort((a, b) => a - b);
        const mid = Math.floor(sortedNumbers.length / 2);
        // If odd length, return the middle element; if even, average the two middle elements
        return sortedNumbers.length % 2 !== 0
            ? sortedNumbers[mid]
            : (sortedNumbers[mid - 1] + sortedNumbers[mid]) / 2;
    };

    useEffect(() => {
        const getPosts = async () => {
            await fetchPosts();
        };
        getPosts();
    }, []);

    useEffect(() => {
        if (posts && posts.length > 0) {
            // Reverse the posts array so that the lowest index is first
            const sortedPosts = [...posts].reverse();
            // Transform posts data for the chart
            const formattedData = sortedPosts.map((post, index) => ({
                index: index,
                firstNumber: post.sortedFirstNumber,
                secondNumber: post.sortedSecondNumber,
                thirdNumber: post.sortedThirdNumber,
            }));
            setChartData(formattedData);
            console.log(formattedData);
        }
    }, [posts]);

    // Compute the median when posts are available
    const median = posts && posts.length > 0 ? getMedian(posts) : null;

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ width: '100%', px: 2 }}>
                <Typography variant="h5" gutterBottom>
                    First Number Trend
                </Typography>

                {/* Display the median number */}
                {median !== null && (
                    <Typography variant="h6" gutterBottom>
                        Median: {median}
                    </Typography>
                )}

                {chartData.length > 0 ? (
                    <Box sx={{ py: 2, overflowX: 'auto' }}>
                        <Box sx={{ width: '1500px', height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <XAxis
                                        dataKey="index"
                                        // Generate ticks for each post index, increasing by 1
                                        ticks={chartData.map(item => item.index)}
                                        label={{
                                            value: 'Post Index',
                                            position: 'insideBottom',
                                            offset: -5
                                        }}
                                    />
                                    <YAxis
                                        domain={[0, 9]}
                                        // Set Y-axis ticks from 0 to 9, increasing by 1
                                        ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
                                        label={{
                                            value: 'First Number',
                                            angle: -90,
                                            position: 'insideLeft'
                                        }}
                                    />
                                    <Tooltip
                                        formatter={(value, name) => [`Value: ${value}`, 'First Number']}
                                        labelFormatter={(value) => `Post #${value}`}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="firstNumber"
                                        stroke="#8884d8"
                                        activeDot={{ r: 8 }}
                                        name="First Number"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Loading data or no posts available...
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default First;

