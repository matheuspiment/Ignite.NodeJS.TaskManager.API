/**
 * Creates a regular expression from a route string.
 * The function converts route parameters (e.g., ":userId") into named regular expression groups,
 * allowing the parameters to be extracted from a URL path.
 *
 * @param {string} route - The route string, which may contain parameters like ":userId".
 * @returns {RegExp} The created regular expression, which can be used to match and extract parameters from a URL path.
 * @throws {Error} Throws an error if the provided route is not a string.
 */
export const createRouteRegex = (route) => {
  if (typeof route !== "string") {
    throw new Error("Invalid route. Expected a string.");
  }

  return new RegExp(`^${route.replaceAll(/:(\w+)/g, "(?<$1>[\\w|\\-]+)")}$`);
};

/**
 * Finds the matching route for a given path.
 *
 * @param {Object} routes - An object where the keys are route strings and the values are handlers.
 * @param {string} path - The path to match against the routes.
 * @returns {Array} An array where the first element is the matching route pattern and the
 * second element is the corresponding route handlers. If no match is found, it returns `undefined`.
 * @throws {Error} Throws an error if the routes is not an object or the path is not a string.
 */
export const getRoute = (routes, path) => {
  if (typeof routes !== "object" || routes === null) {
    throw new Error("Invalid routes. Expected an object.");
  }

  if (typeof path !== "string") {
    throw new Error("Invalid path. Expected a string.");
  }

  return Object.entries(routes).find(([route]) => {
    const regex = createRouteRegex(route);
    return regex.test(path);
  });
};

/**
 * Extracts the route parameters from a path.
 *
 * @param {string} routePath - The route path.
 * @param {string} path - The actual path.
 * @returns {Object} The extracted route parameters.
 * @throws {Error} Throws an error if the routePath or path is not a string.
 */
export const getRouteParams = (routePath, path) => {
  if (typeof routePath !== "string") {
    throw new Error("Invalid routePath. Expected a string.");
  }

  if (typeof path !== "string") {
    throw new Error("Invalid path. Expected a string.");
  }

  const regex = createRouteRegex(routePath);
  return regex.exec(path).groups || {};
};

/**
 * Parses the query parameters from a query string.
 *
 * @param {string} querystring - The query string.
 * @returns {Object} The parsed query parameters.
 */
export const getQueryParams = (querystring) => {
  const searchParams = new URLSearchParams(querystring);
  return Object.fromEntries(searchParams);
};
