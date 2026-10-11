export type GalleryPhoto = {
  id: string
  src: string
  alt: string
}

export const aboutGalleryContent = {
  eyebrow: 'Inside Ascentia',
  title: 'People, spaces, and analytical work.',
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
      src: '/images/about-us/foto-2.webp',
      alt: 'Meeting room with projector at Ascentia office',
    },
    {
      id: 'instrument',
      src: '/images/about-us/Collaborative%20Analysis%20in%20the%20Modern%20Lab%201.webp',
      alt: 'Collaborative analysis in the modern lab',
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
      id: 'lab',
      src: '/images/about-us/Cool-Toned%20Laboratory%20Pipetting%20Scene%201.webp',
      alt: 'Laboratory pipetting scene',
    },
    {
      id: 'grand-opening',
      src: '/images/about-us/foto-3.webp',
      alt: 'Grand opening ribbon cutting of Dynatech International Kendari branch',
    },
    {
      id: 'technician',
      src: '/images/about-us/Laboratory-technician.webp',
      alt: 'Laboratory technician loading samples into an analytical instrument',
    },
    {
      id: 'booth',
      src: '/images/about-us/foto-5.webp',
      alt: 'Ascentia exhibition booth with visitors',
    },
  ] as GalleryPhoto[],
} as const
