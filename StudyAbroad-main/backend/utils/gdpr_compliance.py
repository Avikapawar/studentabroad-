"""
GDPR Compliance utilities for data protection and privacy
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from sqlalchemy import text
from models import get_db_session, User
from utils.encryption import DataAnonymization, secure_storage

logger = logging.getLogger(__name__)

class DataProcessingPurpose(Enum):
    """GDPR data processing purposes"""
    ACCOUNT_MANAGEMENT = "account_management"
    SERVICE_PROVISION = "service_provision"
    COMMUNICATION = "communication"
    ANALYTICS = "analytics"
    MARKETING = "marketing"
    LEGAL_COMPLIANCE = "legal_compliance"
    SECURITY = "security"

class ConsentStatus(Enum):
    """User consent status"""
    GIVEN = "given"
    WITHDRAWN = "withdrawn"
    PENDING = "pending"
    NOT_REQUIRED = "not_required"

@dataclass
class DataProcessingRecord:
    """Record of data processing activity"""
    user_id: int
    purpose: DataProcessingPurpose
    data_categories: List[str]
    legal_basis: str
    consent_status: ConsentStatus
    processing_date: datetime
    retention_period: Optional[int] = None  # days
    third_parties: Optional[List[str]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        data = asdict(self)
        data['purpose'] = self.purpose.value
        data['consent_status'] = self.consent_status.value
        data['processing_date'] = self.processing_date.isoformat()
        return data

@dataclass
class UserDataExport:
    """User data export structure"""
    user_id: int
    export_date: datetime
    personal_data: Dict[str, Any]
    processing_records: List[DataProcessingRecord]
    consent_history: List[Dict[str, Any]]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'user_id': self.user_id,
            'export_date': self.export_date.isoformat(),
            'personal_data': self.personal_data,
            'processing_records': [record.to_dict() for record in self.processing_records],
            'consent_history': self.consent_history
        }

class GDPRCompliance:
    """GDPR compliance management"""
    
    def __init__(self):
        self.data_retention_days = int(os.getenv('DATA_RETENTION_DAYS', '365'))
        self.anonymization_enabled = os.getenv('DATA_ANONYMIZATION_ENABLED', 'true').lower() == 'true'
    
    def record_data_processing(self, user_id: int, purpose: DataProcessingPurpose, 
                             data_categories: List[str], legal_basis: str,
                             consent_status: ConsentStatus = ConsentStatus.NOT_REQUIRED,
                             retention_period: Optional[int] = None,
                             third_parties: Optional[List[str]] = None) -> bool:
        """Record data processing activity"""
        try:
            record = DataProcessingRecord(
                user_id=user_id,
                purpose=purpose,
                data_categories=data_categories,
                legal_basis=legal_basis,
                consent_status=consent_status,
                processing_date=datetime.utcnow(),
                retention_period=retention_period,
                third_parties=third_parties or []
            )
            
            # Store processing record
            key = f"processing_record_{user_id}_{datetime.utcnow().timestamp()}"
            return secure_storage.store_encrypted(key, record.to_dict())
            
        except Exception as e:
            logger.error(f"Failed to record data processing: {str(e)}")
            return False
    
    def get_user_processing_records(self, user_id: int) -> List[DataProcessingRecord]:
        """Get all processing records for a user"""
        try:
            records = []
            storage_path = secure_storage.storage_path
            
            for filename in os.listdir(storage_path):
                if filename.startswith(f"processing_record_{user_id}_") and filename.endswith('.enc'):
                    key = filename.replace('.enc', '')
                    record_data = secure_storage.retrieve_encrypted(key, as_dict=True)
                    if record_data:
                        # Convert back to DataProcessingRecord
                        record_data['purpose'] = DataProcessingPurpose(record_data['purpose'])
                        record_data['consent_status'] = ConsentStatus(record_data['consent_status'])
                        record_data['processing_date'] = datetime.fromisoformat(record_data['processing_date'])
                        records.append(DataProcessingRecord(**record_data))
            
            return sorted(records, key=lambda x: x.processing_date, reverse=True)
            
        except Exception as e:
            logger.error(f"Failed to get processing records: {str(e)}")
            return []
    
    def record_consent(self, user_id: int, purpose: DataProcessingPurpose, 
                      consent_given: bool, consent_method: str = "web_form") -> bool:
        """Record user consent"""
        try:
            consent_record = {
                'user_id': user_id,
                'purpose': purpose.value,
                'consent_given': consent_given,
                'consent_method': consent_method,
                'timestamp': datetime.utcnow().isoformat(),
                'ip_address': 'recorded',  # In real implementation, get from request
                'user_agent': 'recorded'   # In real implementation, get from request
            }
            
            key = f"consent_{user_id}_{purpose.value}_{datetime.utcnow().timestamp()}"
            return secure_storage.store_encrypted(key, consent_record)
            
        except Exception as e:
            logger.error(f"Failed to record consent: {str(e)}")
            return False
    
    def get_user_consent_history(self, user_id: int) -> List[Dict[str, Any]]:
        """Get consent history for a user"""
        try:
            consent_history = []
            storage_path = secure_storage.storage_path
            
            for filename in os.listdir(storage_path):
                if filename.startswith(f"consent_{user_id}_") and filename.endswith('.enc'):
                    key = filename.replace('.enc', '')
                    consent_data = secure_storage.retrieve_encrypted(key, as_dict=True)
                    if consent_data:
                        consent_history.append(consent_data)
            
            return sorted(consent_history, key=lambda x: x['timestamp'], reverse=True)
            
        except Exception as e:
            logger.error(f"Failed to get consent history: {str(e)}")
            return []
    
    def export_user_data(self, user_id: int) -> Optional[UserDataExport]:
        """Export all user data (Right to Data Portability)"""
        try:
            session = next(get_db_session())
            
            try:
                # Get user data
                user = session.query(User).filter_by(id=user_id).first()
                if not user:
                    return None
                
                # Collect personal data
                personal_data = {
                    'id': user.id,
                    'email': user.email,
                    'created_at': user.created_at.isoformat() if user.created_at else None,
                    'updated_at': user.updated_at.isoformat() if user.updated_at else None,
                    # Add other user fields as needed
                }
                
                # Get processing records
                processing_records = self.get_user_processing_records(user_id)
                
                # Get consent history
                consent_history = self.get_user_consent_history(user_id)
                
                export = UserDataExport(
                    user_id=user_id,
                    export_date=datetime.utcnow(),
                    personal_data=personal_data,
                    processing_records=processing_records,
                    consent_history=consent_history
                )
                
                # Log the export request
                self.record_data_processing(
                    user_id=user_id,
                    purpose=DataProcessingPurpose.LEGAL_COMPLIANCE,
                    data_categories=['personal_data', 'processing_records', 'consent_history'],
                    legal_basis='GDPR Article 20 - Right to Data Portability'
                )
                
                return export
                
            finally:
                session.close()
                
        except Exception as e:
            logger.error(f"Failed to export user data: {str(e)}")
            return None
    
    def anonymize_user_data(self, user_id: int) -> bool:
        """Anonymize user data (Right to be Forgotten)"""
        if not self.anonymization_enabled:
            logger.warning("Data anonymization is disabled")
            return False
        
        try:
            session = next(get_db_session())
            
            try:
                user = session.query(User).filter_by(id=user_id).first()
                if not user:
                    return False
                
                # Anonymize user data
                original_email = user.email
                user.email = DataAnonymization.anonymize_email(user.email)
                
                # Add anonymization fields if they exist
                if hasattr(user, 'first_name') and user.first_name:
                    user.first_name = DataAnonymization.anonymize_name(user.first_name)
                
                if hasattr(user, 'last_name') and user.last_name:
                    user.last_name = DataAnonymization.anonymize_name(user.last_name)
                
                if hasattr(user, 'phone') and user.phone:
                    user.phone = DataAnonymization.anonymize_phone(user.phone)
                
                # Mark as anonymized
                if hasattr(user, 'is_anonymized'):
                    user.is_anonymized = True
                
                if hasattr(user, 'anonymized_at'):
                    user.anonymized_at = datetime.utcnow()
                
                session.commit()
                
                # Record the anonymization
                self.record_data_processing(
                    user_id=user_id,
                    purpose=DataProcessingPurpose.LEGAL_COMPLIANCE,
                    data_categories=['personal_data'],
                    legal_basis='GDPR Article 17 - Right to be Forgotten'
                )
                
                logger.info(f"User {user_id} data anonymized (original email: {original_email})")
                return True
                
            except Exception as e:
                session.rollback()
                raise e
            finally:
                session.close()
                
        except Exception as e:
            logger.error(f"Failed to anonymize user data: {str(e)}")
            return False
    
    def delete_user_data(self, user_id: int, hard_delete: bool = False) -> bool:
        """Delete user data (Right to be Forgotten)"""
        try:
            if hard_delete:
                # Hard delete - completely remove from database
                session = next(get_db_session())
                
                try:
                    user = session.query(User).filter_by(id=user_id).first()
                    if user:
                        session.delete(user)
                        session.commit()
                        
                        # Delete processing records and consent history
                        self._delete_user_records(user_id)
                        
                        logger.info(f"User {user_id} hard deleted")
                        return True
                    
                except Exception as e:
                    session.rollback()
                    raise e
                finally:
                    session.close()
            else:
                # Soft delete - anonymize data
                return self.anonymize_user_data(user_id)
                
        except Exception as e:
            logger.error(f"Failed to delete user data: {str(e)}")
            return False
    
    def _delete_user_records(self, user_id: int):
        """Delete user processing records and consent history"""
        try:
            storage_path = secure_storage.storage_path
            
            for filename in os.listdir(storage_path):
                if (filename.startswith(f"processing_record_{user_id}_") or 
                    filename.startswith(f"consent_{user_id}_")) and filename.endswith('.enc'):
                    key = filename.replace('.enc', '')
                    secure_storage.delete_encrypted(key)
                    
        except Exception as e:
            logger.error(f"Failed to delete user records: {str(e)}")
    
    def cleanup_expired_data(self) -> int:
        """Clean up expired data based on retention policy"""
        try:
            cleanup_count = 0
            cutoff_date = datetime.utcnow() - timedelta(days=self.data_retention_days)
            
            session = next(get_db_session())
            
            try:
                # Find users with expired data
                expired_users_query = text("""
                    SELECT id FROM users 
                    WHERE created_at < :cutoff_date 
                    AND (is_anonymized IS NULL OR is_anonymized = FALSE)
                """)
                
                result = session.execute(expired_users_query, {'cutoff_date': cutoff_date})
                expired_user_ids = [row[0] for row in result.fetchall()]
                
                # Anonymize expired user data
                for user_id in expired_user_ids:
                    if self.anonymize_user_data(user_id):
                        cleanup_count += 1
                
                logger.info(f"Cleaned up {cleanup_count} expired user records")
                return cleanup_count
                
            finally:
                session.close()
                
        except Exception as e:
            logger.error(f"Failed to cleanup expired data: {str(e)}")
            return 0
    
    def generate_privacy_report(self) -> Dict[str, Any]:
        """Generate privacy compliance report"""
        try:
            session = next(get_db_session())
            
            try:
                # Count total users
                total_users = session.query(User).count()
                
                # Count anonymized users
                anonymized_query = text("SELECT COUNT(*) FROM users WHERE is_anonymized = TRUE")
                anonymized_count = session.execute(anonymized_query).scalar() or 0
                
                # Count processing records
                storage_path = secure_storage.storage_path
                processing_records_count = len([
                    f for f in os.listdir(storage_path) 
                    if f.startswith('processing_record_') and f.endswith('.enc')
                ])
                
                # Count consent records
                consent_records_count = len([
                    f for f in os.listdir(storage_path) 
                    if f.startswith('consent_') and f.endswith('.enc')
                ])
                
                report = {
                    'report_date': datetime.utcnow().isoformat(),
                    'total_users': total_users,
                    'anonymized_users': anonymized_count,
                    'active_users': total_users - anonymized_count,
                    'processing_records': processing_records_count,
                    'consent_records': consent_records_count,
                    'data_retention_days': self.data_retention_days,
                    'anonymization_enabled': self.anonymization_enabled,
                    'compliance_status': 'compliant' if self.anonymization_enabled else 'partial'
                }
                
                return report
                
            finally:
                session.close()
                
        except Exception as e:
            logger.error(f"Failed to generate privacy report: {str(e)}")
            return {'error': str(e)}

# Global GDPR compliance instance
gdpr_compliance = GDPRCompliance()

# Utility functions
def record_user_consent(user_id: int, purpose: str, consent_given: bool) -> bool:
    """Record user consent for a specific purpose"""
    try:
        purpose_enum = DataProcessingPurpose(purpose)
        return gdpr_compliance.record_consent(user_id, purpose_enum, consent_given)
    except ValueError:
        logger.error(f"Invalid data processing purpose: {purpose}")
        return False

def export_user_data_json(user_id: int) -> Optional[str]:
    """Export user data as JSON string"""
    export = gdpr_compliance.export_user_data(user_id)
    if export:
        return json.dumps(export.to_dict(), indent=2, default=str)
    return None

def request_data_deletion(user_id: int, hard_delete: bool = False) -> bool:
    """Request deletion of user data"""
    return gdpr_compliance.delete_user_data(user_id, hard_delete)

def check_data_retention_compliance() -> Dict[str, Any]:
    """Check data retention compliance"""
    cleanup_count = gdpr_compliance.cleanup_expired_data()
    report = gdpr_compliance.generate_privacy_report()
    
    return {
        'cleanup_performed': cleanup_count > 0,
        'records_cleaned': cleanup_count,
        'compliance_report': report
    }