-- Migration to add missing columns for messages functionality
-- Run this script to update the existing tables

-- Add missing columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP;

-- Add missing column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP; 