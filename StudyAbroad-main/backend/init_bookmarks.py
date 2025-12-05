#!/usr/bin/env python3
"""
Initialize bookmark tables in the database
"""

import os
import sys
from sqlalchemy import create_engine, text
from models import get_db_session, init_db
from models.user import Base
from models.bookmark import Bookmark, UserPreference, SearchHistory

def init_bookmark_tables():
    """Initialize bookmark-related tables"""
    try:
        # Initialize the database first
        init_db()
        print("✅ Database initialized successfully!")
        
        # Test database connection
        session = next(get_db_session())
        try:
            # Test query
            result = session.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='bookmarks'"))
            if result.fetchone():
                print("✅ Bookmarks table exists and is accessible")
            else:
                print("❌ Bookmarks table not found")
                
            session.close()
            
        except Exception as e:
            print(f"❌ Database test failed: {e}")
            session.close()
            
    except Exception as e:
        print(f"❌ Failed to initialize bookmark tables: {e}")
        return False
        
    return True

if __name__ == "__main__":
    print("🔧 Initializing bookmark system...")
    success = init_bookmark_tables()
    
    if success:
        print("🎉 Bookmark system initialization complete!")
        sys.exit(0)
    else:
        print("💥 Bookmark system initialization failed!")
        sys.exit(1)