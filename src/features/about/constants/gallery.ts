export type GalleryPhoto = {
  id: string
  src: string
  alt: string
}

export const aboutGalleryContent = {
  eyebrow: 'Inside Ascentia',
  title: 'People, spaces, and analytical work',
  description:
    'With locations in Jakarta and Kendari, Ascentia supports laboratories and industrial operations with faster.',
  photos: [
    {
      id: 'meeting',
      src: '/images/about-us/foto-4.webp',
      alt: 'Ascentia team meeting with a client in a meeting room',
    },
    {
      id: 'boardroom',
      src: '/images/about-us/Ascentia-booth.webp',
      alt: 'Meeting room with projector at Ascentia office',
    },
    {
      id: 'reception',
      src: '/images/about-us/foto-1.webp',
      alt: 'Ascentia Jakarta head office reception',
    },
    {
      id: 'seminar',
      src: '/images/about-us/foto-6.webp',
      alt: 'Ascentia seminar group photo',
    },
    {
      id: 'grand-opening',
      src: '/images/about-us/foto-3.webp',
      alt: 'Grand opening ribbon cutting of Dynatech International Kendari branch',
    },
    {
      id: 'grand',
      src: '/images/about-us/Technical-briefing.webp',
      alt: 'Grand opening ribbon cutting of Dynatech International Kendari branch',
    },
  ] as GalleryPhoto[],
} as const
