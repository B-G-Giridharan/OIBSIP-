CREATE DATABASE IF NOT EXISTS train_reservation
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE train_reservation;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_username (username)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trains (
    id BIGINT NOT NULL AUTO_INCREMENT,
    train_number VARCHAR(32) NOT NULL,
    train_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_trains_train_number (train_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reservations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    pnr VARCHAR(32) NOT NULL,
    user_id BIGINT NOT NULL,
    passenger_name VARCHAR(255) NOT NULL,
    train_number VARCHAR(32) NOT NULL,
    train_name VARCHAR(255) NOT NULL,
    class_type VARCHAR(64) NOT NULL,
    journey_date DATE NOT NULL,
    source_station VARCHAR(255) NOT NULL,
    destination_station VARCHAR(255) NOT NULL,
    booking_status VARCHAR(32) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_reservations_pnr (pnr),
    KEY idx_reservations_user_id (user_id),
    KEY idx_reservations_train_number (train_number),
    KEY idx_reservations_journey_date (journey_date),
    CONSTRAINT fk_reservations_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reservations_train
        FOREIGN KEY (train_number) REFERENCES trains (train_number)
) ENGINE=InnoDB;
