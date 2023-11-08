/**
 * Extracts the content of files from a multipart/form-data payload.
 *
 * @param {string} payload - The multipart/form-data payload.
 * @param {string} boundary - The boundary string that separates different parts in the payload.
 * @returns {Object} An object where the keys are the names of the files and the values are arrays of objects, each containing the filename and content of a file.
 * @throws {Error} Throws an error if the payload or boundary is not a string.
 */
export function extractFiles(payload, boundary) {
  if (typeof payload !== "string") {
    throw new Error("Invalid payload. Expected a string.");
  }

  if (typeof boundary !== "string") {
    throw new Error("Invalid boundary. Expected a string.");
  }

  const parts = payload.split(boundary).slice(1, -1);
  const files = {};

  parts.forEach((part) => {
    const [header, ...body] = part.split("\r\n\r\n");
    const nameMatch = header.match(/name="([^"]+)"/);
    const filenameMatch = header.match(/filename="([^"]+)"/);

    if (nameMatch && filenameMatch) {
      const name = nameMatch[1];
      const filename = filenameMatch[1];
      const content = body.join("\r\n\r\n").trim();

      if (!files[name]) {
        files[name] = [];
      }

      files[name].push({ filename, content });
    }
  });

  return files;
}
