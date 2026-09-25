import suburbsData from "./sa-suburbs.json"

export interface Suburb {
  suburb: string
  postcode: string
}

export const SA_SUBURBS: Suburb[] = suburbsData

/** Suburb name + postcode as a single display/storage string, e.g. "Aldgate SA 5154". */
export function suburbLabel(s: Suburb): string {
  return `${s.suburb} SA ${s.postcode}`
}
