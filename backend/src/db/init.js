const { initializeDatabase, closeDatabase } = require("./database");

initializeDatabase()
	.then(async () => {
		console.log(`MySQL database initialized: ${process.env.MYSQL_DATABASE || "train_reservation"}`);
		await closeDatabase();
	})
	.catch((error) => {
		console.error("MySQL database initialization failed:", error.message);
		process.exit(1);
	});
