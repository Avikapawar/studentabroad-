"""
Update University Data
Comprehensive tool for updating university information, fees, and requirements
"""

import json
from datetime import datetime
import requests
from typing import Dict, List, Any

def update_tuition_fees():
    """Update tuition fees with latest data"""
    print("💰 UPDATING TUITION FEES")
    print("=" * 40)
    
    try:
        # Load current data
        with open('data/universities.json', 'r', encoding='utf-8') as f:
            universities = json.load(f)
        
        # Sample tuition fee updates (you can expand this with real data sources)
        tuition_updates = {
            "Harvard University": 56550,
            "Stanford University": 58416,
            "MIT": 59750,
            "Yale University": 62250,
            "Princeton University": 59710,
            "Columbia University": 65524,
            "University of Pennsylvania": 63452,
            "University of Chicago": 64965,
            "California Institute of Technology": 60864,
            "Duke University": 63450,
            "Northwestern University": 63468,
            "Johns Hopkins University": 60480,
            "Cornell University": 63200,
            "Carnegie Mellon University": 61344,
            "University of California, Berkeley": 46374,
            "University of California, Los Angeles": 46326,
            "University of Michigan": 53232,
            "New York University": 58168,
            "University of Virginia": 56837,
            "Georgetown University": 62052
        }
        
        updated_count = 0
        for university in universities:
            uni_name = university.get('name', '')
            if uni_name in tuition_updates:
                old_fee = university.get('tuition_fee', 'N/A')
                new_fee = tuition_updates[uni_name]
                university['tuition_fee'] = new_fee
                university['tuition_updated'] = datetime.now().isoformat()
                updated_count += 1
                print(f"   ✅ {uni_name}: ${old_fee:,} → ${new_fee:,}")
        
        # Save updated data
        with open('data/universities.json', 'w', encoding='utf-8') as f:
            json.dump(universities, f, indent=2, ensure_ascii=False)
        
        print(f"\n📊 Updated {updated_count} tuition fees")
        return True
        
    except Exception as e:
        print(f"❌ Error updating tuition fees: {e}")
        return False

def update_admission_requirements():
    """Update admission requirements"""
    print("\n📋 UPDATING ADMISSION REQUIREMENTS")
    print("=" * 45)
    
    try:
        with open('data/universities.json', 'r', encoding='utf-8') as f:
            universities = json.load(f)
        
        # Sample requirement updates
        requirement_updates = {
            "Harvard University": {
                "min_gre": 325,
                "min_ielts": 7.5,
                "min_toefl": 109,
                "min_cgpa": 3.9
            },
            "Stanford University": {
                "min_gre": 330,
                "min_ielts": 7.5,
                "min_toefl": 110,
                "min_cgpa": 3.9
            },
            "MIT": {
                "min_gre": 335,
                "min_ielts": 7.5,
                "min_toefl": 110,
                "min_cgpa": 3.9
            },
            "Yale University": {
                "min_gre": 325,
                "min_ielts": 7.0,
                "min_toefl": 100,
                "min_cgpa": 3.8
            },
            "Princeton University": {
                "min_gre": 330,
                "min_ielts": 7.0,
                "min_toefl": 108,
                "min_cgpa": 3.9
            }
        }
        
        updated_count = 0
        for university in universities:
            uni_name = university.get('name', '')
            if uni_name in requirement_updates:
                updates = requirement_updates[uni_name]
                for key, value in updates.items():
                    university[key] = value
                university['requirements_updated'] = datetime.now().isoformat()
                updated_count += 1
                print(f"   ✅ {uni_name}: Requirements updated")
        
        # Save updated data
        with open('data/universities.json', 'w', encoding='utf-8') as f:
            json.dump(universities, f, indent=2, ensure_ascii=False)
        
        print(f"\n📊 Updated {updated_count} admission requirements")
        return True
        
    except Exception as e:
        print(f"❌ Error updating requirements: {e}")
        return False

def add_new_universities(new_unis: List[Dict[str, Any]]):
    """Add new universities to the database"""
    print(f"\n🏫 ADDING {len(new_unis)} NEW UNIVERSITIES")
    print("=" * 50)
    
    try:
        with open('data/universities.json', 'r', encoding='utf-8') as f:
            universities = json.load(f)
        
        # Get next ID
        next_id = max(uni['id'] for uni in universities) + 1
        
        # Add new universities
        for i, new_uni in enumerate(new_unis):
            new_uni['id'] = next_id + i
            new_uni['created_at'] = datetime.now().isoformat()
            new_uni['data_source'] = 'Manual Addition'
            universities.append(new_uni)
            print(f"   ✅ Added: {new_uni['name']} ({new_uni['country']})")
        
        # Save updated data
        with open('data/universities.json', 'w', encoding='utf-8') as f:
            json.dump(universities, f, indent=2, ensure_ascii=False)
        
        print(f"\n📊 Total universities: {len(universities)}")
        return True
        
    except Exception as e:
        print(f"❌ Error adding universities: {e}")
        return False

def update_university_info(university_name: str, updates: Dict[str, Any]):
    """Update specific university information"""
    print(f"\n🔄 UPDATING {university_name}")
    print("=" * 50)
    
    try:
        with open('data/universities.json', 'r', encoding='utf-8') as f:
            universities = json.load(f)
        
        # Find and update university
        updated = False
        for university in universities:
            if university.get('name', '').lower() == university_name.lower():
                for key, value in updates.items():
                    old_value = university.get(key, 'N/A')
                    university[key] = value
                    print(f"   ✅ {key}: {old_value} → {value}")
                
                university['updated_at'] = datetime.now().isoformat()
                updated = True
                break
        
        if updated:
            # Save updated data
            with open('data/universities.json', 'w', encoding='utf-8') as f:
                json.dump(universities, f, indent=2, ensure_ascii=False)
            print(f"\n✅ {university_name} updated successfully")
        else:
            print(f"\n❌ University '{university_name}' not found")
        
        return updated
        
    except Exception as e:
        print(f"❌ Error updating university: {e}")
        return False

def validate_data():
    """Validate university data for consistency"""
    print("\n🔍 VALIDATING DATA")
    print("=" * 30)
    
    try:
        with open('data/universities.json', 'r', encoding='utf-8') as f:
            universities = json.load(f)
        
        issues = []
        
        for uni in universities:
            uni_name = uni.get('name', 'Unknown')
            
            # Check required fields
            required_fields = ['name', 'country', 'city', 'ranking', 'fields']
            for field in required_fields:
                if not uni.get(field):
                    issues.append(f"{uni_name}: Missing {field}")
            
            # Check data types
            if uni.get('tuition_fee') and not isinstance(uni['tuition_fee'], (int, float)):
                issues.append(f"{uni_name}: Invalid tuition_fee type")
            
            if uni.get('ranking') and not isinstance(uni['ranking'], int):
                issues.append(f"{uni_name}: Invalid ranking type")
            
            # Check ranges
            if uni.get('min_cgpa') and (uni['min_cgpa'] < 0 or uni['min_cgpa'] > 4):
                issues.append(f"{uni_name}: Invalid CGPA range")
            
            if uni.get('min_ielts') and (uni['min_ielts'] < 0 or uni['min_ielts'] > 9):
                issues.append(f"{uni_name}: Invalid IELTS range")
        
        if issues:
            print("⚠️  Data Issues Found:")
            for issue in issues[:10]:  # Show first 10 issues
                print(f"   • {issue}")
            if len(issues) > 10:
                print(f"   ... and {len(issues) - 10} more issues")
        else:
            print("✅ All data validation checks passed")
        
        return len(issues) == 0
        
    except Exception as e:
        print(f"❌ Error validating data: {e}")
        return False

def backup_data():
    """Create backup of current data"""
    print("\n💾 CREATING BACKUP")
    print("=" * 25)
    
    try:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f"data/universities_backup_{timestamp}.json"
        
        with open('data/universities.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        with open(backup_filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Backup created: {backup_filename}")
        return backup_filename
        
    except Exception as e:
        print(f"❌ Error creating backup: {e}")
        return None

def main():
    """Main function for data updates"""
    print("🚀 UNIVERSITY DATA UPDATER")
    print("=" * 60)
    
    # Create backup first
    backup_file = backup_data()
    if not backup_file:
        print("❌ Failed to create backup. Aborting updates.")
        return False
    
    # Update data
    success = True
    success &= update_tuition_fees()
    success &= update_admission_requirements()
    
    # Validate data
    validate_data()
    
    if success:
        print("\n✅ Data update completed successfully!")
        print(f"💾 Backup available: {backup_file}")
    else:
        print("\n❌ Some updates failed!")
    
    return success

# Example usage functions
def example_add_university():
    """Example of adding a new university"""
    new_university = {
        "name": "Example University",
        "country": "US",
        "city": "Example City",
        "state": "California",
        "ranking": 150,
        "fields": ["Computer Science", "Engineering"],
        "tuition_fee": 45000,
        "living_cost": 15000,
        "application_fee": 100,
        "min_cgpa": 3.5,
        "min_gre": 310,
        "min_ielts": 6.5,
        "min_toefl": 90,
        "acceptance_rate": 0.45,
        "website": "https://www.example.edu",
        "established": 1950,
        "type": "Public",
        "student_population": 25000,
        "international_students": 20
    }
    
    return add_new_universities([new_university])

def example_update_university():
    """Example of updating university information"""
    updates = {
        "tuition_fee": 50000,
        "min_gre": 315,
        "acceptance_rate": 0.40
    }
    
    return update_university_info("Harvard University", updates)

if __name__ == "__main__":
    main()