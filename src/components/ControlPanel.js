// src/components/ControlPanel.js

import React from 'react';

const ControlPanel = ({
  k,
  setK,
  initMethod,
  setInitMethod,
  generateData,
  startClustering,
  nextStep,
  runToConvergence,
  resetClustering,
  isRunning,
  step,
  clusters,
  dataMode,
  setDataMode,
}) => {
  return (
    <div>
      {/* Initialization Method Selection */}
      <label>
        Initialization Method:
        <select
          value={initMethod}
          onChange={(e) => {
            setInitMethod(e.target.value);
            resetClustering();
          }}
        >
          <option value="Random">Random</option>
          <option value="Farthest First">Farthest First</option>
          <option value="KMeans++">KMeans++</option>
          <option value="Manual">Manual</option>
        </select>
      </label>

      {/* Number of Clusters Input */}
      <label style={{ marginLeft: '20px' }}>
        Number of Clusters (k):
        <input
          type="number"
          value={k}
          min="1"
          onChange={(e) => {
            setK(parseInt(e.target.value));
            resetClustering();
          }}
        />
      </label>

      {/* Data Mode Selection */}
      <label style={{ marginLeft: '20px' }}>
        Data Mode:
        <select
          value={dataMode}
          onChange={(e) => {
            setDataMode(e.target.value);
            resetClustering();
            generateData();
          }}
        >
          <option value="clustered">Clustered</option>
          <option value="uniform">Uniform</option>
        </select>
      </label>

      {/* Buttons */}
      <div style={{ marginTop: '10px' }}>
        <button onClick={generateData}>Generate New Dataset</button>
        <button onClick={startClustering} disabled={isRunning}>
          Start Clustering
        </button>
        <button
          onClick={nextStep}
          disabled={!isRunning || step >= clusters.length - 1}
        >
          Next Step
        </button>
        <button onClick={runToConvergence} disabled={!isRunning}>
          Run to Convergence
        </button>
        <button onClick={resetClustering}>Reset</button>
      </div>
    </div>
  );
};

export default ControlPanel;


