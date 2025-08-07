/**
 * @fileoverview Download options constants
 * @module constants/download-options
 */

/**
 * Options for single file download
 * @typedef {Object} DownloadOneOptions
 * @property {string} [path=''] - Directory path to save the file
 * @property {string} [fileName='file'] - Name of the file to save
 * @property {number} [downloadNumber=1] - Download number (for progress bar)
 * @property {string} [fileNamingStrategy='timestamp'] - Strategy for naming duplicate files ('timestamp', 'counter', 'random')
 */
const DOWNLOAD_ONE_OPTIONS = {
  /**
   * Directory path to save the file
   * @type {string}
   * @default ''
   */
  path: "",

  /**
   * Name of the file to save
   * If the file already exists, a unique name will be generated based on the fileNamingStrategy
   * @type {string}
   * @default 'file'
   */
  fileName: "file",

  /**
   * Download number (for progress bar)
   * @type {number}
   * @default 1
   */
  downloadNumber: 1,

  /**
   * Strategy for naming duplicate files
   * @type {string}
   * @default 'timestamp'
   */
  fileNamingStrategy: "timestamp",
};

/**
 * Options for multiple file downloads
 * @typedef {Object} DownloadManyOptions
 * @property {string} url - URL to download from
 * @property {string} [path=''] - Directory path to save the file
 * @property {string} [fileName='file'] - Name of the file to save
 */
const DOWNLOAD_MANY_OPTIONS = {
  /**
   * URL to download from
   * @type {string}
   * @default ''
   */
  url: "",

  // Include all options from DOWNLOAD_ONE_OPTIONS
  ...DOWNLOAD_ONE_OPTIONS,
};

module.exports = {
  DOWNLOAD_ONE_OPTIONS,
  DOWNLOAD_MANY_OPTIONS,
};
