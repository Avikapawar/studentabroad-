/**
 * Utility functions for handling university logos
 */

// Fallback logo service that generates logos based on university name
const generateFallbackLogo = (universityName) => {
  // Use a service like UI Avatars to generate a logo with initials
  const initials = universityName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 3)
    .toUpperCase();
  
  // Generate a consistent color based on university name
  const colors = [
    '1f2937', '374151', '4b5563', '6b7280', '9ca3af',
    '1f2937', '7c2d12', '991b1b', 'b91c1c', 'dc2626',
    '92400e', 'b45309', 'd97706', 'f59e0b', 'fbbf24',
    '365314', '4d7c0f', '65a30d', '84cc16', 'a3e635',
    '14532d', '166534', '15803d', '16a34a', '22c55e',
    '0f766e', '0d9488', '14b8a6', '2dd4bf', '5eead4',
    '0e7490', '0891b2', '0ea5e9', '38bdf8', '7dd3fc',
    '1e40af', '2563eb', '3b82f6', '60a5fa', '93c5fd',
    '5b21b6', '7c3aed', '8b5cf6', 'a78bfa', 'c4b5fd',
    '86198f', 'a21caf', 'c026d3', 'd946ef', 'e879f9'
  ];
  
  let hash = 0;
  for (let i = 0; i < universityName.length; i++) {
    hash = universityName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const backgroundColor = colors[colorIndex];
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=128&background=${backgroundColor}&color=ffffff&bold=true&format=png`;
};

// Known university logos mapping
const universityLogos = {
  'Harvard University': 'https://logos-world.net/wp-content/uploads/2021/09/Harvard-Logo.png',
  'Stanford University': 'https://logos-world.net/wp-content/uploads/2020/06/Stanford-Logo.png',
  'Massachusetts Institute of Technology': 'https://logos-world.net/wp-content/uploads/2020/06/MIT-Logo.png',
  'University of California, Berkeley': 'https://logos-world.net/wp-content/uploads/2020/06/UC-Berkeley-Logo.png',
  'University of Oxford': 'https://logos-world.net/wp-content/uploads/2020/06/Oxford-University-Logo.png',
  'University of Cambridge': 'https://logos-world.net/wp-content/uploads/2020/06/Cambridge-University-Logo.png',
  'University of Toronto': 'https://logos-world.net/wp-content/uploads/2020/06/University-of-Toronto-Logo.png',
  'Australian National University': 'https://logos-world.net/wp-content/uploads/2020/06/Australian-National-University-Logo.png',
  'Technical University of Munich': 'https://logos-world.net/wp-content/uploads/2020/06/TUM-Logo.png',
  'Yale University': 'https://logos-world.net/wp-content/uploads/2020/06/Yale-University-Logo.png',
  'Princeton University': 'https://logos-world.net/wp-content/uploads/2020/06/Princeton-University-Logo.png',
  'Imperial College London': 'https://logos-world.net/wp-content/uploads/2020/06/Imperial-College-London-Logo.png',
  'University of British Columbia': 'https://logos-world.net/wp-content/uploads/2020/06/UBC-Logo.png',
  'University of Melbourne': 'https://logos-world.net/wp-content/uploads/2020/06/University-of-Melbourne-Logo.png',
  'Columbia University': 'https://logos-world.net/wp-content/uploads/2020/06/Columbia-University-Logo.png',
  'University of Pennsylvania': 'https://logos-world.net/wp-content/uploads/2020/06/University-of-Pennsylvania-Logo.png',
  'University College London': 'https://logos-world.net/wp-content/uploads/2020/06/UCL-Logo.png',
  'McGill University': 'https://logos-world.net/wp-content/uploads/2020/06/McGill-University-Logo.png',
  'University of Sydney': 'https://logos-world.net/wp-content/uploads/2020/06/University-of-Sydney-Logo.png',
  'University of Chicago': 'https://logos-world.net/wp-content/uploads/2020/06/University-of-Chicago-Logo.png',
  'Cornell University': 'https://logos-world.net/wp-content/uploads/2020/06/Cornell-University-Logo.png',
  'Duke University': 'https://logos-world.net/wp-content/uploads/2020/06/Duke-University-Logo.png',
  'Northwestern University': 'https://logos-world.net/wp-content/uploads/2020/06/Northwestern-University-Logo.png',
  'Johns Hopkins University': 'https://logos-world.net/wp-content/uploads/2020/06/Johns-Hopkins-University-Logo.png'
};

/**
 * Get the logo URL for a university
 * @param {Object} university - University object
 * @returns {string} Logo URL
 */
export const getUniversityLogo = (university) => {
  // First check if the university object has a logo field
  if (university.logo) {
    return university.logo;
  }
  
  // Check our known logos mapping
  if (universityLogos[university.name]) {
    return universityLogos[university.name];
  }
  
  // Generate fallback logo
  return generateFallbackLogo(university.name);
};

/**
 * Preload university logos for better performance
 * @param {Array} universities - Array of university objects
 */
export const preloadUniversityLogos = (universities) => {
  universities.forEach(university => {
    const logoUrl = getUniversityLogo(university);
    const img = new Image();
    img.src = logoUrl;
  });
};

/**
 * Get a placeholder logo while the real logo loads
 * @param {Object} university - University object
 * @returns {string} Placeholder logo URL
 */
export const getPlaceholderLogo = (university) => {
  return generateFallbackLogo(university.name);
};

export default {
  getUniversityLogo,
  preloadUniversityLogos,
  getPlaceholderLogo
};