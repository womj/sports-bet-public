"use client"

import React from 'react';
import { XYPlot, LineSeries, XAxis, YAxis, VerticalGridLines, HorizontalGridLines } from 'react-vis';

const Graph = ({ historical }) => {
    const maxY = 4
    const tickValuesY = [0, 0.5, 1]
    for (let i = 1.5; i <= maxY; i += 0.5) {
        tickValuesY.push(i)
    }
    // Example data
    const data = historical.simGames.map((g, idx) => {
        return {
            x: idx,
            y: g.balanceAfter
        }
    })

    const tickStyle = {
        fontSize: '12px', // Adjust the font size as needed
        fill: 'white',    // Set the tick value color to white
    };

    return (
        <XYPlot width={1300} height={400} style={{ color: "white" }} yDomain={[0, maxY]} xDomain={[0, data.length - 1]} >
            <VerticalGridLines style={{
                color: "white",  // Set tick stroke color to white       // Apply tick value style
            }} />
            <HorizontalGridLines />
            <XAxis  // Set the total number of ticks on the Y-axis
                style={{
                    ticks: { stroke: 'white' },  // Set tick stroke color to white
                    text: tickStyle,            // Apply tick value style
                }} />
            <YAxis
                tickTotal={tickValuesY.length}  // Set the total number of ticks on the Y-axis
                tickValues={tickValuesY}
                style={{
                    ticks: { stroke: 'white' },  // Set tick stroke color to white
                    text: tickStyle,            // Apply tick value style
                }}

            />
            <LineSeries data={data} />
            <LineSeries data={[{ x: 0, y: 0 }, { x: data.length - 1, y: 0 }]} color="white" />
            <LineSeries data={[{ x: 0, y: 1 }, { x: data.length - 1, y: 1 }]} color="white" />
            <LineSeries data={[{ x: 0, y: 0 }, { x: 0, y: maxY }]} color="white" />
        </XYPlot >
    );
};

export default Graph;
