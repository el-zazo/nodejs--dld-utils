/**
 * @fileoverview Custom error classes for download operations
 * @module errors/download-errors
 */

/**
 * Base error class for download operations
 * @class DownloadError
 * @extends Error
 */
class DownloadError extends Error {
  /**
   * Create a new DownloadError
   * @param {string} message - Error message
   * @param {string} code - Error code
   */
  constructor(message, code) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when a fetch operation fails
 * @class FetchError
 * @extends DownloadError
 */
class FetchError extends DownloadError {
  /**
   * Create a new FetchError
   * @param {string} message - Error message
   * @param {string} url - The URL that failed to fetch
   * @param {Error} originalError - The original error that caused the fetch to fail
   */
  constructor(message, url, originalError) {
    super(message, "FETCH_ERROR");
    this.url = url;
    this.originalError = originalError;
  }
}

/**
 * Error thrown when a file system operation fails
 * @class FileSystemError
 * @extends DownloadError
 */
class FileSystemError extends DownloadError {
  /**
   * Create a new FileSystemError
   * @param {string} message - Error message
   * @param {string} path - The file path where the error occurred
   * @param {Error} originalError - The original error that caused the file system operation to fail
   */
  constructor(message, path, originalError) {
    super(message, "FILE_SYSTEM_ERROR");
    this.path = path;
    this.originalError = originalError;
  }
}

/**
 * Error thrown when a download operation fails
 * @class DownloadFailedError
 * @extends DownloadError
 */
class DownloadFailedError extends DownloadError {
  /**
   * Create a new DownloadFailedError
   * @param {string} message - Error message
   * @param {string} url - The URL that failed to download
   * @param {string} path - The file path where the download was being saved
   * @param {Error} originalError - The original error that caused the download to fail
   */
  constructor(message, url, path, originalError) {
    super(message, "DOWNLOAD_FAILED");
    this.url = url;
    this.path = path;
    this.originalError = originalError;
  }
}

module.exports = {
  DownloadError,
  FetchError,
  FileSystemError,
  DownloadFailedError,
};
