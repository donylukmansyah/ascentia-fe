export type OfficeLocation = {
  id: string
  name: string
  label: string
  longitude: number
  latitude: number
  photo: string
  address: string
  mapsUrl: string
  email: string
  phone: string
  phoneHref: string
  whatsapp: string
  whatsappHref: string
}

export const aboutLocationsContent = {
  eyebrow: 'Our Locations',
  title: 'Technical Support Closer to You',
  description:
    'Facilities in Jakarta and Kendari deliver application consulting, rapid consumable dispatch, and direct on-site support across Indonesia.',
  viewport: {
    center: [117.5, -2.5] as [number, number],
    zoom: 4.2,
  },
  mobileViewport: {
    center: [115, -1.6] as [number, number],
    zoom: 3.6,
  },
  offices: [
    {
      id: 'jakarta',
      name: 'Jakarta Head Office',
      label: 'Jakarta',
      longitude: 106.7614046,
      latitude: -6.1972135,
      photo: '/images/about-us/foto-1.webp',
      address:
        'Business Park Kebon Jeruk D2-12 Jl. Meruya Ilir No. 88 Meruya, Jakarta Barat 11620',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=PT+Ascentia+Arsya+Analitika+Jakarta&query_place_id=ChIJAfPlzjL3aS4RJgkrqoECgtU',
      email: 'sales@ascentia.co.id',
      phone: '(021) 2932-5739',
      phoneHref: 'tel:+622129325739',
      whatsapp: '+62 851-8606-1000',
      whatsappHref: 'https://wa.me/6285186061000',
    },
    {
      id: 'kendari',
      name: 'Kendari Office',
      label: 'Kendari',
      longitude: 122.5339273,
      latitude: -3.9930673,
      photo: '/images/about-us/kendari-office.webp',
      address:
        'Jl. Malaka Kawasan Citraland Kendari, Blok A01/015, Kendari, Sulawesi Tenggara',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=PT+ASCENTIA+ARSYA+ANALITIKA+Kendari&query_place_id=ChIJzaeLJ-aNmC0RwwL_mIMblQI',
      email: 'sales@ascentia.co.id',
      phone: '+62 851-8606-1000',
      phoneHref: 'tel:+6285186061000',
      whatsapp: '+62 851-8606-1000',
      whatsappHref: 'https://wa.me/6285186061000',
    },
  ] as OfficeLocation[],
} as const
