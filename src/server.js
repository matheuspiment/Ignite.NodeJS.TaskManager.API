import http from "node:http";

import { getQueryParams, getRoute, getRouteParams } from "./utils/request.js";
import routes from "./routes.js";

const server = http
  .createServer((req, res) => {
    const [path, querystring] = req.url.split("?");
    const route = getRoute(routes, path);

    if (route) {
      const [routePath, routeHandlers] = route;
      const routeHandler = routeHandlers[req.method];

      if (routeHandler) {
        req.params = getRouteParams(routePath, path);
        req.query = getQueryParams(querystring);

        return routeHandler(req, res);
      }

      return res
        .writeHead(405, {
          "Content-Type": "application/json",
        })
        .end(JSON.stringify({ error: "Method Not Allowed" }));
    }

    return res
      .writeHead(404, {
        "Content-Type": "text/plain",
      })
      .end("Not Found");
  })
  .listen(3000, () => {
    console.log(`Server is listening on port ${server.address().port}`);
  });
