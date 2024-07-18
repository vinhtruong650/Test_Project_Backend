const express = require("express");
const mysql = require("mysql2");
const dbConfig = require("./db/config");
const cors = require("cors");
const { body, validationResult } = require("express-validator");

const app = express();
const port = 3333;

const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
});

connection.connect((error) => {
  if (error) throw error;
  console.log("Connected to the database.");
});

app.use(cors());

app.use(express.json());

app.post("/api/webhook-integrations", (req, res) => {
  if (!req.body.type || req.body.type !== "discord") {
    return res.status(400).json({ errors: "Invalid type" });
  }

  if (!req.body.friendlyName) {
    return res.status(400).json({ errors: "Friendly Name is required" });
  }

  if (!req.body.webhookUrl) {
    return res.status(400).json({ errors: "Webhook Url is required" });
  }

  const data = req.body;

  const query = "INSERT INTO webhook_integrations SET ?";

  connection.query(
    query,
    {
      type: data.type,
      friendly_name: data.friendlyName,
      webhook_url: data.webhookUrl,
      bot_display_name: data.botDisplayName,
    },
    (err, results) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({
        message: "Data inserted successfully",
        id: results.insertId,
      });
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
