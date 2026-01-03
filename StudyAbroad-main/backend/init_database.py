#!/usr/bin/env python3
"""
Database initialization script for Student Abroad Platform
Creates all necessary tables for users, bookmarks, recommendations, and preferences
"""

import os
import sys
from models.database import db_manager

def main():
    """Initialize the database with all tables"""
    try:
        print("Initializing Student Abroad Platform database...")
        
        # Ensure database directory exists
        db_dir = os.path.dirname('database/student_abroad.db')
        if not os.path.exists(db_dir):
            os.makedirs(db_dir)
            print(f"Created database directory: {db_dir}")
        
        # Initialize database
        engine = db_manager.initialize_database()
        
        print("Database initialization completed successfully!")
        print(f"Database location: {db_manager.database_url}")
        
        # Verify tables were created
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print("\nCreated tables:")
        for table in sorted(tables):
            print(f"  - {table}")
            
    except Exception as e:
        print(f"Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()