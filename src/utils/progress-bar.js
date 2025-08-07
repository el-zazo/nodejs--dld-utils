/**
 * @fileoverview Progress bar implementation for download operations
 * @module utils/progress-bar
 */

const { set } = require("ansi-color");
const { SingleBar } = require("cli-progress");
const { secondsToDuration } = require("@el-zazo/main-utils");

/**
 * Creates and manages a progress bar for download operations
 * @class ProgressBar
 */
class ProgressBar {
  /**
   * Create a new ProgressBar instance
   * @param {Object} options - Progress bar options
   * @param {string} [options.barColor='cyan'] - Color of the progress bar
   * @param {string} [options.barCompleteChar='\u2588'] - Character for completed portion of bar
   * @param {string} [options.barIncompleteChar='\u2591'] - Character for incomplete portion of bar
   */
  constructor(options = {}) {
    const { barColor = "cyan", barCompleteChar = "\u2588", barIncompleteChar = "\u2591" } = options;

    // Configuration
    const bar = set("{bar}", barColor);
    const format = `{i} | ${bar} | {percentage}% | ETA: {eta} | {value}/{total} MB | Speed: {speed}MB/s`;

    this.config = {
      format,
      barCompleteChar,
      barIncompleteChar,
      hideCursor: true,
    };

    // Create the progress bar
    this.bar = new SingleBar(this.config);

    // Initialize state
    this.totalSize = 0;
    this.startTime = 0;
    this.totalSizeMB = 0;
    this.isActive = false;
  }

  /**
   * Start the progress bar
   * @param {Object} data - Response data with headers
   * @param {number} [barNumber=1] - Number to display for this bar (useful for multiple downloads)
   * @throws {Error} If the progress bar is already active
   */
  start(data, barNumber = 1) {
    if (this.isActive) {
      throw new Error("Progress bar is already active");
    }

    // Initialize parameters
    this.totalSize = 0;
    this.startTime = Date.now();
    this.isActive = true;

    try {
      // Get file size from content-length header
      const contentLength = parseInt(data.headers["content-length"], 10) || 0;

      // Convert total size to megabytes
      this.totalSizeMB = (contentLength / (1024 * 1024)).toFixed(2);

      // Start the progress bar
      this.bar.start(this.totalSizeMB, 0, {
        i: barNumber,
        speed: "N/A",
        eta: "00:00:00",
      });
    } catch (error) {
      this.isActive = false;
      throw new Error(`Failed to start progress bar: ${error.message}`);
    }
  }

  /**
   * Update the progress bar with new chunk data
   * @param {Buffer} chunk - Data chunk received
   */
  update(chunk) {
    if (!this.isActive) return;

    try {
      // Increment downloaded size
      this.totalSize += chunk.length;

      // Convert downloaded size to MB
      const downloadedSizeMB = parseFloat((this.totalSize / (1024 * 1024)).toFixed(2));

      // Calculate download speed
      const elapsedTime = (Date.now() - this.startTime) / 1000;
      const speed = (downloadedSizeMB / elapsedTime).toFixed(2);

      // Calculate ETA (Estimated Time of Arrival)
      const remainingSizeMB = this.totalSizeMB - downloadedSizeMB;
      const estimatedTimeRemaining = (remainingSizeMB * elapsedTime) / downloadedSizeMB;
      const eta = secondsToDuration(estimatedTimeRemaining);

      // Update the progress bar
      this.bar.update(downloadedSizeMB, { speed, eta });
    } catch (error) {
      // Silently handle errors during update to prevent download interruption
      console.error(`Progress bar update error: ${error.message}`);
    }
  }

  /**
   * Stop the progress bar
   */
  stop() {
    if (this.isActive) {
      try {
        this.bar.stop();
      } catch (error) {
        console.error(`Error stopping progress bar: ${error.message}`);
      } finally {
        this.isActive = false;
      }
    }
  }
}

module.exports = { ProgressBar };
