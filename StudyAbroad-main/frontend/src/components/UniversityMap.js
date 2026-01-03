import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import universityService from '../services/universityService';
import { getUniversityCoordinates, formatCountryName, formatTuitionFee, formatAcceptanceRate } from '../data/universityCoordinates';

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

// Function to fetch all universities from backend with pagination
const fetchAllUniversities = async () => {
  const allUniversities = [];
  let page = 1;
  const perPage = 100; // Maximum allowed per page
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await universityService.searchUniversities({
        page: page,
        per_page: perPage
      });
      
      const universities = response.data.universities;
      allUniversities.push(...universities);
      
      // Check if there are more pages
      const pagination = response.data.pagination;
      hasMore = pagination.has_next && page < pagination.pages;
      page++;
      
      // Safety check to prevent infinite loops
      if (page > 50) break;
    }
    
    return allUniversities;
  } catch (error) {
    console.error('Error fetching universities:', error);
    return [];
  }
};

// Function to merge backend university data with coordinates
const mergeUniversityData = async () => {
  try {
    // Fetch all universities from backend
    const backendUniversities = await fetchAllUniversities();
    
    console.log(`Fetched ${backendUniversities.length} universities from backend`);
    
    // Merge with coordinate data
    const universitiesWithCoordinates = backendUniversities.map(university => {
      const coordinates = getUniversityCoordinates(university.id);
      
      if (coordinates) {
        // Validate coordinates before creating university object
        const [lat, lng] = coordinates;
        if (typeof lat === 'number' && typeof lng === 'number' && 
            !isNaN(lat) && !isNaN(lng) &&
            lat >= -90 && lat <= 90 &&
            lng >= -180 && lng <= 180) {
          
          return {
            id: university.id,
            name: university.name,
            country: formatCountryName(university.country),
            city: university.city,
            coordinates: [lat, lng],
            ranking: university.ranking || 999,
            tuition: formatTuitionFee(university.tuitionFee),
            acceptance_rate: formatAcceptanceRate(university.acceptanceRate),
            description: university.description || `${university.name} is a prestigious institution offering ${university.programs?.length || 'various'} academic programs.`,
            // Include original data for reference
            originalData: university
          };
        } else {
          console.warn(`Invalid coordinates for university ${university.name} (${university.id}):`, coordinates);
        }
      } else {
        console.warn(`No coordinates found for university ${university.name} (${university.id})`);
      }
      
      return null;
    }).filter(Boolean); // Remove universities without coordinates
    
    console.log(`Mapped ${universitiesWithCoordinates.length} universities with valid coordinates out of ${backendUniversities.length} total universities`);
    
    return universitiesWithCoordinates;
  } catch (error) {
    console.error('Error merging university data:', error);
    return [];
  }
};

// Component to fit map bounds to show all universities
function FitBounds({ universities }) {
  const map = useMap();
  
  useEffect(() => {
    if (universities.length > 0) {
      // Filter out universities with invalid coordinates
      const validUniversities = universities.filter(uni => {
        const coords = uni.coordinates;
        return coords && 
               Array.isArray(coords) && 
               coords.length === 2 &&
               typeof coords[0] === 'number' && 
               typeof coords[1] === 'number' &&
               !isNaN(coords[0]) && 
               !isNaN(coords[1]) &&
               coords[0] >= -90 && 
               coords[0] <= 90 &&
               coords[1] >= -180 && 
               coords[1] <= 180;
      });
      
      if (validUniversities.length > 0) {
        const bounds = L.latLngBounds(validUniversities.map(uni => uni.coordinates));
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [universities, map]);
  
  return null;
}

const UniversityMap = ({ 
  universities: propUniversities, 
  selectedCountry = '', 
  height = '500px',
  showControls = true 
}) => {
  const [universities, setUniversities] = useState([]);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [mapCenter, setMapCenter] = useState([30, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch universities on component mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If universities are passed as props, use them
        if (propUniversities && propUniversities.length > 0) {
          setUniversities(propUniversities);
          setFilteredUniversities(propUniversities);
        } else {
          // Otherwise fetch from backend
          const universitiesWithCoords = await mergeUniversityData();
          setUniversities(universitiesWithCoords);
          setFilteredUniversities(universitiesWithCoords);
        }
      } catch (err) {
        console.error('Error loading universities:', err);
        setError('Failed to load universities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, [propUniversities]);

  // Filter universities based on selected country
  useEffect(() => {
    if (universities.length === 0) return;

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
        // Filter out universities with invalid coordinates
        const validFiltered = filtered.filter(uni => {
          const coords = uni.coordinates;
          return coords && 
                 Array.isArray(coords) && 
                 coords.length === 2 &&
                 typeof coords[0] === 'number' && 
                 typeof coords[1] === 'number' &&
                 !isNaN(coords[0]) && 
                 !isNaN(coords[1]) &&
                 coords[0] >= -90 && 
                 coords[0] <= 90 &&
                 coords[1] >= -180 && 
                 coords[1] <= 180;
        });
        
        if (validFiltered.length > 0) {
          const bounds = L.latLngBounds(validFiltered.map(uni => uni.coordinates));
          const center = bounds.getCenter();
          setMapCenter([center.lat, center.lng]);
          setMapZoom(validFiltered.length === 1 ? 12 : validFiltered.length <= 3 ? 8 : 6);
        }
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

  if (loading) {
    return (
      <div className="university-map-container">
        {showControls && (
          <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-indigo-900">
              🗺️ University Locations Map
            </h3>
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm">
                Loading universities...
              </p>
            </div>
          </div>
        )}
        <div 
          className="map-wrapper rounded-lg overflow-hidden shadow-lg border border-gray-200 flex items-center justify-center bg-gray-100"
          style={{ height }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading universities...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="university-map-container">
        {showControls && (
          <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-indigo-900">
              🗺️ University Locations Map
            </h3>
            <div className="flex justify-between items-center">
              <p className="text-red-600 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}
        <div 
          className="map-wrapper rounded-lg overflow-hidden shadow-lg border border-gray-200 flex items-center justify-center bg-gray-100"
          style={{ height }}
        >
          <div className="text-center text-red-600">
            <p className="mb-2">⚠️ {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="university-map-container">
      {showControls && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-indigo-900">
            🗺️ University Locations Map
          </h3>
          <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm">
                Showing {filteredUniversities.length} of {universities.length} universities
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
          
          {filteredUniversities.map((university) => {
            // Validate coordinates before rendering marker
            if (!university.coordinates || 
                !Array.isArray(university.coordinates) || 
                university.coordinates.length !== 2 ||
                typeof university.coordinates[0] !== 'number' || 
                typeof university.coordinates[1] !== 'number' ||
                isNaN(university.coordinates[0]) || 
                isNaN(university.coordinates[1]) ||
                university.coordinates[0] < -90 || 
                university.coordinates[0] > 90 ||
                university.coordinates[1] < -180 || 
                university.coordinates[1] > 180) {
              console.warn(`Invalid coordinates for university ${university.name} (${university.id}):`, university.coordinates);
              return null;
            }
            
            return (
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
          )})}
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