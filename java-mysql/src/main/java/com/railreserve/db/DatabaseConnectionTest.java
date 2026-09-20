package com.railreserve.db;

public final class DatabaseConnectionTest {
    private DatabaseConnectionTest() {
    }

    public static void main(String[] args) {
        if (DatabaseConnection.testConnection()) {
            System.out.println("MySQL connection succeeded.");
            return;
        }
        System.exit(1);
    }
}
