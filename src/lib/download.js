/**
 * @fileoverview Main download class for handling file downloads
 * @module lib/download
 */

const axios = require("axios").default;
const { ConsoleMessages } = require("@el-zazo/console-messages");
const { FileManager } = require("./file-manager");
const { ProgressBar } = require("../utils/progress-bar");
const { FetchError, DownloadFailedError } = require("../errors/download-errors");

/**
 * Download class for handling file downloads from URLs
 * @class Download
 */
class Download {
  /**
   * Create a new Download instance
   * @param {Object} options - Download options
   * @param {ConsoleMessages} [options.consoleMessages=null] - Console messages instance for logging
   * @param {number} [options.timeout=5000] - Timeout for download requests in milliseconds
   * @param {string} [options.fileNamingStrategy='timestamp'] - Strategy for naming duplicate files ('timestamp', 'counter', 'random')
   */
  constructor(options = {}) {
    const { consoleMessages = null, timeout = 5000, fileNamingStrategy = "timestamp" } = options;

    this.consoleMessages = consoleMessages || new ConsoleMessages();
    this.fileManager = new FileManager(this.consoleMessages);
    this.timeout = timeout;
    this.fileNamingStrategy = fileNamingStrategy;
  }

  /**
   * Fetch data from a URL
   * @private
   * @param {string} url - URL to fetch data from
   * @returns {Promise<Object>} Response data stream
   * @throws {FetchError} If fetch operation fails
   */
  async #fetchData(url) {
    try {
      const response = await axios.get(url, {
        responseType: "stream",
        timeout: this.timeout,
      });
      return response.data;
    } catch (error) {
      throw new FetchError(`Failed to fetch data from URL: ${url}`, url, error);
    }
  }

  /**
   * Download a single file from a URL
   * @param {string} url - URL to download from
   * @param {Object} options - Download options
   * @param {string} [options.path=''] - Directory path to save the file
   * @param {string} [options.fileName='file'] - Name of the file to save
   * @param {number} [options.downloadNumber=1] - Download number (for progress bar)
   * @param {string} [options.fileNamingStrategy] - Strategy for naming duplicate files (overrides constructor setting)
   * @returns {Promise<Object>} Download result with success status and file path
   */
  async downloadOne(url, options = {}) {
    const { path = "", fileName = "file", downloadNumber = 1, fileNamingStrategy = this.fileNamingStrategy } = options;

    let dataStream = null;
    let progressBar = null;
    let filePath = null;

    try {
      // Fetch data from URL
      try {
        dataStream = await this.#fetchData(url);
      } catch (error) {
        this.consoleMessages.error(`${error.message}\nError details: ${error.originalError?.message || "Unknown error"}`);
        return { success: false, error };
      }

      // Ensure directory exists
      if (!this.fileManager.ensureDirectoryExists(path)) {
        this.consoleMessages.error(`Failed to create directory: ${path}`);
        return { success: false, error: new Error(`Failed to create directory: ${path}`) };
      }

      // Normalize path and generate unique filename if needed
      const normalizedPath = this.fileManager.normalizeDirPath(path);
      const uniqueFileName = this.fileManager.generateUniqueFilename(normalizedPath, fileName, { strategy: fileNamingStrategy });

      filePath = `${normalizedPath}${uniqueFileName}`;

      // Create and start progress bar
      progressBar = new ProgressBar();
      progressBar.start(dataStream, downloadNumber);

      // Set up data event handler for progress updates
      dataStream.on("data", (chunk) => progressBar.update(chunk));

      // Create write stream and pipe data to it
      const writeStream = this.fileManager.createFileWriteStream(filePath);
      dataStream.pipe(writeStream);

      // Wait for download to complete
      return new Promise((resolve) => {
        // Handle successful download
        dataStream.on("end", () => {
          progressBar.stop();
          this.consoleMessages.succes(`Download completed.\nFile saved at: '${filePath}'`);
          resolve({ success: true, filePath });
        });

        // Handle download errors
        dataStream.on("error", (err) => {
          progressBar.stop();
          const error = new DownloadFailedError(`Download failed for URL: ${url}`, url, filePath, err);
          this.consoleMessages.error(`${error.message}\nError details: ${err.message}`);
          resolve({ success: false, error });
        });

        // Handle write stream errors
        writeStream.on("error", (err) => {
          progressBar.stop();
          const error = new DownloadFailedError(`Failed to write file: ${filePath}`, url, filePath, err);
          this.consoleMessages.error(`${error.message}\nError details: ${err.message}`);
          resolve({ success: false, error });
        });
      });
    } catch (error) {
      // Clean up resources in case of error
      if (progressBar) progressBar.stop();

      this.consoleMessages.error(`Error downloading from URL: ${url}\nError details: ${error.message}`);
      return { success: false, error };
    }
  }

  /**
   * Download multiple files from URLs
   * @param {...Object} downloadOptions - Array of download options objects
   * @param {string} downloadOptions[].url - URL to download from
   * @param {string} [downloadOptions[].path=''] - Directory path to save the file
   * @param {string} [downloadOptions[].fileName='file'] - Name of the file to save
   * @returns {Promise<Array<Object>>} Array of download results
   */
  async downloadMany(...downloadOptions) {
    const results = [];
    const totalDownloads = downloadOptions.length;

    try {
      this.consoleMessages.normal(`Starting download of ${totalDownloads} file${totalDownloads > 1 ? "s" : ""}.`);

      for (let i = 0; i < downloadOptions.length; i++) {
        const options = downloadOptions[i];
        const { url, path = "", fileName = "file" } = options;

        // Calculate download number for progress display
        const downloadNumber = i + 1;

        // Download the file
        const result = await this.downloadOne(url, {
          path,
          fileName,
          downloadNumber,
        });

        results.push(result);
      }

      // Log summary
      const successCount = results.filter((result) => result.success).length;
      this.consoleMessages.normal(`Download summary: ${successCount}/${totalDownloads} files downloaded successfully.`);

      return results;
    } catch (error) {
      this.consoleMessages.error(`Error in batch download: ${error.message}`);
      return results;
    }
  }
}

module.exports = { Download };
