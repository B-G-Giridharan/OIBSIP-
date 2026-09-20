package com.railreserve.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public final class DatabaseConnection {
    private static final String URL =
            "jdbc:mysql://localhost:3306/train_reservation?useSSL=false&serverTimezone=UTC";
    private static final String DEFAULT_USERNAME = "root";
    private static final String USERNAME_VARIABLE = "MYSQL_USER";
    private static final String PASSWORD_VARIABLE = "MYSQL_PASSWORD";

    private DatabaseConnection() {
    }

    public static Connection getConnection() throws SQLException {
        String username = environmentOrDefault(USERNAME_VARIABLE, DEFAULT_USERNAME);
        String password = System.getenv(PASSWORD_VARIABLE);
        if (password == null || password.isBlank()) {
            throw new SQLException(PASSWORD_VARIABLE + " is not set.");
        }
        return DriverManager.getConnection(URL, username, password);
    }

    public static boolean testConnection() {
        try (Connection connection = getConnection()) {
            return connection.isValid(5);
        } catch (SQLException exception) {
            System.err.println("MySQL connection failed: " + exception.getMessage());
            return false;
        }
    }

    private static String environmentOrDefault(String variable, String defaultValue) {
        String value = System.getenv(variable);
        return value == null || value.isBlank() ? defaultValue : value;
    }
}
