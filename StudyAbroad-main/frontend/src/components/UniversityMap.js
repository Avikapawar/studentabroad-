import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom university icon
const universityIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4361ee" width="32" height="32">
      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Comprehensive university data with coordinates
const sampleUniversities = [
  // USA Universities
  {
    id: 1,
    name: "Harvard University",
    country: "USA",
    city: "Cambridge, MA",
    coordinates: [42.3744, -71.1169],
    ranking: 1,
    tuition: "$54,002",
    acceptance_rate: "3.4%",
    description: "Prestigious Ivy League university known for excellence in all fields."
  },
  {
    id: 2,
    name: "MIT",
    country: "USA",
    city: "Cambridge, MA",
    coordinates: [42.3601, -71.0942],
    ranking: 3,
    tuition: "$57,986",
    acceptance_rate: "4.1%",
    description: "Leading institution for technology, engineering, and innovation."
  },
  {
    id: 3,
    name: "Stanford University",
    country: "USA",
    city: "Stanford, CA",
    coordinates: [37.4275, -122.1697],
    ranking: 4,
    tuition: "$56,169",
    acceptance_rate: "3.9%",
    description: "Silicon Valley's premier university for technology and entrepreneurship."
  },
  {
    id: 4,
    name: "Yale University",
    country: "USA",
    city: "New Haven, CT",
    coordinates: [41.3163, -72.9223],
    ranking: 5,
    tuition: "$59,950",
    acceptance_rate: "4.6%",
    description: "Historic Ivy League institution known for law, medicine, and liberal arts."
  },
  {
    id: 5,
    name: "Princeton University",
    country: "USA",
    city: "Princeton, NJ",
    coordinates: [40.3573, -74.6672],
    ranking: 6,
    tuition: "$56,010",
    acceptance_rate: "4.0%",
    description: "Elite Ivy League university with strong undergraduate focus."
  },
  {
    id: 6,
    name: "University of California, Berkeley",
    country: "USA",
    city: "Berkeley, CA",
    coordinates: [37.8719, -122.2585],
    ranking: 8,
    tuition: "$44,007",
    acceptance_rate: "11.4%",
    description: "Top public research university known for academic excellence."
  },
  {
    id: 7,
    name: "Columbia University",
    country: "USA",
    city: "New York, NY",
    coordinates: [40.8075, -73.9626],
    ranking: 9,
    tuition: "$61,850",
    acceptance_rate: "3.7%",
    description: "Ivy League university in the heart of Manhattan."
  },
  {
    id: 8,
    name: "University of Chicago",
    country: "USA",
    city: "Chicago, IL",
    coordinates: [41.7886, -87.5987],
    ranking: 10,
    tuition: "$59,298",
    acceptance_rate: "5.4%",
    description: "Renowned for economics, business, and rigorous academics."
  },

  // UK Universities
  {
    id: 9,
    name: "Oxford University",
    country: "UK",
    city: "Oxford",
    coordinates: [51.7548, -1.2544],
    ranking: 2,
    tuition: "£9,250",
    acceptance_rate: "17.5%",
    description: "World's oldest English-speaking university with 900+ years of history."
  },
  {
    id: 10,
    name: "Cambridge University",
    country: "UK",
    city: "Cambridge",
    coordinates: [52.2043, 0.1149],
    ranking: 7,
    tuition: "£9,250",
    acceptance_rate: "21%",
    description: "Historic university known for science, mathematics, and literature."
  },
  {
    id: 11,
    name: "Imperial College London",
    country: "UK",
    city: "London",
    coordinates: [51.4988, -0.1749],
    ranking: 11,
    tuition: "£34,000",
    acceptance_rate: "14.3%",
    description: "Leading STEM university in the heart of London."
  },
  {
    id: 12,
    name: "London School of Economics",
    country: "UK",
    city: "London",
    coordinates: [51.5144, -0.1167],
    ranking: 15,
    tuition: "£22,430",
    acceptance_rate: "8.9%",
    description: "World-renowned for social sciences, economics, and politics."
  },
  {
    id: 13,
    name: "University College London",
    country: "UK",
    city: "London",
    coordinates: [51.5246, -0.1340],
    ranking: 16,
    tuition: "£24,000",
    acceptance_rate: "48%",
    description: "London's leading multidisciplinary university."
  },
  {
    id: 14,
    name: "King's College London",
    country: "UK",
    city: "London",
    coordinates: [51.5118, -0.1162],
    ranking: 35,
    tuition: "£19,740",
    acceptance_rate: "13%",
    description: "Historic university known for medicine, law, and humanities."
  },

  // Canada Universities
  {
    id: 15,
    name: "University of Toronto",
    country: "Canada",
    city: "Toronto, ON",
    coordinates: [43.6629, -79.3957],
    ranking: 25,
    tuition: "CAD $58,160",
    acceptance_rate: "43%",
    description: "Canada's top research university with diverse academic programs."
  },
  {
    id: 16,
    name: "McGill University",
    country: "Canada",
    city: "Montreal, QC",
    coordinates: [45.5048, -73.5772],
    ranking: 30,
    tuition: "CAD $50,000",
    acceptance_rate: "46%",
    description: "Prestigious bilingual university known for medicine and research."
  },
  {
    id: 17,
    name: "University of British Columbia",
    country: "Canada",
    city: "Vancouver, BC",
    coordinates: [49.2606, -123.2460],
    ranking: 40,
    tuition: "CAD $45,000",
    acceptance_rate: "52%",
    description: "Beautiful campus university with strong research programs."
  },
  {
    id: 18,
    name: "University of Waterloo",
    country: "Canada",
    city: "Waterloo, ON",
    coordinates: [43.4723, -80.5449],
    ranking: 50,
    tuition: "CAD $35,000",
    acceptance_rate: "53%",
    description: "Leading technology university with top co-op programs."
  },

  // Australia Universities
  {
    id: 19,
    name: "University of Melbourne",
    country: "Australia",
    city: "Melbourne, VIC",
    coordinates: [-37.7963, 144.9614],
    ranking: 33,
    tuition: "AUD $45,824",
    acceptance_rate: "70%",
    description: "Australia's leading university known for research and innovation."
  },
  {
    id: 20,
    name: "Australian National University",
    country: "Australia",
    city: "Canberra, ACT",
    coordinates: [-35.2777, 149.1185],
    ranking: 27,
    tuition: "AUD $47,940",
    acceptance_rate: "35%",
    description: "Australia's national university with strong research focus."
  },
  {
    id: 21,
    name: "University of Sydney",
    country: "Australia",
    city: "Sydney, NSW",
    coordinates: [-33.8886, 151.1873],
    ranking: 41,
    tuition: "AUD $48,000",
    acceptance_rate: "30%",
    description: "Historic sandstone university with beautiful campus."
  },
  {
    id: 22,
    name: "University of Queensland",
    country: "Australia",
    city: "Brisbane, QLD",
    coordinates: [-27.4975, 153.0137],
    ranking: 50,
    tuition: "AUD $43,000",
    acceptance_rate: "63%",
    description: "Leading research university in subtropical Brisbane."
  },

  // Germany Universities
  {
    id: 23,
    name: "Technical University of Munich",
    country: "Germany",
    city: "Munich",
    coordinates: [48.1497, 11.5683],
    ranking: 37,
    tuition: "€150",
    acceptance_rate: "8%",
    description: "Germany's top technical university for engineering and technology."
  },
  {
    id: 24,
    name: "Ludwig Maximilian University",
    country: "Germany",
    city: "Munich",
    coordinates: [48.1506, 11.5804],
    ranking: 59,
    tuition: "€150",
    acceptance_rate: "15%",
    description: "Historic university known for humanities and sciences."
  },
  {
    id: 25,
    name: "Heidelberg University",
    country: "Germany",
    city: "Heidelberg",
    coordinates: [49.4093, 8.7073],
    ranking: 64,
    tuition: "€1,500",
    acceptance_rate: "19%",
    description: "Germany's oldest university with strong research tradition."
  },

  // Switzerland Universities
  {
    id: 26,
    name: "ETH Zurich",
    country: "Switzerland",
    city: "Zurich",
    coordinates: [47.3769, 8.5417],
    ranking: 7,
    tuition: "CHF 1,298",
    acceptance_rate: "8%",
    description: "Premier technical university in Europe for science and technology."
  },
  {
    id: 27,
    name: "EPFL",
    country: "Switzerland",
    city: "Lausanne",
    coordinates: [46.5197, 6.6323],
    ranking: 14,
    tuition: "CHF 1,266",
    acceptance_rate: "12%",
    description: "Leading technical university known for engineering and computer science."
  },

  // France Universities
  {
    id: 28,
    name: "Sorbonne University",
    country: "France",
    city: "Paris",
    coordinates: [48.8566, 2.3522],
    ranking: 44,
    tuition: "€170",
    acceptance_rate: "32%",
    description: "Historic Parisian university known for humanities and sciences."
  },
  {
    id: 29,
    name: "École Normale Supérieure",
    country: "France",
    city: "Paris",
    coordinates: [48.8434, 2.3408],
    ranking: 23,
    tuition: "€243",
    acceptance_rate: "8%",
    description: "Elite French institution for advanced studies and research."
  },

  // Netherlands Universities
  {
    id: 30,
    name: "University of Amsterdam",
    country: "Netherlands",
    city: "Amsterdam",
    coordinates: [52.3676, 4.9041],
    ranking: 53,
    tuition: "€2,314",
    acceptance_rate: "4%",
    description: "Leading Dutch university in the heart of Amsterdam."
  },
  {
    id: 31,
    name: "Delft University of Technology",
    country: "Netherlands",
    city: "Delft",
    coordinates: [52.0116, 4.3571],
    ranking: 47,
    tuition: "€2,314",
    acceptance_rate: "15%",
    description: "Top technical university known for engineering and design."
  },

  // Singapore Universities
  {
    id: 32,
    name: "National University of Singapore",
    country: "Singapore",
    city: "Singapore",
    coordinates: [1.2966, 103.7764],
    ranking: 12,
    tuition: "S$37,550",
    acceptance_rate: "5%",
    description: "Asia's leading university with global reputation."
  },
  {
    id: 33,
    name: "Nanyang Technological University",
    country: "Singapore",
    city: "Singapore",
    coordinates: [1.3483, 103.6831],
    ranking: 19,
    tuition: "S$36,800",
    acceptance_rate: "10%",
    description: "Young and dynamic university known for innovation."
  },

  // Japan Universities
  {
    id: 34,
    name: "University of Tokyo",
    country: "Japan",
    city: "Tokyo",
    coordinates: [35.7128, 139.7617],
    ranking: 29,
    tuition: "¥535,800",
    acceptance_rate: "34%",
    description: "Japan's most prestigious university and research institution."
  },
  {
    id: 35,
    name: "Kyoto University",
    country: "Japan",
    city: "Kyoto",
    coordinates: [35.0262, 135.7808],
    ranking: 36,
    tuition: "¥535,800",
    acceptance_rate: "36%",
    description: "Historic university known for Nobel Prize winners."
  }
];

// Component to fit map bounds to show all universities
function FitBounds({ universities }) {
  const map = useMap();
  
  useEffect(() => {
    if (universities.length > 0) {
      const bounds = L.latLngBounds(universities.map(uni => uni.coordinates));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [universities, map]);
  
  return null;
}

const UniversityMap = ({ 
  universities = sampleUniversities, 
  selectedCountry = '', 
  height = '500px',
  showControls = true 
}) => {
  const [filteredUniversities, setFilteredUniversities] = useState(universities);
  const [mapCenter, setMapCenter] = useState([30, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  // Filter universities based on selected country
  useEffect(() => {
    if (selectedCountry) {
      const countryMap = {
        'US': 'USA',
        'UK': 'UK', 
        'CA': 'Canada',
        'AU': 'Australia',
        'DE': 'Germany',
        'CH': 'Switzerland',
        'FR': 'France',
        'NL': 'Netherlands',
        'SG': 'Singapore',
        'JP': 'Japan'
      };
      
      const targetCountry = countryMap[selectedCountry.toUpperCase()] || selectedCountry;
      
      const filtered = universities.filter(uni => 
        uni.country.toLowerCase() === targetCountry.toLowerCase() ||
        uni.country.toLowerCase().includes(selectedCountry.toLowerCase())
      );
      
      setFilteredUniversities(filtered);
      
      // Center map on filtered results
      if (filtered.length > 0) {
        const bounds = L.latLngBounds(filtered.map(uni => uni.coordinates));
        const center = bounds.getCenter();
        setMapCenter([center.lat, center.lng]);
        setMapZoom(filtered.length === 1 ? 12 : filtered.length <= 3 ? 8 : 6);
      }
    } else {
      setFilteredUniversities(universities);
      setMapCenter([30, 0]);
      setMapZoom(2);
    }
  }, [selectedCountry, universities]);

  const handleShowAll = () => {
    setFilteredUniversities(universities);
    setMapCenter([30, 0]);
    setMapZoom(2);
  };

  return (
    <div className="university-map-container">
      {showControls && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-indigo-900">
            🗺️ University Locations Map
          </h3>
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm">
              Showing {filteredUniversities.length} universities
              {selectedCountry && ` in ${selectedCountry}`}
            </p>
            {selectedCountry && (
              <button 
                onClick={handleShowAll}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Show All Universities
              </button>
            )}
          </div>
        </div>
      )}
      
      <div 
        className="map-wrapper rounded-lg overflow-hidden shadow-lg border border-gray-200"
        style={{ height }}
      >
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <FitBounds universities={filteredUniversities} />
          
          {filteredUniversities.map((university) => (
            <Marker
              key={university.id}
              position={university.coordinates}
              icon={universityIcon}
            >
              <Popup className="university-popup">
                <div className="p-2 min-w-[250px]">
                  <h4 className="font-bold text-lg text-indigo-900 mb-2">
                    {university.name}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-semibold">📍 Location:</span> {university.city}, {university.country}</p>
                    <p><span className="font-semibold">🏆 Ranking:</span> #{university.ranking}</p>
                    <p><span className="font-semibold">💰 Tuition:</span> {university.tuition}</p>
                    <p><span className="font-semibold">📊 Acceptance:</span> {university.acceptance_rate}</p>
                    <p className="text-gray-600 mt-2 italic">{university.description}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                    <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors">
                      Apply Now
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {showControls && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              <span>University Location</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🖱️ Click markers for details</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔍 Zoom with mouse wheel</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityMap;