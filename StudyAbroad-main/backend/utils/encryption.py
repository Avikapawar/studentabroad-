"""
Data encryption utilities for protecting sensitive user information
"""

import os
import base64
import hashlib
import secrets
from typing import Optional, Union, Dict, Any
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import json
import logging

logger = logging.getLogger(__name__)

class EncryptionError(Exception):
    """Custom exception for encryption-related errors"""
    pass

class DataEncryption:
    """Comprehensive data encryption utilities"""
    
    def __init__(self, key: Optional[bytes] = None):
        """Initialize encryption with key"""
        if key is None:
            key = os.getenv('ENCRYPTION_KEY', '').encode()
            if not key:
                # Generate a new key if none provided
                key = Fernet.generate_key()
                logger.warning("No encryption key provided, generated new key")
        
        if isinstance(key, str):
            key = key.encode()
        
        self.key = key
        self.fernet = Fernet(key)
    
    def encrypt_string(self, plaintext: str) -> str:
        """Encrypt a string and return base64 encoded result"""
        try:
            if not isinstance(plaintext, str):
                plaintext = str(plaintext)
            
            encrypted_data = self.fernet.encrypt(plaintext.encode())
            return base64.b64encode(encrypted_data).decode()
        except Exception as e:
            logger.error(f"Encryption failed: {str(e)}")
            raise EncryptionError(f"Failed to encrypt data: {str(e)}")
    
    def decrypt_string(self, encrypted_data: str) -> str:
        """Decrypt base64 encoded encrypted data"""
        try:
            encrypted_bytes = base64.b64decode(encrypted_data.encode())
            decrypted_data = self.fernet.decrypt(encrypted_bytes)
            return decrypted_data.decode()
        except Exception as e:
            logger.error(f"Decryption failed: {str(e)}")
            raise EncryptionError(f"Failed to decrypt data: {str(e)}")
    
    def encrypt_dict(self, data: Dict[str, Any]) -> str:
        """Encrypt a dictionary as JSON"""
        try:
            json_data = json.dumps(data, sort_keys=True)
            return self.encrypt_string(json_data)
        except Exception as e:
            logger.error(f"Dictionary encryption failed: {str(e)}")
            raise EncryptionError(f"Failed to encrypt dictionary: {str(e)}")
    
    def decrypt_dict(self, encrypted_data: str) -> Dict[str, Any]:
        """Decrypt encrypted JSON data back to dictionary"""
        try:
            json_data = self.decrypt_string(encrypted_data)
            return json.loads(json_data)
        except Exception as e:
            logger.error(f"Dictionary decryption failed: {str(e)}")
            raise EncryptionError(f"Failed to decrypt dictionary: {str(e)}")
    
    def encrypt_file(self, file_path: str, output_path: Optional[str] = None) -> str:
        """Encrypt a file"""
        try:
            if output_path is None:
                output_path = file_path + '.encrypted'
            
            with open(file_path, 'rb') as file:
                file_data = file.read()
            
            encrypted_data = self.fernet.encrypt(file_data)
            
            with open(output_path, 'wb') as encrypted_file:
                encrypted_file.write(encrypted_data)
            
            return output_path
        except Exception as e:
            logger.error(f"File encryption failed: {str(e)}")
            raise EncryptionError(f"Failed to encrypt file: {str(e)}")
    
    def decrypt_file(self, encrypted_file_path: str, output_path: Optional[str] = None) -> str:
        """Decrypt a file"""
        try:
            if output_path is None:
                output_path = encrypted_file_path.replace('.encrypted', '')
            
            with open(encrypted_file_path, 'rb') as encrypted_file:
                encrypted_data = encrypted_file.read()
            
            decrypted_data = self.fernet.decrypt(encrypted_data)
            
            with open(output_path, 'wb') as file:
                file.write(decrypted_data)
            
            return output_path
        except Exception as e:
            logger.error(f"File decryption failed: {str(e)}")
            raise EncryptionError(f"Failed to decrypt file: {str(e)}")

class FieldEncryption:
    """Field-level encryption for database columns"""
    
    def __init__(self, encryption_key: Optional[bytes] = None):
        self.encryptor = DataEncryption(encryption_key)
    
    def encrypt_field(self, value: Any, field_name: str = "field") -> Optional[str]:
        """Encrypt a database field value"""
        if value is None:
            return None
        
        try:
            return self.encryptor.encrypt_string(str(value))
        except Exception as e:
            logger.error(f"Field encryption failed for {field_name}: {str(e)}")
            raise EncryptionError(f"Failed to encrypt {field_name}")
    
    def decrypt_field(self, encrypted_value: Optional[str], field_name: str = "field") -> Optional[str]:
        """Decrypt a database field value"""
        if encrypted_value is None:
            return None
        
        try:
            return self.encryptor.decrypt_string(encrypted_value)
        except Exception as e:
            logger.error(f"Field decryption failed for {field_name}: {str(e)}")
            # Return None instead of raising exception to handle corrupted data gracefully
            return None

class PasswordSecurity:
    """Enhanced password security utilities"""
    
    @staticmethod
    def generate_salt(length: int = 32) -> str:
        """Generate a random salt"""
        return secrets.token_hex(length)
    
    @staticmethod
    def hash_password_pbkdf2(password: str, salt: Optional[str] = None, iterations: int = 100000) -> tuple:
        """Hash password using PBKDF2"""
        if salt is None:
            salt = PasswordSecurity.generate_salt()
        
        if isinstance(salt, str):
            salt_bytes = salt.encode()
        else:
            salt_bytes = salt
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt_bytes,
            iterations=iterations,
            backend=default_backend()
        )
        
        password_hash = base64.b64encode(kdf.derive(password.encode())).decode()
        return password_hash, salt
    
    @staticmethod
    def verify_password_pbkdf2(password: str, password_hash: str, salt: str, iterations: int = 100000) -> bool:
        """Verify password against PBKDF2 hash"""
        try:
            computed_hash, _ = PasswordSecurity.hash_password_pbkdf2(password, salt, iterations)
            return secrets.compare_digest(computed_hash, password_hash)
        except Exception as e:
            logger.error(f"Password verification failed: {str(e)}")
            return False
    
    @staticmethod
    def generate_secure_password(length: int = 16) -> str:
        """Generate a secure random password"""
        alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
        return ''.join(secrets.choice(alphabet) for _ in range(length))

class TokenSecurity:
    """Secure token generation and validation"""
    
    @staticmethod
    def generate_secure_token(length: int = 32) -> str:
        """Generate a cryptographically secure token"""
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def generate_api_key(prefix: str = "sk", length: int = 32) -> str:
        """Generate an API key with prefix"""
        token = TokenSecurity.generate_secure_token(length)
        return f"{prefix}_{token}"
    
    @staticmethod
    def hash_token(token: str) -> str:
        """Hash a token for secure storage"""
        return hashlib.sha256(token.encode()).hexdigest()
    
    @staticmethod
    def verify_token_hash(token: str, token_hash: str) -> bool:
        """Verify token against its hash"""
        computed_hash = TokenSecurity.hash_token(token)
        return secrets.compare_digest(computed_hash, token_hash)

class DataAnonymization:
    """Data anonymization utilities for GDPR compliance"""
    
    @staticmethod
    def anonymize_email(email: str) -> str:
        """Anonymize email address"""
        if '@' not in email:
            return "anonymized@example.com"
        
        local, domain = email.split('@', 1)
        if len(local) <= 2:
            anonymized_local = 'xx'
        else:
            anonymized_local = local[0] + 'x' * (len(local) - 2) + local[-1]
        
        return f"{anonymized_local}@{domain}"
    
    @staticmethod
    def anonymize_name(name: str) -> str:
        """Anonymize a name"""
        if not name or len(name) <= 2:
            return "Anonymous"
        
        return name[0] + '*' * (len(name) - 2) + name[-1]
    
    @staticmethod
    def anonymize_phone(phone: str) -> str:
        """Anonymize phone number"""
        if not phone or len(phone) <= 4:
            return "****"
        
        return phone[:2] + '*' * (len(phone) - 4) + phone[-2:]
    
    @staticmethod
    def generate_anonymous_id() -> str:
        """Generate anonymous user ID"""
        return f"anon_{secrets.token_hex(8)}"

class SecureStorage:
    """Secure storage utilities"""
    
    def __init__(self, storage_path: str = "secure_storage"):
        self.storage_path = storage_path
        self.encryptor = DataEncryption()
        
        # Create storage directory if it doesn't exist
        os.makedirs(storage_path, exist_ok=True)
    
    def store_encrypted(self, key: str, data: Any) -> bool:
        """Store data encrypted"""
        try:
            file_path = os.path.join(self.storage_path, f"{key}.enc")
            
            if isinstance(data, dict):
                encrypted_data = self.encryptor.encrypt_dict(data)
            else:
                encrypted_data = self.encryptor.encrypt_string(str(data))
            
            with open(file_path, 'w') as f:
                f.write(encrypted_data)
            
            return True
        except Exception as e:
            logger.error(f"Secure storage failed: {str(e)}")
            return False
    
    def retrieve_encrypted(self, key: str, as_dict: bool = False) -> Optional[Any]:
        """Retrieve encrypted data"""
        try:
            file_path = os.path.join(self.storage_path, f"{key}.enc")
            
            if not os.path.exists(file_path):
                return None
            
            with open(file_path, 'r') as f:
                encrypted_data = f.read()
            
            if as_dict:
                return self.encryptor.decrypt_dict(encrypted_data)
            else:
                return self.encryptor.decrypt_string(encrypted_data)
        except Exception as e:
            logger.error(f"Secure retrieval failed: {str(e)}")
            return None
    
    def delete_encrypted(self, key: str) -> bool:
        """Delete encrypted data"""
        try:
            file_path = os.path.join(self.storage_path, f"{key}.enc")
            if os.path.exists(file_path):
                os.remove(file_path)
            return True
        except Exception as e:
            logger.error(f"Secure deletion failed: {str(e)}")
            return False

# Global instances
default_encryptor = DataEncryption()
field_encryptor = FieldEncryption()
secure_storage = SecureStorage()

# Utility functions
def encrypt_sensitive_data(data: str) -> str:
    """Encrypt sensitive data using default encryptor"""
    return default_encryptor.encrypt_string(data)

def decrypt_sensitive_data(encrypted_data: str) -> str:
    """Decrypt sensitive data using default encryptor"""
    return default_encryptor.decrypt_string(encrypted_data)

def generate_encryption_key() -> bytes:
    """Generate a new encryption key"""
    return Fernet.generate_key()

def is_encrypted(data: str) -> bool:
    """Check if data appears to be encrypted"""
    try:
        # Try to decode as base64
        base64.b64decode(data)
        # If it's valid base64 and has the right length, it might be encrypted
        return len(data) > 50 and '=' in data[-4:]
    except:
        return False