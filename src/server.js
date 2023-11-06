import http from "node:http";
import packageJson from "../package.json" assert { type: "json" };

import Database from "./database.js";

const routes = {
  "/": {
    GET: (_req, res) => {
      res
        .writeHead(200, {
          "Content-Type": "text/plain",
        })
        .end(`Task Manager API v${packageJson.version}`);
    },
  },
  "/tasks": {
    GET: (_req, res) => {
      const tasks = Database.select("tasks");

      res
        .writeHead(200, {
          "Content-Type": "application/json",
        })
        .end(JSON.stringify(tasks));
    },
  },
};

const server = http
  .createServer((req, res) => {
    const { url, method } = req;

    if (routes[url] && routes[url][method]) {
      return routes[url][method](req, res);
    }

    res
      .writeHead(404, {
        "Content-Type": "text/plain",
      })
      .end("Not Found");
  })
  .listen(3000, () => {
    console.log(`Server is listening on port ${server.address().port}`);
  });
