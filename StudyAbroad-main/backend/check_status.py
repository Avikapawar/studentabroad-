"""
Check Platform Status
Quick status check for your Study Abroad platform
"""
import os

def check_status():
    """Check the status of the platform"""
    print("📋 STUDY ABROAD PLATFORM STATUS")
    print("=" * 50)
    
    # Check Firebase
    firebase_file = "config/firebase-service-account.json"
    firebase_status = "✅ Connected" if os.path.exists(firebase_file) else "❌ Not found"
    print(f"🔥 Firebase: {firebase_status}")
    
    # Check JSON data
    json_unis = "data/universities.json"
    json_countries = "data/countries.json"
    json_status = "✅ Available" if (os.path.exists(json_unis) and os.path.exists(json_countries)) else "❌ Missing"
    print(f"📁 JSON Data: {json_status}")
    
    # Check Flask app
    flask_app = "app.py"
    flask_status = "✅ Ready" if os.path.exists(flask_app) else "❌ Missing"
    print(f"🌐 Flask App: {flask_status}")
    
    print("\n📊 DATA SUMMARY:")
    
    # Count data if available
    if os.path.exists(json_unis):
        try:
            import json
            with open(json_unis, 'r', encoding='utf-8') as f:
                unis = json.load(f)
            print(f"   Universities: {len(unis)}")
        except:
            print("   Universities: Error reading")
    
    if os.path.exists(json_countries):
        try:
            import json
            with open(json_countries, 'r', encoding='utf-8') as f:
                countries = json.load(f)
            print(f"   Countries: {len(countries)}")
        except:
            print("   Countries: Error reading")
    
    # Overall status
    print("\n🎯 OVERALL STATUS:")
    if firebase_status == "✅ Connected" and json_status == "✅ Available" and flask_status == "✅ Ready":
        print("   🎉 EXCELLENT: All systems operational!")
        print("   🚀 Your platform is ready for production")
        print("\n📝 To start your platform:")
        print("   python app.py")
    elif json_status == "✅ Available" and flask_status == "✅ Ready":
        print("   ✅ GOOD: Platform ready")
        print("   📝 Firebase integrated and working")
        print("\n📝 To start your platform:")
        print("   python app.py")
    else:
        print("   ⚠️  ISSUES: Some components missing")
        print("   📝 Check the status above and fix missing components")

if __name__ == "__main__":
    check_status()