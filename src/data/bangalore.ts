// ───────────────────────────────────────────────────────────────────────────
// BENGALURU — area-based dataset (Bengaluru is organised by locality/area names,
// not numbered sectors). These 28 areas are SEEDED PLACEHOLDER DATA: real
// centroids + web-researched approximations, to be replaced with the detailed
// report. The compact F/W/P/N/C rating table below uses the SAME 1–10 scale and
// conversion as the Gurugram report, so accurate values drop straight in later.
//
// Ratings (1 = worst, 10 = best):
//   F flooding · W water · P power · N noise/peace · C commute/connectivity
// ───────────────────────────────────────────────────────────────────────────
import type { Sector } from './sectors'
import { BANGALORE_POLYGONS } from './bangalorePolygons'

// ── 1–10 rating → app metric scale (identical to the Gurugram conversion) ──
const rhu = (x: number) => Math.floor(x + 0.5)
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))
const waterlogFromF = (F: number) => clamp(rhu(6 - F / 2), 1, 5)
const tankerFromW = (W: number) => (W >= 6 ? 1.5 : W === 5 ? 2.5 : W === 4 ? 3.5 : 4.5)
const powerMinsFromP = (P: number) => clamp(rhu((10 - P) * 12 + 8), 5, 200)
const noiseDbFromN = (N: number) => rhu(86 - N * 3.6)
const airFromAqi = (aqi: number) => clamp(rhu(125 - aqi * 0.55), 5, 99)

// Deterministic blob polygon around a centroid — placeholder boundaries.
function blob(lng: number, lat: number, r: number, seed: number): number[][][] {
  const frac = (x: number) => x - Math.floor(x)
  const n = 9
  const pts: number[][] = []
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2
    const jr = r * (0.80 + 0.40 * frac(Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453))
    pts.push([lng + Math.cos(ang) * jr * 1.03, lat + Math.sin(ang) * jr])
  }
  pts.push(pts[0])
  return [pts]
}

type Amen = [string, number]
interface AreaRaw {
  id: string; code: string; name: string; vibe: string; emoji: string
  lng: number; lat: number; r: number; score: number
  F: number; W: number; P: number; N: number; C: number
  aqi: number; infra: number
  buy: [number, number]; rent: [number, number]
  hosp: Amen; school: Amen; mall: Amen; metro: Amen | null
  rating: Sector['prediction_3yr']['rating']
  summary: string; risks: string[]; opps: string[]
  projects: [string, Sector['infrastructure_projects'][number]['type'], number,
             Sector['infrastructure_projects'][number]['status'],
             Sector['infrastructure_projects'][number]['impact']][]
}

const AREAS: AreaRaw[] = [
  // ── Central / premium ──────────────────────────────────────────────────
  { id: 'blr-indiranagar', code: 'IND', name: 'Indiranagar', vibe: 'Premium Urbane Core', emoji: '🍸',
    lng: 77.6408, lat: 12.9719, r: 0.013, score: 84, F: 6, W: 7, P: 7, N: 4, C: 9, aqi: 88, infra: 82,
    buy: [14000, 24000], rent: [35000, 90000],
    hosp: ['Chinmaya Mission Hospital', 1.2], school: ['National Public School', 1.6], mall: ['1 MG / Garuda Mall', 2.4], metro: ['Indiranagar (Purple)', 0.5],
    rating: 'Stable', summary: 'Mature high-street neighbourhood with top metro access. Premium values, high noise from nightlife and 100ft Road traffic.',
    risks: ['Heavy traffic and pub-street noise', 'Premium pricing caps yields'], opps: ['On the Purple Line', 'Consistent rental demand from professionals'],
    projects: [['100ft Road junction improvements', 'Road', 2026, 'Active', 'Medium']] },
  { id: 'blr-koramangala', code: 'KOR', name: 'Koramangala', vibe: 'Startup Capital', emoji: '🚀',
    lng: 77.6245, lat: 12.9352, r: 0.014, score: 83, F: 3, W: 7, P: 7, N: 4, C: 8, aqi: 90, infra: 78,
    buy: [15000, 26000], rent: [38000, 95000],
    hosp: ['St. Johns Medical College', 1.5], school: ['Bethany High School', 1.4], mall: ['Forum Mall', 1.0], metro: null,
    rating: 'Stable', summary: 'Bengaluru’s startup and dining hub. Excellent amenities and demand, but notorious for monsoon flooding at junctions and no direct metro.',
    risks: ['Recurring waterlogging (Sony World, 80ft Rd)', 'No metro station within the core'], opps: ['Unmatched startup/F&B ecosystem', 'Strong premium rental demand'],
    projects: [['Koramangala valley stormwater drain rebuild', 'Water Line', 2027, 'Active', 'High']] },
  { id: 'blr-mg-road', code: 'MGR', name: 'MG Road / CBD', vibe: 'Central Business District', emoji: '🏙️',
    lng: 77.6090, lat: 12.9750, r: 0.012, score: 80, F: 6, W: 7, P: 8, N: 3, C: 9, aqi: 92, infra: 84,
    buy: [16000, 30000], rent: [40000, 110000],
    hosp: ['Bowring & Lady Curzon', 1.3], school: ['St. Josephs Boys', 1.8], mall: ['UB City / Garuda', 1.0], metro: ['MG Road (Purple)', 0.3],
    rating: 'Stable', summary: 'The historic commercial core. Best-in-city connectivity and retail; limited residential supply keeps values high.',
    risks: ['Very high ambient noise', 'Scarce residential inventory'], opps: ['Premier metro + commercial access', 'Trophy-address scarcity premium'],
    projects: [['Shivajinagar multi-modal hub', 'Transit Hub', 2027, 'Active', 'High']] },
  { id: 'blr-ulsoor', code: 'ULS', name: 'Ulsoor', vibe: 'Lakeside Heritage', emoji: '🛶',
    lng: 77.6200, lat: 12.9820, r: 0.011, score: 76, F: 5, W: 7, P: 7, N: 4, C: 8, aqi: 90, infra: 74,
    buy: [13000, 22000], rent: [30000, 75000],
    hosp: ['Manipal Hospital (Old Airport Rd)', 2.6], school: ['Cambridge Public School', 1.7], mall: ['Phoenix Marketcity', 4.5], metro: ['Halasuru (Purple)', 0.6],
    rating: 'Stable', summary: 'Central lakeside pocket with old-Bengaluru character and metro access. Mixed-age stock; lake-edge drainage needs work.',
    risks: ['Older building stock', 'Localised lake-edge flooding'], opps: ['Central + metro connected', 'Ulsoor Lake amenity value'],
    projects: [['Ulsoor Lake rejuvenation', 'Park', 2026, 'Active', 'Medium']] },
  { id: 'blr-domlur', code: 'DOM', name: 'Domlur / Old Airport Rd', vibe: 'Corporate Spine', emoji: '💼',
    lng: 77.6380, lat: 12.9610, r: 0.011, score: 78, F: 5, W: 7, P: 7, N: 4, C: 9, aqi: 90, infra: 80,
    buy: [13000, 23000], rent: [32000, 82000],
    hosp: ['Manipal Hospital', 1.0], school: ['New Horizon Public', 2.0], mall: ['CMH Road retail', 1.6], metro: null,
    rating: 'Stable', summary: 'Wedged between CBD and the ORR tech belt. Strong corporate rental demand and central location.',
    risks: ['Old Airport Road congestion', 'No metro in the immediate core'], opps: ['Walk-to-work for ORR offices', 'Central yet near tech parks'],
    projects: [['ORR Blue Line metro (nearby)', 'Metro', 2027, 'Active', 'High']] },

  // ── ORR / tech corridor ────────────────────────────────────────────────
  { id: 'blr-whitefield', code: 'WTF', name: 'Whitefield', vibe: 'IT Township', emoji: '💻',
    lng: 77.7500, lat: 12.9698, r: 0.020, score: 74, F: 4, W: 4, P: 6, N: 5, C: 6, aqi: 95, infra: 76,
    buy: [8000, 15000], rent: [22000, 65000],
    hosp: ['Manipal Hospital Whitefield', 1.5], school: ['Vydehi School / TISB', 2.2], mall: ['Phoenix Marketcity / VR', 1.8], metro: ['Whitefield Kadugodi (Purple)', 1.0],
    rating: 'Rising', summary: 'Self-contained IT township around ITPL. New Purple Line terminus is a major boost; periphery still tanker-reliant.',
    risks: ['Tanker water dependence', 'ORR/Varthur road congestion'], opps: ['Purple Line now operational', 'Large grade-A office base (ITPL/EPIP)'],
    projects: [['Whitefield metro extension', 'Metro', 2025, 'Completed', 'High']] },
  { id: 'blr-marathahalli', code: 'MAR', name: 'Marathahalli', vibe: 'ORR Workhorse', emoji: '🛣️',
    lng: 77.6970, lat: 12.9560, r: 0.014, score: 67, F: 4, W: 4, P: 6, N: 3, C: 6, aqi: 98, infra: 70,
    buy: [7500, 13000], rent: [20000, 55000],
    hosp: ['Sakra World Hospital', 2.4], school: ['New Horizon Gurukul', 1.6], mall: ['Innovative Multiplex / Phoenix', 2.0], metro: null,
    rating: 'Transforming', summary: 'Dense rental hub midway along the ORR tech belt. Severe peak congestion; ORR metro will be transformative.',
    risks: ['Among the worst traffic chokepoints', 'Tanker water in many pockets'], opps: ['ORR Blue Line under construction', 'Deep affordable rental demand'],
    projects: [['ORR Blue Line (KR Puram–Silk Board)', 'Metro', 2027, 'Active', 'High']] },
  { id: 'blr-bellandur', code: 'BEL', name: 'Bellandur', vibe: 'Lake-Edge Tech', emoji: '🌫️',
    lng: 77.6760, lat: 12.9260, r: 0.015, score: 62, F: 2, W: 3, P: 6, N: 4, C: 5, aqi: 102, infra: 66,
    buy: [8500, 14500], rent: [24000, 60000],
    hosp: ['Sakra World Hospital', 2.0], school: ['Gear Innovative School', 1.8], mall: ['Central / Soul Space', 1.5], metro: null,
    rating: 'Transforming', summary: 'High-rise tech-belt living beside Bellandur Lake. Strong office proximity offset by infamous flooding and water stress.',
    risks: ['Severe lake-overflow flooding', 'Critical tanker dependence'], opps: ['Core of the ORR office cluster', 'Blue Line metro upcoming'],
    projects: [['Bellandur Lake rejuvenation & SWD', 'Water Line', 2028, 'Active', 'High']] },
  { id: 'blr-sarjapur', code: 'SJP', name: 'Sarjapur Road', vibe: 'Growth Corridor', emoji: '📈',
    lng: 77.7050, lat: 12.9050, r: 0.018, score: 66, F: 3, W: 3, P: 6, N: 5, C: 5, aqi: 96, infra: 68,
    buy: [8000, 15500], rent: [22000, 62000],
    hosp: ['Columbia Asia Sarjapur', 2.5], school: ['Greenwood High / Inventure', 2.0], mall: ['Market Square / RGA Tech', 2.2], metro: null,
    rating: 'Rising', summary: 'Fast-growing apartment corridor feeding the ORR and Wipro/RGA tech parks. Infrastructure lags rapid construction.',
    risks: ['Tanker reliance and patchy roads', 'No metro line yet'], opps: ['Branded-developer apartment supply', 'Proximity to ECity + ORR jobs'],
    projects: [['Sarjapur–Hebbal metro (proposed)', 'Metro', 2029, 'Proposed', 'High']] },
  { id: 'blr-kr-puram', code: 'KRP', name: 'KR Puram', vibe: 'East Gateway', emoji: '🌉',
    lng: 77.6950, lat: 13.0030, r: 0.014, score: 64, F: 3, W: 4, P: 6, N: 3, C: 6, aqi: 99, infra: 67,
    buy: [7000, 12500], rent: [18000, 45000],
    hosp: ['Aster RV / Columbia', 3.0], school: ['Vibgyor High', 2.2], mall: ['Phoenix Marketcity', 3.5], metro: ['KR Puram (Purple)', 1.2],
    rating: 'Transforming', summary: 'Eastern entry point linking Whitefield, ORR and the airport road. Purple Line and Blue Line interchange improving access fast.',
    risks: ['Railway-gate and bridge congestion', 'Low-lying flood pockets'], opps: ['Purple/Blue metro interchange', 'Affordable entry near tech jobs'],
    projects: [['KR Puram interchange + Blue Line', 'Metro', 2027, 'Active', 'High']] },
  { id: 'blr-varthur', code: 'VAR', name: 'Varthur', vibe: 'Emerging East', emoji: '🏗️',
    lng: 77.7450, lat: 12.9400, r: 0.014, score: 58, F: 2, W: 3, P: 5, N: 6, C: 4, aqi: 97, infra: 60,
    buy: [6500, 11000], rent: [16000, 40000],
    hosp: ['Manipal Whitefield', 3.2], school: ['Chrysalis High', 2.0], mall: ['VR Bengaluru', 3.4], metro: null,
    rating: 'Rising', summary: 'Affordable Whitefield-adjacent belt around Varthur Lake. Cheapest east-side entry, but weakest civic infrastructure.',
    risks: ['Varthur Lake flooding/froth', 'Tanker water, narrow roads'], opps: ['Lowest east-side prices', 'Whitefield job access'],
    projects: [['Varthur Lake desilting', 'Water Line', 2028, 'Proposed', 'Medium']] },

  // ── South ────────────────────────────────────────────────────────────────
  { id: 'blr-hsr-layout', code: 'HSR', name: 'HSR Layout', vibe: 'Planned Tech Suburb', emoji: '🧩',
    lng: 77.6480, lat: 12.9116, r: 0.013, score: 77, F: 4, W: 5, P: 7, N: 5, C: 7, aqi: 92, infra: 78,
    buy: [11000, 19000], rent: [28000, 75000],
    hosp: ['Narayana Health City', 4.0], school: ['VIBGYOR / DPS East', 1.8], mall: ['Central HSR', 1.4], metro: null,
    rating: 'Stable', summary: 'Well-planned grid layout popular with startups and young families. Strong amenities; Yellow Line will close the metro gap.',
    risks: ['Outer Ring Road bottlenecks', 'Some monsoon ponding'], opps: ['Planned wide-road layout', 'Yellow Line metro nearby (u/c)'],
    projects: [['Yellow Line (RV Road–Bommasandra)', 'Metro', 2026, 'Active', 'High']] },
  { id: 'blr-btm-layout', code: 'BTM', name: 'BTM Layout', vibe: 'Affordable Central-South', emoji: '🏘️',
    lng: 77.6100, lat: 12.9166, r: 0.012, score: 70, F: 3, W: 5, P: 7, N: 3, C: 7, aqi: 95, infra: 72,
    buy: [9000, 15000], rent: [20000, 52000],
    hosp: ['Apollo Spectra', 1.6], school: ['Sri Kumaran Childrens', 2.4], mall: ['Gopalan Innovation', 2.0], metro: null,
    rating: 'Stable', summary: 'Dense, affordable and central with huge PG/rental demand. Traffic and Madiwala-area flooding are the trade-offs.',
    risks: ['Silk Board congestion', 'Madiwala lake-area flooding'], opps: ['Very strong rental yields', 'Yellow Line connectivity (u/c)'],
    projects: [['Silk Board double-decker flyover + metro', 'Flyover', 2026, 'Active', 'High']] },
  { id: 'blr-jayanagar', code: 'JAY', name: 'Jayanagar', vibe: 'Garden City Classic', emoji: '🌳',
    lng: 77.5830, lat: 12.9250, r: 0.013, score: 81, F: 6, W: 8, P: 8, N: 6, C: 8, aqi: 84, infra: 82,
    buy: [12000, 21000], rent: [26000, 65000],
    hosp: ['Apollo Jayanagar', 1.2], school: ['National College', 1.5], mall: ['Jayanagar 4th Block', 0.8], metro: ['Jayanagar (Green)', 0.6],
    rating: 'Stable', summary: 'Quintessential leafy, well-planned south Bengaluru. Reliable Cauvery water, low flooding, Green Line access — a defensive favourite.',
    risks: ['Limited new supply', 'Premium for old-Bengaluru charm'], opps: ['Among the best civic infrastructure', 'Green Line + established retail'],
    projects: [['Jayanagar road & footpath upgrades', 'Road', 2026, 'Active', 'Low']] },
  { id: 'blr-jp-nagar', code: 'JPN', name: 'JP Nagar', vibe: 'Settled South', emoji: '🏡',
    lng: 77.5850, lat: 12.9080, r: 0.014, score: 76, F: 5, W: 7, P: 7, N: 6, C: 7, aqi: 86, infra: 76,
    buy: [10000, 18000], rent: [24000, 58000],
    hosp: ['Sagar Hospitals', 1.4], school: ['Delhi Public School South', 2.0], mall: ['Brigade Orion / Gopalan', 2.6], metro: ['Yelachenahalli (Green)', 2.2],
    rating: 'Stable', summary: 'Comfortable, family-oriented southern suburb extending Jayanagar. Good water and quiet; metro on the southern fringe.',
    risks: ['Outer JP Nagar metro gap', 'Gradual densification'], opps: ['Strong end-user demand', 'Good schools and green cover'],
    projects: [['Green Line southern extension', 'Metro', 2025, 'Completed', 'Medium']] },
  { id: 'blr-banashankari', code: 'BSK', name: 'Banashankari', vibe: 'Temple-Town South', emoji: '🛕',
    lng: 77.5560, lat: 12.9250, r: 0.015, score: 74, F: 5, W: 7, P: 7, N: 6, C: 7, aqi: 85, infra: 74,
    buy: [9000, 16000], rent: [20000, 50000],
    hosp: ['Sagar / BGS Global', 2.5], school: ['Kumarans / BGS', 2.0], mall: ['Vega City Mall', 2.2], metro: ['Banashankari (Green)', 0.8],
    rating: 'Stable', summary: 'Large, established south-west residential zone on the Green Line. Good water security and value; some inner-road congestion.',
    risks: ['Narrow inner roads', 'Patchy footpaths'], opps: ['Green Line connected', 'Reliable Cauvery supply'],
    projects: [['Outer Ring Road West widening', 'Road', 2027, 'Active', 'Medium']] },
  { id: 'blr-basavanagudi', code: 'BSV', name: 'Basavanagudi', vibe: 'Old-Bengaluru Heritage', emoji: '🏛️',
    lng: 77.5730, lat: 12.9410, r: 0.011, score: 78, F: 6, W: 8, P: 8, N: 6, C: 8, aqi: 84, infra: 80,
    buy: [12000, 20000], rent: [24000, 58000],
    hosp: ['Vasavi / Apollo', 1.6], school: ['National High School', 1.0], mall: ['Gandhi Bazaar high street', 0.6], metro: ['National College (Green)', 0.7],
    rating: 'Stable', summary: 'Heritage south-central neighbourhood with strong civic services and Green Line access. Low flooding, scarce new supply.',
    risks: ['Very limited new inventory', 'Heritage-zone build constraints'], opps: ['Excellent water + power reliability', 'Central + metro connected'],
    projects: [['Bull Temple Road heritage streetscape', 'Road', 2026, 'Active', 'Low']] },
  { id: 'blr-bannerghatta', code: 'BGR', name: 'Bannerghatta Road', vibe: 'Healthcare Corridor', emoji: '🏥',
    lng: 77.5970, lat: 12.8900, r: 0.016, score: 69, F: 4, W: 5, P: 7, N: 4, C: 6, aqi: 90, infra: 70,
    buy: [8500, 15000], rent: [20000, 52000],
    hosp: ['Apollo / Fortis BG Road', 0.8], school: ['IIM-B / DPS', 2.0], mall: ['Gopalan / Royal Meenakshi', 2.4], metro: null,
    rating: 'Rising', summary: 'Hospital-and-IIMB corridor heading south. Strong institutional anchors; arterial congestion until road/metro upgrades land.',
    risks: ['BG Road peak congestion', 'Patchy tanker dependence south'], opps: ['Top healthcare + IIM-B cluster', 'Pink Line metro planned'],
    projects: [['Bannerghatta Rd elevated corridor', 'Flyover', 2027, 'Proposed', 'High']] },
  { id: 'blr-electronic-city', code: 'ECY', name: 'Electronic City', vibe: 'IT Powerhouse', emoji: '⚙️',
    lng: 77.6603, lat: 12.8452, r: 0.018, score: 68, F: 4, W: 4, P: 7, N: 6, C: 5, aqi: 94, infra: 72,
    buy: [6500, 12000], rent: [16000, 42000],
    hosp: ['Narayana Health City', 3.0], school: ['Sherwood High / Ebenezer', 2.2], mall: ['DMart / MTR retail', 2.0], metro: null,
    rating: 'Rising', summary: 'India’s flagship IT hub anchored by Infosys/Wipro. Elevated expressway helps; Yellow Line metro will be the game-changer.',
    risks: ['Hosur Road bottlenecks', 'Tanker reliance in pockets'], opps: ['Yellow Line metro (u/c)', 'Massive on-site employment base'],
    projects: [['Yellow Line to Bommasandra', 'Metro', 2026, 'Active', 'High']] },

  // ── North ──────────────────────────────────────────────────────────────
  { id: 'blr-hebbal', code: 'HEB', name: 'Hebbal', vibe: 'Airport Gateway', emoji: '✈️',
    lng: 77.5970, lat: 13.0358, r: 0.014, score: 75, F: 5, W: 6, P: 7, N: 4, C: 7, aqi: 88, infra: 78,
    buy: [10000, 19000], rent: [24000, 65000],
    hosp: ['Baptist / Aster CMI', 1.5], school: ['Vidyaniketan / Canadian Intl', 2.4], mall: ['Esteem / RMZ Galleria', 2.0], metro: null,
    rating: 'Rising', summary: 'Premium north node on the airport corridor with lake views and RMZ/Manyata access. Flyover congestion is the main pain point.',
    risks: ['Hebbal flyover congestion', 'No metro yet (Blue Line u/c)'], opps: ['Airport + Manyata proximity', 'Blue Line metro upcoming'],
    projects: [['Airport (Blue) metro line', 'Metro', 2026, 'Active', 'High']] },
  { id: 'blr-yelahanka', code: 'YLK', name: 'Yelahanka', vibe: 'Northern Satellite', emoji: '🌅',
    lng: 77.5963, lat: 13.1007, r: 0.018, score: 71, F: 6, W: 6, P: 7, N: 7, C: 6, aqi: 82, infra: 72,
    buy: [7000, 14000], rent: [16000, 42000],
    hosp: ['Columbia Asia / Aster', 3.0], school: ['Delhi Public School North', 2.0], mall: ['Elements Mall', 2.6], metro: null,
    rating: 'Rising', summary: 'Spacious, greener satellite town en route to the airport. Cleaner air and calm; depends on airport-corridor build-out.',
    risks: ['Distance from central jobs', 'Metro still years away'], opps: ['Cleanest air of the seeded areas', 'Airport-corridor growth + villa stock'],
    projects: [['Airport metro + STRR access', 'Metro', 2026, 'Active', 'High']] },
  { id: 'blr-hennur', code: 'HEN', name: 'Hennur', vibe: 'North-East Growth', emoji: '🌿',
    lng: 77.6400, lat: 13.0400, r: 0.015, score: 67, F: 5, W: 5, P: 7, N: 6, C: 6, aqi: 88, infra: 68,
    buy: [7500, 14000], rent: [18000, 45000],
    hosp: ['Columbia Asia Hebbal', 3.2], school: ['Legacy / Vidyashilp', 2.4], mall: ['Elements / Phoenix', 4.0], metro: null,
    rating: 'Rising', summary: 'Quieter north-east corridor linking the ORR to the airport road. Good apartment value; arterial widening still in progress.',
    risks: ['Hennur Road narrows in stretches', 'Tanker dependence outward'], opps: ['Airport + Manyata access', 'Newer gated apartment supply'],
    projects: [['Hennur Road widening', 'Road', 2027, 'Active', 'Medium']] },
  { id: 'blr-sahakar-nagar', code: 'SHK', name: 'Sahakar Nagar', vibe: 'Settled North', emoji: '🏘️',
    lng: 77.5800, lat: 13.0600, r: 0.012, score: 72, F: 6, W: 6, P: 7, N: 7, C: 6, aqi: 84, infra: 73,
    buy: [8000, 15000], rent: [18000, 44000],
    hosp: ['Aster CMI', 2.4], school: ['Kendriya Vidyalaya / Jain', 1.6], mall: ['Esteem Mall', 1.8], metro: null,
    rating: 'Stable', summary: 'Established, calm residential layout near the airport corridor and Manyata. Good day-to-day liveability for families.',
    risks: ['Airport-road traffic spillover', 'Metro gap'], opps: ['Quiet planned layout', 'Manyata Tech Park proximity'],
    projects: [['Outer Ring Road North upgrades', 'Road', 2026, 'Active', 'Low']] },

  // ── West ─────────────────────────────────────────────────────────────────
  { id: 'blr-malleshwaram', code: 'MLS', name: 'Malleshwaram', vibe: 'Cultural Heartland', emoji: '🎻',
    lng: 77.5700, lat: 13.0035, r: 0.012, score: 80, F: 6, W: 8, P: 8, N: 6, C: 8, aqi: 84, infra: 82,
    buy: [13000, 22000], rent: [26000, 62000],
    hosp: ['Columbia Asia / MS Ramaiah', 1.8], school: ['Cluny / MES', 1.2], mall: ['Mantri Square', 0.7], metro: ['Mantri Square Sampige (Green)', 0.5],
    rating: 'Stable', summary: 'Cultured, leafy north-west neighbourhood with excellent civic services and Green Line access. Defensive, low-volatility values.',
    risks: ['Scarce new supply', 'Heritage-area constraints'], opps: ['Top water + power reliability', 'Green Line + Mantri Square retail'],
    projects: [['Sampige Road streetscape upgrade', 'Road', 2026, 'Active', 'Low']] },
  { id: 'blr-rajajinagar', code: 'RAJ', name: 'Rajajinagar', vibe: 'Established West', emoji: '🏬',
    lng: 77.5550, lat: 12.9910, r: 0.013, score: 76, F: 6, W: 7, P: 8, N: 5, C: 8, aqi: 86, infra: 78,
    buy: [11000, 19000], rent: [24000, 56000],
    hosp: ['Suguna / Manipal', 1.6], school: ['MES / Poornaprajna', 1.4], mall: ['Orion Mall (Brigade Gateway)', 1.5], metro: ['Rajajinagar (Green)', 0.6],
    rating: 'Stable', summary: 'Well-planned west Bengaluru with strong infrastructure, Orion Mall and Green Line metro. Reliable utilities and steady demand.',
    risks: ['Dr. Rajkumar Road congestion', 'Limited large-format new supply'], opps: ['Green Line + Orion Mall', 'Reliable power and water'],
    projects: [['West-of-Chord Road junction fixes', 'Road', 2026, 'Active', 'Low']] },
  { id: 'blr-vijayanagar', code: 'VJN', name: 'Vijayanagar', vibe: 'Value West', emoji: '⚖️',
    lng: 77.5380, lat: 12.9720, r: 0.013, score: 72, F: 5, W: 7, P: 7, N: 5, C: 7, aqi: 88, infra: 73,
    buy: [9000, 16000], rent: [20000, 48000],
    hosp: ['Sri Sai / ESI', 1.8], school: ['VET / Sri Vidyaniketan', 1.5], mall: ['GT World Mall', 1.4], metro: ['Vijayanagar (Green)', 0.5],
    rating: 'Stable', summary: 'Affordable, well-connected west zone on the Green Line. Good value with reliable Cauvery water and steady rental demand.',
    risks: ['Dense older pockets', 'Inner-road parking pressure'], opps: ['Green Line connected', 'Strong value-for-money'],
    projects: [['Mysore Road metro feeder upgrade', 'Transit Hub', 2026, 'Active', 'Medium']] },
  { id: 'blr-rr-nagar', code: 'RRN', name: 'Rajarajeshwari Nagar', vibe: 'South-West Suburb', emoji: '🏞️',
    lng: 77.5180, lat: 12.9270, r: 0.017, score: 68, F: 5, W: 5, P: 7, N: 7, C: 5, aqi: 90, infra: 68,
    buy: [7000, 13000], rent: [16000, 40000],
    hosp: ['BGS Global / Rajarajeshwari Medical', 2.0], school: ['RNS / Sri Kumaran', 2.2], mall: ['GT World / Gopalan', 3.0], metro: null,
    rating: 'Rising', summary: 'Spacious south-west suburb off Mysore Road and NICE Road. Affordable plotted + apartment stock; commute is the main constraint.',
    risks: ['Longer commute to east-side jobs', 'No metro within core'], opps: ['NICE Road + Mysore Rd access', 'Affordable larger homes'],
    projects: [['Mysore Road / NICE Road interchange', 'Road', 2027, 'Active', 'Medium']] },
]

function build(a: AreaRaw): Sector {
  const amen = ([n, d]: Amen) => ({ name: n, distance_km: d })
  return {
    id: a.id,
    sector_code: a.code,
    sector_name: a.name,
    vibe_tag: a.vibe,
    vibe_emoji: a.emoji,
    coordinates: [a.lng, a.lat],
    // Real Voronoi-tessellated cell clipped to the Bengaluru city boundary
    // (see bangalorePolygons.ts); fall back to a generated blob if missing.
    polygon: BANGALORE_POLYGONS[a.id] ?? blob(a.lng, a.lat, a.r, a.lng * 1000 + a.lat),
    score: a.score,
    metrics: {
      aqi: a.aqi,
      water_tanker_reliance: tankerFromW(a.W),
      power_outage_mins: powerMinsFromP(a.P),
      noise_db: noiseDbFromN(a.N),
      waterlogging_level: waterlogFromF(a.F),
    },
    radar: {
      air_quality: airFromAqi(a.aqi),
      water_reliability: a.W * 10,
      power_reliability: a.P * 10,
      noise_peace: a.N * 10,
      connectivity: a.C * 10,
      infra_health: a.infra,
    },
    amenities: {
      hospitals: [amen(a.hosp)],
      schools: [amen(a.school)],
      malls: [amen(a.mall)],
      metro: a.metro ? amen(a.metro) : null,
    },
    infrastructure_projects: a.projects.map(([title, type, completion_year, status, impact]) => ({
      title, type, completion_year, status, impact,
    })),
    prediction_3yr: {
      rating: a.rating,
      summary: a.summary,
      risks: a.risks,
      opportunities: a.opps,
    },
    price_range: { buy_psf: a.buy, rent_2bhk: a.rent },
  }
}

export const BANGALORE_AREAS: Sector[] = AREAS.map(build)

export function getBangaloreGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: BANGALORE_AREAS.map(s => ({
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
      geometry: { type: 'Polygon' as const, coordinates: s.polygon },
    })),
  }
}
