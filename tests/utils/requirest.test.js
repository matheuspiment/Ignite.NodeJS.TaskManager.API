import {
  createRouteRegex,
  getQueryParams,
  getRoute,
  getRouteParams,
} from "../../src/utils/request";

describe("createRouteRegex", () => {
  it("should return a RegExp object", () => {
    const result = createRouteRegex("/test");
    expect(result).toBeInstanceOf(RegExp);
  });

  it("should correctly match the provided route", () => {
    const route = "/test";
    const regex = createRouteRegex(route);
    expect(regex.test(route)).toBe(true);
  });

  it("should not match a different route", () => {
    const regex = createRouteRegex("/test");
    expect(regex.test("/different")).toBe(false);
  });

  it("should correctly match routes with parameters", () => {
    const regex = createRouteRegex("/test/:id");
    expect(regex.test("/test/123")).toBe(true);
    expect(regex.test("/test/abc")).toBe(true);
  });

  it("should not match routes with missing parameters", () => {
    const regex = createRouteRegex("/test/:id");
    expect(regex.test("/test/")).toBe(false);
  });

  it("should throw an error when route is not a string", () => {
    expect(() => createRouteRegex(null)).toThrow(
      "Invalid route. Expected a string."
    );
  });
});

describe("getRoute", () => {
  const routes = {
    "/test": "testHandler",
    "/test/:id": "testIdHandler",
    "/other/:param": "otherHandler",
  };

  it("should return the correct route for a simple path", () => {
    const result = getRoute(routes, "/test");
    expect(result).toEqual(["/test", "testHandler"]);
  });

  it("should return the correct route for a path with a parameter", () => {
    const result = getRoute(routes, "/test/123");
    expect(result).toEqual(["/test/:id", "testIdHandler"]);
  });

  it("should return undefined for a path that doesn't match any route", () => {
    const result = getRoute(routes, "/nonexistent");
    expect(result).toBeUndefined();
  });

  it("should return the correct route when multiple routes could match", () => {
    const result = getRoute(routes, "/other/123");
    expect(result).toEqual(["/other/:param", "otherHandler"]);
  });

  it("should throw an error when routes object is not an object", () => {
    expect(() => getRoute(null, "/test")).toThrow(
      "Invalid routes. Expected an object."
    );
  });

  it("should throw an error when path is not a string", () => {
    expect(() => getRoute(routes, null)).toThrow(
      "Invalid path. Expected a string."
    );
  });

  it("should throw an error when both routes object and path are not valid", () => {
    expect(() => getRoute(null, null)).toThrow(
      "Invalid routes. Expected an object."
    );
  });
});

describe("getRouteParams", () => {
  it("should return an object with the correct parameters", () => {
    const routePath = "/test/:id";
    const path = "/test/123";
    const result = getRouteParams(routePath, path);
    expect(result).toEqual({ id: "123" });
  });

  it("should return an empty object when there are no parameters", () => {
    const routePath = "/test";
    const path = "/test";
    const result = getRouteParams(routePath, path);
    expect(result).toEqual({});
  });

  it("should throw an error when routePath is not a string", () => {
    expect(() => getRouteParams(null, "/test")).toThrow(
      "Invalid routePath. Expected a string."
    );
  });

  it("should throw an error when path is not a string", () => {
    expect(() => getRouteParams("/test", null)).toThrow(
      "Invalid path. Expected a string."
    );
  });

  it("should throw an error when both routePath and path are not strings", () => {
    expect(() => getRouteParams(null, null)).toThrow(
      "Invalid routePath. Expected a string."
    );
  });
});

describe("getQueryParams", () => {
  it("should return an object with the correct parameters", () => {
    const querystring = "param1=value1&param2=value2";
    const result = getQueryParams(querystring);
    expect(result).toEqual({ param1: "value1", param2: "value2" });
  });

  it("should return an empty object when there are no parameters", () => {
    const querystring = "";
    const result = getQueryParams(querystring);
    expect(result).toEqual({});
  });

  it("should return an empty object when querystring is not a string", () => {
    const result = getQueryParams(null);
    expect(result).toEqual({});
  });
});
