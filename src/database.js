import { writeFile, readFile } from "node:fs/promises";

const DATABASE_FILE_URL = new URL("../data.json", import.meta.url);

/**
 * @class
 * @classdesc A class that simulates a database by saving data to a JSON file.
 * The data is stored in memory as an object, where the keys are table names and the values are arrays of records.
 * The data is loaded from the file into memory when a new instance of the class is created.
 * The select method can be used to select all records from a specified table.
 * The insert method can be used to insert a record into a specified table.
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
   * Selects records from a specified table that match a search criteria.
   * If the table does not exist, it returns an empty array.
   * If no search criteria is provided, it returns all records from the table.
   *
   * @param {string} table - The name of the table to select from.
   * @param {Object} [search={}] - An object where the keys are field names and the values are the values to search for.
   * @returns {Array} An array of records that match the search criteria, or an empty array if the table does not exist.
   */
  select(table, search = {}) {
    if (!this.#data[table]) {
      return [];
    }

    const records = this.#data[table];

    if (Object.keys(search).length === 0) {
      return records;
    }

    return records.filter((record) => {
      for (const [key, value] of Object.entries(search)) {
        if (record[key].includes(value)) {
          return true;
        }
      }

      return false;
    });
  }

  /**
   * Inserts a record into a specified table.
   * If the table does not exist, it creates the table.
   * After inserting the record, it persists the data to the database file.
   *
   * @param {string} table - The name of the table to insert into.
   * @param {Object} record - The record to insert.
   * @returns {Promise<void>} A promise that resolves when the record has been successfully inserted and the data has been persisted.
   * @throws {Error} If there's an error persisting the data.
   */
  async insert(table, record) {
    if (!this.#data[table]) {
      this.#data[table] = [];
    }

    this.#data[table].push(record);

    await this.#persist();
  }

  /**
   * Updates a record in a specified table.
   * If the table or the record does not exist, it throws an error.
   * After updating the record, it persists the data to the database file.
   *
   * @param {string} table - The name of the table to update the record in.
   * @param {string|number} id - The id of the record to update.
   * @param {Object} record - An object containing the new values for the record.
   * @returns {Promise<void>} A promise that resolves when the record has been successfully updated and the data has been persisted.
   * @throws {Error} If the table or the record does not exist.
   */
  async update(table, id, record) {
    if (!this.#data[table]) {
      throw new Error("Record not found");
    }

    const index = this.#data[table].findIndex((record) => record.id === id);

    if (index === -1) {
      throw new Error("Record not found");
    }

    this.#data[table][index] = {
      ...this.#data[table][index],
      ...record,
    };

    await this.#persist();
  }

  /**
   * Deletes a record from a specified table.
   * If the table or the record does not exist, it throws an error.
   * After deleting the record, it persists the data to the database file.
   * 
   * @param {string} table - The name of the table to delete the record from.
   * @param {string|number} id - The id of the record to delete.
   * @returns {Promise<void>} A promise that resolves when the record has been successfully deleted and the data has been persisted.
   * @throws {Error} If the table or the record does not exist.
   */
  async delete(table, id) {
    if (!this.#data[table]) {
      throw new Error("Record not found");
    }

    const index = this.#data[table].findIndex((record) => record.id === id);

    if (index === -1) {
      throw new Error("Record not found");
    }

    this.#data[table].splice(index, 1);

    await this.#persist();
  }
}

export default new Database();
