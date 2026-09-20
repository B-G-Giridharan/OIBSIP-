const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { initializeDatabase, closeDatabase } = require("./db/database");
const authRoutes = require("./routes/auth");
const trainRoutes = require("./routes/trains");
const reservationRoutes = require("./routes/reservations");
const { notFound, errorHandler } = require("./middleware/errorHandler");

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

async function startServer() {
  await initializeDatabase();
  const server = app.listen(PORT, () => {
    console.log(`RailReserve API running at http://localhost:${PORT}`);
    console.log(`MySQL database: ${process.env.MYSQL_DATABASE || "train_reservation"}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

startServer().catch((error) => {
  console.error("Unable to start RailReserve API:", error.message);
  process.exit(1);
});
