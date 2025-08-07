/**
 * @fileoverview File management utilities for download operations
 * @module lib/file-manager
 */

const { existsSync, createWriteStream } = require("fs");
const path = require("path");
const { CreatePath } = require("@el-zazo/path-utils");
const { FileSystemError } = require("../errors/download-errors");

/**
 * Manages file operations for downloads
 * @class FileManager
 */
class FileManager {
  /**
   * Create a new FileManager instance
   * @param {ConsoleMessages} consoleMessages - Console messages instance for logging
   */
  constructor(consoleMessages) {
    this.consoleMessages = consoleMessages;
    this.pathCreator = new CreatePath(consoleMessages);
  }

  /**
   * Ensures a directory exists, creating it if necessary
   * @param {string} dirPath - Directory path to ensure
   * @returns {boolean} True if directory exists or was created successfully
   * @throws {FileSystemError} If directory creation fails
   */
  ensureDirectoryExists(dirPath) {
    try {
      if (dirPath.trim() === "") return true;
      return this.pathCreator.make_dir(dirPath);
    } catch (error) {
      throw new FileSystemError(`Failed to create directory: ${dirPath}`, dirPath, error);
    }
  }

  /**
   * Normalizes a directory path to ensure it ends with a separator
   * @param {string} dirPath - Directory path to normalize
   * @returns {string} Normalized directory path
   */
  normalizeDirPath(dirPath) {
    if (dirPath.trim() === "") return "";
    return dirPath.trim().endsWith(path.sep) ? dirPath.trim() : `${dirPath.trim()}${path.sep}`;
  }

  /**
   * Generates a unique filename if the original already exists
   * @param {string} dirPath - Directory path
   * @param {string} fileName - Original filename
   * @param {Object} options - Options for filename generation
   * @param {string} [options.strategy='timestamp'] - Strategy for generating unique names ('timestamp', 'counter', 'random')
   * @returns {string} Unique filename
   */
  generateUniqueFilename(dirPath, fileName, options = {}) {
    const { strategy = "timestamp" } = options;
    const normalizedPath = this.normalizeDirPath(dirPath);
    const fullPath = `${normalizedPath}${fileName}`;

    // If file doesn't exist, return original name
    if (!existsSync(fullPath)) return fileName;

    // Parse filename and extension
    const lastDotIndex = fileName.lastIndexOf(".");
    const baseName = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
    const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : "";

    // Generate unique name based on strategy
    let uniqueName;
    switch (strategy) {
      case "timestamp":
        uniqueName = `${baseName}-${Date.now()}${extension}`;
        break;
      case "counter":
        let counter = 1;
        do {
          uniqueName = `${baseName}-(${counter})${extension}`;
          counter++;
        } while (existsSync(`${normalizedPath}${uniqueName}`));
        break;
      case "random":
        const randomStr = Math.random().toString(36).substring(2, 8);
        uniqueName = `${baseName}-${randomStr}${extension}`;
        break;
      default:
        uniqueName = `${baseName}-${Date.now()}${extension}`;
    }

    return uniqueName;
  }

  /**
   * Creates a write stream for a file
   * @param {string} filePath - Path to the file
   * @returns {WriteStream} Node.js write stream
   * @throws {FileSystemError} If stream creation fails
   */
  createFileWriteStream(filePath) {
    try {
      return createWriteStream(filePath);
    } catch (error) {
      throw new FileSystemError(`Failed to create write stream for file: ${filePath}`, filePath, error);
    }
  }
}

module.exports = { FileManager };
