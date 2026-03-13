/**
 * Shared booking search constants for BookSearchForm and HeroBookBar.
 * When more than 5 rooms are selected, UI shows "guests per room" instead of total guests.
 */
export const MAX_GUESTS_PER_ROOM = 3

/** When rooms >= this value, show guests-per-room mode (more than 5 rooms = 6+). */
export const ROOMS_FOR_GUESTS_PER_ROOM_MODE = 6

export function getMaxTotalGuests(rooms: number): number {
  return rooms * MAX_GUESTS_PER_ROOM
}

export function clampGuestsPerRoom(value: number): number {
  return Math.min(MAX_GUESTS_PER_ROOM, Math.max(1, value))
}

export function clampTotalGuests(rooms: number, value: number): number {
  const max = getMaxTotalGuests(rooms)
  return Math.min(max, Math.max(1, value))
}
