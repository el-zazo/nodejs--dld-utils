const { default: axios } = require("axios");
const { existsSync, createWriteStream } = require("fs");
const { CreatePath } = require("@elzazo/path-utils");
const { ConsoleMessages } = require("@elzazo/console-messages");
const { getRandomNumber, setLenByZero } = require("@elzazo/main-utils");

// Utils
const { ProgressBarForDld } = require("./utils/progress_bar_for_dld");

// Data
const { DOWNLOAD_ONE_OPTIONS, DOWNLOAD_MANY_OPTIONS } = require("./options/download_options");

/**
 * ## Download Files By URL
 *
 * Download url And Save them in specifique path
 */
class Download {
  #CPath;

  /**
   * @param {ConsoleMessages} CM
   */
  constructor(CM = null) {
    this.CM = CM || new ConsoleMessages();
    this.#CPath = new CreatePath(this.CM);
  }

  /**
   * ### Fetch Data
   *
   * @param {String} link
   */
  async #fetch(link) {
    try {
      const { data } = await axios.get(link, { responseType: "stream", timeout: 5000 });
      return data;
    } catch (error) {
      this.CM.error(`Can't Fetch Data From Link: '${link}'\nError Message : ${error.message}`);
      return null;
    }
  }

  /**
   * ### Download One
   *
   * @param {string} link
   * @param {DOWNLOAD_ONE_OPTIONS} options
   */
  async download_one(link, options) {
    return new Promise(async (resolve, reject) => {
      try {
        // Prepare Options
        let { path, file_name, dld_number = 1 } = { ...DOWNLOAD_ONE_OPTIONS, ...options };

        // Download Data
        const data = await this.#fetch(link);

        // Stop IF data is null
        if (data === null) return resolve(false);

        // Create Path IF Not Exists
        if (path.trim() === "" || this.#CPath.make_dir(path)) {
          // Create Progress Bar
          const bar = new ProgressBarForDld();

          // Start Progress Bar
          bar.start(data, dld_number);

          // Update Progress Bar
          data.on("data", (chunk) => bar.update(chunk));

          // Prepare Path
          path = path.trim() !== "" ? (path.endsWith("/") ? path.trim() : `${path.trim()}/`) : "";
          let complete_path = `${path}${file_name}`;

          // If FileName Already Exist -> Add Rand Number To FileName
          if (existsSync(complete_path)) {
            const f = file_name.split(".");
            f[f.length - 1] = `${f[f.length - 1]}-${getRandomNumber()}`;
            complete_path = `${path}${f.join(".")}`;
          }

          // Pipe the response stream into a file
          data.pipe(createWriteStream(complete_path));

          // Download completed
          data.on("end", () => {
            // Stop Progress Bar
            bar.stop();
            resolve(true);
            this.CM.succes(`Download completed.\nFile Saved in : '${complete_path}'`);
          });

          // Download Failed
          data.on("error", (err) => {
            bar.stop();
            resolve(false);
            this.CM.error(`Download Failed.\nError Message : ${err.message}`);
          });
        }
      } catch (error) {
        this.CM.error(`Error Downloading URL : ${link}\nError Message : ${error.message}`);
        resolve(false);
      }
    });
  }

  /**
   * ### Download Many
   *
   * @param {...DOWNLOAD_MANY_OPTIONS} list_options
   */
  async download_many(...list_options) {
    return new Promise(async (resolve, reject) => {
      try {
        const number_dlds = list_options.length;
        this.CM.normal(`Start Downloading ${number_dlds} File${number_dlds > 1 ? "s" : ""}.`);

        for (let [index, options] of Object.entries(list_options)) {
          // Prepare Data
          const { link, path, file_name } = { ...DOWNLOAD_MANY_OPTIONS, ...options };
          const dld_number = setLenByZero(+index + 1, String(number_dlds).length);

          // Start Download One
          await this.download_one(link, { path, file_name, dld_number });

          if (index === list_options.length - 1) {
            // All Download Completed
            resolve(true);
          }
        }
      } catch (error) {
        this.CM.error(`Error Downloading Many : ${error.message}`);
        resolve(false);
      }
    });
  }
}

module.exports = { Download };
