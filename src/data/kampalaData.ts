import { DivisionInfo, DivisionName, Pothole } from '../types';

export const KAMPALA_CENTER: [number, number] = [0.3152, 32.5816];
export const KAMPALA_DEFAULT_ZOOM = 13;

export const KAMPALA_DIVISIONS: Record<DivisionName, DivisionInfo> = {
  Central: {
    name: 'Central',
    fullName: 'Central Division (Kampala CBD)',
    hqLocation: 'KCCA Headquarters, Kimathi Avenue',
    engineerInCharge: 'Eng. David Luyimbazi',
    emergencyHotline: '+256 800 990 000',
    color: '#f59e0b',
    center: [0.3152, 32.5816],
    bounds: [[0.3000, 32.5650], [0.3350, 32.6000]]
  },
  Nakawa: {
    name: 'Nakawa',
    fullName: 'Nakawa Division',
    hqLocation: 'Nakawa Division Offices, Jinja Road',
    engineerInCharge: 'Eng. Sarah Nansubuga',
    emergencyHotline: '+256 414 286 111',
    color: '#3b82f6',
    center: [0.3320, 32.6230],
    bounds: [[0.3100, 32.6000], [0.3650, 32.6600]]
  },
  Makindye: {
    name: 'Makindye',
    fullName: 'Makindye Division',
    hqLocation: 'Makindye Mobutu Road Office',
    engineerInCharge: 'Eng. Patrick Kisekka',
    emergencyHotline: '+256 414 266 543',
    color: '#10b981',
    center: [0.2850, 32.5860],
    bounds: [[0.2500, 32.5600], [0.3050, 32.6200]]
  },
  Kawempe: {
    name: 'Kawempe',
    fullName: 'Kawempe Division',
    hqLocation: 'Kawempe Division Hall, Bombo Road',
    engineerInCharge: 'Eng. Moses Mugabi',
    emergencyHotline: '+256 414 567 890',
    color: '#ec4899',
    center: [0.3630, 32.5620],
    bounds: [[0.3350, 32.5300], [0.3950, 32.5900]]
  },
  Rubaga: {
    name: 'Rubaga',
    fullName: 'Rubaga Division',
    hqLocation: 'Rubaga Kabuusu Administrative Centre',
    engineerInCharge: 'Eng. Agnes Nakitende',
    emergencyHotline: '+256 414 270 412',
    color: '#8b5cf6',
    center: [0.3050, 32.5450],
    bounds: [[0.2700, 32.5100], [0.3300, 32.5650]]
  }
};

export const KAMPALA_LANDMARKS = [
  { name: 'KCCA Headquarters (City Hall)', lat: 0.3138, lng: 32.5835, division: 'Central' },
  { name: 'Nakawa Market & Junction', lat: 0.3298, lng: 32.6175, division: 'Nakawa' },
  { name: 'Lugogo Mall & Stadium', lat: 0.3262, lng: 32.6074, division: 'Nakawa' },
  { name: 'Makerere University Main Gate', lat: 0.3328, lng: 32.5694, division: 'Kawempe' },
  { name: 'Wandegeya Traffic Lights', lat: 0.3305, lng: 32.5732, division: 'Central' },
  { name: 'Kalerwe Market / Northern Bypass', lat: 0.3542, lng: 32.5699, division: 'Kawempe' },
  { name: 'Kibuye Roundabout / Entebbe Rd', lat: 0.2925, lng: 32.5702, division: 'Makindye' },
  { name: 'Kansanga / Ggaba Road', lat: 0.2882, lng: 32.6025, division: 'Makindye' },
  { name: 'Kabaka\'s Lake / Rubaga', lat: 0.3015, lng: 32.5562, division: 'Rubaga' },
  { name: 'Bugolobi Market / Bandali Rise', lat: 0.3168, lng: 32.6241, division: 'Nakawa' },
  { name: 'Bwaise Junction / Bombo Rd', lat: 0.3475, lng: 32.5590, division: 'Kawempe' },
  { name: 'Ntinda Complex / Stretcher Rd', lat: 0.3512, lng: 32.6189, division: 'Nakawa' },
  { name: 'Munyonyo Commonwealth Resort link', lat: 0.2520, lng: 32.6210, division: 'Makindye' },
  { name: 'Posta Uganda / Kampala Road', lat: 0.3142, lng: 32.5802, division: 'Central' }
];

export const INITIAL_POTHOLES: Pothole[] = [
  {
    id: 'KLA-2026-089',
    title: 'Severe crater near Nakawa Market junction',
    roadName: 'Jinja Road',
    landmark: 'Opposite Nakawa Market pedestrian crossing',
    division: 'Nakawa',
    lat: 0.3294,
    lng: 32.6178,
    severity: 'critical',
    depthCm: 18,
    diameterCm: 95,
    status: 'in_repair',
    upvotes: 142,
    reportedBy: 'Kigozi Brian (Taxi Driver)',
    reportedAt: '2026-08-18T08:30:00Z',
    updatedAt: '2026-08-20T14:15:00Z',
    description: 'Sub-base completely washed away after heavy rain. Vehicles swerving into oncoming traffic towards Spear Motors. Boda-bodas falling during evening rush hours.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    bodaHazardWarning: true,
    workOrderNumber: 'KCCA-WO-2026-1104',
    assignedCrew: 'Nakawa Works Rapid Response Unit',
    aiAnalysis: {
      hazardScore: 9.4,
      depthCm: 18,
      diameterCm: 95,
      severity: 'critical',
      vehicleDamageRisk: 'Extreme risk of suspension failure, rim cracking, and lethal boda-boda rollover at night.',
      estimatedAsphaltTons: 1.85,
      estimatedRepairCostUGX: 4200000,
      estimatedRepairCostUSD: 1130,
      kccaPriorityRank: 'Emergency (24h)',
      repairRecommendations: [
        'Immediate mechanical sawing of edges to 40mm depth',
        'Excavate loosened gravel and pump out stagnant water',
        'Apply heavy bituminous emulsion tack coat (K1-60)',
        'Compact 50mm Asphalt Concrete wearing course with 8-ton vibratory roller'
      ],
      aiSummary: 'High-volume arterial degradation caused by intense stormwater runoff from Nakawa hill coupled with heavily loaded transit trailers.'
    },
    comments: [
      {
        id: 'c1',
        author: 'Kakooza Denis (Boda Rider)',
        text: 'Two riders bent their front forks here yesterday night. Please put reflective warning cones!',
        time: '2 days ago',
        role: 'boda_rider'
      },
      {
        id: 'c2',
        author: 'Eng. Sarah Nansubuga',
        text: 'Crew dispatched today with cold-mix temporary patch while scheduling full bitumen overlay this weekend.',
        time: 'Yesterday',
        role: 'kcca_engineer'
      }
    ]
  },
  {
    id: 'KLA-2026-094',
    title: 'Twin tire-buster potholes on Sir Apollo Kaggwa Rd',
    roadName: 'Sir Apollo Kaggwa Road',
    landmark: 'Between Makerere Small Gate and TotalEnergies',
    division: 'Kawempe',
    lat: 0.3345,
    lng: 32.5668,
    severity: 'critical',
    depthCm: 16,
    diameterCm: 80,
    status: 'reported',
    upvotes: 98,
    reportedBy: 'Dr. Nakato Prossy',
    reportedAt: '2026-08-19T11:20:00Z',
    updatedAt: '2026-08-19T11:20:00Z',
    description: 'Deep twin hollows right in the center of the lane. Low-clearance saloons bottoming out with severe oil sump damage.',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    bodaHazardWarning: true,
    aiAnalysis: {
      hazardScore: 8.9,
      depthCm: 16,
      diameterCm: 80,
      severity: 'critical',
      vehicleDamageRisk: 'Severe sump rupture and rim deformation risk.',
      estimatedAsphaltTons: 1.4,
      estimatedRepairCostUGX: 3100000,
      estimatedRepairCostUSD: 835,
      kccaPriorityRank: 'Emergency (24h)',
      repairRecommendations: [
        'Drain water trapped under base layer',
        'Reinforce with crushed stone aggregate (Grading 0/37.5)',
        'Lay hot-mix asphalt (HMA) with 4.5% bitumen content'
      ],
      aiSummary: 'Edge failure triggered by Makerere hillside drainage overflow into road carriage.'
    },
    comments: [
      {
        id: 'c3',
        author: 'Muwonge Joel',
        text: 'My car tyre burst here on Tuesday. KCCA should act promptly.',
        time: '1 day ago',
        role: 'citizen'
      }
    ]
  },
  {
    id: 'KLA-2026-077',
    title: 'Sunken culvert and deep trench',
    roadName: 'Ggaba Road',
    landmark: 'Near Kansanga Market bus stage',
    division: 'Makindye',
    lat: 0.2878,
    lng: 32.6019,
    severity: 'severe',
    depthCm: 14,
    diameterCm: 110,
    status: 'verified',
    upvotes: 84,
    reportedBy: 'Tumusiime Ronald',
    reportedAt: '2026-08-16T16:45:00Z',
    updatedAt: '2026-08-17T09:10:00Z',
    description: 'The culvert beneath has cracked causing the asphalt to collapse into a concave depression.',
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    bodaHazardWarning: true,
    workOrderNumber: 'KCCA-WO-2026-1088',
    assignedCrew: 'Makindye Drainage & Infrastructure Gang',
    aiAnalysis: {
      hazardScore: 8.2,
      depthCm: 14,
      diameterCm: 110,
      severity: 'severe',
      vehicleDamageRisk: 'High risk of chassis scrapes and vehicle bottoming out during heavy rain.',
      estimatedAsphaltTons: 2.2,
      estimatedRepairCostUGX: 5600000,
      estimatedRepairCostUSD: 1510,
      kccaPriorityRank: 'Urgent (72h)',
      repairRecommendations: [
        'Replace broken precast concrete culvert section',
        'Backfill with selected granular material in 150mm compacted layers',
        'Asphalt resurfacing across 6m road strip'
      ],
      aiSummary: 'Culvert structural fatigue exacerbated by high commuter minibus traffic headed to Ggaba & Munyonyo.'
    },
    comments: []
  },
  {
    id: 'KLA-2026-061',
    title: 'Cluster of potholes near Posta Uganda',
    roadName: 'Kampala Road',
    landmark: 'Posta Uganda / Bank of Uganda crossing',
    division: 'Central',
    lat: 0.3146,
    lng: 32.5806,
    severity: 'moderate',
    depthCm: 9,
    diameterCm: 55,
    status: 'patched',
    upvotes: 67,
    reportedBy: 'KCCA Patrol Unit',
    reportedAt: '2026-08-12T07:15:00Z',
    updatedAt: '2026-08-15T18:00:00Z',
    description: 'Surface ravelling and edge peeling in CBD traffic lane. Successfully milled and hot-patch sealed.',
    imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
    bodaHazardWarning: false,
    workOrderNumber: 'KCCA-WO-2026-1042',
    assignedCrew: 'Central Directorate Night Shift',
    aiAnalysis: {
      hazardScore: 5.5,
      depthCm: 9,
      diameterCm: 55,
      severity: 'moderate',
      vehicleDamageRisk: 'Minor alignment misalignment; moderate ride discomfort.',
      estimatedAsphaltTons: 0.6,
      estimatedRepairCostUGX: 1450000,
      estimatedRepairCostUSD: 390,
      kccaPriorityRank: 'Scheduled',
      repairRecommendations: [
        'Milling of surface layer',
        'Tack coat application',
        'Smooth roller compaction'
      ],
      aiSummary: 'Routine surface fatigue in high density urban center.'
    },
    comments: [
      {
        id: 'c4',
        author: 'Eng. David Luyimbazi',
        text: 'Completed patch works on Aug 15th at night to avoid day traffic disruption.',
        time: '6 days ago',
        role: 'kcca_engineer'
      }
    ]
  },
  {
    id: 'KLA-2026-101',
    title: 'Deep ditch at Kalerwe Northern Bypass slip road',
    roadName: 'Northern Bypass',
    landmark: 'Kalerwe interchange northbound exit',
    division: 'Kawempe',
    lat: 0.3548,
    lng: 32.5705,
    severity: 'critical',
    depthCm: 22,
    diameterCm: 125,
    status: 'reported',
    upvotes: 189,
    reportedBy: 'Mubiru Samuel (Truck Driver)',
    reportedAt: '2026-08-20T06:10:00Z',
    updatedAt: '2026-08-20T06:10:00Z',
    description: 'Huge gaping hole directly on slip road merge. Causes instant severe tailbacks during morning peak hours.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    bodaHazardWarning: true,
    aiAnalysis: {
      hazardScore: 9.8,
      depthCm: 22,
      diameterCm: 125,
      severity: 'critical',
      vehicleDamageRisk: 'Catastrophic truck axle breakage and rollover hazard for fast moving traffic.',
      estimatedAsphaltTons: 3.1,
      estimatedRepairCostUGX: 7800000,
      estimatedRepairCostUSD: 2100,
      kccaPriorityRank: 'Emergency (24h)',
      repairRecommendations: [
        'Full depth excavation of failed base course (300mm)',
        'Place geo-grid membrane to stop clay soil pumping',
        'Stabilize with 200mm cement-treated base (CTB)',
        '60mm heavy duty polymer modified asphalt wearing course'
      ],
      aiSummary: 'Critical structural failure under heavy transit freight axle loads on unreinforced slip road shoulder.'
    },
    comments: []
  },
  {
    id: 'KLA-2026-082',
    title: 'Spreading potholes near Kabaka\'s Lake',
    roadName: 'Rubaga Road',
    landmark: '300m from Kabaka\'s Lake leisure park entrance',
    division: 'Rubaga',
    lat: 0.3012,
    lng: 32.5558,
    severity: 'severe',
    depthCm: 13,
    diameterCm: 70,
    status: 'in_repair',
    upvotes: 52,
    reportedBy: 'Nanyonjo Grace',
    reportedAt: '2026-08-17T14:30:00Z',
    updatedAt: '2026-08-20T10:00:00Z',
    description: 'Water ponding continuously during rains accelerating tarmac peeling on both lanes.',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    bodaHazardWarning: true,
    workOrderNumber: 'KCCA-WO-2026-1092',
    assignedCrew: 'Rubaga Road Maintenance Team',
    aiAnalysis: {
      hazardScore: 7.9,
      depthCm: 13,
      diameterCm: 70,
      severity: 'severe',
      vehicleDamageRisk: 'Moderate to high risk of shock absorber rupture and tire side-wall cuts.',
      estimatedAsphaltTons: 1.1,
      estimatedRepairCostUGX: 2600000,
      estimatedRepairCostUSD: 700,
      kccaPriorityRank: 'Urgent (72h)',
      repairRecommendations: [
        'Unblock side roadside drainage channels first',
        'Square cut damaged tarmac zone',
        'Re-pack aggregate and roll hot bitumen'
      ],
      aiSummary: 'Poor roadside stormwater runoff causing hydrostatic pore pressure below asphalt.'
    },
    comments: []
  },
  {
    id: 'KLA-2026-055',
    title: 'Edge erosion and potholes on Bugolobi curve',
    roadName: 'Bandali Rise / Port Bell Road',
    landmark: 'Near Bugolobi Village Mall exit',
    division: 'Nakawa',
    lat: 0.3175,
    lng: 32.6248,
    severity: 'moderate',
    depthCm: 8,
    diameterCm: 45,
    status: 'verified',
    upvotes: 41,
    reportedBy: 'Kavuma Arthur',
    reportedAt: '2026-08-14T09:00:00Z',
    updatedAt: '2026-08-16T12:00:00Z',
    description: 'Road shoulder is eroded forcing cars into the center line on a blind corner.',
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    bodaHazardWarning: false,
    aiAnalysis: {
      hazardScore: 6.4,
      depthCm: 8,
      diameterCm: 45,
      severity: 'moderate',
      vehicleDamageRisk: 'Moderate cornering slip hazard in wet conditions.',
      estimatedAsphaltTons: 0.75,
      estimatedRepairCostUGX: 1800000,
      estimatedRepairCostUSD: 485,
      kccaPriorityRank: 'Scheduled',
      repairRecommendations: [
        'Shoulder regrading and stone kerb protection',
        'Asphalt patching with medium seal'
      ],
      aiSummary: 'Shoulder erosion caused by vehicles parking on soft verge.'
    },
    comments: []
  },
  {
    id: 'KLA-2026-039',
    title: 'Pothole patch on Kibuye roundabout link',
    roadName: 'Entebbe Road',
    landmark: 'Kibuye Roundabout heading towards Namasuba',
    division: 'Makindye',
    lat: 0.2918,
    lng: 32.5698,
    severity: 'minor',
    depthCm: 5,
    diameterCm: 30,
    status: 'patched',
    upvotes: 33,
    reportedBy: 'Ssali Martin',
    reportedAt: '2026-08-10T13:10:00Z',
    updatedAt: '2026-08-12T17:30:00Z',
    description: 'Minor hollow repaired during routine highway maintenance.',
    imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
    bodaHazardWarning: false,
    workOrderNumber: 'KCCA-WO-2026-1011',
    assignedCrew: 'Makindye Infrastructure Unit',
    aiAnalysis: {
      hazardScore: 3.8,
      depthCm: 5,
      diameterCm: 30,
      severity: 'minor',
      vehicleDamageRisk: 'Low vehicle damage hazard.',
      estimatedAsphaltTons: 0.3,
      estimatedRepairCostUGX: 750000,
      estimatedRepairCostUSD: 200,
      kccaPriorityRank: 'Low Priority',
      repairRecommendations: ['Surface sealing'],
      aiSummary: 'Early stage aggregate loss successfully arrested with surface seal.'
    },
    comments: []
  },
  {
    id: 'KLA-2026-112',
    title: 'Severe trench on Wandegeya - Mulago link',
    roadName: 'Bombo Road',
    landmark: 'Mulago Hospital junction descent',
    division: 'Central',
    lat: 0.3312,
    lng: 32.5740,
    severity: 'critical',
    depthCm: 17,
    diameterCm: 85,
    status: 'reported',
    upvotes: 115,
    reportedBy: 'Dr. Okello Bosco (Ambulance Service)',
    reportedAt: '2026-08-20T19:40:00Z',
    updatedAt: '2026-08-20T19:40:00Z',
    description: 'Critical emergency ambulance route obstructed. Ambulances carrying critical patients are forced to slow to 5km/h risking patient trauma.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    bodaHazardWarning: true,
    aiAnalysis: {
      hazardScore: 9.6,
      depthCm: 17,
      diameterCm: 85,
      severity: 'critical',
      vehicleDamageRisk: 'Critical hazard to emergency ambulance suspensions and patient safety.',
      estimatedAsphaltTons: 1.6,
      estimatedRepairCostUGX: 3800000,
      estimatedRepairCostUSD: 1025,
      kccaPriorityRank: 'Emergency (24h)',
      repairRecommendations: [
        'Priority overnight emergency asphalt reinstatement',
        'High-early-strength rapid hardening concrete base',
        'Polymer-modified asphalt wearing course'
      ],
      aiSummary: 'Strategic emergency corridor priority needing immediate intervention within 24 hours.'
    },
    comments: [
      {
        id: 'c5',
        author: 'Nagawa Joan',
        text: 'Saw an ambulance brake violently here today. This must be fixed immediately!',
        time: '3 hours ago',
        role: 'citizen'
      }
    ]
  }
];

export const ROAD_POPULAR_OPTIONS = [
  'Jinja Road',
  'Kampala Road',
  'Bombo Road',
  'Entebbe Road',
  'Northern Bypass',
  'Ggaba Road',
  'Sir Apollo Kaggwa Road',
  'Port Bell Road',
  'Rubaga Road',
  'Kira Road',
  'Yusuf Lule Road',
  'Salaama Road',
  'Mawanda Road',
  'Bukoto-Kisaasi Road',
  'Sentema Road',
  'Lugogo Bypass',
  'Namugongo Road',
  'Gayaza Road',
  'Old Port Bell Road',
  'Kyaggwe Road'
];

export const SAMPLE_POTHOLE_IMAGES = [
  {
    name: 'Severe Crater on Jinja Road',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    description: 'Deep road cavity with exposed gravel sub-base'
  },
  {
    name: 'Asphalt Ravelling & Edge Fracture',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    description: 'Peeling bitumen layer forming twin tire traps'
  },
  {
    name: 'Water-Filled Sub-Base Collapse',
    url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    description: 'Puddle concealing dangerous 15cm sharp asphalt ledge'
  }
];
