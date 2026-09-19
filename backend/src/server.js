const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { initializeDatabase } = require("./db/database");
const authRoutes = require("./routes/auth");
const trainRoutes = require("./routes/trains");
const reservationRoutes = require("./routes/reservations");
const { notFound, errorHandler } = require("./middleware/errorHandler");

initializeDatabase();

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(helmet());
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "RailReserve" });
});

app.use("/api/auth", authRoutes);
app.use("/api/trains", trainRoutes);
app.use("/api/reservations", reservationRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`RailReserve API running at http://localhost:${PORT}`);
  console.log(`SQLite file: ${path.join(__dirname, "..", "data", "railreserve.db")}`);
});
