require("dotenv").config();
const express = require("express");
const app = express();
const { createClient } = require("@supabase/supabase-js");

app.use(express.json());
app.set("trust proxy", true);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

app.post("/checkin", async (req, res) => {
  const ip = req.ip;
  console.log("User IP:", ip);

  res.json({ message: "Check-in successful!" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
