#!/usr/bin/env python3
"""
Script to add university logos to the universities.json file
"""

import json
import os

# University logos mapping
UNIVERSITY_LOGOS = {
    "Harvard University": "https://logos-world.net/wp-content/uploads/2021/09/Harvard-Logo.png",
    "Stanford University": "https://logos-world.net/wp-content/uploads/2020/06/Stanford-Logo.png",
    "Massachusetts Institute of Technology": "https://logos-world.net/wp-content/uploads/2020/06/MIT-Logo.png",
    "University of California, Berkeley": "https://logos-world.net/wp-content/uploads/2020/06/UC-Berkeley-Logo.png",
    "University of Oxford": "https://logos-world.net/wp-content/uploads/2020/06/Oxford-University-Logo.png",
    "University of Cambridge": "https://logos-world.net/wp-content/uploads/2020/06/Cambridge-University-Logo.png",
    "University of Toronto": "https://logos-world.net/wp-content/uploads/2020/06/University-of-Toronto-Logo.png",
    "Australian National University": "https://logos-world.net/wp-content/uploads/2020/06/Australian-National-University-Logo.png",
    "Technical University of Munich": "https://logos-world.net/wp-content/uploads/2020/06/TUM-Logo.png",
    "Yale University": "https://logos-world.net/wp-content/uploads/2020/06/Yale-University-Logo.png",
    "Princeton University": "https://logos-world.net/wp-content/uploads/2020/06/Princeton-University-Logo.png",
    "Imperial College London": "https://logos-world.net/wp-content/uploads/2020/06/Imperial-College-London-Logo.png",
    "University of British Columbia": "https://logos-world.net/wp-content/uploads/2020/06/UBC-Logo.png",
    "University of Melbourne": "https://logos-world.net/wp-content/uploads/2020/06/University-of-Melbourne-Logo.png",
    "University of Heidelberg": "https://logos-world.net/wp-content/uploads/2020/06/Heidelberg-University-Logo.png",
    "Columbia University": "https://logos-world.net/wp-content/uploads/2020/06/Columbia-University-Logo.png",
    "University of Pennsylvania": "https://logos-world.net/wp-content/uploads/2020/06/University-of-Pennsylvania-Logo.png",
    "University College London": "https://logos-world.net/wp-content/uploads/2020/06/UCL-Logo.png",
    "McGill University": "https://logos-world.net/wp-content/uploads/2020/06/McGill-University-Logo.png",
    "University of Sydney": "https://logos-world.net/wp-content/uploads/2020/06/University-of-Sydney-Logo.png",
    "University of Chicago": "https://logos-world.net/wp-content/uploads/2020/06/University-of-Chicago-Logo.png",
    "King's College London": "https://logos-world.net/wp-content/uploads/2020/06/Kings-College-London-Logo.png",
    "University of Waterloo": "https://logos-world.net/wp-content/uploads/2020/06/University-of-Waterloo-Logo.png",
    "University of New South Wales": "https://logos-world.net/wp-content/uploads/2020/06/UNSW-Logo.png",
    "RWTH Aachen University": "https://logos-world.net/wp-content/uploads/2020/06/RWTH-Aachen-Logo.png",
    "Cornell University": "https://logos-world.net/wp-content/uploads/2020/06/Cornell-University-Logo.png",
    "University of Edinburgh": "https://logos-world.net/wp-content/uploads/2020/06/University-of-Edinburgh-Logo.png",
    "University of Alberta": "https://logos-world.net/wp-content/uploads/2020/06/University-of-Alberta-Logo.png",
    "Monash University": "https://logos-world.net/wp-content/uploads/2020/06/Monash-University-Logo.png",
    "University of Munich": "https://logos-world.net/wp-content/uploads/2020/06/LMU-Munich-Logo.png",
    "Duke University": "https://logos-world.net/wp-content/uploads/2020/06/Duke-University-Logo.png",
    "London School of Economics": "https://logos-world.net/wp-content/uploads/2020/06/LSE-Logo.png",
    "Simon Fraser University": "https://logos-world.net/wp-content/uploads/2020/06/SFU-Logo.png",
    "University of Queensland": "https://logos-world.net/wp-content/uploads/2020/06/University-of-Queensland-Logo.png",
    "Karlsruhe Institute of Technology": "https://logos-world.net/wp-content/uploads/2020/06/KIT-Logo.png",
    "Northwestern University": "https://logos-world.net/wp-content/uploads/2020/06/Northwestern-University-Logo.png",
    "University of Manchester": "https://logos-world.net/wp-content/uploads/2020/06/University-of-Manchester-Logo.png",
    "McMaster University": "https://logos-world.net/wp-content/uploads/2020/06/McMaster-University-Logo.png",
    "University of Adelaide": "https://logos-world.net/wp-content/uploads/2020/06/University-of-Adelaide-Logo.png",
    "Humboldt University of Berlin": "https://logos-world.net/wp-content/uploads/2020/06/Humboldt-University-Logo.png",
    "Johns Hopkins University": "https://logos-world.net/wp-content/uploads/2020/06/Johns-Hopkins-University-Logo.png",
    "University of Bristol": "https://logos-world.net/wp-content/uploads/2020/06/University-of-Bristol-Logo.png",
    "University of Ottawa": "https://logos-world.net/wp-content/uploads/2020/06/University-of-Ottawa-Logo.png",
    "University of Western Australia": "https://logos-world.net/wp-content/uploads/2020/06/UWA-Logo.png",
    "Free University of Berlin": "https://logos-world.net/wp-content/uploads/2020/06/Free-University-Berlin-Logo.png",
    "Rice University": "https://logos-world.net/wp-content/uploads/2020/06/Rice-University-Logo.png",
    "University of Warwick": "https://logos-world.net/wp-content/uploads/2020/06/University-of-Warwick-Logo.png"
}

def add_logos_to_universities():
    """Add logos to universities in the JSON file"""
    
    # Get the path to the universities.json file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, '..', 'data', 'universities.json')
    
    try:
        # Read the current universities data
        with open(json_path, 'r', encoding='utf-8') as f:
            universities = json.load(f)
        
        # Add logos to universities
        updated_count = 0
        for university in universities:
            university_name = university.get('name', '')
            
            # Skip if logo already exists
            if 'logo' in university and university['logo']:
                continue
                
            # Add logo if we have one for this university
            if university_name in UNIVERSITY_LOGOS:
                university['logo'] = UNIVERSITY_LOGOS[university_name]
                updated_count += 1
                print(f"Added logo for: {university_name}")
        
        # Write the updated data back to the file
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(universities, f, indent=2, ensure_ascii=False)
        
        print(f"\nSuccessfully updated {updated_count} universities with logos!")
        print(f"Total universities in database: {len(universities)}")
        
    except FileNotFoundError:
        print(f"Error: Could not find universities.json at {json_path}")
    except json.JSONDecodeError:
        print("Error: Invalid JSON format in universities.json")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    add_logos_to_universities()