const DOWNLOAD_ONE_OPTIONS = {
  /**
   * ### Path To Save File
   *
   * _default is empty string_
   */
  path: "",

  /**
   * ### File Name
   *
   * _default is `file`. If already exist an random number will be added to it_
   */
  file_name: "file",
};

const DOWNLOAD_MANY_OPTIONS = {
  /**
   * ### Link To Download
   *
   * _default is empty string_
   */
  link: "",

  ...DOWNLOAD_ONE_OPTIONS,
};

module.exports = { DOWNLOAD_ONE_OPTIONS, DOWNLOAD_MANY_OPTIONS };
