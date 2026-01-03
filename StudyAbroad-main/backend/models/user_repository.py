from models.user import User
from models.database import get_db_session

class UserRepository:
    """Simple user repository for database operations"""
    
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        session = next(get_db_session())
        try:
            return session.query(User).filter(User.id == user_id).first()
        finally:
            session.close()
    
    def get_user_by_email(self, email):
        """Get user by email"""
        session = next(get_db_session())
        try:
            return session.query(User).filter(User.email == email).first()
        finally:
            session.close()
    
    def create_user(self, user_data):
        """Create a new user"""
        session = next(get_db_session())
        try:
            user = User(**user_data)
            session.add(user)
            session.commit()
            return user
        finally:
            session.close()
    
    def update_user(self, user_id, user_data):
        """Update user data"""
        session = next(get_db_session())
        try:
            user = session.query(User).filter(User.id == user_id).first()
            if user:
                for key, value in user_data.items():
                    if hasattr(user, key):
                        setattr(user, key, value)
                session.commit()
            return user
        finally:
            session.close()
    
    def delete_user(self, user_id):
        """Delete user"""
        session = next(get_db_session())
        try:
            user = session.query(User).filter(User.id == user_id).first()
            if user:
                session.delete(user)
                session.commit()
                return True
            return False
        finally:
            session.close()