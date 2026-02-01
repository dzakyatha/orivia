export const DESTINATION_TYPES = [
  'Island Exploration',
  'Mount Hiking',
  'Camping Ground',
  'City Tour',
  'Wildlife Exploration',
  'Other'
];

export const trips = [
  {
    id: 1,
    name: 'Komodo Island',
    description: 'Discover Komodo Island: see Komodo dragons, hike Padar for panoramic views, snorkel at Pink Beach, and enjoy island-hopping with local guides.',
    location: { state: 'East Nusa Tenggara', country: 'Indonesia' },
    date: { start_date: '2026-02-01', end_date: '2026-02-03' },
    price: 4575000,
    pax: 15,
    duration: { days: 2, nights: 1 },
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop',
    type: 'Island Exploration',
    destinationType: 'Island Exploration',
    status: 'ACTIVE',
    includes: ['Guide', 'Meals', 'Entrance Ticket', 'Snorkeling Gear'],
    pickup_points: [
      { location: 'Komodo Airport, Labuan Bajo', price: 0 },
      { location: 'Orivia Agent Gambir, Jakarta', price: 50000 },
      { location: 'Orivia Agent, NTT', price: 75000 },
      { location: 'test', price: 0 },
      { location: 'test', price: 0 }
    ],
    slotAvailable: 1,
    rundowns: {
      1: [
        { time: '06.00 - 07.00', duration: '1', activity: 'Meeting point & briefing', location: 'Komodo Airport' },
        { time: '07.00 - 09.30', duration: '2.5', activity: 'Sailing', location: 'Padar Island' },
        { time: '09.30 - 11.00', duration: '1.5', activity: 'Trekking & sightseeing', location: 'Padar Island' },
        { time: '11.00 - 13.00', duration: '2', activity: 'Beach time & snorkeling', location: 'Pink Beach' }
      ],
      2: [
        { time: '07.00 - 09.00', duration: '2', activity: 'Komodo trekking', location: 'Komodo Island' },
        { time: '09.30 - 12.00', duration: '2.5', activity: 'Island hopping', location: 'Nearby Islets' }
      ]
    },
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&sig=1',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&sig=11',
      'https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=800&h=600&fit=crop&sig=21'
    ]
  },
  {
    id: 2,
    name: 'Raja Ampat',
    description: 'Raja Ampat offers world-class marine biodiversity: island hopping, snorkeling, and diving among vibrant coral gardens and unique seascapes.',
    location: { state: 'Maluku', country: 'Indonesia' },
    date: { start_date: '2026-02-01', end_date: '2026-02-03' },
    price: 4175000,
    pax: 15,
    duration: { days: 3, nights: 2 },
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&h=300&fit=crop',
    type: 'Island Exploration',
    destinationType: 'Island Exploration',
    status: 'ACTIVE',
    slotAvailable: 3,
    includes: ['Guide', 'Meals', 'Boat Transfer', 'Diving Equipment'],
    pickup_points: [
      { location: 'Sorong Harbor', price: 0 },
      { location: 'Raja Ampat Domestic Air', price: 0 }
    ],
    rundowns: {
      1: [
        { time: '06.00 - 08.00', duration: '2', activity: 'Transfer to boat & briefing', location: 'Sorong' },
        { time: '08.00 - 12.00', duration: '4', activity: 'Island hopping', location: 'Raja Ampat' }
      ],
      2: [
        { time: '07.00 - 10.00', duration: '3', activity: 'Snorkeling & diving', location: 'Manta Point' }
      ]
    },
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&sig=2',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&sig=12'
    ]
  },
  {
    id: 3,
    name: 'Lake Toba',
    description: 'Relax at Lake Toba and explore Samosir Island: scenic stops, traditional Batak villages, and easy-paced cultural excursions around the lake.',
    location: { state: 'North Sumatra', country: 'Indonesia' },
    date: { start_date: '2026-02-01', end_date: '2026-02-03' },
    price: 4575000,
    pax: 15,
    duration: { days: 4, nights: 3 },
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
    type: 'City Tour',
    destinationType: 'City Tour',
    status: 'ACTIVE',
    slotAvailable: 1,
    includes: ['Guide', 'Meals', 'Accommodation', 'Transportation'],
    pickup_points: [
      { location: 'Medan Airport', price: 0 },
      { location: 'Parapat Pier', price: 0 }
    ],
    rundowns: {
      1: [
        { time: '08.00 - 10.00', duration: '2', activity: 'Arrival & transfer', location: 'Parapat' },
        { time: '10.00 - 13.00', duration: '3', activity: 'Explore Samosir Island', location: 'Samosir' }
      ],
      2: [
        { time: '09.00 - 12.00', duration: '3', activity: 'Local culture visit', location: 'Tomok' }
      ]
    },
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&sig=3'
    ]
  },
  {
    id: 4,
    name: 'Bromo Tengger',
    description: 'Experience Mount Bromo sunrise treks and the Tengger caldera: dramatic landscapes, accessible hikes, and memorable off-road transfers.',
    location: { state: 'East Java', country: 'Indonesia' },
    date: { start_date: '2026-02-05', end_date: '2026-02-07' },
    price: 3250000,
    pax: 12,
    duration: { days: 3, nights: 2 },
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
    type: 'Mount Hiking',
    destinationType: 'Mount Hiking',
    status: 'DRAFT', // Only visible to agents
    slotAvailable: 0,
    includes: ['Guide', 'Meals', 'Jeep Transfer'],
    pickup_points: [
      { location: 'Malang Bus Terminal', price: 0 },
      { location: 'Surabaya Airport', price: 0 }
    ],
    rundowns: {
      1: [
        { time: '03.00 - 06.00', duration: '3', activity: 'Sunrise trek', location: 'Mount Bromo' }
      ]
    },
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&sig=4'
    ]
  },
  {
    id: 5,
    name: 'Belitung Island',
    description: 'Belitung highlights include pristine beaches, granite rock formations, and relaxed island excursions ideal for beachcombing and short boat trips.',
    location: { state: 'Bangka Belitung', country: 'Indonesia' },
    date: { start_date: '2026-02-10', end_date: '2026-02-12' },
    price: 2800000,
    pax: 20,
    duration: { days: 2, nights: 1 },
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop',
    type: 'Island Exploration',
    destinationType: 'Island Exploration',
    status: 'ACTIVE',
    slotAvailable: 1,
    includes: ['Guide', 'Meals', 'Boat Transfer'],
    pickup_points: [
      { location: 'Tanjung Pandan Pier', price: 0 },
      { location: 'Jakarta Soetta Airport', price: 0 }
    ],
    rundowns: {
      1: [
        { time: '08.00 - 10.00', duration: '2', activity: 'Beach visit', location: 'Tanjung Tinggi' }
      ]
    },
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&sig=5'
    ]
  },
  {
    id: 6,
    name: 'Wakatobi Diving',
    description: 'Wakatobi delivers exceptional diving experiences with rich reefs and clear waters; perfect for multi-day dive itineraries and marine exploration.',
    location: { state: 'Southeast Sulawesi', country: 'Indonesia' },
    date: { start_date: '2026-02-15', end_date: '2026-02-19' },
    price: 6500000,
    pax: 10,
    duration: { days: 5, nights: 4 },
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&h=300&fit=crop',
    type: 'Wildlife Exploration',
    destinationType: 'Wildlife Exploration',
    status: 'ACTIVE',
    slotAvailable: 1,
    includes: ['Guide', 'Meals', 'Diving Equipment', 'Boat Transfer'],
    pickup_points: [
      { location: 'Wakatobi Airport', price: 0 },
      { location: 'Baubau Harbor', price: 0 }
    ],
    rundowns: {
      1: [
        { time: '08.00 - 12.00', duration: '4', activity: 'Diving Session 1', location: 'House Reef' }
      ],
      2: [
        { time: '09.00 - 13.00', duration: '4', activity: 'Diving Session 2', location: 'Drop-off Site' }
      ]
    },
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&sig=6'
    ]
  }
  ,
  // duplicate entries with different dates for testing
  {
    id: 7,
    name: 'Komodo Island',
    description: 'Komodo Island (alternate schedule): similar wildlife and island activities as the main Komodo listing, with different departure dates for flexibility.',
    location: { state: 'East Nusa Tenggara', country: 'Indonesia' },
    date: { start_date: '2026-03-15', end_date: '2026-03-17' },
    price: 4575000,
    pax: 15,
    duration: { days: 2, nights: 1 },
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop',
    type: 'Island Exploration',
    destinationType: 'Island Exploration',
    status: 'ACTIVE',
    slotAvailable: 1,
    includes: ['Guide', 'Meals', 'Entrance Ticket'],
    pickup_points: [
      { location: 'Komodo Airport, Labuan Bajo', price: 0 }
    ],
    rundowns: {
      1: [
        { time: '07.00 - 10.00', duration: '3', activity: 'Sailing & snorkeling', location: 'Padar Island' }
      ]
    },
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&sig=7'
    ]
  },
  {
    id: 8,
    name: 'Raja Ampat',
    description: 'Alternate Raja Ampat schedule: enjoy island hopping and snorkeling across protected marine areas with local boat transfers and guides.',
    location: { state: 'Maluku', country: 'Indonesia' },
    date: { start_date: '2026-04-10', end_date: '2026-04-12' },
    price: 4175000,
    pax: 15,
    duration: { days: 3, nights: 2 },
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&h=300&fit=crop',
    type: 'Island Exploration',
    destinationType: 'Island Exploration',
    status: 'ACTIVE',
    slotAvailable: 1,
    includes: ['Guide', 'Meals', 'Boat Transfer'],
    pickup_points: [
      { location: 'Sorong Harbor', price: 0 }
    ],
    rundowns: {
      1: [
        { time: '08.00 - 12.00', duration: '4', activity: 'Island hopping', location: 'Raja Ampat' }
      ]
    },
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&sig=8'
    ]
  },
  {
    id: 9,
    name: 'Lake Toba',
    description: 'Alternate Lake Toba schedule: includes guided visits to cultural points on Samosir Island and gentle exploration of the lake shoreline.',
    location: { state: 'North Sumatra', country: 'Indonesia' },
    date: { start_date: '2026-05-20', end_date: '2026-05-23' },
    price: 4575000,
    pax: 15,
    duration: { days: 4, nights: 3 },
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
    type: 'City Tour',
    destinationType: 'City Tour',
    status: 'ACTIVE',
    slotAvailable: 1,
    includes: ['Guide', 'Meals', 'Accommodation'],
    pickup_points: [
      { location: 'Medan Airport', price: 0 }
    ],
    rundowns: {
      1: [
        { time: '09.00 - 12.00', duration: '3', activity: 'Explore Beach', location: 'Samosir' }
      ]
    },
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&sig=9'
    ]
  },
  {
    id: 10,
    name: 'Bromo Tengger',
    description: 'Alternate Bromo schedule: focused on sunrise trekking with simpler logistics and small-group jeep transfers.',
    location: { state: 'East Java', country: 'Indonesia' },
    date: { start_date: '2026-06-01', end_date: '2026-06-03' },
    price: 3250000,
    pax: 12,
    duration: { days: 3, nights: 2 },
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
    type: 'Mount Hiking',
    destinationType: 'Mount Hiking',
    status: 'DRAFT',
    slotAvailable: 1,
    includes: ['Guide', 'Meals', 'Jeep Transfer'],
    pickup_points: [
      { location: 'Malang Bus Terminal', price: 0 }
    ],
    rundowns: {
      1: [ { time: '03.00 - 06.00', duration: '3', activity: 'Sunrise trek', location: 'Mount Bromo' } ]
    },
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&sig=10'
    ]
  },
  {
    id: 11,
    name: 'Belitung Island',
    description: 'Alternate Belitung schedule: short beach-focused itinerary highlighting Tanjung Tinggi and nearby islets for relaxed coastal exploration.',
    location: { state: 'Bangka Belitung', country: 'Indonesia' },
    date: { start_date: '2026-07-10', end_date: '2026-07-12' },
    price: 2800000,
    pax: 20,
    duration: { days: 2, nights: 1 },
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop',
    type: 'Island Exploration',
    destinationType: 'Island Exploration',
    status: 'ACTIVE',
    slotAvailable: 1,
    includes: ['Guide', 'Meals', 'Boat Transfer'],
    pickup_points: [
      { location: 'Tanjung Pandan Pier', price: 0 }
    ],
    rundowns: {
      1: [ { time: '08.00 - 10.00', duration: '2', activity: 'Beach visit', location: 'Tanjung Tinggi' } ]
    },
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&sig=11'
    ]
  }
];

export const passengers = Array.from({ length: 12 }).map((_, i) => ({
  username: `user${100 + i}`,
  fullname: `Passenger ${i + 1}`,
  gender: i % 2 === 0 ? 'Male' : 'Female',
  dob: i % 2 === 0 ? '1990-03-07' : '1995-08-21',
  nationality: 'Indonesia',
  pickup: i % 3 === 0 ? 'Orivia Agent Gambir, Jakarta' : i % 3 === 1 ? 'Orivia Agent Pasteur, Bandung' : 'Soekarno Hatta Airport, Jakarta',
  phone: `0812-555-0${100 + i}`
}));

export const users = [
  { id: 'u-1', username: 'agent01', role: 'TRAVEL_AGENT' },
  { id: 'u-2', username: 'customer01', role: 'CUSTOMER' }
];

export const bookings = [
  { id: 'b-1', tripId: 'trip-1', username: 'user100', status: 'CONFIRMED' },
  { id: 'b-2', tripId: 'trip-1', username: 'user101', status: 'PENDING' }
];

// Additional mock data used by BookingPage
export const TRIP_RUNDOWNS = {
  1: [
    { time: '06.00 - 07.00', duration: '1', activity: 'Meeting point & briefing', location: 'Bandar Udara Komodo' },
    { time: '07.00 - 09.30', duration: '2.5', activity: 'Sailing', location: 'Padar Island' },
    { time: '09.30 - 11.00', duration: '1.5', activity: 'Trekking & sightseeing', location: 'Padar Island' },
    { time: '11.00 - 13.00', duration: '2', activity: 'Beach time & snorkeling', location: 'Pink Beach' },
    { time: '13.00 - 14.00', duration: '1', activity: 'Lunch', location: 'On Boat' },
    { time: '14.00 - 16.00', duration: '2', activity: 'Komodo trekking', location: 'Komodo Island' },
    { time: '16.00 - 19.00', duration: '3', activity: 'Sunset and Dinner', location: 'Sunset and Dinner' }
  ],
  2: [
    { time: '06.00 - 08.00', duration: '2', activity: 'Breakfast & check out', location: 'Hotel' },
    { time: '08.00 - 10.00', duration: '2', activity: 'Island hopping', location: 'Kanawa Island' },
    { time: '10.00 - 12.00', duration: '2', activity: 'Snorkeling', location: 'Manta Point' },
    { time: '12.00 - 13.00', duration: '1', activity: 'Lunch', location: 'Local Restaurant' }
  ]
};

export const TRIP_IMAGES = {
  1: [
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&h=600&fit=crop'
  ]
};

export const INCLUDES = [
  'Guide',
  'Meals',
  'First Aid',
  'Insurance',
  'Entrance Ticket',
  'Transportation',
  'Documentation',
  'Accommodation'
];

export const PICKUP_POINTS = [
  'Orivia Agent Gambir, Jakarta',
  'Orivia Agent Pasteur, Bandung',
  'Komodo Airport, Labuan Bajo',
  'Soekarno Hatta Airport, Jakarta'
];

export default {
  trips,
  passengers,
  users,
  bookings,
  DESTINATION_TYPES,
  TRIP_RUNDOWNS,
  TRIP_IMAGES,
  INCLUDES,
  PICKUP_POINTS
};
