import { writeFile, readFile } from "node:fs/promises";

const DATABASE_FILE_URL = new URL("../data.json", import.meta.url);

/**
 * @class
 * @classdesc A class that simulates a database by saving data to a JSON file.
 * The data is stored in memory as an object, where the keys are table names and the values are arrays of records.
 * The data is loaded from the file into memory when a new instance of the class is created.
 * The select method can be used to select all records from a specified table.
 */
class Database {
  /**
   * @private
   * @type {Object}
   * @description An object to hold the data in memory. The keys are table names and the values are arrays of records.
   */
  #data = {};

  /**
   * Constructor for the Database class.
   * Calls the load method to load data from the database file into memory.
   */
  constructor() {
    this.load();
  }

  /**
   * Persists the current data to the database file.
   *
   * @returns {Promise<void>} A promise that resolves when the data has been successfully written to the file.
   * @throws {Error} If there's an error writing the file.
   */
  async #persist() {
    const dataJson = JSON.stringify(this.#data);
    await writeFile(DATABASE_FILE_URL, dataJson);
  }

  /**
   * Loads data from the database file into memory.
   * If the file does not exist, it calls the persist method to create it.
   *
   * @returns {Promise<void>} A promise that resolves when the data has been successfully loaded into memory.
   * @throws {Error} If there's an error reading the file (other than the file not existing).
   */
  async load() {
    try {
      const dataJson = await readFile(DATABASE_FILE_URL);
      this.#data = JSON.parse(dataJson);
    } catch (error) {
      if (error.code === "ENOENT") {
        await this.#persist();

        return;
      }

      throw error;
    }
  }

  /**
   * Selects all records from a specified table.
   *
   * @param {string} table - The name of the table to select from.
   * @returns {Array} An array of records from the specified table, or an empty array if the table does not exist.
   */
  select(table) {
    return this.#data[table] ?? [];
  }
}

export default new Database();
