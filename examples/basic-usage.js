/**
 * @fileoverview Basic usage examples for the download utility
 */

const { Download } = require("../index");

/**
 * Example of downloading a single file
 */
async function downloadSingleFile() {
  // Create a new Download instance with custom options
  const downloader = new Download({
    timeout: 10000, // 10 seconds timeout
    fileNamingStrategy: "timestamp", // Use timestamp for duplicate files
  });

  // Download a single file
  const result = await downloader.downloadOne("https://example.com/sample.jpg", {
    path: "./downloads",
    fileName: "sample.jpg",
  });

  if (result.success) {
    console.log(`File downloaded successfully to: ${result.filePath}`);
  } else {
    console.error(`Download failed: ${result.error.message}`);
  }
}

/**
 * Example of downloading multiple files
 */
async function downloadMultipleFiles() {
  const downloader = new Download();

  // Define files to download
  const filesToDownload = [
    {
      url: "https://example.com/file1.pdf",
      path: "./downloads/documents",
      fileName: "document1.pdf",
    },
    {
      url: "https://example.com/file2.jpg",
      path: "./downloads/images",
      fileName: "image1.jpg",
    },
    {
      url: "https://example.com/file3.zip",
      path: "./downloads/archives",
      fileName: "archive1.zip",
    },
  ];

  // Download all files
  const results = await downloader.downloadMany(...filesToDownload);

  // Log results
  console.log(`Downloaded ${results.filter((r) => r.success).length} of ${results.length} files`);
}

/**
 * Example of handling download errors
 */
async function handleDownloadErrors() {
  const downloader = new Download();

  try {
    const result = await downloader.downloadOne("https://invalid-url.example", {
      path: "./downloads",
      fileName: "will-fail.txt",
    });

    if (!result.success) {
      // Access error details
      console.error(`Error type: ${result.error.name}`);
      console.error(`Error code: ${result.error.code}`);

      if (result.error.originalError) {
        console.error(`Original error: ${result.error.originalError.message}`);
      }
    }
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
  }
}

// Run examples
(async () => {
  console.log("=== Single File Download Example ===");
  await downloadSingleFile();

  console.log("\n=== Multiple Files Download Example ===");
  await downloadMultipleFiles();

  console.log("\n=== Error Handling Example ===");
  await handleDownloadErrors();
})();
