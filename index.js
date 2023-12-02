import { readFileSync } from "fs";
import routes from "./src/routes.js";
import express from "express";
import cors from "cors";

const app = express();

const WELCOME_PAGE = readFileSync("api-welcome.html", "utf8");

const expressBodyParser = express.json();

app.use(cors({}));

app.use(expressBodyParser);

app.get(["/", "/api/"], (req, res) => {
  res.send(WELCOME_PAGE);
});

app.use("/api/", routes);

app.listen("8000", function () {
  console.log(`ZIMS SERVER STARTED : ${this.address().port}`);
});
