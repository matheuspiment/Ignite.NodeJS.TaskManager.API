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
    GET: (req, res) => {
      const { search } = req.query;

      const tasks = Database.select(
        "tasks",
        search && {
          title: search,
          description: search,
        }
      );

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
  "/tasks/:id": {
    PUT: (req, res) => {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        const { title, description } = JSON.parse(body);

        if (title && typeof title !== "string") {
          return res
            .writeHead(400, {
              "Content-Type": "application/json",
            })
            .end(JSON.stringify({ error: "Title must be a string" }));
        }

        if (description && typeof description !== "string") {
          return res
            .writeHead(400, {
              "Content-Type": "application/json",
            })
            .end(JSON.stringify({ error: "Description must be a string" }));
        }

        const { id } = req.params;

        const [task] = Database.select("tasks", { id });

        if (!task) {
          return res
            .writeHead(404, {
              "Content-Type": "application/json",
            })
            .end(JSON.stringify({ error: `Task with id ${id} not found` }));
        }

        const updatedTask = {
          ...task,
          title: title || task.title,
          description: description || task.description,
          updated_at: new Date().toISOString(),
        };

        await Database.update("tasks", id, updatedTask);

        return res.writeHead(204).end();
      });
    },
    DELETE: async (req, res) => {
      const { id } = req.params;

      const [task] = Database.select("tasks", { id });

      if (!task) {
        return res
          .writeHead(404, {
            "Content-Type": "application/json",
          })
          .end(JSON.stringify({ error: `Task with id ${id} not found` }));
      }

      await Database.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },
};

const server = http
  .createServer((req, res) => {
    const { url, method } = req;

    const [path, querystring] = url.split("?");

    const route = Object.entries(routes).find(([route]) => {
      const regex = new RegExp(`^${route.replaceAll(/:(\w+)/g, "(?<$1>.+)")}$`);

      return regex.test(path);
    });

    if (route) {
      const [routePath, routeHandlers] = route;

      if (routeHandlers[method]) {
        const regex = new RegExp(
          `^${routePath.replaceAll(/:(\w+)/g, "(?<$1>.+)")}$`
        );

        const routeParams = regex.exec(path);
        req.params = routeParams.groups;

        const searchParams = new URLSearchParams(querystring);
        req.query = Object.fromEntries(searchParams);

        return routeHandlers[method](req, res);
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
