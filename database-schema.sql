-- KF Legacy Resources - Quotation Requests Table
-- Database: kflr
-- Run this SQL to create the table if it doesn't exist

CREATE TABLE IF NOT EXISTS `quotation_requests` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(50) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `hp_number` VARCHAR(20) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `company_name` VARCHAR(255) DEFAULT NULL,
  `company_address` TEXT DEFAULT NULL,
  `office_tel` VARCHAR(20) DEFAULT NULL,
  `office_fax` VARCHAR(20) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `question` TEXT NOT NULL,
  `attachment_name` VARCHAR(255) DEFAULT NULL,
  `attachment_size` INT(11) DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `reference` VARCHAR(50) NOT NULL UNIQUE,
  `chip_payment_id` VARCHAR(100) DEFAULT NULL,
  `customer_first_name` VARCHAR(100) NOT NULL,
  `customer_last_name` VARCHAR(100) NOT NULL,
  `customer_email` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `customer_address` TEXT NOT NULL,
  `customer_city` VARCHAR(100) NOT NULL,
  `customer_state` VARCHAR(100) DEFAULT NULL,
  `customer_postcode` VARCHAR(20) NOT NULL,
  `customer_country` VARCHAR(10) DEFAULT 'MY',
  `total_amount` DECIMAL(10,2) NOT NULL,
  `refund_amount` DECIMAL(10,2) DEFAULT NULL COMMENT 'Amount refunded (for partial refunds)',
  `currency` VARCHAR(10) DEFAULT 'MYR',
  `status` ENUM('pending', 'viewed', 'paid', 'failed', 'cancelled', 'refunded', 'refund_pending', 'partial_refund') DEFAULT 'pending',
  `payment_method` VARCHAR(50) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `chip_checkout_url` TEXT DEFAULT NULL,
  `customer_bank_account` VARCHAR(50) DEFAULT NULL COMMENT 'Optional bank account for refunds',
  `customer_bank_code` VARCHAR(20) DEFAULT NULL COMMENT 'Bank SWIFT/BIC code',
  `customer_bank_holder_name` VARCHAR(255) DEFAULT NULL COMMENT 'Bank account holder name',
  `paid_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_reference` (`reference`),
  INDEX `idx_email` (`customer_email`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_chip_payment_id` (`chip_payment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items Table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `order_id` INT(11) NOT NULL,
  `product_id` INT(11) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `product_price` DECIMAL(10,2) NOT NULL,
  `quantity` INT(11) NOT NULL DEFAULT 1,
  `selected_options` JSON DEFAULT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_product_id` (`product_id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admins Table (Argon2id + salt)
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Sessions Table (persistent sessions, 24h default)
CREATE TABLE IF NOT EXISTS `admin_sessions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `hash` VARCHAR(128) NOT NULL,
  `username` VARCHAR(191) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_hash` (`hash`),
  INDEX `idx_username` (`username`),
  INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default administrator (idempotent)
INSERT INTO `admins` (`username`, `password_hash`)
VALUES (
  'administrator@root',
  '$argon2id$v=19$m=65536,t=3,p=4$75hqQH5TnhGKhP5JmH596g$D8Ufmb902zgpx+F9ih5LDXESsikpl3hksXo9i1xIuNQ'
)
ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`);

