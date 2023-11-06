import http from "node:http";
import { randomUUID } from "node:crypto";
import packageJson from "../package.json" assert { type: "json" };

import Database from "./database.js";

const routes = {
  "/": {
    GET: (_req, res) => {
      return res
        .writeHead(200, {
          "Content-Type": "text/plain",
        })
        .end(`Task Manager API v${packageJson.version}`);
    },
  },
  "/tasks": {
    GET: (_req, res) => {
      const tasks = Database.select("tasks");

      return res
        .writeHead(200, {
          "Content-Type": "application/json",
        })
        .end(JSON.stringify(tasks));
    },
    POST: (req, res) => {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        const { title, description } = JSON.parse(body);

        if (!title) {
          return res
            .writeHead(400, {
              "Content-Type": "application/json",
            })
            .end(JSON.stringify({ error: "Title is required" }));
        }

        if (typeof title !== "string") {
          return res
            .writeHead(400, {
              "Content-Type": "application/json",
            })
            .end(JSON.stringify({ error: "Title must be a string" }));
        }

        if (!description) {
          return res
            .writeHead(400, {
              "Content-Type": "application/json",
            })
            .end(JSON.stringify({ error: "Description is required" }));
        }

        if (typeof description !== "string") {
          return res
            .writeHead(400, {
              "Content-Type": "application/json",
            })
            .end(JSON.stringify({ error: "Description must be a string" }));
        }

        const today = new Date().toISOString();

        const task = {
          id: randomUUID(),
          title,
          description,
          completed_at: null,
          created_at: today,
          updated_at: today,
        };

        await Database.insert("tasks", task);

        res
          .writeHead(201, {
            "Content-Type": "application/json",
          })
          .end(JSON.stringify(task));
      });
    },
  },
};

const server = http
  .createServer((req, res) => {
    const { url, method } = req;

    if (routes[url] && routes[url][method]) {
      return routes[url][method](req, res);
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
