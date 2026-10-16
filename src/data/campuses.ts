import { CampusOption } from '../types';

export const EKITI_CAMPUSES: CampusOption[] = [
  {
    id: 'eksu',
    name: 'Ekiti State University (EKSU)',
    short_code: 'EKSU',
    location: 'Ado-Ekiti, Ekiti State',
    pickup_hubs: [
      'Student Union Building (SUB)',
      'University Main Gate',
      'Faculty of Science Foyer',
      'University Library Complex',
      'Sandwich Hall'
    ]
  },
  {
    id: 'fuoye',
    name: 'Federal University Oye-Ekiti (FUOYE)',
    short_code: 'FUOYE',
    location: 'Oye-Ekiti, Ekiti State',
    pickup_hubs: [
      'Oye Campus Main Gate',
      'Student Union Secretariat',
      'Faculty of Engineering Quad (Ikole Campus)',
      'Central Library Hub',
      'Faculty of Arts Complex'
    ]
  },
  {
    id: 'abuad',
    name: 'Afe Babalola University (ABUAD)',
    short_code: 'ABUAD',
    location: 'Ado-Ekiti, Ekiti State',
    pickup_hubs: [
      'Talent Discovery Centre (TDC)',
      'ABUAD Inn & Cafeteria',
      'Law College Atrium',
      'College of Engineering Quadrangle',
      'Multisystem Hospital Gate'
    ]
  },
  {
    id: 'bouesti',
    name: 'Bamidele Olumilua University of Education, Science and Technology (BOUESTI)',
    short_code: 'BOUESTI',
    location: 'Ikere-Ekiti, Ekiti State',
    pickup_hubs: [
      'Administrative Block Concourse',
      'Science Complex Pavilion',
      'Ikere Campus Main Gate',
      'University Auditorium Walkway'
    ]
  },
  {
    id: 'venite',
    name: 'Venite University',
    short_code: 'Venite',
    location: 'Iloro-Ekiti, Ekiti State',
    pickup_hubs: [
      'Campus Gate Plaza',
      'Academic Block Front Desk',
      'Student Common Ground',
      'Main Hall Entrance'
    ]
  }
];

export const CAMPUS_NAMES = EKITI_CAMPUSES.map((c) => c.name);

export const DEFAULT_CAMPUS = EKITI_CAMPUSES[0].name;

export function isValidCampus(name?: string): boolean {
  if (!name) return false;
  return CAMPUS_NAMES.includes(name);
}

export function getCampusByShortCode(code: string): CampusOption | undefined {
  return EKITI_CAMPUSES.find(
    (c) => c.short_code.toLowerCase() === code.toLowerCase() || c.id.toLowerCase() === code.toLowerCase()
  );
}

export function getCampusByName(name: string): CampusOption | undefined {
  return EKITI_CAMPUSES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function sanitizeCampus(name?: string): string {
  if (!name) return DEFAULT_CAMPUS;
  const match = EKITI_CAMPUSES.find(
    (c) => c.name.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(c.short_code.toLowerCase())
  );
  return match ? match.name : DEFAULT_CAMPUS;
}
