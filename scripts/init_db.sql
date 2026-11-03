-- AccountPulse: Banking Transaction Analysis System
-- Academic Project 16 MySQL Schema Initializer
-- Database: banking_analysis

CREATE DATABASE IF NOT EXISTS `banking_analysis` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `banking_analysis`;

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS `customers` (
    `customer_id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_customers_username` (`username`),
    INDEX `idx_customers_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Accounts Table
CREATE TABLE IF NOT EXISTS `accounts` (
    `account_id` INT AUTO_INCREMENT PRIMARY KEY,
    `account_number` VARCHAR(20) NOT NULL UNIQUE,
    `customer_id` INT NOT NULL,
    `account_type` VARCHAR(20) NOT NULL DEFAULT 'Savings',
    `balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_accounts_number` (`account_number`),
    INDEX `idx_accounts_customer` (`customer_id`),
    CONSTRAINT `fk_accounts_customer` FOREIGN KEY (`customer_id`)
        REFERENCES `customers` (`customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Transactions Table
CREATE TABLE IF NOT EXISTS `transactions` (
    `transaction_id` VARCHAR(40) PRIMARY KEY,
    `account_id` INT NOT NULL,
    `transaction_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `transaction_type` VARCHAR(15) NOT NULL,
    `amount` DECIMAL(15,2) NOT NULL,
    `description` VARCHAR(255) NULL,
    `balance_after` DECIMAL(15,2) NOT NULL,
    INDEX `idx_transactions_account` (`account_id`),
    INDEX `idx_transactions_date` (`transaction_date`),
    CONSTRAINT `fk_transactions_account` FOREIGN KEY (`account_id`)
        REFERENCES `accounts` (`account_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Transaction Flags Table (Educational Anomaly Review)
CREATE TABLE IF NOT EXISTS `transaction_flags` (
    `flag_id` VARCHAR(40) PRIMARY KEY,
    `transaction_id` VARCHAR(40) NOT NULL,
    `rule_name` VARCHAR(60) NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `review_status` VARCHAR(25) NOT NULL DEFAULT 'PENDING_REVIEW',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_flags_transaction` (`transaction_id`),
    CONSTRAINT `fk_flags_transaction` FOREIGN KEY (`transaction_id`)
        REFERENCES `transactions` (`transaction_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
