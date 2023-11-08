/**
 * Creates a regular expression from a route string.
 * The function converts route parameters (e.g., ":userId") into named regular expression groups,
 * allowing the parameters to be extracted from a URL path.
 *
 * @param {string} route - The route string, which may contain parameters like ":userId".
 * @returns {RegExp} The created regular expression, which can be used to match and extract parameters from a URL path.
 */
const createRouteRegex = (route) =>
  new RegExp(`^${route.replaceAll(/:(\w+)/g, "(?<$1>[\\w|\\-]+)")}$`);

/**
 * Finds the matching route for a given path.
 *
 * @param {Object} routes - An object where keys are route patterns and values are route handlers.
 * @param {string} path - The path of an incoming HTTP request.
 * @returns {Array} An array where the first element is the matching route pattern and the
 * second element is the corresponding route handlers. If no match is found, it returns `undefined`.
 */
export const getRoute = (routes, path) => {
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
 */
export const getRouteParams = (routePath, path) => {
  const regex = createRouteRegex(routePath);
  return regex.exec(path).groups;
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
