// ============================================================
// Pune Metro Station & Route Data
// All 3 lines: Purple, Aqua, Line 3 with real GPS coordinates
// ============================================================

export interface Station {
  id: string;
  name: string;
  line: MetroLine;
  lat: number;
  lng: number;
  connectedStations: string[];
  isInterchange: boolean;
  interchangeLines?: MetroLine[];
  nearbyPlaces: string[];
  facilities: string[];
}

export type MetroLine = 'purple' | 'aqua' | 'line3';

export interface LineInfo {
  id: MetroLine;
  name: string;
  fullName: string;
  color: string;
  glowColor: string;
  stations: string[];
}

export const LINE_COLORS: Record<MetroLine, { primary: string; glow: string; rgb: [number, number, number] }> = {
  purple: { primary: '#a855f7', glow: '#c084fc', rgb: [168, 85, 247] },
  aqua: { primary: '#06b6d4', glow: '#22d3ee', rgb: [6, 182, 212] },
  line3: { primary: '#ec4899', glow: '#f472b6', rgb: [236, 72, 153] },
};

export const LINES: LineInfo[] = [
  {
    id: 'purple',
    name: 'Purple',
    fullName: 'Purple Line (Line 1)',
    color: '#a855f7',
    glowColor: '#c084fc',
    stations: [
      'pcmc', 'sant_tukaram_nagar', 'bhosari', 'kasarwadi', 'phugewadi',
      'dapodi', 'bopodi', 'khadki', 'range_hills', 'shivajinagar',
      'civil_court', 'budhwar_peth', 'mandai', 'swargate', 'katraj',
      'market_yard',
    ],
  },
  {
    id: 'aqua',
    name: 'Aqua',
    fullName: 'Aqua Line (Line 2)',
    color: '#06b6d4',
    glowColor: '#22d3ee',
    stations: [
      'vanaz', 'anand_nagar', 'ideal_colony', 'nal_stop', 'garware_college',
      'deccan_gymkhana', 'chhatrapati_sambhaji_udyan', 'pmcc', 'civil_court_aqua',
      'mangalwar_peth', 'pune_railway_station', 'ruby_hall', 'bund_garden',
      'yerawada', 'kalyani_nagar', 'ramwadi',
    ],
  },
  {
    id: 'line3',
    name: 'Line 3',
    fullName: 'Line 3 (Hinjewadi–Civil Court)',
    color: '#ec4899',
    glowColor: '#f472b6',
    stations: [
      'hinjewadi', 'hinjewadi_phase2', 'hinjewadi_phase1', 'wakad',
      'balewadi_phata', 'balewadi_stadium', 'baner', 'baner_gaon',
      'agriculture_college', 'university', 'shivajinagar_l3',
      'civil_court_l3',
    ],
  },
];

export const STATIONS: Record<string, Station> = {
  // ===================== PURPLE LINE =====================
  pcmc: {
    id: 'pcmc',
    name: 'PCMC',
    line: 'purple',
    lat: 18.6298,
    lng: 73.7997,
    connectedStations: ['sant_tukaram_nagar'],
    isInterchange: false,
    nearbyPlaces: ['PCMC Building', 'Pimpri Chinchwad Municipal Corporation'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift'],
  },
  sant_tukaram_nagar: {
    id: 'sant_tukaram_nagar',
    name: 'Sant Tukaram Nagar',
    line: 'purple',
    lat: 18.6215,
    lng: 73.8005,
    connectedStations: ['pcmc', 'bhosari'],
    isInterchange: false,
    nearbyPlaces: ['Sant Tukaram Temple', 'Residential Area'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  bhosari: {
    id: 'bhosari',
    name: 'Bhosari',
    line: 'purple',
    lat: 18.6160,
    lng: 73.8010,
    connectedStations: ['sant_tukaram_nagar', 'kasarwadi'],
    isInterchange: false,
    nearbyPlaces: ['Bhosari Industrial Area', 'Market'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms'],
  },
  kasarwadi: {
    id: 'kasarwadi',
    name: 'Kasarwadi',
    line: 'purple',
    lat: 18.6090,
    lng: 73.8025,
    connectedStations: ['bhosari', 'phugewadi'],
    isInterchange: false,
    nearbyPlaces: ['Kasarwadi Bridge', 'Industrial Zone'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  phugewadi: {
    id: 'phugewadi',
    name: 'Phugewadi',
    line: 'purple',
    lat: 18.5978,
    lng: 73.8095,
    connectedStations: ['kasarwadi', 'dapodi'],
    isInterchange: false,
    nearbyPlaces: ['Residential Area'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  dapodi: {
    id: 'dapodi',
    name: 'Dapodi',
    line: 'purple',
    lat: 18.5900,
    lng: 73.8175,
    connectedStations: ['phugewadi', 'bopodi'],
    isInterchange: false,
    nearbyPlaces: ['Dapodi Market', 'Military Area'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms'],
  },
  bopodi: {
    id: 'bopodi',
    name: 'Bopodi',
    line: 'purple',
    lat: 18.5820,
    lng: 73.8290,
    connectedStations: ['dapodi', 'khadki'],
    isInterchange: false,
    nearbyPlaces: ['Bopodi Residential Area'],
    facilities: ['Ticket Counter', 'Restrooms', 'Lift'],
  },
  khadki: {
    id: 'khadki',
    name: 'Khadki',
    line: 'purple',
    lat: 18.5710,
    lng: 73.8370,
    connectedStations: ['bopodi', 'range_hills'],
    isInterchange: false,
    nearbyPlaces: ['Khadki Cantonment', 'Ammunition Factory'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms'],
  },
  range_hills: {
    id: 'range_hills',
    name: 'Range Hills',
    line: 'purple',
    lat: 18.5630,
    lng: 73.8420,
    connectedStations: ['khadki', 'shivajinagar'],
    isInterchange: false,
    nearbyPlaces: ['Range Hills Military Area', 'Parks'],
    facilities: ['Ticket Counter', 'Restrooms', 'Lift'],
  },
  shivajinagar: {
    id: 'shivajinagar',
    name: 'Shivajinagar',
    line: 'purple',
    lat: 18.5320,
    lng: 73.8470,
    connectedStations: ['range_hills', 'civil_court'],
    isInterchange: false,
    nearbyPlaces: ['FC Road', 'Shivajinagar Bus Stand', 'JM Road'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift', 'Escalator'],
  },
  civil_court: {
    id: 'civil_court',
    name: 'Civil Court',
    line: 'purple',
    lat: 18.5270,
    lng: 73.8490,
    connectedStations: ['shivajinagar', 'budhwar_peth', 'civil_court_aqua', 'civil_court_l3'],
    isInterchange: true,
    interchangeLines: ['aqua', 'line3'],
    nearbyPlaces: ['Pune Civil Court', 'District Court', 'Council Hall'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift', 'Escalator', 'Interchange'],
  },
  budhwar_peth: {
    id: 'budhwar_peth',
    name: 'Budhwar Peth',
    line: 'purple',
    lat: 18.5190,
    lng: 73.8560,
    connectedStations: ['civil_court', 'mandai'],
    isInterchange: false,
    nearbyPlaces: ['Dagdusheth Halwai Temple', 'Budhwar Peth Market'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  mandai: {
    id: 'mandai',
    name: 'Mandai',
    line: 'purple',
    lat: 18.5130,
    lng: 73.8570,
    connectedStations: ['budhwar_peth', 'swargate'],
    isInterchange: false,
    nearbyPlaces: ['Mandai Market', 'Tulshibaug'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  swargate: {
    id: 'swargate',
    name: 'Swargate',
    line: 'purple',
    lat: 18.5018,
    lng: 73.8636,
    connectedStations: ['mandai', 'katraj'],
    isInterchange: false,
    nearbyPlaces: ['Swargate Bus Stand', 'Swargate Chowk'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift', 'Escalator'],
  },
  katraj: {
    id: 'katraj',
    name: 'Katraj',
    line: 'purple',
    lat: 18.4580,
    lng: 73.8650,
    connectedStations: ['swargate', 'market_yard'],
    isInterchange: false,
    nearbyPlaces: ['Katraj Snake Park', 'Katraj Lake'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms'],
  },
  market_yard: {
    id: 'market_yard',
    name: 'Market Yard',
    line: 'purple',
    lat: 18.4890,
    lng: 73.8720,
    connectedStations: ['katraj'],
    isInterchange: false,
    nearbyPlaces: ['Market Yard', 'Bibwewadi'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms'],
  },

  // ===================== AQUA LINE =====================
  vanaz: {
    id: 'vanaz',
    name: 'Vanaz',
    line: 'aqua',
    lat: 18.5120,
    lng: 73.8060,
    connectedStations: ['anand_nagar'],
    isInterchange: false,
    nearbyPlaces: ['Vanaz Engineering', 'Kothrud Residential'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift'],
  },
  anand_nagar: {
    id: 'anand_nagar',
    name: 'Anand Nagar',
    line: 'aqua',
    lat: 18.5128,
    lng: 73.8120,
    connectedStations: ['vanaz', 'ideal_colony'],
    isInterchange: false,
    nearbyPlaces: ['Anand Nagar Residential', 'Schools'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  ideal_colony: {
    id: 'ideal_colony',
    name: 'Ideal Colony',
    line: 'aqua',
    lat: 18.5134,
    lng: 73.8195,
    connectedStations: ['anand_nagar', 'nal_stop'],
    isInterchange: false,
    nearbyPlaces: ['Ideal Colony', 'Paud Road'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  nal_stop: {
    id: 'nal_stop',
    name: 'Nal Stop',
    line: 'aqua',
    lat: 18.5140,
    lng: 73.8260,
    connectedStations: ['ideal_colony', 'garware_college'],
    isInterchange: false,
    nearbyPlaces: ['Nal Stop Junction', 'Karve Road'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  garware_college: {
    id: 'garware_college',
    name: 'Garware College',
    line: 'aqua',
    lat: 18.5152,
    lng: 73.8330,
    connectedStations: ['nal_stop', 'deccan_gymkhana'],
    isInterchange: false,
    nearbyPlaces: ['Garware College', 'BMCC College'],
    facilities: ['Ticket Counter', 'Restrooms', 'Lift'],
  },
  deccan_gymkhana: {
    id: 'deccan_gymkhana',
    name: 'Deccan Gymkhana',
    line: 'aqua',
    lat: 18.5168,
    lng: 73.8400,
    connectedStations: ['garware_college', 'chhatrapati_sambhaji_udyan'],
    isInterchange: false,
    nearbyPlaces: ['Deccan Gymkhana', 'FC Road', 'Goodluck Chowk'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift', 'Escalator'],
  },
  chhatrapati_sambhaji_udyan: {
    id: 'chhatrapati_sambhaji_udyan',
    name: 'Chh. Sambhaji Udyan',
    line: 'aqua',
    lat: 18.5190,
    lng: 73.8440,
    connectedStations: ['deccan_gymkhana', 'pmcc'],
    isInterchange: false,
    nearbyPlaces: ['Sambhaji Park', 'Shaniwar Wada'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  pmcc: {
    id: 'pmcc',
    name: 'PMC',
    line: 'aqua',
    lat: 18.5215,
    lng: 73.8465,
    connectedStations: ['chhatrapati_sambhaji_udyan', 'civil_court_aqua'],
    isInterchange: false,
    nearbyPlaces: ['Pune Municipal Corporation', 'Shaniwar Wada'],
    facilities: ['Ticket Counter', 'Restrooms', 'Lift'],
  },
  civil_court_aqua: {
    id: 'civil_court_aqua',
    name: 'Civil Court',
    line: 'aqua',
    lat: 18.5270,
    lng: 73.8490,
    connectedStations: ['pmcc', 'mangalwar_peth', 'civil_court', 'civil_court_l3'],
    isInterchange: true,
    interchangeLines: ['purple', 'line3'],
    nearbyPlaces: ['Pune Civil Court', 'District Court'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift', 'Escalator', 'Interchange'],
  },
  mangalwar_peth: {
    id: 'mangalwar_peth',
    name: 'Mangalwar Peth',
    line: 'aqua',
    lat: 18.5250,
    lng: 73.8570,
    connectedStations: ['civil_court_aqua', 'pune_railway_station'],
    isInterchange: false,
    nearbyPlaces: ['Mangalwar Peth', 'Laxmi Road'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  pune_railway_station: {
    id: 'pune_railway_station',
    name: 'Pune Railway Station',
    line: 'aqua',
    lat: 18.5290,
    lng: 73.8640,
    connectedStations: ['mangalwar_peth', 'ruby_hall'],
    isInterchange: false,
    nearbyPlaces: ['Pune Junction Railway Station', 'Pune Station Area'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift', 'Escalator'],
  },
  ruby_hall: {
    id: 'ruby_hall',
    name: 'Ruby Hall Clinic',
    line: 'aqua',
    lat: 18.5325,
    lng: 73.8720,
    connectedStations: ['pune_railway_station', 'bund_garden'],
    isInterchange: false,
    nearbyPlaces: ['Ruby Hall Clinic', 'Sassoon Hospital'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  bund_garden: {
    id: 'bund_garden',
    name: 'Bund Garden',
    line: 'aqua',
    lat: 18.5360,
    lng: 73.8800,
    connectedStations: ['ruby_hall', 'yerawada'],
    isInterchange: false,
    nearbyPlaces: ['Bund Garden', 'Koregaon Park'],
    facilities: ['Ticket Counter', 'Restrooms', 'Lift'],
  },
  yerawada: {
    id: 'yerawada',
    name: 'Yerawada',
    line: 'aqua',
    lat: 18.5440,
    lng: 73.8870,
    connectedStations: ['bund_garden', 'kalyani_nagar'],
    isInterchange: false,
    nearbyPlaces: ['Yerawada Jail', 'Aga Khan Palace'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms'],
  },
  kalyani_nagar: {
    id: 'kalyani_nagar',
    name: 'Kalyani Nagar',
    line: 'aqua',
    lat: 18.5510,
    lng: 73.8990,
    connectedStations: ['yerawada', 'ramwadi'],
    isInterchange: false,
    nearbyPlaces: ['Kalyani Nagar', 'Eon IT Park'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift'],
  },
  ramwadi: {
    id: 'ramwadi',
    name: 'Ramwadi',
    line: 'aqua',
    lat: 18.5560,
    lng: 73.9130,
    connectedStations: ['kalyani_nagar'],
    isInterchange: false,
    nearbyPlaces: ['Ramwadi Bus Depot', 'Wagholi Road'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift'],
  },

  // ===================== LINE 3 =====================
  hinjewadi: {
    id: 'hinjewadi',
    name: 'Hinjewadi',
    line: 'line3',
    lat: 18.5912,
    lng: 73.7380,
    connectedStations: ['hinjewadi_phase2'],
    isInterchange: false,
    nearbyPlaces: ['Hinjewadi IT Park', 'Infosys', 'Wipro'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift', 'Escalator'],
  },
  hinjewadi_phase2: {
    id: 'hinjewadi_phase2',
    name: 'Hinjewadi Phase 2',
    line: 'line3',
    lat: 18.5870,
    lng: 73.7440,
    connectedStations: ['hinjewadi', 'hinjewadi_phase1'],
    isInterchange: false,
    nearbyPlaces: ['Phase 2 IT Park', 'Tech Parks'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  hinjewadi_phase1: {
    id: 'hinjewadi_phase1',
    name: 'Hinjewadi Phase 1',
    line: 'line3',
    lat: 18.5825,
    lng: 73.7510,
    connectedStations: ['hinjewadi_phase2', 'wakad'],
    isInterchange: false,
    nearbyPlaces: ['Phase 1 IT Park', 'Restaurants'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms'],
  },
  wakad: {
    id: 'wakad',
    name: 'Wakad',
    line: 'line3',
    lat: 18.5720,
    lng: 73.7640,
    connectedStations: ['hinjewadi_phase1', 'balewadi_phata'],
    isInterchange: false,
    nearbyPlaces: ['Wakad Bridge', 'Residential Hub'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift'],
  },
  balewadi_phata: {
    id: 'balewadi_phata',
    name: 'Balewadi Phata',
    line: 'line3',
    lat: 18.5655,
    lng: 73.7740,
    connectedStations: ['wakad', 'balewadi_stadium'],
    isInterchange: false,
    nearbyPlaces: ['Balewadi Junction', 'Highway'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  balewadi_stadium: {
    id: 'balewadi_stadium',
    name: 'Balewadi Stadium',
    line: 'line3',
    lat: 18.5580,
    lng: 73.7820,
    connectedStations: ['balewadi_phata', 'baner'],
    isInterchange: false,
    nearbyPlaces: ['Shree Shiv Chhatrapati Sports Complex', 'Balewadi Stadium'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift'],
  },
  baner: {
    id: 'baner',
    name: 'Baner',
    line: 'line3',
    lat: 18.5520,
    lng: 73.7920,
    connectedStations: ['balewadi_stadium', 'baner_gaon'],
    isInterchange: false,
    nearbyPlaces: ['Baner Hills', 'IT Hub', 'Restaurants'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift'],
  },
  baner_gaon: {
    id: 'baner_gaon',
    name: 'Baner Gaon',
    line: 'line3',
    lat: 18.5460,
    lng: 73.8020,
    connectedStations: ['baner', 'agriculture_college'],
    isInterchange: false,
    nearbyPlaces: ['Baner Village', 'Local Market'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  agriculture_college: {
    id: 'agriculture_college',
    name: 'Agriculture College',
    line: 'line3',
    lat: 18.5400,
    lng: 73.8130,
    connectedStations: ['baner_gaon', 'university'],
    isInterchange: false,
    nearbyPlaces: ['College of Agriculture', 'Aundh Road'],
    facilities: ['Ticket Counter', 'Restrooms', 'Lift'],
  },
  university: {
    id: 'university',
    name: 'University',
    line: 'line3',
    lat: 18.5355,
    lng: 73.8270,
    connectedStations: ['agriculture_college', 'shivajinagar_l3'],
    isInterchange: false,
    nearbyPlaces: ['Savitribai Phule Pune University', 'Law College Road'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift'],
  },
  shivajinagar_l3: {
    id: 'shivajinagar_l3',
    name: 'Shivajinagar',
    line: 'line3',
    lat: 18.5320,
    lng: 73.8400,
    connectedStations: ['university', 'civil_court_l3'],
    isInterchange: false,
    nearbyPlaces: ['Shivajinagar Bus Stand', 'FC Road', 'JM Road'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift', 'Escalator'],
  },
  civil_court_l3: {
    id: 'civil_court_l3',
    name: 'Civil Court',
    line: 'line3',
    lat: 18.5270,
    lng: 73.8490,
    connectedStations: ['shivajinagar_l3', 'civil_court', 'civil_court_aqua'],
    isInterchange: true,
    interchangeLines: ['purple', 'aqua'],
    nearbyPlaces: ['Pune Civil Court', 'District Court'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift', 'Escalator', 'Interchange'],
  },
};

// Route coordinate arrays for rendering track lines on the map
export const ROUTE_COORDINATES: Record<MetroLine, [number, number][]> = {
  purple: [
    [73.7997, 18.6298], [73.8005, 18.6215], [73.8010, 18.6160],
    [73.8025, 18.6090], [73.8095, 18.5978], [73.8175, 18.5900],
    [73.8290, 18.5820], [73.8370, 18.5710], [73.8420, 18.5630],
    [73.8470, 18.5320], [73.8490, 18.5270], [73.8560, 18.5190],
    [73.8570, 18.5130], [73.8636, 18.5018], [73.8650, 18.4580],
    [73.8720, 18.4890],
  ],
  aqua: [
    [73.8060, 18.5120], [73.8120, 18.5128], [73.8195, 18.5134],
    [73.8260, 18.5140], [73.8330, 18.5152], [73.8400, 18.5168],
    [73.8440, 18.5190], [73.8465, 18.5215], [73.8490, 18.5270],
    [73.8570, 18.5250], [73.8640, 18.5290], [73.8720, 18.5325],
    [73.8800, 18.5360], [73.8870, 18.5440], [73.8990, 18.5510],
    [73.9130, 18.5560],
  ],
  line3: [
    [73.7380, 18.5912], [73.7440, 18.5870], [73.7510, 18.5825],
    [73.7640, 18.5720], [73.7740, 18.5655], [73.7820, 18.5580],
    [73.7920, 18.5520], [73.8020, 18.5460], [73.8130, 18.5400],
    [73.8270, 18.5355], [73.8400, 18.5320], [73.8490, 18.5270],
  ],
};

// Average speed for time estimation (km/h)
export const METRO_AVG_SPEED_KMH = 33;

// Calculate distance between two coordinates using Haversine formula
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get all station IDs as a flat array
export function getAllStationIds(): string[] {
  return Object.keys(STATIONS);
}

// Get stations for a specific line
export function getStationsForLine(line: MetroLine): Station[] {
  const lineInfo = LINES.find(l => l.id === line);
  if (!lineInfo) return [];
  return lineInfo.stations.map(id => STATIONS[id]).filter(Boolean);
}

// Map center coordinates (Pune center)
export const PUNE_CENTER: [number, number] = [73.8490, 18.5270];
export const DEFAULT_ZOOM = 12.5;
export const DEFAULT_PITCH = 60;
export const DEFAULT_BEARING = -17;
