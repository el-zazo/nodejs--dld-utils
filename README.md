# @el-zazo/dld-utils

A powerful Node.js utility for downloading files from URLs with progress tracking, error handling, and file management.

## Features

- **Single and Batch Downloads**: Download individual files or multiple files in sequence
- **Progress Tracking**: Real-time progress bars with ETA and speed indicators
- **Smart File Naming**: Multiple strategies for handling duplicate filenames
- **Robust Error Handling**: Detailed error information and recovery mechanisms
- **Flexible Configuration**: Customize timeouts, file naming strategies, and more

## Installation

```bash
npm install @el-zazo/dld-utils
```

## Basic Usage

### Download a Single File

```js
const { Download } = require("@el-zazo/dld-utils");

async function downloadFile() {
  const downloader = new Download();

  const result = await downloader.downloadOne("https://example.com/file.jpg", {
    path: "./downloads",
    fileName: "image.jpg",
  });

  if (result.success) {
    console.log(`File downloaded to: ${result.filePath}`);
  }
}

downloadFile();
```

### Download Multiple Files

```js
const { Download } = require("@el-zazo/dld-utils");

async function downloadMultipleFiles() {
  const downloader = new Download();

  const results = await downloader.downloadMany(
    {
      url: "https://example.com/file1.pdf",
      path: "./downloads/documents",
      fileName: "document.pdf",
    },
    {
      url: "https://example.com/file2.jpg",
      path: "./downloads/images",
      fileName: "image.jpg",
    }
  );

  console.log(`Downloaded ${results.filter((r) => r.success).length} of ${results.length} files`);
}

downloadMultipleFiles();
```

## API Reference

### `Download` Class

#### Constructor

```js
const downloader = new Download(options);
```

**Options:**

- `consoleMessages` (ConsoleMessages, optional): Custom console messages instance
- `timeout` (number, default: 5000): Request timeout in milliseconds
- `fileNamingStrategy` (string, default: 'timestamp'): Strategy for naming duplicate files ('timestamp', 'counter', 'random')

#### Methods

##### `downloadOne(url, options)`

Downloads a single file from a URL.

**Parameters:**

- `url` (string): URL to download from
- `options` (object):
  - `path` (string, default: ''): Directory path to save the file
  - `fileName` (string, default: 'file'): Name of the file to save
  - `downloadNumber` (number, default: 1): Download number for progress display
  - `fileNamingStrategy` (string, optional): Override the default file naming strategy

**Returns:** Promise resolving to an object with:

- `success` (boolean): Whether the download was successful
- `filePath` (string): Path where the file was saved (if successful)
- `error` (Error): Error object (if download failed)

##### `downloadMany(...downloadOptions)`

Downloads multiple files in sequence.

**Parameters:**

- `downloadOptions` (array of objects): Each object contains:
  - `url` (string): URL to download from
  - `path` (string, default: ''): Directory path to save the file
  - `fileName` (string, default: 'file'): Name of the file to save

**Returns:** Promise resolving to an array of download result objects

## Error Handling

The library provides detailed error information through custom error classes:

```js
const downloader = new Download();

try {
  const result = await downloader.downloadOne("https://example.com/file.jpg", {
    path: "./downloads",
    fileName: "image.jpg",
  });

  if (!result.success) {
    // Handle specific error types
    console.error(`Error type: ${result.error.name}`);
    console.error(`Error code: ${result.error.code}`);
  }
} catch (error) {
  console.error(`Unexpected error: ${error.message}`);
}
```

## Advanced Configuration

### Custom Console Messages

```js
const { ConsoleMessages } = require("@el-zazo/console-messages");
const { Download } = require("@el-zazo/dld-utils");

const customConsole = new ConsoleMessages({
  // Custom console options
});

const downloader = new Download({ consoleMessages: customConsole });
```

### File Naming Strategies

The library supports multiple strategies for handling duplicate filenames:

- `timestamp`: Appends the current timestamp (default)
- `counter`: Appends an incremental number
- `random`: Appends a random string

```js
const downloader = new Download({ fileNamingStrategy: "counter" });
```

## Examples

See the [examples](./examples) directory for more usage examples.

## License

ISC
