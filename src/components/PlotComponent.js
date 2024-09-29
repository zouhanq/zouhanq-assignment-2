// src/components/PlotComponent.js

import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import KMeans from '../utils/kmeans';
import ControlPanel from './ControlPanel';

const PlotComponent = () => {
  const [k, setK] = useState(4); // Number of clusters
  const [data, setData] = useState([]);
  const [kmeans, setKMeans] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [step, setStep] = useState(0);
  const [initMethod, setInitMethod] = useState('Random'); // Default initialization method
  const [manualCentroids, setManualCentroids] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [dataMode, setDataMode] = useState('clustered'); // New state for data mode

  // Function to generate random data
  const generateData = () => {
    const generatedData = [];
    const numPoints = 300;
    if (dataMode === 'clustered') {
      const centers = [[0, 0], [2, 2], [-3, 2], [2, -4]];
      for (let i = 0; i < numPoints; i++) {
        const center = centers[Math.floor(Math.random() * centers.length)];
        generatedData.push([
          center[0] + Math.random() * 1.5,
          center[1] + Math.random() * 1.5,
        ]);
      }
    } else if (dataMode === 'uniform') {
      const xMin = -5;
      const xMax = 5;
      const yMin = -5;
      const yMax = 5;
      for (let i = 0; i < numPoints; i++) {
        const x = Math.random() * (xMax - xMin) + xMin;
        const y = Math.random() * (yMax - yMin) + yMin;
        generatedData.push([x, y]);
      }
    }
    setData(generatedData);
    setClusters([]);
    setStep(0);
    setManualCentroids([]);
    setIsRunning(false);
    setKMeans(null);
  };

  useEffect(() => {
    generateData(); // Generate data on component mount or when dataMode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataMode]); // Adding dataMode as a dependency

  // Function to start clustering
  const startClustering = () => {
    if (!k || k <= 0) {
      alert('Please enter a valid number of clusters (k).');
      return;
    }

    if (initMethod === 'Manual') {
      if (manualCentroids.length !== k) {
        alert(`Please select ${k} centroids on the plot.`);
        return;
      }
    }

    const newKMeans = new KMeans(
      data,
      k,
      initMethod,
      initMethod === 'Manual' ? manualCentroids : []
    );
    newKMeans.run();
    setKMeans(newKMeans);
    setClusters(newKMeans.snaps);
    setStep(0);
    setIsRunning(true);
  };

  // Function to step through the clustering process
  const nextStep = () => {
    if (step < clusters.length - 1) {
      setStep(step + 1);
    }
  };

  // Function to run to convergence
  const runToConvergence = () => {
    if (clusters.length > 0) {
      setStep(clusters.length - 1);
    }
  };

  // Function to reset the clustering
  const resetClustering = () => {
    setClusters([]);
    setStep(0);
    setKMeans(null);
    setManualCentroids([]);
    setIsRunning(false);
  };

  // Handle plot clicks for manual centroid selection
  const handlePlotClick = (event) => {
    if (initMethod === 'Manual' && manualCentroids.length < k && !isRunning) {
      const x = event.points[0].x;
      const y = event.points[0].y;
      setManualCentroids([...manualCentroids, [x, y]]);
    }
  };

  // Render data points and centroids
  const renderData = () => {
    const traces = [];

    // Data points
    if (clusters.length > 0) {
      const colors = [
        'red',
        'blue',
        'green',
        'purple',
        'orange',
        'brown',
        'pink',
        'gray',
        'olive',
        'cyan',
      ];
      const assignments = clusters[step].assignments;

      const clusterData = {};
      for (let i = 0; i < k; i++) {
        clusterData[i] = { x: [], y: [] };
      }

      data.forEach((point, index) => {
        const clusterIndex = assignments[index];
        clusterData[clusterIndex].x.push(point[0]);
        clusterData[clusterIndex].y.push(point[1]);
      });

      for (let i = 0; i < k; i++) {
        traces.push({
          x: clusterData[i].x,
          y: clusterData[i].y,
          mode: 'markers',
          type: 'scatter',
          marker: { color: colors[i % colors.length], size: 8 },
          name: `Cluster ${i + 1}`,
        });
      }

      // Centroids
      const centers = clusters[step].centers;
      traces.push({
        x: centers.map((c) => c[0]),
        y: centers.map((c) => c[1]),
        mode: 'markers',
        type: 'scatter',
        marker: {
          color: 'black',
          size: 12,
          symbol: 'x',
        },
        name: 'Centroids',
      });
    } else {
      // Before clustering starts, show all data points in gray
      traces.push({
        x: data.map((d) => d[0]),
        y: data.map((d) => d[1]),
        mode: 'markers',
        type: 'scatter',
        marker: { color: 'lightgray', size: 8 },
        name: 'Data Points',
      });
    }

    // Manual centroids
    if (initMethod === 'Manual' && manualCentroids.length > 0) {
      traces.push({
        x: manualCentroids.map((c) => c[0]),
        y: manualCentroids.map((c) => c[1]),
        mode: 'markers',
        type: 'scatter',
        marker: { color: 'green', size: 12, symbol: 'cross' },
        name: 'Manual Centroids',
      });
    }

    return traces;
  };

  return (
    <div>
      <h2>KMeans Clustering Visualization</h2>

      <ControlPanel
        k={k}
        setK={setK}
        initMethod={initMethod}
        setInitMethod={setInitMethod}
        generateData={generateData}
        startClustering={startClustering}
        nextStep={nextStep}
        runToConvergence={runToConvergence}
        resetClustering={resetClustering}
        isRunning={isRunning}
        step={step}
        clusters={clusters}
        dataMode={dataMode}
        setDataMode={setDataMode}
      />

      {/* Plot */}
      <Plot
        data={renderData()}
        layout={{
          title: 'KMeans Clustering',
          xaxis: { range: [-6, 6] },
          yaxis: { range: [-6, 6] },
          width: 700,
          height: 500,
        }}
        onClick={handlePlotClick}
      />

      {/* Instructions for Manual Centroid Selection */}
      {initMethod === 'Manual' && !isRunning && (
        <p>
          Click on the plot to select {k} initial centroids. Selected: {manualCentroids.length}/{k}
        </p>
      )}
    </div>
  );
};

export default PlotComponent;
