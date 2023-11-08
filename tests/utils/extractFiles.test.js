import { extractFiles } from "../../src/utils/extractFiles";

describe("extractFiles", () => {
  it("should throw an error when payload is not a string", () => {
    expect(() => extractFiles(null, "boundary")).toThrow(
      "Invalid payload. Expected a string."
    );
  });

  it("should throw an error when boundary is not a string", () => {
    expect(() => extractFiles("payload", null)).toThrow(
      "Invalid boundary. Expected a string."
    );
  });

  it("should throw an error when payload and boundary are not strings", () => {
    expect(() => extractFiles(null, null)).toThrow(
      "Invalid payload. Expected a string."
    );
  });

  it("should return an empty object when payload is empty", () => {
    const result = extractFiles("", "boundary");
    expect(result).toEqual({});
  });

  it("should return an empty object when boundary is not found in payload", () => {
    const result = extractFiles("payload", "boundary");
    expect(result).toEqual({});
  });

  it("should handle payloads with no headers", () => {
    const payload = "--boundary\r\n\r\nHello, World!\r\n--boundary--";
    const result = extractFiles(payload, "--boundary");
    expect(result).toEqual({});
  });

  it("should handle payloads with no body", () => {
    const payload =
      '--boundary\r\nContent-Disposition: form-data; name="file1"; filename="test1.txt"\r\n\r\n\r\n--boundary--';
    const result = extractFiles(payload, "--boundary");
    expect(result).toEqual({ file1: [{ filename: "test1.txt", content: "" }] });
  });

  it("should extract files correctly", () => {
    const payload =
      '--boundary\r\nContent-Disposition: form-data; name="file1"; filename="test1.txt"\r\n\r\nHello, World!\r\n--boundary\r\nContent-Disposition: form-data; name="file2"; filename="test2.txt"\r\n\r\nHello, Universe!\r\n--boundary--';
    const result = extractFiles(payload, "--boundary");
    expect(result).toEqual({
      file1: [{ filename: "test1.txt", content: "Hello, World!" }],
      file2: [{ filename: "test2.txt", content: "Hello, Universe!" }],
    });
  });

  it("should handle multiple files with the same name", () => {
    const payload =
      '--boundary\r\nContent-Disposition: form-data; name="file1"; filename="test1.txt"\r\n\r\nHello, World!\r\n--boundary\r\nContent-Disposition: form-data; name="file1"; filename="test2.txt"\r\n\r\nHello, Universe!\r\n--boundary--';
    const result = extractFiles(payload, "--boundary");
    expect(result).toEqual({
      file1: [
        { filename: "test1.txt", content: "Hello, World!" },
        { filename: "test2.txt", content: "Hello, Universe!" },
      ],
    });
  });
});
