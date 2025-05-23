const { set } = require("ansi-color");
const { SingleBar } = require("cli-progress");
const { secondsToDuration } = require("@elzazo/main-utils");

/**
 * ## Create Progress Bar For Download
 */
class ProgressBarForDld {
  #Bar;
  #totalSize;
  #startTime;
  #totalSizeMB;

  constructor() {
    // Configuration
    const bar = set("{bar}", "cyan");
    const format = `{i} | ${bar} | {percentage}% | ETA: {my_eta} | {value}/{total} MB | Speed: {speed}MB/s`;
    const config = { format, barCompleteChar: "\u2588", barIncompleteChar: "\u2591", hideCursor: true };

    // create the progress bar
    this.#Bar = new SingleBar(config);
  }

  /**
   * ### Start Progress Bar
   */
  start(data, bar_number = 1) {
    // Initialise Params
    this.#totalSize = 0;
    this.#startTime = Date.now();

    // Get file size
    const contentLength = parseInt(data.headers["content-length"], 10);

    // Convert total size to megabytes
    this.#totalSizeMB = (contentLength / (1024 * 1024)).toFixed(2);

    // start the progress bar
    this.#Bar.start(this.#totalSizeMB, 0, { i: bar_number, speed: "N/A", my_eta: "00:00:00" });
  }

  /**
   * ### Update Progress Bar
   */
  update(chunk) {
    // Increment Downloading Size
    this.#totalSize += chunk.length;

    // Transfert Downloading Size TO MB
    const DldSize = parseFloat((this.#totalSize / (1024 * 1024)).toFixed(2));

    // Calc Dlding Speed
    const elapsedTime = (Date.now() - this.#startTime) / 1000;
    const speed = (DldSize / elapsedTime).toFixed(2);

    /**
     * ------------------------------------------------------------------
     * ---- Explication Calc ETA (time required for finish download) ----
     * ------------------------------------------------------------------
     *
     * Dlded    -> DldedTime
     * ToDld    -> ToDldTime
     * ToDldTime = (ToDld * DldedTime) / Dlded
     */
    const ToDldSize = this.#totalSizeMB - DldSize;
    const time_to_end_dld = (ToDldSize * elapsedTime) / DldSize;
    const my_eta = secondsToDuration(time_to_end_dld);

    // update the progress bar
    this.#Bar.update(DldSize, { speed, my_eta });
  }

  /**
   * ### Stop Progress Bar
   */
  stop() {
    this.#Bar.stop();
  }
}

module.exports = { ProgressBarForDld };
