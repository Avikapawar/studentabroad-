#!/usr/bin/env python3
"""
Database migration script to add resume_url column
"""

import sqlite3
import os

def migrate_database():
    """Add resume_url column to users table"""
    
    db_path = os.path.join('database', 'student_abroad.db')
    
    if not os.path.exists(db_path):
        print("❌ Database file not found. Please run the application first to create the database.")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if resume_url column already exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'resume_url' in columns:
            print("✅ resume_url column already exists!")
            return
        
        # Add resume_url column
        cursor.execute("ALTER TABLE users ADD COLUMN resume_url VARCHAR(500)")
        conn.commit()
        
        print("✅ Successfully added resume_url column to users table!")
        
    except Exception as e:
        print(f"❌ Error migrating database: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    migrate_database()