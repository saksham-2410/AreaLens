// Sunrise/sunset calculation for any Indian city, IST = UTC+5:30.
// Pass the city's latitude & longitude; defaults to Gurugram for back-compat.
const GURUGRAM_LAT = 28.46
const GURUGRAM_LNG = 77.03
const IST_OFFSET_HOURS = 5.5
const STD_MERIDIAN = 82.5 // IST standard meridian (°E)

function toRad(deg: number) { return deg * Math.PI / 180 }
function toDeg(rad: number) { return rad * 180 / Math.PI }

export function getSunTimes(
  lat = GURUGRAM_LAT,
  lng = GURUGRAM_LNG,
  date = new Date(),
): { sunrise: number; sunset: number } {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  )
  // Solar declination
  const decl = toRad(23.45 * Math.sin(toRad(360 / 365 * (dayOfYear - 81))))
  // Hour angle at sunrise/sunset
  const cosHA = -Math.tan(toRad(lat)) * Math.tan(decl)
  const HA = toDeg(Math.acos(Math.max(-1, Math.min(1, cosHA))))
  // Longitude correction relative to the IST standard meridian
  const longitudeCorrection = (lng - STD_MERIDIAN) / 15 // hours
  const solarNoon = 12 - longitudeCorrection

  return {
    sunrise: solarNoon - HA / 15,
    sunset: solarNoon + HA / 15,
  }
}

export function isNight(
  lat = GURUGRAM_LAT,
  lng = GURUGRAM_LNG,
  date = new Date(),
): boolean {
  const { sunrise, sunset } = getSunTimes(lat, lng, date)
  const istHour = (date.getUTCHours() + IST_OFFSET_HOURS) % 24
  const istMinutes = date.getUTCMinutes()
  const currentDecimal = istHour + istMinutes / 60
  // Night is before 30min after sunrise or after 30min after sunset
  return currentDecimal < (sunrise + 0.5) || currentDecimal > (sunset + 0.5)
}

export function getSunsetLabel(
  lat = GURUGRAM_LAT,
  lng = GURUGRAM_LNG,
  date = new Date(),
): string {
  const { sunrise, sunset } = getSunTimes(lat, lng, date)
  const istHour = (date.getUTCHours() + IST_OFFSET_HOURS) % 24
  const istMinutes = date.getUTCMinutes()
  const current = istHour + istMinutes / 60

  const fmt = (h: number) => {
    const hh = Math.floor(h) % 24
    const mm = Math.round((h % 1) * 60)
    const ampm = hh >= 12 ? 'PM' : 'AM'
    return `${hh % 12 || 12}:${mm.toString().padStart(2, '0')} ${ampm}`
  }

  if (current < sunrise) return `Sunrise at ${fmt(sunrise)}`
  if (current < sunset) return `Sunset at ${fmt(sunset)}`
  return `Sunrise at ${fmt(sunrise + 24)}`
}
