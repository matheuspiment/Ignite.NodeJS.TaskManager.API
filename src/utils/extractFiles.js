/**
 * Extracts the content of files from a multipart/form-data payload.
 *
 * @param {string} payload - The multipart/form-data payload.
 * @param {string} boundary - The boundary string that separates different parts in the payload.
 * @returns {Object} An object where the keys are the names of the files and the values are the contents of the files.
 */
export function extractFiles(payload, boundary) {
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
