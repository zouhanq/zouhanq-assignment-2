class KMeans {
    constructor(data, k, initMethod = 'Random', initialCentroids = []) {
      this.data = data;
      this.k = k;
      this.initMethod = initMethod;
      this.initialCentroids = initialCentroids;
      this.assignment = new Array(data.length).fill(-1);
      this.centers = [];
      this.snaps = [];
    }
  
    dist(x, y) {
      return Math.sqrt(x.reduce((sum, xi, i) => sum + (xi - y[i]) ** 2, 0));
    }
  
    initialize() {
      if (this.initMethod === 'Random') {
        this.initializeRandom();
      } else if (this.initMethod === 'Farthest First') {
        this.initializeFarthestFirst();
      } else if (this.initMethod === 'KMeans++') {
        this.initializeKMeansPlusPlus();
      } else if (this.initMethod === 'Manual') {
        this.centers = this.initialCentroids.slice();
      } else {
        throw new Error(`Unknown initialization method: ${this.initMethod}`);
      }
    }
  
    initializeRandom() {
      const shuffledData = [...this.data].sort(() => 0.5 - Math.random());
      this.centers = shuffledData.slice(0, this.k);
    }
  
    initializeFarthestFirst() {
      const randomIndex = Math.floor(Math.random() * this.data.length);
      this.centers.push(this.data[randomIndex]);
  
      while (this.centers.length < this.k) {
        let maxDist = -Infinity;
        let farthestPoint = null;
  
        for (const point of this.data) {
          const minDist = Math.min(
            ...this.centers.map(center => this.dist(point, center))
          );
  
          if (minDist > maxDist) {
            maxDist = minDist;
            farthestPoint = point;
          }
        }
  
        this.centers.push(farthestPoint);
      }
    }
  
    initializeKMeansPlusPlus() {
      const randomIndex = Math.floor(Math.random() * this.data.length);
      this.centers.push(this.data[randomIndex]);
  
      while (this.centers.length < this.k) {
        const distancesSquared = this.data.map(point => {
          const minDistSquared = Math.min(
            ...this.centers.map(center => {
              const dist = this.dist(point, center);
              return dist * dist;
            })
          );
          return minDistSquared;
        });
  
        const sumDistances = distancesSquared.reduce((a, b) => a + b, 0);
        const probabilities = distancesSquared.map(d => d / sumDistances);
  
        const cumulativeProbabilities = [];
        probabilities.reduce((acc, curr, index) => {
          cumulativeProbabilities[index] = acc + curr;
          return cumulativeProbabilities[index];
        }, 0);
  
        const randomValue = Math.random();
  
        let selectedIndex = probabilities.length - 1;
        for (let i = 0; i < cumulativeProbabilities.length; i++) {
          if (randomValue < cumulativeProbabilities[i]) {
            selectedIndex = i;
            break;
          }
        }
  
        this.centers.push(this.data[selectedIndex]);
      }
    }
  
    makeClusters() {
      for (let i = 0; i < this.data.length; i++) {
        let minDist = Infinity;
        let closestCenter = -1;
        for (let j = 0; j < this.k; j++) {
          const distance = this.dist(this.data[i], this.centers[j]);
          if (distance < minDist) {
            minDist = distance;
            closestCenter = j;
          }
        }
        this.assignment[i] = closestCenter;
      }
    }
  
    computeCenters() {
      const dimension = this.data[0].length;
      const newCenters = Array.from({ length: this.k }, () => Array(dimension).fill(0));
      const counts = new Array(this.k).fill(0);
  
      for (let i = 0; i < this.data.length; i++) {
        const clusterIndex = this.assignment[i];
        for (let d = 0; d < dimension; d++) {
          newCenters[clusterIndex][d] += this.data[i][d];
        }
        counts[clusterIndex] += 1;
      }
  
      for (let j = 0; j < this.k; j++) {
        if (counts[j] === 0) {
          newCenters[j] = this.data[Math.floor(Math.random() * this.data.length)];
        } else {
          for (let d = 0; d < dimension; d++) {
            newCenters[j][d] /= counts[j];
          }
        }
      }
  
      return newCenters;
    }
  
    centersChanged(newCenters) {
      for (let i = 0; i < this.k; i++) {
        if (this.dist(this.centers[i], newCenters[i]) > 1e-6) {
          return true;
        }
      }
      return false;
    }
  
    run() {
      this.initialize();
      let iterations = 0;
      const maxIterations = 100;
  
      while (iterations < maxIterations) {
        this.makeClusters();
        const newCenters = this.computeCenters();
        this.snaps.push({
          centers: this.centers.slice(),
          assignments: [...this.assignment],
        });
  
        if (!this.centersChanged(newCenters)) {
          break;
        }
  
        this.centers = newCenters;
        iterations += 1;
      }
  
      this.snaps.push({
        centers: this.centers.slice(),
        assignments: [...this.assignment],
      });
    }
  }
  
  export default KMeans;
  