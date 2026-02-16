export const DESTINATION_TYPES = [
  'Island Exploration',
  'Mount Hiking',
  'Camping Ground',
  'City Tour',
  'Wildlife Exploration',
  'Other'
];

// Profile Dummy Data
export const dummyAgentProfile = {
  name: 'Dzaky Atha Fadhilah',
  username: 'dzakyatha_agent',
  email: 'jek@gmail.com',
  phone: '+62 812-3456-7891',
  dateOfBirth: '2005-03-07',
  gender: 'Male',
  district: 'Jatinangor',
  city: 'Sumedang',
  province: 'West Java',
  nationality: 'Indonesia',
  language: 'Bahasa Indonesia, English',
  joinedDate: '2024-01-15',
};

export const dummyCustomerProfile = {
  name: 'Nakeisha Valya Shakila',
  username: 'nakei_traveler',
  email: 'nakei@gmail.com',
  phone: '+62 856-7890-1234',
  dateOfBirth: '2006-06-29',
  gender: 'Female',
  district: 'Senayan',
  city: 'Jakarta Selatan',
  province: 'DKI Jakarta',
  nationality: 'Indonesia',
  language: 'Bahasa Indonesia, English',
  joinedDate: '2024-06-20',
};

// Latest Trip Data for Customer Profile
export const customerLatestTrips = [
  { 
    id: 1, 
    title: '3D2N - Komodo Island Adventure', 
    location: 'East Nusa Tenggara, Indonesia', 
    date: '15-17 March 2026', 
    price: 'Rp4.575.000 / 2pax', 
    tag: 'Island Exploration', 
    status: 'Upcoming' 
  },
  { 
    id: 2, 
    title: '4D3N - Raja Ampat Diving', 
    location: 'West Papua, Indonesia', 
    date: '20-23 January 2026', 
    price: 'Rp8.200.000 / 2pax', 
    tag: 'Marine Tourism', 
    status: 'Completed' 
  },
  { 
    id: 3, 
    title: '2D1N - Bromo Sunrise Trek', 
    location: 'East Java, Indonesia', 
    date: '05-06 January 2026', 
    price: 'Rp1.850.000 / 2pax', 
    tag: 'Mountain Hiking', 
    status: 'Completed' 
  },
];

// Detailed booking information for each trip
export const tripBookingDetails = {
  1: {
    bookingId: '@nakeiiii123',
    customerName: 'Nakeisha Valya',
    phoneNumber: '081234568910',
    gender: 'Female',
    nationality: 'Indonesia',
    dateOfBirth: '29 June 2006',
    notes: 'I prefer a window seat during transportation if available, prefer a lower bunk for sleeping arrangements, and have food allergies to peanuts and shrimp.',
    pickupPoint: 'Orivia Agent Pasteur, Bandung',
    passengers: [
      {
        customerName: 'Nakeisha Valya',
        phoneNumber: '081234568910',
        gender: 'Female',
        nationality: 'Indonesia',
        dateOfBirth: '29 June 2006',
        pickupPoint: 'Orivia Agent Pasteur, Bandung',
        notes: 'I prefer a window seat during transportation if available. Allergic to peanuts and shrimp.'
      },
      {
        customerName: 'Ardi Prasetyo',
        phoneNumber: '081298765432',
        gender: 'Male',
        nationality: 'Indonesia',
        dateOfBirth: '1995-11-21',
        pickupPoint: 'Orivia Agent Pasteur, Bandung',
        notes: 'Needs vegetarian meal option.'
      },
      {
        customerName: 'Siti Rahma',
        phoneNumber: '081377788899',
        gender: 'Female',
        nationality: 'Indonesia',
        dateOfBirth: '1998-04-03',
        pickupPoint: 'Orivia Agent Pasteur, Bandung',
        notes: 'Prefer lower bunk and morning departure.'
      }
    ]
  },
  2: {
    bookingId: '@nakeiiii124',
    customerName: 'Nakeisha Valya',
    phoneNumber: '081234568910',
    gender: 'Female',
    nationality: 'Indonesia',
    dateOfBirth: '29 June 2006',
    notes: 'Experienced diver with PADI Open Water certification. Prefer early morning dive sessions and vegetarian meal options.',
    pickupPoint: 'Sorong Harbor'
  },
  3: {
    bookingId: '@nakeiiii125',
    customerName: 'Nakeisha Valya',
    phoneNumber: '081234568910',
    gender: 'Female',
    nationality: 'Indonesia',
    dateOfBirth: '29 June 2006',
    notes: 'First time mountain hiking. Please provide extra guidance and safety equipment. Prefer moderate hiking pace.',
    pickupPoint: 'Orivia Agent Malang, East Java'
  }
};

// Trip Master Data (static information shared across all schedules)
export const trips = [
  {
    tripId: 1,
    name: 'Komodo Island',
    description: 'Discover Komodo Island: see Komodo dragons, hike Padar for panoramic views, snorkel at Pink Beach, and enjoy island-hopping with local guides.',
    location: { state: 'East Nusa Tenggara', country: 'Indonesia' },
    price: 4575000,
    pax: 15,
    duration: { days: 2, nights: 1 },
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop',
    type: 'Island Exploration',
    destinationType: 'Island Exploration',
    includes: ['Guide', 'Meals', 'Entrance Ticket', 'Snorkeling Gear'],
    pickup_points: [
      { location: 'Komodo Airport, Labuan Bajo', price: 0 },
      { location: 'Orivia Agent Gambir, Jakarta', price: 50000 },
      // { location: 'Orivia Agent Pasteur, Bandung', price: 100000 },
      { location: 'Orivia Agent, NTT', price: 75000 }
    ],
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
    tripId: 2,
    name: 'Raja Ampat',
    description: 'Raja Ampat offers world-class marine biodiversity: island hopping, snorkeling, and diving among vibrant coral gardens and unique seascapes.',
    location: { state: 'Maluku', country: 'Indonesia' },
    price: 4175000,
    pax: 15,
    duration: { days: 3, nights: 2 },
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&h=300&fit=crop',
    type: 'Island Exploration',
    destinationType: 'Island Exploration',
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
    tripId: 3,
    name: 'Lake Toba',
    description: 'Relax at Lake Toba and explore Samosir Island: scenic stops, traditional Batak villages, and easy-paced cultural excursions around the lake.',
    location: { state: 'North Sumatra', country: 'Indonesia' },
    price: 4575000,
    pax: 15,
    duration: { days: 4, nights: 3 },
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
    type: 'City Tour',
    destinationType: 'City Tour',
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
    tripId: 4,
    name: 'Bromo Tengger',
    description: 'Experience Mount Bromo sunrise treks and the Tengger caldera: dramatic landscapes, accessible hikes, and memorable off-road transfers.',
    location: { state: 'East Java', country: 'Indonesia' },
    price: 3250000,
    pax: 12,
    duration: { days: 3, nights: 2 },
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
    type: 'Mount Hiking',
    destinationType: 'Mount Hiking',
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
    tripId: 5,
    name: 'Belitung Island',
    description: 'Belitung highlights include pristine beaches, granite rock formations, and relaxed island excursions ideal for beachcombing and short boat trips.',
    location: { state: 'Bangka Belitung', country: 'Indonesia' },
    price: 2800000,
    pax: 20,
    duration: { days: 2, nights: 1 },
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop',
    type: 'Island Exploration',
    destinationType: 'Island Exploration',
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
    tripId: 6,
    name: 'Wakatobi Diving',
    description: 'Wakatobi delivers exceptional diving experiences with rich reefs and clear waters; perfect for multi-day dive itineraries and marine exploration.',
    location: { state: 'Southeast Sulawesi', country: 'Indonesia' },
    price: 6500000,
    pax: 10,
    duration: { days: 5, nights: 4 },
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&h=300&fit=crop',
    type: 'Wildlife Exploration',
    destinationType: 'Wildlife Exploration',
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
];

// Trip Schedules (date-specific data with slot availability)
export const tripSchedules = [
  {
    scheduleId: 101,
    tripId: 1,
    start_date: '2026-02-01',
    end_date: '2026-02-03',
    status: 'ACTIVE',
    slotAvailable: 12,
    participants: [
      {
        username: 'user100',
        fullname: 'Ari Santoso',
        gender: 'Male',
        dob: '1990-03-07',
        nationality: 'Indonesia',
        pickup: 'Komodo Airport, Labuan Bajo',
        phone: '0812-345-0001'
      },
      {
        username: 'user101',
        fullname: 'Siti Rahma',
        gender: 'Female',
        dob: '1995-08-21',
        nationality: 'Indonesia',
        pickup: 'Orivia Agent Gambir, Jakarta',
        phone: '0812-345-0002'
      },
      {
        username: 'user102',
        fullname: 'Budi Prasetyo',
        gender: 'Male',
        dob: '1988-11-02',
        nationality: 'Indonesia',
        pickup: 'Orivia Agent Gambir, Jakarta',
        phone: '0812-345-0003'
      }
    ]
  },
  {
    scheduleId: 102,
    tripId: 1,
    start_date: '2026-03-15',
    end_date: '2026-03-17',
    status: 'ACTIVE',
    slotAvailable: 13,
    participants: [
      {
        username: 'user200',
        fullname: 'Rina Marlina',
        gender: 'Female',
        dob: '1993-02-18',
        nationality: 'Indonesia',
        pickup: 'Komodo Airport, Labuan Bajo',
        phone: '0812-555-0200'
      },
      {
        username: 'user201',
        fullname: 'Andi Wijaya',
        gender: 'Male',
        dob: '1987-09-30',
        nationality: 'Indonesia',
        pickup: 'Orivia Agent Gambir, Jakarta',
        phone: '0812-555-0201'
      }
    ]
  },
  {
    scheduleId: 201,
    tripId: 2,
    start_date: '2026-02-01',
    end_date: '2026-02-03',
    status: 'ACTIVE',
    slotAvailable: 13,
    participants: [
      {
        username: 'user200',
        fullname: 'Rina Marlina',
        gender: 'Female',
        dob: '1993-02-18',
        nationality: 'Indonesia',
        pickup: 'Sorong Harbor',
        phone: '0812-555-0200'
      },
      {
        username: 'user201',
        fullname: 'Andi Wijaya',
        gender: 'Male',
        dob: '1987-09-30',
        nationality: 'Indonesia',
        pickup: 'Raja Ampat Domestic Air',
        phone: '0812-555-0201'
      }
    ]
  },
  {
    scheduleId: 202,
    tripId: 2,
    start_date: '2026-04-10',
    end_date: '2026-04-12',
    status: 'ACTIVE',
    slotAvailable: 15
  },
  {
    scheduleId: 301,
    tripId: 3,
    start_date: '2026-02-01',
    end_date: '2026-02-04',
    status: 'ACTIVE',
    slotAvailable: 15
  },
  {
    scheduleId: 302,
    tripId: 3,
    start_date: '2026-05-20',
    end_date: '2026-05-23',
    status: 'ACTIVE',
    slotAvailable: 15
  },
  {
    scheduleId: 401,
    tripId: 4,
    start_date: '2026-02-05',
    end_date: '2026-02-07',
    status: 'DRAFT',
    slotAvailable: 12
  },
  {
    scheduleId: 402,
    tripId: 4,
    start_date: '2026-06-01',
    end_date: '2026-06-03',
    status: 'DRAFT',
    slotAvailable: 12
  },
  {
    scheduleId: 501,
    tripId: 5,
    start_date: '2026-02-10',
    end_date: '2026-02-12',
    status: 'ACTIVE',
    slotAvailable: 20
  },
  {
    scheduleId: 502,
    tripId: 5,
    start_date: '2026-07-10',
    end_date: '2026-07-12',
    status: 'ACTIVE',
    slotAvailable: 20
  },
  {
    scheduleId: 601,
    tripId: 6,
    start_date: '2026-02-15',
    end_date: '2026-02-19',
    status: 'ACTIVE',
    slotAvailable: 10
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
  tripSchedules,
  passengers,
  users,
  bookings,
  DESTINATION_TYPES,
  TRIP_RUNDOWNS,
  TRIP_IMAGES,
  INCLUDES,
  PICKUP_POINTS
};
