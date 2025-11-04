const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database/data_source.db");

const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(8000, () => console.log("Server is running on Port 8000, visit http://localhost:8000/ or https://aus01.safelinks.protection.outlook.com/?url=http%3A%2F%2F127.0.0.1%3A8000%2F&data=05%7C02%7Cian.tang3%40education.nsw.gov.au%7C78c1b0ad77bd4afb06a408de1b616a32%7C05a0e69a418a47c19c259387261bf991%7C0%7C0%7C638978302362515602%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=qzqxVPGlLUpyS0olzF3NdKKsQIqqDWnwNdh%2B%2FfbXXaQ%3D&reserved=0 to access your website"));
