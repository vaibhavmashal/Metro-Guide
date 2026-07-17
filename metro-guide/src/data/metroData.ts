// ============================================================
// Pune Metro Station & Route Data
// All 3 lines: Purple, Aqua, Line 3 with real GPS coordinates
// ============================================================

export interface Station {
  id: string;
  name: string;
  line: string;
  lat: number;
  lng: number;
  connectedStations: string[];
  isInterchange: boolean;
  interchangeLines?: string[];
  nearbyPlaces: string[];
  facilities: string[];
}

export type MetroLine = 'purple' | 'aqua' | 'line3';

export interface LineInfo {
  id: string;
  name: string;
  fullName: string;
  color: string;
  glowColor: string;
  stations: string[];
}

export const LINE_COLORS: Record<string, { primary: string; glow: string; rgb: [number, number, number] }> = {
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
      'dapodi', 'bopodi', 'khadki', 'shivajinagar', 'civil_court',
      'budhwar_peth', 'mandai', 'swargate',
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
  // Coordinates sourced from Wikipedia / Pune Metro official data
  pcmc: {
    id: 'pcmc',
    name: 'PCMC',
    line: 'purple',
    lat: 18.6281,
    lng: 73.7963,
    connectedStations: ['sant_tukaram_nagar'],
    isInterchange: false,
    nearbyPlaces: ['PCMC Building', 'Pimpri Chinchwad Municipal Corporation'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift'],
  },
  sant_tukaram_nagar: {
    id: 'sant_tukaram_nagar',
    name: 'Sant Tukaram Nagar (Nashik Phata)',
    line: 'purple',
    lat: 18.6146,
    lng: 73.8158,
    connectedStations: ['pcmc', 'bhosari'],
    isInterchange: false,
    nearbyPlaces: ['Nashik Phata', 'Sant Tukaram Nagar', 'Sant Tukaram Temple', 'YCM Hospital'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  bhosari: {
    id: 'bhosari',
    name: 'Bhosari (Nashik Phata)',
    line: 'purple',
    lat: 18.6096,
    lng: 73.8195,
    connectedStations: ['sant_tukaram_nagar', 'kasarwadi'],
    isInterchange: false,
    nearbyPlaces: ['Bhosari Industrial Area', 'Nashik Phata', 'Market'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms'],
  },
  kasarwadi: {
    id: 'kasarwadi',
    name: 'Kasarwadi',
    line: 'purple',
    lat: 18.5997,
    lng: 73.8273,
    connectedStations: ['bhosari', 'phugewadi'],
    isInterchange: false,
    nearbyPlaces: ['Kasarwadi Bridge', 'Industrial Zone'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  phugewadi: {
    id: 'phugewadi',
    name: 'Phugewadi',
    line: 'purple',
    lat: 18.5900,
    lng: 73.8310,
    connectedStations: ['kasarwadi', 'dapodi'],
    isInterchange: false,
    nearbyPlaces: ['Residential Area'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  dapodi: {
    id: 'dapodi',
    name: 'Dapodi',
    line: 'purple',
    lat: 18.5838,
    lng: 73.8338,
    connectedStations: ['phugewadi', 'bopodi'],
    isInterchange: false,
    nearbyPlaces: ['Dapodi Market', 'Military Area'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms'],
  },
  bopodi: {
    id: 'bopodi',
    name: 'Bopodi',
    line: 'purple',
    lat: 18.5697,
    lng: 73.8381,
    connectedStations: ['dapodi', 'khadki'],
    isInterchange: false,
    nearbyPlaces: ['Bopodi', 'Khadki Railway Station area'],
    facilities: ['Ticket Counter', 'Restrooms', 'Lift'],
  },
  khadki: {
    id: 'khadki',
    name: 'Khadki',
    line: 'purple',
    lat: 18.5635,
    lng: 73.8420,
    connectedStations: ['bopodi', 'shivajinagar'],
    isInterchange: false,
    nearbyPlaces: ['Khadki Cantonment', 'Ordnance Factory', 'Khadki Bazaar'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms'],
  },
  shivajinagar: {
    id: 'shivajinagar',
    name: 'Shivajinagar',
    line: 'purple',
    lat: 18.5328,
    lng: 73.8494,
    connectedStations: ['khadki', 'civil_court'],
    isInterchange: false,
    nearbyPlaces: ['Shivajinagar Railway Station', 'Shivajinagar ST Bus Depot', 'COEP', 'Sancheti Hospital'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift', 'Escalator'],
  },
  civil_court: {
    id: 'civil_court',
    name: 'District Court (Civil Court)',
    line: 'purple',
    lat: 18.5269,
    lng: 73.8581,
    connectedStations: ['shivajinagar', 'budhwar_peth', 'civil_court_aqua', 'civil_court_l3'],
    isInterchange: true,
    interchangeLines: ['aqua', 'line3'],
    nearbyPlaces: ['District Court', 'Shivajinagar District Court', 'Civil Court', 'Kamgar Putala', 'PMC Main Office'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift', 'Escalator', 'Interchange'],
  },
  budhwar_peth: {
    id: 'budhwar_peth',
    name: 'Kasba Peth (Budhwar Peth)',
    line: 'purple',
    lat: 18.5211,
    lng: 73.8594,
    connectedStations: ['civil_court', 'mandai'],
    isInterchange: false,
    nearbyPlaces: ['Kasba Peth', 'Budhwar Peth', 'Shaniwar Wada', 'Appa Balwant Chowk', 'Dagdusheth Halwai Ganpati'],
    facilities: ['Ticket Counter', 'Restrooms', 'Lift'],
  },
  mandai: {
    id: 'mandai',
    name: 'Mahatma Phule Mandai',
    line: 'purple',
    lat: 18.5143,
    lng: 73.8574,
    connectedStations: ['budhwar_peth', 'swargate'],
    isInterchange: false,
    nearbyPlaces: ['Mahatma Phule Mandai', 'Mandai', 'Tulshibaug Market', 'Raja Dinkar Kelkar Museum'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  swargate: {
    id: 'swargate',
    name: 'Swargate',
    line: 'purple',
    lat: 18.5018,
    lng: 73.8583,
    connectedStations: ['mandai'],
    isInterchange: false,
    nearbyPlaces: ['Swargate Bus Stand', 'Swargate ST Depot', 'Saras Baug', 'Parvati Hill'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift', 'Escalator'],
  },

  // ===================== AQUA LINE =====================
  vanaz: {
    id: 'vanaz',
    name: 'Vanaz',
    line: 'aqua',
    lat: 18.5071,
    lng: 73.8053,
    connectedStations: ['anand_nagar'],
    isInterchange: false,
    nearbyPlaces: ['Vanaz Engineering', 'Kothrud Residential'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift'],
  },
  anand_nagar: {
    id: 'anand_nagar',
    name: 'Anand Nagar',
    line: 'aqua',
    lat: 18.5096,
    lng: 73.8141,
    connectedStations: ['vanaz', 'ideal_colony'],
    isInterchange: false,
    nearbyPlaces: ['Anand Nagar Residential', 'Schools'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  ideal_colony: {
    id: 'ideal_colony',
    name: 'Ideal Colony (Paud Phata)',
    line: 'aqua',
    lat: 18.5084,
    lng: 73.8228,
    connectedStations: ['anand_nagar', 'nal_stop'],
    isInterchange: false,
    nearbyPlaces: ['Ideal Colony', 'Paud Phata', 'Kothrud', 'MIT College Road'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  nal_stop: {
    id: 'nal_stop',
    name: 'SNDT College (Nal Stop)',
    line: 'aqua',
    lat: 18.5073,
    lng: 73.8287,
    connectedStations: ['ideal_colony', 'garware_college'],
    isInterchange: false,
    nearbyPlaces: ['SNDT College', 'Nal Stop', 'Law College Road', 'Erandwane', 'Siddhant Towers Kothrud'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms'],
  },
  garware_college: {
    id: 'garware_college',
    name: 'Garware College',
    line: 'aqua',
    lat: 18.5120,
    lng: 73.8380,
    connectedStations: ['nal_stop', 'deccan_gymkhana'],
    isInterchange: false,
    nearbyPlaces: ['Garware College', 'Karve Road', 'Prabhat Road', 'Khilarewadi'],
    facilities: ['Ticket Counter', 'Restrooms', 'Lift'],
  },
  deccan_gymkhana: {
    id: 'deccan_gymkhana',
    name: 'Deccan Gymkhana',
    line: 'aqua',
    lat: 18.5163,
    lng: 73.8445,
    connectedStations: ['garware_college', 'chhatrapati_sambhaji_udyan'],
    isInterchange: false,
    nearbyPlaces: ['Deccan Gymkhana', 'FC Road', 'Fergusson College Road', 'JM Road', 'Goodluck Cafe'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift', 'Escalator'],
  },
  chhatrapati_sambhaji_udyan: {
    id: 'chhatrapati_sambhaji_udyan',
    name: 'Chhatrapati Sambhaji Udyan',
    line: 'aqua',
    lat: 18.5201,
    lng: 73.8476,
    connectedStations: ['deccan_gymkhana', 'pmcc'],
    isInterchange: false,
    nearbyPlaces: ['Chhatrapati Sambhaji Udyan', 'Chatrapati Sambhaji Park', 'JM Road', 'Bal Gandharva'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  pmcc: {
    id: 'pmcc',
    name: 'PMC (Pune Municipal Corporation)',
    line: 'aqua',
    lat: 18.5227,
    lng: 73.8535,
    connectedStations: ['chhatrapati_sambhaji_udyan', 'civil_court_aqua'],
    isInterchange: false,
    nearbyPlaces: ['PMC', 'Pune Municipal Corporation', 'Mutha River', 'Kasba Peth border'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift'],
  },
  civil_court_aqua: {
    id: 'civil_court_aqua',
    name: 'District Court (Civil Court)',
    line: 'aqua',
    lat: 18.5269,
    lng: 73.8581,
    connectedStations: ['pmcc', 'mangalwar_peth', 'civil_court', 'civil_court_l3'],
    isInterchange: true,
    interchangeLines: ['purple', 'line3'],
    nearbyPlaces: ['District Court', 'Shivajinagar District Court', 'Civil Court Aqua', 'Kamgar Putala'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift', 'Escalator', 'Interchange'],
  },
  mangalwar_peth: {
    id: 'mangalwar_peth',
    name: 'RTO Pune (Mangalwar Peth)',
    line: 'aqua',
    lat: 18.5300,
    lng: 73.8652,
    connectedStations: ['civil_court_aqua', 'pune_railway_station'],
    isInterchange: false,
    nearbyPlaces: ['RTO Pune', 'Mangalwar Peth', 'Sangamwadi Bridge', 'COEP Hostel'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  pune_railway_station: {
    id: 'pune_railway_station',
    name: 'Pune Railway Station',
    line: 'aqua',
    lat: 18.5297,
    lng: 73.8726,
    connectedStations: ['mangalwar_peth', 'ruby_hall'],
    isInterchange: false,
    nearbyPlaces: ['Pune Junction Railway Station', 'Pune Station Area'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift', 'Escalator'],
  },
  ruby_hall: {
    id: 'ruby_hall',
    name: 'Ruby Hall Clinic',
    line: 'aqua',
    lat: 18.5326,
    lng: 73.8778,
    connectedStations: ['pune_railway_station', 'bund_garden'],
    isInterchange: false,
    nearbyPlaces: ['Ruby Hall Clinic', 'Sassoon Hospital'],
    facilities: ['Ticket Counter', 'Restrooms'],
  },
  bund_garden: {
    id: 'bund_garden',
    name: 'Bund Garden',
    line: 'aqua',
    lat: 18.5406,
    lng: 73.8834,
    connectedStations: ['ruby_hall', 'yerawada'],
    isInterchange: false,
    nearbyPlaces: ['Bund Garden', 'Koregaon Park'],
    facilities: ['Ticket Counter', 'Restrooms', 'Lift'],
  },
  yerawada: {
    id: 'yerawada',
    name: 'Yerawada',
    line: 'aqua',
    lat: 18.5454,
    lng: 73.8867,
    connectedStations: ['bund_garden', 'kalyani_nagar'],
    isInterchange: false,
    nearbyPlaces: ['Yerawada Jail', 'Aga Khan Palace'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms'],
  },
  kalyani_nagar: {
    id: 'kalyani_nagar',
    name: 'Kalyani Nagar',
    line: 'aqua',
    lat: 18.5444,
    lng: 73.9057,
    connectedStations: ['yerawada', 'ramwadi'],
    isInterchange: false,
    nearbyPlaces: ['Kalyani Nagar', 'Eon IT Park'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift'],
  },
  ramwadi: {
    id: 'ramwadi',
    name: 'Ramwadi',
    line: 'aqua',
    lat: 18.5571,
    lng: 73.9097,
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
    lat: 18.5328,
    lng: 73.8494,
    connectedStations: ['university', 'civil_court_l3'],
    isInterchange: false,
    nearbyPlaces: ['Shivajinagar Bus Stand', 'FC Road', 'JM Road'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift', 'Escalator'],
  },
  civil_court_l3: {
    id: 'civil_court_l3',
    name: 'Civil Court',
    line: 'line3',
    lat: 18.5269,
    lng: 73.8581,
    connectedStations: ['shivajinagar_l3', 'civil_court', 'civil_court_aqua'],
    isInterchange: true,
    interchangeLines: ['purple', 'aqua'],
    nearbyPlaces: ['Pune Civil Court', 'District Court'],
    facilities: ['Parking', 'Ticket Counter', 'Restrooms', 'Lift', 'Escalator', 'Interchange'],
  },
};

// =================================================================
// Route coordinate arrays for rendering track lines on the map.
// Each waypoint [lng, lat] passes EXACTLY through every station
// coordinate, with intermediate points to follow the real viaduct /
// road alignment so the animated route, 3D beams, and station
// structures all sit precisely on the physical metro corridor.
// =================================================================
export const ROUTE_COORDINATES: Record<string, [number, number][]> = {
  purple: [
    // PCMC
    [73.7963, 18.6281],
    // intermediate – track heads SE along old Mumbai-Pune highway
    [73.7990, 18.6250], [73.8030, 18.6230],
    [73.8080, 18.6200], [73.8120, 18.6175],
    // Sant Tukaram Nagar
    [73.8158, 18.6146],
    // intermediate
    [73.8170, 18.6130], [73.8182, 18.6115],
    // Bhosari
    [73.8195, 18.6096],
    // intermediate – crosses railway bridge, curves SE
    [73.8215, 18.6065], [73.8240, 18.6035],
    [73.8258, 18.6015],
    // Kasarwadi
    [73.8273, 18.5997],
    // intermediate – follows old Pune-Mumbai road
    [73.8285, 18.5965], [73.8298, 18.5935],
    // Phugewadi
    [73.8310, 18.5900],
    // intermediate
    [73.8318, 18.5878], [73.8328, 18.5858],
    // Dapodi
    [73.8338, 18.5838],
    // intermediate – long stretch parallel to railway
    [73.8348, 18.5810], [73.8358, 18.5780],
    [73.8366, 18.5750], [73.8374, 18.5725],
    // Bopodi
    [73.8381, 18.5697],
    // intermediate
    [73.8392, 18.5672], [73.8405, 18.5652],
    // Khadki
    [73.8420, 18.5635],
    // intermediate – long stretch, transition from elevated to underground
    [73.8432, 18.5610], [73.8442, 18.5585],
    [73.8452, 18.5555], [73.8462, 18.5520],
    [73.8472, 18.5480], [73.8480, 18.5440],
    [73.8486, 18.5400], [73.8490, 18.5365],
    // Shivajinagar (underground)
    [73.8494, 18.5328],
    // intermediate – underground SE towards District Court
    [73.8515, 18.5315], [73.8535, 18.5300],
    [73.8558, 18.5285], [73.8572, 18.5276],
    // Civil Court / District Court (interchange hub)
    [73.8581, 18.5269],
    // intermediate – underground continues south
    [73.8586, 18.5248], [73.8591, 18.5230],
    // Kasba Peth (Budhwar Peth)
    [73.8594, 18.5211],
    // intermediate
    [73.8592, 18.5190], [73.8586, 18.5168],
    // Mandai (Mahatma Phule Mandai)
    [73.8574, 18.5143],
    // intermediate – continues south to Swargate
    [73.8576, 18.5118], [73.8578, 18.5090],
    [73.8580, 18.5058], [73.8582, 18.5038],
    // Swargate
    [73.8583, 18.5018],
  ],
  aqua: [
    // Vanaz
    [73.8053, 18.5071],
    // intermediate – track heads east along Karve Road
    [73.8078, 18.5078], [73.8110, 18.5088],
    // Anand Nagar
    [73.8141, 18.5096],
    // intermediate
    [73.8168, 18.5092], [73.8198, 18.5088],
    // Ideal Colony (Paud Phata)
    [73.8228, 18.5084],
    // intermediate
    [73.8250, 18.5080], [73.8270, 18.5076],
    // Nal Stop (SNDT)
    [73.8287, 18.5073],
    // intermediate – curves NE along Karve Road
    [73.8312, 18.5082], [73.8338, 18.5098],
    [73.8360, 18.5110],
    // Garware College
    [73.8380, 18.5120],
    // intermediate – continues NE
    [73.8400, 18.5135], [73.8422, 18.5150],
    // Deccan Gymkhana
    [73.8445, 18.5163],
    // intermediate – NE towards Sambhaji Udyan
    [73.8458, 18.5178], [73.8468, 18.5190],
    // Chhatrapati Sambhaji Udyan
    [73.8476, 18.5201],
    // intermediate – continues towards PMC
    [73.8498, 18.5212], [73.8518, 18.5220],
    // PMC (Pune Municipal Corporation)
    [73.8535, 18.5227],
    // intermediate – towards Civil Court
    [73.8552, 18.5240], [73.8568, 18.5256],
    // Civil Court / District Court
    [73.8581, 18.5269],
    // intermediate – heads east towards RTO
    [73.8602, 18.5280], [73.8628, 18.5292],
    // Mangalwar Peth (RTO Pune)
    [73.8652, 18.5300],
    // intermediate – continues east
    [73.8678, 18.5298], [73.8702, 18.5297],
    // Pune Railway Station
    [73.8726, 18.5297],
    // intermediate – continues ENE
    [73.8748, 18.5308], [73.8764, 18.5318],
    // Ruby Hall Clinic
    [73.8778, 18.5326],
    // intermediate – curves north towards Bund Garden
    [73.8795, 18.5350], [73.8812, 18.5378],
    [73.8824, 18.5394],
    // Bund Garden
    [73.8834, 18.5406],
    // intermediate – continues NE
    [73.8848, 18.5425], [73.8858, 18.5440],
    // Yerawada
    [73.8867, 18.5454],
    // intermediate – curves east across Mula-Mutha
    [73.8892, 18.5460], [73.8920, 18.5462],
    [73.8955, 18.5458], [73.8985, 18.5453],
    [73.9020, 18.5450], [73.9040, 18.5448],
    // Kalyani Nagar
    [73.9057, 18.5444],
    // intermediate – heads north to Ramwadi
    [73.9072, 18.5468], [73.9082, 18.5498],
    [73.9090, 18.5530], [73.9094, 18.5552],
    // Ramwadi
    [73.9097, 18.5571],
  ],
  line3: [
    // Hinjewadi
    [73.7380, 18.5912],
    // intermediate
    [73.7408, 18.5894], [73.7425, 18.5882],
    // Hinjewadi Phase 2
    [73.7440, 18.5870],
    // intermediate
    [73.7468, 18.5852], [73.7490, 18.5838],
    // Hinjewadi Phase 1
    [73.7510, 18.5825],
    // intermediate – along highway
    [73.7555, 18.5790], [73.7598, 18.5755],
    // Wakad
    [73.7640, 18.5720],
    // intermediate
    [73.7680, 18.5692], [73.7712, 18.5672],
    // Balewadi Phata
    [73.7740, 18.5655],
    // intermediate
    [73.7772, 18.5628], [73.7798, 18.5603],
    // Balewadi Stadium
    [73.7820, 18.5580],
    // intermediate
    [73.7855, 18.5558], [73.7888, 18.5538],
    // Baner
    [73.7920, 18.5520],
    // intermediate
    [73.7955, 18.5498], [73.7988, 18.5478],
    // Baner Gaon
    [73.8020, 18.5460],
    // intermediate
    [73.8058, 18.5438], [73.8095, 18.5418],
    // Agriculture College
    [73.8130, 18.5400],
    // intermediate
    [73.8175, 18.5382], [73.8225, 18.5368],
    // University
    [73.8270, 18.5355],
    // intermediate – heads east then SE towards Shivajinagar
    [73.8325, 18.5348], [73.8378, 18.5340],
    [73.8430, 18.5336], [73.8465, 18.5332],
    // Shivajinagar (L3)
    [73.8494, 18.5328],
    // intermediate – turns SE towards Civil Court
    [73.8522, 18.5310], [73.8548, 18.5294],
    [73.8568, 18.5280],
    // Civil Court (L3)
    [73.8581, 18.5269],
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
export const PUNE_CENTER: [number, number] = [73.8500, 18.5300];
export const DEFAULT_ZOOM = 12.5;
export const DEFAULT_PITCH = 60;
export const DEFAULT_BEARING = -17;
