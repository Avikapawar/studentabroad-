"""
University Database Viewer
Interactive tool to explore and visualize the university database
"""
import json
import os
from collections import Counter, defaultdict
from datetime import datetime

class DatabaseViewer:
    def __init__(self, data_path="data"):
        self.data_path = data_path
        self.universities_file = os.path.join(data_path, "universities.json")
        self.universities = self.load_universities()
    
    def load_universities(self):
        """Load universities from JSON file"""
        try:
            with open(self.universities_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ Database file not found: {self.universities_file}")
            return []
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON: {e}")
            return []
    
    def show_overview(self):
        """Display database overview"""
        print("🎓 UNIVERSITY DATABASE OVERVIEW")
        print("=" * 50)
        
        total = len(self.universities)
        countries = len(set(uni['country'] for uni in self.universities))
        
        print(f"📊 Total Universities: {total}")
        print(f"🌍 Countries: {countries}")
        print(f"📅 Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        if total > 0:
            # Ranking stats
            rankings = [uni['ranking'] for uni in self.universities if uni.get('ranking')]
            if rankings:
                print(f"🏆 Best Ranking: #{min(rankings)}")
                print(f"📈 Average Ranking: #{sum(rankings)/len(rankings):.0f}")
            
            # Tuition stats
            tuitions = [uni['tuition_fee'] for uni in self.universities if uni.get('tuition_fee') is not None]
            if tuitions:
                print(f"💰 Tuition Range: ${min(tuitions):,} - ${max(tuitions):,}")
                print(f"💵 Average Tuition: ${sum(tuitions)/len(tuitions):,.0f}")
        
        print()
    
    def show_by_country(self, limit=None):
        """Display universities grouped by country"""
        print("🌍 UNIVERSITIES BY COUNTRY")
        print("=" * 50)
        
        country_groups = defaultdict(list)
        for uni in self.universities:
            country_groups[uni['country']].append(uni)
        
        # Sort by country code
        for country in sorted(country_groups.keys()):
            unis = country_groups[country]
            print(f"\n🏳️  {country} ({len(unis)} universities):")
            
            # Sort universities by ranking (if available)
            sorted_unis = sorted(unis, key=lambda x: x.get('ranking', 999))
            
            display_unis = sorted_unis[:limit] if limit else sorted_unis
            
            for uni in display_unis:
                ranking = f"#{uni['ranking']}" if uni.get('ranking') else "N/A"
                tuition = f"${uni['tuition_fee']:,}" if uni.get('tuition_fee') is not None else "N/A"
                print(f"   • {uni['name']} - Rank: {ranking}, Tuition: {tuition}")
            
            if limit and len(sorted_unis) > limit:
                print(f"   ... and {len(sorted_unis) - limit} more")
        
        print()
    
    def show_top_universities(self, limit=20):
        """Display top universities by ranking"""
        print(f"🏆 TOP {limit} UNIVERSITIES BY RANKING")
        print("=" * 50)
        
        # Filter universities with rankings and sort
        ranked_unis = [uni for uni in self.universities if uni.get('ranking')]
        top_unis = sorted(ranked_unis, key=lambda x: x['ranking'])[:limit]
        
        for i, uni in enumerate(top_unis, 1):
            tuition = f"${uni['tuition_fee']:,}" if uni.get('tuition_fee') is not None else "Free/N/A"
            fields = ", ".join(uni.get('fields', [])[:3])  # Show first 3 fields
            if len(uni.get('fields', [])) > 3:
                fields += "..."
            
            print(f"{i:2d}. #{uni['ranking']:3d} - {uni['name']}")
            print(f"     🌍 {uni['country']} | 💰 {tuition} | 📚 {fields}")
        
        print()
    
    def show_affordable_options(self, max_tuition=15000):
        """Display affordable universities"""
        print(f"💰 AFFORDABLE UNIVERSITIES (Under ${max_tuition:,})")
        print("=" * 50)
        
        affordable = [uni for uni in self.universities 
                     if uni.get('tuition_fee') is not None and uni['tuition_fee'] <= max_tuition]
        
        # Sort by tuition fee
        affordable.sort(key=lambda x: x['tuition_fee'])
        
        for uni in affordable:
            ranking = f"#{uni['ranking']}" if uni.get('ranking') else "N/A"
            tuition = f"${uni['tuition_fee']:,}" if uni['tuition_fee'] > 0 else "FREE"
            
            print(f"• {uni['name']} ({uni['country']})")
            print(f"  💰 {tuition} | 🏆 {ranking} | 🏛️ {uni.get('type', 'N/A')}")
        
        print(f"\nTotal affordable options: {len(affordable)}")
        print()
    
    def show_by_field(self, field_name=None):
        """Display universities by field of study"""
        if field_name:
            print(f"📚 UNIVERSITIES OFFERING {field_name.upper()}")
            print("=" * 50)
            
            matching_unis = []
            for uni in self.universities:
                if uni.get('fields') and any(field_name.lower() in field.lower() for field in uni['fields']):
                    matching_unis.append(uni)
            
            # Sort by ranking
            matching_unis.sort(key=lambda x: x.get('ranking', 999))
            
            for uni in matching_unis:
                ranking = f"#{uni['ranking']}" if uni.get('ranking') else "N/A"
                tuition = f"${uni['tuition_fee']:,}" if uni.get('tuition_fee') is not None else "N/A"
                print(f"• {uni['name']} ({uni['country']}) - Rank: {ranking}, Tuition: {tuition}")
            
            print(f"\nTotal universities: {len(matching_unis)}")
        else:
            # Show all fields
            print("📚 POPULAR FIELDS OF STUDY")
            print("=" * 50)
            
            all_fields = []
            for uni in self.universities:
                if uni.get('fields'):
                    all_fields.extend(uni['fields'])
            
            field_counts = Counter(all_fields)
            
            for field, count in field_counts.most_common(15):
                print(f"• {field}: {count} universities")
        
        print()
    
    def search_universities(self, query):
        """Search universities by name or country"""
        print(f"🔍 SEARCH RESULTS FOR: '{query}'")
        print("=" * 50)
        
        query_lower = query.lower()
        matches = []
        
        for uni in self.universities:
            if (query_lower in uni['name'].lower() or 
                query_lower in uni['country'].lower() or
                query_lower in uni.get('city', '').lower()):
                matches.append(uni)
        
        if matches:
            # Sort by ranking
            matches.sort(key=lambda x: x.get('ranking', 999))
            
            for uni in matches:
                ranking = f"#{uni['ranking']}" if uni.get('ranking') else "N/A"
                tuition = f"${uni['tuition_fee']:,}" if uni.get('tuition_fee') is not None else "N/A"
                fields = ", ".join(uni.get('fields', [])[:2])
                
                print(f"• {uni['name']}")
                print(f"  🌍 {uni['city']}, {uni['country']} | 🏆 {ranking} | 💰 {tuition}")
                print(f"  📚 {fields}")
                print()
        else:
            print("No universities found matching your search.")
        
        print(f"Total results: {len(matches)}")
        print()
    
    def show_statistics(self):
        """Display detailed statistics"""
        print("📊 DETAILED STATISTICS")
        print("=" * 50)
        
        # Country distribution
        country_counts = Counter(uni['country'] for uni in self.universities)
        print("🌍 Top 10 Countries:")
        for country, count in country_counts.most_common(10):
            percentage = (count / len(self.universities)) * 100
            print(f"   {country}: {count} universities ({percentage:.1f}%)")
        
        # University types
        type_counts = Counter(uni.get('type', 'Unknown') for uni in self.universities)
        print(f"\n🏛️ University Types:")
        for uni_type, count in type_counts.items():
            percentage = (count / len(self.universities)) * 100
            print(f"   {uni_type}: {count} universities ({percentage:.1f}%)")
        
        # Tuition ranges
        tuitions = [uni['tuition_fee'] for uni in self.universities if uni.get('tuition_fee') is not None]
        if tuitions:
            print(f"\n💰 Tuition Distribution:")
            ranges = [
                ("Free", 0, 0),
                ("Under $5K", 1, 4999),
                ("$5K-$15K", 5000, 14999),
                ("$15K-$30K", 15000, 29999),
                ("$30K-$50K", 30000, 49999),
                ("Over $50K", 50000, float('inf'))
            ]
            
            for label, min_val, max_val in ranges:
                if max_val == float('inf'):
                    count = len([t for t in tuitions if t >= min_val])
                else:
                    count = len([t for t in tuitions if min_val <= t <= max_val])
                percentage = (count / len(tuitions)) * 100
                print(f"   {label}: {count} universities ({percentage:.1f}%)")
        
        print()
    
    def interactive_menu(self):
        """Interactive menu for database exploration"""
        while True:
            print("\n🎓 UNIVERSITY DATABASE EXPLORER")
            print("=" * 40)
            print("1. 📊 Database Overview")
            print("2. 🌍 View by Country")
            print("3. 🏆 Top Universities")
            print("4. 💰 Affordable Options")
            print("5. 📚 View by Field")
            print("6. 🔍 Search Universities")
            print("7. 📈 Detailed Statistics")
            print("8. 🚪 Exit")
            
            choice = input("\nEnter your choice (1-8): ").strip()
            
            if choice == '1':
                self.show_overview()
            elif choice == '2':
                limit = input("Limit per country (press Enter for all): ").strip()
                limit = int(limit) if limit.isdigit() else None
                self.show_by_country(limit)
            elif choice == '3':
                limit = input("Number of top universities (default 20): ").strip()
                limit = int(limit) if limit.isdigit() else 20
                self.show_top_universities(limit)
            elif choice == '4':
                max_tuition = input("Maximum tuition (default $15,000): ").strip()
                max_tuition = int(max_tuition) if max_tuition.isdigit() else 15000
                self.show_affordable_options(max_tuition)
            elif choice == '5':
                field = input("Enter field name (or press Enter to see all fields): ").strip()
                field = field if field else None
                self.show_by_field(field)
            elif choice == '6':
                query = input("Enter search term: ").strip()
                if query:
                    self.search_universities(query)
            elif choice == '7':
                self.show_statistics()
            elif choice == '8':
                print("👋 Goodbye!")
                break
            else:
                print("❌ Invalid choice. Please try again.")

def main():
    """Main function to run the database viewer"""
    viewer = DatabaseViewer()
    
    if not viewer.universities:
        print("❌ No university data found. Please check your database file.")
        return
    
    # Show quick overview
    viewer.show_overview()
    
    # Start interactive menu
    viewer.interactive_menu()

if __name__ == "__main__":
  