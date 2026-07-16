const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function run() {
    console.log("Connecting to database:", process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@')); // Hide password in logs
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const sql = fs.readFileSync(path.join(__dirname, 'init_supabase.sql'), 'utf8');
        console.log("Executing init_supabase.sql...");
        await pool.query(sql);
        console.log("Database initialized successfully!");
    } catch (err) {
        console.error("Error initializing database:", err);
    } finally {
        await pool.end();
    }
}

run();
