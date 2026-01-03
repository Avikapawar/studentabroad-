#!/usr/bin/env python3
"""
Setup script for Student Abroad Platform
Creates necessary directories and initializes the database
"""

import os
import sqlite3
import json

def create_directories():
    """Create necessary directories for the project"""
    directories = [
        'backend/database',
        'backend/models',
        'backend/data',
        'backend/logs',
        'frontend/public/images',
        'frontend/public/icons'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"Created directory: {directory}")

def initialize_database():
    """Initialize SQLite database with basic schema"""
    db_path = 'backend/database/student_abroad.db'
    
    # Create database connection
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create users table (basic schema for now)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print(f"Initialized database: {db_path}")

def create_sample_data():
    """Create sample data files"""
    
    # Sample countries data
    countries_data = [
        {"code": "US", "name": "United States"},
        {"code": "UK", "name": "United Kingdom"},
        {"code": "CA", "name": "Canada"},
        {"code": "AU", "name": "Australia"},
        {"code": "DE", "name": "Germany"}
    ]
    
    # Sample fields data
    fields_data = [
        {"id": 1, "name": "Computer Science"},
        {"id": 2, "name": "Engineering"},
        {"id": 3, "name": "Business Administration"},
        {"id": 4, "name": "Medicine"},
        {"id": 5, "name": "Law"}
    ]
    
    # Write sample data
    with open('backend/data/countries.json', 'w') as f:
        json.dump(countries_data, f, indent=2)
    
    with open('backend/data/fields.json', 'w') as f:
        json.dump(fields_data, f, indent=2)
    
    print("Created sample data files")

def main():
    """Main setup function"""
    print("Setting up Student Abroad Platform...")
    
    create_directories()
    initialize_database()
    create_sample_data()
    
    print("\nSetup completed successfully!")
    print("Next steps:")
    print("1. Install backend dependencies: cd backend && pip install -r requirements.txt")
    print("2. Install frontend dependencies: cd frontend && npm install")
    print("3. Start the backend: cd backend && python app.py")
    print("4. Start the frontend: cd frontend && npm start")

if __name__ == "__main__":
    main()