#!/usr/bin/env python3
"""
Test Recommendations Endpoint
Quick test to verify the recommendations API works
"""

import requests
import json

def test_recommendations():
    """Test the recommendations endpoint"""
    print("🧪 TESTING RECOMMENDATIONS ENDPOINT")
    print("=" * 50)
    
    url = "http://localhost:5000/api/recommendations/generate"
    
    # Test data
    payload = {
        "max_recommendations": 10,
        "filters": {},
        "user_profile": {
            "cgpa": 3.5,
            "gre_score": 315,
            "ielts_score": 7.0,
            "field_of_study": "Computer Science",
            "preferred_countries": "US,UK,CA",
            "budget_min": 30000,
            "budget_max": 60000
        }
    }
    
    print(f"\n📤 Sending request to: {url}")
    print(f"📋 Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        
        print(f"\n📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ SUCCESS!")
            print(f"📊 Recommendations received: {len(data.get('recommendations', []))}")
            
            if data.get('recommendations'):
                print(f"\n🎯 Top 5 Recommendations:")
                for i, rec in enumerate(data['recommendations'][:5], 1):
                    print(f"   {i}. {rec.get('name')} ({rec.get('country')})")
                    print(f"      Match Score: {rec.get('match_score', 0):.2f}")
                    print(f"      Admission Probability: {rec.get('admission_probability', 0):.2f}")
                    print()
            
            if data.get('summary'):
                print(f"📈 Summary:")
                summary = data['summary']
                for key, value in summary.items():
                    print(f"   {key}: {value}")
        else:
            print(f"\n❌ ERROR: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print(f"\n❌ CONNECTION ERROR")
        print(f"Make sure Flask app is running: python app.py")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    test_recommendations()