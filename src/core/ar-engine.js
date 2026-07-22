/**
 * AREngine — керування MindAR + A-Frame
 */

export class AREngine {
  constructor() {
    this.scene = document.getElementById('ar-scene');
    this.markerContainer = document.getElementById('marker-container');
    this.arSystem = null;
    this.isTracking = false;
  }

  init() {
    return new Promise((resolve, reject) => {
      if (this.scene.hasLoaded) {
        this.onLoaded(resolve, reject);
      } else {
        this.scene.addEventListener('loaded', () => this.onLoaded(resolve, reject));
        this.scene.addEventListener('arError', (e) => reject(e.detail));
      }
    });
  }

  onLoaded(resolve, reject) {
    this.arSystem = this.scene.systems['mindar-image-system'];
    if (!this.arSystem) {
      reject(new Error('MindAR system not found'));
      return;
    }
    resolve();
  }

  waitForMarker() {
    return new Promise((resolve) => {
      this.arSystem.start();
      this.markerContainer.setAttribute('visible', 'true');
      this.isTracking = true;
      
      const onFound = () => {
        this.markerContainer.removeEventListener('targetFound', onFound);
        resolve();
      };
      
      this.markerContainer.addEventListener('targetFound', onFound);
    });
  }

  stopTracking() {
    if (this.arSystem) {
      this.arSystem.stop();
    }
    this.isTracking = false;
  }

  destroy() {
    this.stopTracking();
  }
}
