# Java MySQL Database Layer

This is a JDBC connectivity starter for the unavailable Java Swing application. It does not recreate the GUI or DAO workflows.

## Configuration

The connection uses:

- URL: `jdbc:mysql://localhost:3306/train_reservation?useSSL=false&serverTimezone=UTC`
- User: `MYSQL_USER` environment variable, default `root`
- Password: required `MYSQL_PASSWORD` environment variable

Run `schema.sql` in MySQL Workbench first.

## Build and test

From this directory:

```powershell
$env:MYSQL_PASSWORD = "your-mysql-password"
$env:MYSQL_USER = "root"
mvn clean compile
mvn exec:java
```

The test prints either `MySQL connection succeeded.` or a failure message without displaying the password.
