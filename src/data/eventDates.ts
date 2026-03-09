/**
 * Event date overrides for Google Drive gallery folders.
 *
 * Google Drive modification times reflect the upload date, not the event date.
 * This file maps folder names (case-insensitive) to the actual event date.
 *
 * For future events you have two options — pick either, both work:
 *   1. Add an entry here:       'my new event name': '2025-09-15'
 *   2. Prefix the Google Drive folder name with a date:  "2025-09-15 My New Event"
 *      (the fetcher will auto-parse the YYYY-MM-DD prefix; no code changes needed)
 */
export const eventDateOverrides: Record<string, string> = {
  'isab inauguration ceremony':                        '2024-01-30',
  '1st general member initiation':                     '2024-02-26',
  'international student town hall':                   '2024-03-26',
  'unt student alumni field day':                      '2024-04-09',
  'eve of nations ou trip':                            '2024-04-12',
  'songkran water festival':                           '2024-04-17',
  'unt etiquette dinner':                              '2024-04-22',
  'international sash ceremony':                       '2024-04-29',
  'international affairs vice provost luncheon':       '2024-05-06',
  'football 101':                                      '2024-08-23',
  'first general meeting fall 24':                     '2024-08-26',
  'general member meeting':                            '2024-09-10',
  'employment opportunities meeting with isa':         '2024-09-24',
  'international trivia night':                        '2024-10-08',
  'homecoming week':                                   '2024-10-28',
  'international game night':                          '2024-11-12',
  'rhythms of the world':                              '2024-11-14',
  'thanksgiving picnic':                               '2024-11-19',
  'first general meeting spring 25':                   '2025-01-28',
  "valentine's day art night":                         '2025-02-11',
  'international game night 2':                        '2025-03-05',
  'international town hall 2':                         '2025-03-19',
  'eid gala with isa':                                 '2025-04-06',
  'eve of nations ou trip 2':                          '2025-04-11',
  'songkran water festival 2':                         '2025-04-14',
};

const DATE_PREFIX_RE = /^(\d{4}-\d{2}-\d{2})\s+/;

function toDisplayDate(iso: string): string {
  // Use noon UTC to avoid off-by-one from timezone shifts
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

/**
 * Returns the display date string for a Google Drive event folder.
 * Priority:
 *   1. "YYYY-MM-DD " prefix in the folder name
 *   2. Entry in eventDateOverrides (matched case-insensitively)
 *   3. fallbackDate (the Drive modification time)
 */
export function getEventDate(folderName: string, fallbackDate: Date): string {
  const prefixMatch = folderName.match(DATE_PREFIX_RE);
  if (prefixMatch) return toDisplayDate(prefixMatch[1]);

  const override = eventDateOverrides[folderName.trim().toLowerCase()];
  if (override) return toDisplayDate(override);

  return fallbackDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

/**
 * Returns a sortable timestamp for a Google Drive event folder.
 * Mirrors the priority of getEventDate so sorting stays consistent with display.
 */
export function getEventTimestamp(folderName: string, fallbackDate: Date): number {
  const prefixMatch = folderName.match(DATE_PREFIX_RE);
  if (prefixMatch) return new Date(`${prefixMatch[1]}T12:00:00`).getTime();

  const override = eventDateOverrides[folderName.trim().toLowerCase()];
  if (override) return new Date(`${override}T12:00:00`).getTime();

  return fallbackDate.getTime();
}
