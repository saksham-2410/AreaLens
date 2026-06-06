import { SECTOR_POLYGONS } from './sectorPolygons'

export type ProjectStatus = 'Proposed' | 'Active' | 'Stalled' | 'Completed'
export type PredictionRating = 'Rising' | 'Stable' | 'Declining' | 'Transforming'

export interface SectorMetrics {
  aqi: number
  water_tanker_reliance: number // 1–5
  power_outage_mins: number // avg per day
  noise_db: number
  waterlogging_level: number // 1–5
}

export interface Amenity {
  name: string
  distance_km: number
  rating?: number
}

export interface InfraProject {
  title: string
  type: 'Metro' | 'Flyover' | 'Water Line' | 'Road' | 'Park' | 'Hospital' | 'Transit Hub'
  completion_year: number
  status: ProjectStatus
  impact: 'High' | 'Medium' | 'Low'
}

export interface RadarScores {
  air_quality: number
  water_reliability: number
  power_reliability: number
  noise_peace: number
  connectivity: number
  infra_health: number
}

export interface Sector {
  id: string
  sector_code: string
  sector_name: string
  vibe_tag: string
  vibe_emoji: string
  coordinates: [number, number] // [lng, lat]
  polygon: number[][][]
  score: number // 0–100
  metrics: SectorMetrics
  radar: RadarScores
  amenities: {
    hospitals: Amenity[]
    schools: Amenity[]
    malls: Amenity[]
    metro: Amenity | null
  }
  infrastructure_projects: InfraProject[]
  prediction_3yr: {
    rating: PredictionRating
    summary: string
    risks: string[]
    opportunities: string[]
  }
  price_range: {
    buy_psf: [number, number]
    rent_2bhk: [number, number]
  }
}

function rect(cLng: number, cLat: number, latOff: number, lngOff: number): number[][][] {
  return [[
    [cLng + lngOff, cLat - latOff],
    [cLng + lngOff, cLat + latOff],
    [cLng - lngOff, cLat + latOff],
    [cLng - lngOff, cLat - latOff],
    [cLng + lngOff, cLat - latOff],
  ]]
}

export const SECTORS: Sector[] = [
  {
    id: 'sec-43-huda',
    sector_code: 'SEC-43',
    sector_name: 'DLF Phase 5 / Sec 43',
    vibe_tag: 'Ultra-Premium Address',
    vibe_emoji: '💎',
    coordinates: [77.0928, 28.4575],
    polygon: rect(77.0928, 28.4575, 0.0042, 0.0042),
    score: 88,
    metrics: { aqi: 138, water_tanker_reliance: 1.5, power_outage_mins: 22, noise_db: 54, waterlogging_level: 1 },
    radar: { air_quality: 72, water_reliability: 70, power_reliability: 88, noise_peace: 74, connectivity: 86, infra_health: 90 },
    amenities: {
      hospitals: [{ name: 'Medanta Hospital', distance_km: 2.1, rating: 4.8 }, { name: 'Fortis Memorial', distance_km: 3.4, rating: 4.6 }],
      schools: [{ name: 'DPS Sector 45', distance_km: 1.2, rating: 4.7 }, { name: 'The Shri Ram School', distance_km: 2.0, rating: 4.8 }],
      malls: [{ name: 'DLF Mega Mall', distance_km: 1.8 }, { name: 'Ambience Mall', distance_km: 3.5 }],
      metro: { name: 'HUDA City Centre', distance_km: 1.4 },
    },
    infrastructure_projects: [
      { title: 'Rapid Metro Extension Phase 2', type: 'Metro', completion_year: 2026, status: 'Active', impact: 'High' },
      { title: 'Golf Course Road Signal-Free Corridor', type: 'Road', completion_year: 2025, status: 'Completed', impact: 'High' },
      { title: 'DLF Phase 5 Central Park Renovation', type: 'Park', completion_year: 2025, status: 'Active', impact: 'Medium' },
    ],
    prediction_3yr: {
      rating: 'Stable',
      summary: 'Fully matured micro-market. Values stable with marginal appreciation tied to Golf Course Road corridor development.',
      risks: ['High maintenance costs', 'Traffic saturation on Golf Course Road'],
      opportunities: ['Rapid Metro extension boosts last-mile connectivity', 'Corporate leasing demand stable year-round'],
    },
    price_range: { buy_psf: [14000, 22000], rent_2bhk: [45000, 75000] },
  },
  {
    id: 'sec-54',
    sector_code: 'SEC-54',
    sector_name: 'Sector 54',
    vibe_tag: 'Golf Course Royale',
    vibe_emoji: '⛳',
    coordinates: [77.1107, 28.4409],
    polygon: rect(77.1107, 28.4409, 0.0040, 0.0040),
    score: 84,
    metrics: { aqi: 142, water_tanker_reliance: 2.0, power_outage_mins: 35, noise_db: 57, waterlogging_level: 2 },
    radar: { air_quality: 72, water_reliability: 60, power_reliability: 81, noise_peace: 72, connectivity: 88, infra_health: 85 },
    amenities: {
      hospitals: [{ name: 'Artemis Hospital', distance_km: 1.8, rating: 4.5 }],
      schools: [{ name: 'Presidium School Sec 57', distance_km: 2.1, rating: 4.5 }],
      malls: [{ name: 'MGF Metropolitan', distance_km: 2.4 }, { name: 'Sector 29 Leisure Zone', distance_km: 3.0 }],
      metro: { name: 'Sector 54 Chowk (Rapid)', distance_km: 0.6 },
    },
    infrastructure_projects: [
      { title: 'Golf Course Road Underpass at Sec 54', type: 'Flyover', completion_year: 2025, status: 'Completed', impact: 'High' },
      { title: 'Sector 54 Water Treatment Plant Upgrade', type: 'Water Line', completion_year: 2026, status: 'Active', impact: 'Medium' },
    ],
    prediction_3yr: {
      rating: 'Stable',
      summary: 'Premium established corridor. Rapid Metro stop drives consistent rental demand from corporates.',
      risks: ['Water tanker dependency persists until 2026 upgrade', 'Traffic congestion near Golf Course Road'],
      opportunities: ['Rapid Metro ridership increasing', 'Proximity to corporate hubs retains tenant demand'],
    },
    price_range: { buy_psf: [12000, 18000], rent_2bhk: [40000, 65000] },
  },
  {
    id: 'sec-55',
    sector_code: 'SEC-55',
    sector_name: 'Sector 55',
    vibe_tag: 'The Gold Mile',
    vibe_emoji: '🏙️',
    coordinates: [77.1118, 28.4253],
    polygon: rect(77.1118, 28.4253, 0.0040, 0.0040),
    score: 82,
    metrics: { aqi: 148, water_tanker_reliance: 2.5, power_outage_mins: 38, noise_db: 62, waterlogging_level: 2 },
    radar: { air_quality: 70, water_reliability: 50, power_reliability: 79, noise_peace: 64, connectivity: 84, infra_health: 80 },
    amenities: {
      hospitals: [{ name: 'Paras Hospital', distance_km: 1.2, rating: 4.4 }],
      schools: [{ name: 'Shalom Hills International', distance_km: 1.5, rating: 4.6 }],
      malls: [{ name: 'Vatika City Centre', distance_km: 1.0 }],
      metro: { name: 'Sec 55-56 (Rapid Metro)', distance_km: 0.4 },
    },
    infrastructure_projects: [
      { title: 'Sector 55 Stormwater Drainage Upgrade', type: 'Water Line', completion_year: 2026, status: 'Active', impact: 'Medium' },
      { title: 'Golf Course Road Widening', type: 'Road', completion_year: 2027, status: 'Proposed', impact: 'High' },
    ],
    prediction_3yr: {
      rating: 'Rising',
      summary: 'High-rise residential corridor with strong appreciation potential as Golf Course Road matures.',
      risks: ['Noise from Golf Course Road traffic increasing', 'Waterlogging persists in monsoon seasons'],
      opportunities: ['Stormwater upgrade resolves monsoon waterlogging', 'New high-rises boosting neighbourhood profile'],
    },
    price_range: { buy_psf: [11000, 16000], rent_2bhk: [38000, 58000] },
  },
  {
    id: 'sec-56',
    sector_code: 'SEC-56',
    sector_name: 'Sector 56',
    vibe_tag: 'Golf Course Heights',
    vibe_emoji: '🌆',
    coordinates: [77.0982, 28.4244],
    polygon: rect(77.0982, 28.4244, 0.0048, 0.0048),
    score: 83,
    metrics: { aqi: 145, water_tanker_reliance: 2.0, power_outage_mins: 32, noise_db: 60, waterlogging_level: 2 },
    radar: { air_quality: 71, water_reliability: 60, power_reliability: 82, noise_peace: 66, connectivity: 82, infra_health: 82 },
    amenities: {
      hospitals: [{ name: 'Columbia Asia Hospital', distance_km: 2.8, rating: 4.3 }],
      schools: [{ name: 'GD Goenka World School', distance_km: 3.1, rating: 4.7 }],
      malls: [{ name: 'Vatika City Centre', distance_km: 1.8 }],
      metro: { name: 'Sec 55-56 (Rapid Metro)', distance_km: 0.8 },
    },
    infrastructure_projects: [
      { title: 'Sector 56 Internal Road Repaving', type: 'Road', completion_year: 2025, status: 'Completed', impact: 'Low' },
      { title: 'New Water Supply Pipeline Network', type: 'Water Line', completion_year: 2026, status: 'Active', impact: 'Medium' },
    ],
    prediction_3yr: {
      rating: 'Stable',
      summary: 'Well-established premium residential zone. Consistent demand from tech and finance professionals.',
      risks: ['Ageing apartment stock in older complexes', 'Limited new supply'],
      opportunities: ['Water supply upgrade in progress', 'Stable long-term corporate rental demand'],
    },
    price_range: { buy_psf: [10500, 15500], rent_2bhk: [35000, 55000] },
  },
  {
    id: 'sec-57',
    sector_code: 'SEC-57',
    sector_name: 'Sector 57',
    vibe_tag: 'Quiet Enclave',
    vibe_emoji: '🌿',
    coordinates: [77.0780, 28.4215],
    polygon: rect(77.0780, 28.4215, 0.0044, 0.0040),
    score: 76,
    metrics: { aqi: 140, water_tanker_reliance: 3.0, power_outage_mins: 60, noise_db: 48, waterlogging_level: 3 },
    radar: { air_quality: 72, water_reliability: 40, power_reliability: 67, noise_peace: 82, connectivity: 70, infra_health: 68 },
    amenities: {
      hospitals: [{ name: 'Medanta Hospital', distance_km: 3.5, rating: 4.8 }],
      schools: [{ name: 'Delhi Public School Sec 45', distance_km: 2.8, rating: 4.7 }],
      malls: [{ name: 'Omaxe Celebration Mall', distance_km: 3.2 }],
      metro: { name: 'IFFCO Chowk (Yellow Line)', distance_km: 3.8 },
    },
    infrastructure_projects: [
      { title: 'Sector 57 Sewage Network Overhaul', type: 'Water Line', completion_year: 2027, status: 'Proposed', impact: 'High' },
      { title: 'Green Belt & Pedestrian Track', type: 'Park', completion_year: 2026, status: 'Active', impact: 'Medium' },
    ],
    prediction_3yr: {
      rating: 'Stable',
      summary: 'Low-density enclave with excellent greenery. Power reliability and water supply are key negatives.',
      risks: ['High tanker reliance with no near-term piped water upgrade', 'Power outages above city average'],
      opportunities: ['Green Belt project increases livability scores', 'Quietest residential pocket in Golf Course Road belt'],
    },
    price_range: { buy_psf: [9000, 13000], rent_2bhk: [28000, 44000] },
  },
  {
    id: 'sec-58',
    sector_code: 'SEC-58',
    sector_name: 'Sector 58',
    vibe_tag: 'Extension Elite',
    vibe_emoji: '🚀',
    coordinates: [77.1097, 28.4184],
    polygon: rect(77.1097, 28.4184, 0.0040, 0.0040),
    score: 78,
    metrics: { aqi: 140, water_tanker_reliance: 2.0, power_outage_mins: 42, noise_db: 64, waterlogging_level: 3 },
    radar: { air_quality: 72, water_reliability: 60, power_reliability: 77, noise_peace: 62, connectivity: 76, infra_health: 78 },
    amenities: {
      hospitals: [{ name: 'Paras Hospital', distance_km: 2.5, rating: 4.4 }],
      schools: [{ name: 'Pathways World School', distance_km: 1.4, rating: 4.9 }],
      malls: [{ name: 'Bestech Central Square', distance_km: 2.0 }],
      metro: { name: 'Sec 54 Chowk (Rapid)', distance_km: 2.8 },
    },
    infrastructure_projects: [
      { title: 'Golf Course Extension Rapid Metro Phase 2', type: 'Metro', completion_year: 2027, status: 'Active', impact: 'High' },
      { title: 'Sector 58 Master Drain Construction', type: 'Water Line', completion_year: 2026, status: 'Active', impact: 'High' },
    ],
    prediction_3yr: {
      rating: 'Rising',
      summary: 'Metro extension due 2027 will be a game-changer. Currently undervalued relative to Golf Course Road.',
      risks: ['Construction dust and disruption until 2027', 'Waterlogging persists until drain project completes'],
      opportunities: ['Metro connectivity boosts values significantly post-2027', 'Major drain project resolves monsoon flooding'],
    },
    price_range: { buy_psf: [8500, 13000], rent_2bhk: [28000, 44000] },
  },
  {
    id: 'sec-61',
    sector_code: 'SEC-61',
    sector_name: 'Sector 61',
    vibe_tag: 'Smart Corridor',
    vibe_emoji: '⚡',
    coordinates: [77.0967, 28.4102],
    polygon: rect(77.0967, 28.4102, 0.0040, 0.0040),
    score: 73,
    metrics: { aqi: 138, water_tanker_reliance: 2.5, power_outage_mins: 55, noise_db: 58, waterlogging_level: 3 },
    radar: { air_quality: 72, water_reliability: 50, power_reliability: 69, noise_peace: 70, connectivity: 72, infra_health: 74 },
    amenities: {
      hospitals: [{ name: 'Max Hospital Sohna Rd', distance_km: 3.0, rating: 4.4 }],
      schools: [{ name: 'Heritage Xperiential School', distance_km: 1.8, rating: 4.5 }],
      malls: [{ name: 'Omaxe Celebration', distance_km: 2.4 }],
      metro: null,
    },
    infrastructure_projects: [
      { title: 'Southern Peripheral Road Widening', type: 'Road', completion_year: 2026, status: 'Active', impact: 'High' },
      { title: 'Sector 61 Water Supply Network', type: 'Water Line', completion_year: 2027, status: 'Proposed', impact: 'Medium' },
    ],
    prediction_3yr: {
      rating: 'Transforming',
      summary: 'SPR widening is transformative. Well-positioned for 3-yr appreciation as road access improves.',
      risks: ['No metro connectivity yet', 'Moderate power reliability issues'],
      opportunities: ['SPR road upgrade underway', 'Lower entry price versus Golf Course Road'],
    },
    price_range: { buy_psf: [7500, 11500], rent_2bhk: [22000, 36000] },
  },
  {
    id: 'sec-62',
    sector_code: 'SEC-62',
    sector_name: 'Sector 62',
    vibe_tag: 'New Wave Living',
    vibe_emoji: '🌊',
    coordinates: [77.0835, 28.4084],
    polygon: rect(77.0835, 28.4084, 0.0044, 0.0048),
    score: 70,
    metrics: { aqi: 136, water_tanker_reliance: 2.5, power_outage_mins: 58, noise_db: 55, waterlogging_level: 4 },
    radar: { air_quality: 73, water_reliability: 50, power_reliability: 68, noise_peace: 74, connectivity: 68, infra_health: 70 },
    amenities: {
      hospitals: [{ name: 'Medanta Hospital', distance_km: 4.0, rating: 4.8 }],
      schools: [{ name: 'Scottish High International', distance_km: 2.2, rating: 4.6 }],
      malls: [{ name: 'Cross Point Mall', distance_km: 3.0 }],
      metro: null,
    },
    infrastructure_projects: [
      { title: 'Sector 62–65 Road Connectivity Project', type: 'Road', completion_year: 2026, status: 'Active', impact: 'High' },
      { title: 'Stormwater Management System', type: 'Water Line', completion_year: 2027, status: 'Proposed', impact: 'High' },
    ],
    prediction_3yr: {
      rating: 'Rising',
      summary: 'One of NCR\'s best long-term bets. Severe waterlogging is the main short-term deterrent.',
      risks: ['Severe monsoon waterlogging for at least 2 more years', 'No metro access until post-2027'],
      opportunities: ['Stormwater project resolves flooding risk', 'Connectivity project opens new access corridors'],
    },
    price_range: { buy_psf: [7000, 10500], rent_2bhk: [20000, 32000] },
  },
  {
    id: 'sec-66',
    sector_code: 'SEC-66',
    sector_name: 'Sector 66',
    vibe_tag: 'Rapid Rise Zone',
    vibe_emoji: '📈',
    coordinates: [77.0554, 28.3977],
    polygon: rect(77.0554, 28.3977, 0.0048, 0.0050),
    score: 65,
    metrics: { aqi: 132, water_tanker_reliance: 3.5, power_outage_mins: 78, noise_db: 52, waterlogging_level: 4 },
    radar: { air_quality: 74, water_reliability: 30, power_reliability: 57, noise_peace: 76, connectivity: 60, infra_health: 62 },
    amenities: {
      hospitals: [{ name: 'Ninewells Hospital', distance_km: 2.8, rating: 4.0 }],
      schools: [{ name: 'Ryan International Sec 31', distance_km: 4.2, rating: 4.2 }],
      malls: [{ name: 'Raheja Mall Sohna Rd', distance_km: 3.5 }],
      metro: null,
    },
    infrastructure_projects: [
      { title: 'Dwarka Expressway Spur to Sohna Road', type: 'Road', completion_year: 2027, status: 'Proposed', impact: 'High' },
      { title: 'Power Sub-Station Augmentation', type: 'Transit Hub', completion_year: 2026, status: 'Active', impact: 'High' },
    ],
    prediction_3yr: {
      rating: 'Transforming',
      summary: 'Best price-to-potential ratio in the entire Sohna Road belt. Infrastructure is the current bottleneck.',
      risks: ['Critical tanker reliance — no piped water timeline confirmed', 'Frequent power outages, sub-station upgrade needed'],
      opportunities: ['Power sub-station upgrade in progress for 2026', 'Upcoming road spur dramatically reduces commute times'],
    },
    price_range: { buy_psf: [6000, 9000], rent_2bhk: [16000, 26000] },
  },
  {
    id: 'sec-47',
    sector_code: 'SEC-47',
    sector_name: 'Sector 47',
    vibe_tag: 'Sohna Road Entry',
    vibe_emoji: '🏘️',
    coordinates: [77.0477, 28.4259],
    polygon: rect(77.0477, 28.4259, 0.0040, 0.0040),
    score: 63,
    metrics: { aqi: 160, water_tanker_reliance: 4.0, power_outage_mins: 92, noise_db: 62, waterlogging_level: 3 },
    radar: { air_quality: 68, water_reliability: 20, power_reliability: 49, noise_peace: 64, connectivity: 64, infra_health: 55 },
    amenities: {
      hospitals: [{ name: 'Cloudnine Hospital', distance_km: 1.5, rating: 4.1 }],
      schools: [{ name: 'Bal Bharati Public School', distance_km: 0.8, rating: 4.0 }],
      malls: [{ name: 'Gold Souk Grande', distance_km: 2.2 }],
      metro: { name: 'IFFCO Chowk (Yellow Line)', distance_km: 3.2 },
    },
    infrastructure_projects: [
      { title: 'Sohna Road Signal-Free Elevated Corridor', type: 'Flyover', completion_year: 2027, status: 'Active', impact: 'High' },
      { title: 'Sector 47 Sewage Line Rehabilitation', type: 'Water Line', completion_year: 2026, status: 'Stalled', impact: 'Medium' },
    ],
    prediction_3yr: {
      rating: 'Stable',
      summary: 'Affordable proximity play to Sohna Road belt. Utility infrastructure is a persistent concern.',
      risks: ['Sewage rehabilitation stalled — no timeline update', 'High tanker reliance with 4.0/5 score'],
      opportunities: ['Sohna Road elevated corridor massively improves commute', 'Affordable entry price for Sohna Road exposure'],
    },
    price_range: { buy_psf: [6500, 9500], rent_2bhk: [16000, 26000] },
  },
  {
    id: 'sec-49',
    sector_code: 'SEC-49',
    sector_name: 'Sector 49',
    vibe_tag: 'Sohna Midrange',
    vibe_emoji: '🏠',
    coordinates: [77.0497, 28.4111],
    polygon: rect(77.0497, 28.4111, 0.0040, 0.0040),
    score: 68,
    metrics: { aqi: 158, water_tanker_reliance: 3.5, power_outage_mins: 80, noise_db: 55, waterlogging_level: 3 },
    radar: { air_quality: 68, water_reliability: 30, power_reliability: 56, noise_peace: 74, connectivity: 66, infra_health: 60 },
    amenities: {
      hospitals: [{ name: 'Fortis Escorts Heart', distance_km: 4.5, rating: 4.5 }],
      schools: [{ name: 'Amity International Sec 46', distance_km: 2.0, rating: 4.5 }],
      malls: [{ name: 'Omaxe Celebration', distance_km: 2.8 }],
      metro: null,
    },
    infrastructure_projects: [
      { title: 'Southern Peripheral Road Extension', type: 'Road', completion_year: 2026, status: 'Active', impact: 'High' },
      { title: 'Sector 49 Underground Water Supply', type: 'Water Line', completion_year: 2028, status: 'Proposed', impact: 'High' },
    ],
    prediction_3yr: {
      rating: 'Rising',
      summary: 'Good mid-market value. SPR extension and future water supply upgrade are positive tailwinds.',
      risks: ['High tanker reliance (3.5/5)', 'Underground water supply is distant (2028 proposal)'],
      opportunities: ['SPR road extension improving connectivity', 'Upcoming supply pipeline when approved'],
    },
    price_range: { buy_psf: [6800, 10000], rent_2bhk: [18000, 30000] },
  },
  {
    id: 'sec-50',
    sector_code: 'SEC-50',
    sector_name: 'Sector 50',
    vibe_tag: 'Value Sweet Spot',
    vibe_emoji: '⚖️',
    coordinates: [77.0633, 28.4166],
    polygon: rect(77.0633, 28.4166, 0.0040, 0.0040),
    score: 72,
    metrics: { aqi: 152, water_tanker_reliance: 3.0, power_outage_mins: 65, noise_db: 60, waterlogging_level: 3 },
    radar: { air_quality: 70, water_reliability: 40, power_reliability: 64, noise_peace: 66, connectivity: 72, infra_health: 66 },
    amenities: {
      hospitals: [{ name: 'Miracles Healthcare', distance_km: 1.5, rating: 4.0 }],
      schools: [{ name: 'K.R. Mangalam World School', distance_km: 1.0, rating: 4.4 }],
      malls: [{ name: 'Spaze Forum', distance_km: 2.0 }],
      metro: { name: 'HUDA City Centre', distance_km: 4.5 },
    },
    infrastructure_projects: [
      { title: 'Nirvana Country Internal Road Resurfacing', type: 'Road', completion_year: 2025, status: 'Completed', impact: 'Low' },
      { title: 'Sohna Road Bus Rapid Transit', type: 'Transit Hub', completion_year: 2027, status: 'Proposed', impact: 'Medium' },
    ],
    prediction_3yr: {
      rating: 'Stable',
      summary: 'Good balance of price and quality of life. Nirvana Country and South City are key micro-markets here.',
      risks: ['Water tanker dependence typical for Sohna Road sectors', 'Power reliability below Golf Course Road belt'],
      opportunities: ['BRT proposal improves transit options if approved', 'Stable demand due to school cluster nearby'],
    },
    price_range: { buy_psf: [7200, 10500], rent_2bhk: [20000, 34000] },
  },
  {
    id: 'sec-45',
    sector_code: 'SEC-45',
    sector_name: 'Sector 45',
    vibe_tag: 'Cyber Proximity',
    vibe_emoji: '💼',
    coordinates: [77.0671, 28.4447],
    polygon: rect(77.0671, 28.4447, 0.0040, 0.0040),
    score: 74,
    metrics: { aqi: 155, water_tanker_reliance: 2.5, power_outage_mins: 45, noise_db: 70, waterlogging_level: 2 },
    radar: { air_quality: 69, water_reliability: 50, power_reliability: 75, noise_peace: 56, connectivity: 82, infra_health: 72 },
    amenities: {
      hospitals: [{ name: 'Max Hospital Gurgaon', distance_km: 1.0, rating: 4.6 }],
      schools: [{ name: 'DPS Sector 45', distance_km: 0.5, rating: 4.7 }],
      malls: [{ name: 'DLF Mega Mall', distance_km: 2.5 }],
      metro: { name: 'HUDA City Centre', distance_km: 1.8 },
    },
    infrastructure_projects: [
      { title: 'HUDA City Centre Metro Parking Expansion', type: 'Transit Hub', completion_year: 2026, status: 'Active', impact: 'Medium' },
      { title: 'Sector 45–46 Road Widening', type: 'Road', completion_year: 2025, status: 'Completed', impact: 'Medium' },
    ],
    prediction_3yr: {
      rating: 'Stable',
      summary: 'Noisy but hyper-connected. The DPS cluster and metro proximity make this a perennial tenant favourite.',
      risks: ['High noise pollution from proximity to commercial zones and arterial roads', 'Congestion near Cyber City'],
      opportunities: ['Walking distance to HUDA City Centre Metro', 'Proximity to Medanta, Max, and top schools in one zone'],
    },
    price_range: { buy_psf: [9500, 14000], rent_2bhk: [30000, 50000] },
  },
  {
    id: 'sec-44',
    sector_code: 'SEC-44',
    sector_name: 'Sector 44',
    vibe_tag: 'DLF Heritage',
    vibe_emoji: '🏛️',
    coordinates: [77.0730, 28.4524],
    polygon: rect(77.0730, 28.4524, 0.0040, 0.0040),
    score: 78,
    metrics: { aqi: 148, water_tanker_reliance: 2.0, power_outage_mins: 38, noise_db: 64, waterlogging_level: 2 },
    radar: { air_quality: 70, water_reliability: 60, power_reliability: 79, noise_peace: 62, connectivity: 80, infra_health: 80 },
    amenities: {
      hospitals: [{ name: 'Medanta Hospital', distance_km: 2.2, rating: 4.8 }],
      schools: [{ name: 'Tagore Bal Niketan', distance_km: 1.0, rating: 4.1 }],
      malls: [{ name: 'DLF Mega Mall', distance_km: 1.5 }],
      metro: { name: 'HUDA City Centre', distance_km: 2.2 },
    },
    infrastructure_projects: [
      { title: 'Sector 44 Park Redevelopment', type: 'Park', completion_year: 2025, status: 'Completed', impact: 'Low' },
      { title: 'Internal Sewage Rehab Phase 2', type: 'Water Line', completion_year: 2026, status: 'Active', impact: 'Medium' },
    ],
    prediction_3yr: {
      rating: 'Stable',
      summary: 'Mature, walkable DLF zone. Consistently popular with families. No dramatic upside but reliable value.',
      risks: ['Ageing housing stock in older blocks', 'Noise from arterial road traffic'],
      opportunities: ['Strong school and hospital cluster nearby', 'Sewage rehab improving sanitation scores'],
    },
    price_range: { buy_psf: [10000, 15000], rent_2bhk: [32000, 52000] },
  },
  {
    id: 'sec-26-gurgaon',
    sector_code: 'SEC-26',
    sector_name: 'Sector 26 (DLF Phase 1)',
    vibe_tag: 'DLF Classic',
    vibe_emoji: '🌳',
    coordinates: [77.1022, 28.4765],
    polygon: rect(77.1022, 28.4765, 0.0040, 0.0040),
    score: 81,
    metrics: { aqi: 150, water_tanker_reliance: 2.0, power_outage_mins: 35, noise_db: 60, waterlogging_level: 2 },
    radar: { air_quality: 70, water_reliability: 60, power_reliability: 81, noise_peace: 66, connectivity: 84, infra_health: 82 },
    amenities: {
      hospitals: [{ name: 'Paras Hospital', distance_km: 1.5, rating: 4.4 }],
      schools: [{ name: 'DPS Sector 45', distance_km: 2.2, rating: 4.7 }],
      malls: [{ name: 'DT Mall Sec 29', distance_km: 2.8 }],
      metro: { name: 'MG Road (Yellow Line)', distance_km: 2.0 },
    },
    infrastructure_projects: [
      { title: 'DLF Phase 1 RWA Road Resurfacing', type: 'Road', completion_year: 2025, status: 'Completed', impact: 'Low' },
      { title: 'Sector 26 Green Canopy Initiative', type: 'Park', completion_year: 2026, status: 'Active', impact: 'Medium' },
    ],
    prediction_3yr: {
      rating: 'Stable',
      summary: 'DLF Phase 1 — the original premium address in Gurugram. Values are stable and the address premium is permanent.',
      risks: ['Ageing bungalow stock', 'Limited vertical development potential due to residential zoning'],
      opportunities: ['Green canopy initiative adds environmental value', 'Address premium consistently appreciated by corporates'],
    },
    price_range: { buy_psf: [13000, 20000], rent_2bhk: [42000, 70000] },
  },
  {
    id: 'sec-28-gurgaon',
    sector_code: 'SEC-28',
    sector_name: 'Sector 28 (MG Road)',
    vibe_tag: 'MG Road Adjacent',
    vibe_emoji: '🚇',
    coordinates: [77.0831, 28.4747],
    polygon: rect(77.0831, 28.4747, 0.0040, 0.0040),
    score: 71,
    metrics: { aqi: 162, water_tanker_reliance: 2.5, power_outage_mins: 48, noise_db: 72, waterlogging_level: 3 },
    radar: { air_quality: 68, water_reliability: 50, power_reliability: 73, noise_peace: 52, connectivity: 86, infra_health: 70 },
    amenities: {
      hospitals: [{ name: 'Columbia Asia', distance_km: 1.8, rating: 4.3 }],
      schools: [{ name: 'Amity International Sec 43', distance_km: 2.5, rating: 4.6 }],
      malls: [{ name: 'Ambience Mall Gurgaon', distance_km: 1.2 }],
      metro: { name: 'MG Road (Yellow Line)', distance_km: 0.6 },
    },
    infrastructure_projects: [
      { title: 'MG Road Metro Station Redevelopment', type: 'Transit Hub', completion_year: 2026, status: 'Active', impact: 'High' },
      { title: 'Old Delhi Road Decongestion Project', type: 'Flyover', completion_year: 2027, status: 'Proposed', impact: 'Medium' },
    ],
    prediction_3yr: {
      rating: 'Stable',
      summary: 'Mixed commercial-residential zone with best metro connectivity in Gurugram. Noise is the trade-off.',
      risks: ['High noise pollution from MG Road traffic', 'Commercial proliferation reducing residential quality'],
      opportunities: ['Best metro access in Gurugram (0.6km to Yellow Line)', 'Ambience Mall proximity drives rental demand'],
    },
    price_range: { buy_psf: [9500, 14000], rent_2bhk: [28000, 48000] },
  },
  {
    id: 'sec-14',
    sector_code: 'SEC-14',
    sector_name: 'Sector 14',
    vibe_tag: 'Old Gurugram Soul',
    vibe_emoji: '🏚️',
    coordinates: [77.0446, 28.4727],
    polygon: rect(77.0446, 28.4727, 0.0030, 0.0030),
    score: 58,
    metrics: { aqi: 172, water_tanker_reliance: 4.0, power_outage_mins: 105, noise_db: 68, waterlogging_level: 4 },
    radar: { air_quality: 66, water_reliability: 20, power_reliability: 42, noise_peace: 58, connectivity: 68, infra_health: 44 },
    amenities: {
      hospitals: [{ name: 'Civil Hospital Gurgaon', distance_km: 0.8, rating: 3.2 }],
      schools: [{ name: 'Govt. Boys Senior Sec School', distance_km: 0.5, rating: 3.0 }],
      malls: [{ name: 'Old City Market', distance_km: 0.3 }],
      metro: { name: 'Guru Dronacharya (Yellow Line)', distance_km: 1.2 },
    },
    infrastructure_projects: [
      { title: 'Old Gurgaon Sewage Renovation Phase 3', type: 'Water Line', completion_year: 2028, status: 'Stalled', impact: 'High' },
      { title: 'Sector 14 Underpass', type: 'Flyover', completion_year: 2026, status: 'Active', impact: 'Medium' },
    ],
    prediction_3yr: {
      rating: 'Declining',
      summary: 'Affordable but challenged by ageing utilities. Sewage project stalled. Best for short-term budget stays.',
      risks: ['Sewage renovation stalled — no confirmed restart timeline', 'Critical power reliability issues (105 min/day avg outages)', 'Heavy tanker dependence (4.0/5)'],
      opportunities: ['Underpass project reduces road congestion', 'Metro access at 1.2km is a genuine asset'],
    },
    price_range: { buy_psf: [5500, 8000], rent_2bhk: [12000, 20000] },
  },
  {
    id: 'sec-83',
    sector_code: 'SEC-83',
    sector_name: 'Sector 83',
    vibe_tag: 'New Gurgaon Frontier',
    vibe_emoji: '🏗️',
    coordinates: [76.9717, 28.3957],
    polygon: rect(76.9717, 28.3957, 0.0080, 0.0085),
    score: 52,
    metrics: { aqi: 124, water_tanker_reliance: 4.5, power_outage_mins: 125, noise_db: 42, waterlogging_level: 5 },
    radar: { air_quality: 75, water_reliability: 10, power_reliability: 31, noise_peace: 84, connectivity: 44, infra_health: 38 },
    amenities: {
      hospitals: [{ name: 'Aarvy Healthcare', distance_km: 3.5, rating: 3.5 }],
      schools: [{ name: 'Pawar Public School', distance_km: 2.8, rating: 3.8 }],
      malls: [{ name: 'None within 5km', distance_km: 6.5 }],
      metro: null,
    },
    infrastructure_projects: [
      { title: 'Dwarka Expressway Terminal Station', type: 'Metro', completion_year: 2028, status: 'Proposed', impact: 'High' },
      { title: 'New Gurugram Water Pipeline Network', type: 'Water Line', completion_year: 2029, status: 'Proposed', impact: 'High' },
      { title: 'Sector 83–84 Master Road Grid', type: 'Road', completion_year: 2026, status: 'Active', impact: 'High' },
      { title: 'Power Sub-Station Installation', type: 'Transit Hub', completion_year: 2027, status: 'Active', impact: 'High' },
    ],
    prediction_3yr: {
      rating: 'Transforming',
      summary: 'A pure long-term land bet. Currently unlivable for most families. All 4 major infrastructure projects pending.',
      risks: ['Critical tanker reliance (4.5/5) — no piped water until 2029 at earliest', 'Power outages severe (125 min/day)', 'Catastrophic waterlogging risk every monsoon', 'Zero metro access until 2028 at earliest'],
      opportunities: ['Cleanest air in Gurugram (AQI 124)', 'All 4 infra projects if executed = 5-year transformation', 'Current prices at historic lows for long-term hold', 'Dwarka Expressway proximity is strategic'],
    },
    price_range: { buy_psf: [4500, 7000], rent_2bhk: [10000, 18000] },
  },
]

// Combined dataset: the 18 hand-curated sectors + ~78 zone-generated sectors
// covering the rest of Gurugram. Curated entries take priority where both exist.
// Import is lazy via a getter so circular deps don't bite, and the merge is
// done once at module load.
import { GENERATED_SECTORS } from './generatedSectors'

const _curatedIds = new Set(SECTORS.map(s => s.id))
export const ALL_SECTORS: Sector[] = [
  ...SECTORS,
  ...GENERATED_SECTORS.filter(s => !_curatedIds.has(s.id)),
]

export function getSectorById(id: string): Sector | undefined {
  return ALL_SECTORS.find(s => s.id === id)
}

export function getSectorsGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: ALL_SECTORS.map(s => ({
      type: 'Feature' as const,
      id: s.id,
      properties: {
        id: s.id,
        sector_code: s.sector_code,
        sector_name: s.sector_name,
        vibe_tag: s.vibe_tag,
        score: s.score,
        aqi: s.metrics.aqi,
        water_tanker: s.metrics.water_tanker_reliance,
        power_outage: s.metrics.power_outage_mins,
        noise_db: s.metrics.noise_db,
        waterlogging: s.metrics.waterlogging_level,
      },
      geometry: {
        type: 'Polygon' as const,
        // Prefer the real OSM administrative-boundary polygon when available;
        // fall back to the seed rectangle (kept for the type contract / data
        // continuity, but should never hit for our 18 mapped sectors).
        coordinates: SECTOR_POLYGONS[s.id] ?? s.polygon,
      },
    })),
  }
}
