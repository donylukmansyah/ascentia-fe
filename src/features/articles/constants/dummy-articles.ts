import type { Article } from '../types/article'

export const dummyArticles: Array<Article> = [
  {
    id: 'matrix-matching',
    slug: 'why-matrix-matching-matters-in-xrf',
    title: 'Why matrix matching matters in XRF.',
    excerpt:
      'Explore how a representative reference material can help laboratories compare samples with greater confidence.',
    image: '/images/homepage/xrf-home.webp',
    alt: 'Laboratory researcher preparing a sample beside an XRF fusion instrument',
    date: '2026-09-24',
    readMinutes: 5,
  },
  {
    id: 'sample-preparation',
    slug: 'a-closer-look-at-sample-preparation',
    title: 'A closer look at sample preparation.',
    excerpt:
      'From weighing to fusion, small steps shape the quality of an analytical result.',
    image: '/images/about-us/Laboratory-technician.webp',
    alt: 'Gloved technician loading sample vials into a laboratory instrument',
    date: '2026-09-22',
    readMinutes: 4,
  },
  {
    id: 'lab-conversations',
    slug: 'better-results-start-with-lab-conversations',
    title: 'Better results start with lab conversations.',
    excerpt:
      'A shared review of methods helps teams identify practical improvements.',
    image: '/images/homepage/assets-home.webp',
    alt: 'Three researchers reviewing results on a laboratory monitor',
    date: '2026-09-20',
    readMinutes: 3,
  },
  {
    id: 'technical-exchange',
    slug: 'making-room-for-technical-exchange',
    title: 'Making room for technical exchange.',
    excerpt:
      'Questions, demonstrations, and discussion bring analytical workflows into focus.',
    image: '/images/about-us/Technical-briefing.webp',
    alt: 'Participants attending a technical briefing',
    date: '2026-09-18',
    readMinutes: 4,
  },
  {
    id: 'reference-materials',
    slug: 'choosing-a-reference-material',
    title: 'Choosing a reference material for your method.',
    excerpt:
      'Start with the sample matrix, concentration range, and intended application.',
    image: '/images/homepage/xrf-home.webp',
    alt: 'Researcher handling a sample cup at a laboratory bench',
    date: '2026-09-16',
    readMinutes: 5,
  },
  {
    id: 'mining-samples',
    slug: 'from-mine-sample-to-laboratory',
    title: 'From mine sample to laboratory.',
    excerpt:
      'Traceable handling keeps the connection between a collected sample and its result.',
    image: '/images/products/assets-products.webp',
    alt: 'Mining vehicle inside an underground tunnel',
    date: '2026-09-14',
    readMinutes: 3,
  },
  {
    id: 'daily-checks',
    slug: 'small-checks-for-everyday-analysis',
    title: 'Small checks for everyday analysis.',
    excerpt:
      'Build repeatable checks into the routine without making the workflow harder.',
    image: '/images/about-us/Laboratory-technician.webp',
    alt: 'Technician checking a tray of laboratory samples',
    date: '2026-09-12',
    readMinutes: 4,
  },
  {
    id: 'exhibition',
    slug: 'exploring-tools-on-the-exhibition-floor',
    title: 'Exploring tools on the exhibition floor.',
    excerpt:
      'Hands-on conversations connect analytical questions with practical tools.',
    image: '/images/about-us/Ascentia-booth.webp',
    alt: 'Ascentia exhibition booth with laboratory equipment displays',
    date: '2026-09-10',
    readMinutes: 3,
  },
  {
    id: 'workflow',
    slug: 'a-more-consistent-laboratory-workflow',
    title: 'A more consistent laboratory workflow.',
    excerpt:
      'Clear handovers and simple records support a more repeatable process.',
    image: '/images/homepage/assets-home.webp',
    alt: 'Laboratory team discussing an instrument workflow',
    date: '2026-09-08',
    readMinutes: 4,
  },
  {
    id: 'pipetting',
    slug: 'precision-starts-at-the-bench',
    title: 'Precision starts at the bench.',
    excerpt:
      'Thoughtful pipetting and preparation routines help reduce variation before analysis begins.',
    image: '/images/about-us/Cool-Toned Laboratory Pipetting Scene 1.webp',
    alt: 'Scientist pipetting liquid into a flask at a laboratory bench',
    date: '2026-09-06',
    readMinutes: 5,
  },
  {
    id: 'sample-journey',
    slug: 'following-the-sample-journey',
    title: 'Following the sample journey.',
    excerpt:
      'Good records connect the mining environment with the laboratory and the final report.',
    image: '/images/products/assets-products.webp',
    alt: 'Underground mining tunnel with a vehicle and ventilation equipment',
    date: '2026-09-04',
    readMinutes: 4,
  },
  {
    id: 'method-review',
    slug: 'a-fresh-perspective-on-method-review',
    title: 'A fresh perspective on method review.',
    excerpt:
      'Take time to compare observations, revisit assumptions, and discuss the next analytical step.',
    image: '/images/about-us/Cool-Toned Laboratory Pipetting Scene 1.webp',
    alt: 'Scientist preparing liquid samples among laboratory glassware',
    date: '2026-09-02',
    readMinutes: 3,
  },
  {
    id: 'mineral-analysis',
    slug: 'connecting-mining-and-mineral-analysis',
    title: 'Connecting mining and mineral analysis.',
    excerpt:
      'Representative samples and a clear analytical plan help put material results into context.',
    image: '/images/products/assets-products.webp',
    alt: 'Working environment inside an underground mine',
    date: '2026-08-30',
    readMinutes: 5,
  },
]

export const dummyNewsSelections = {
  featured: ['matrix-matching'],
  center: ['sample-preparation', 'lab-conversations', 'technical-exchange'],
  right: [
    'reference-materials',
    'mining-samples',
    'daily-checks',
    'exhibition',
    'workflow',
  ],
  latest: ['pipetting', 'sample-journey', 'method-review', 'mineral-analysis'],
  popular: [
    'matrix-matching',
    'reference-materials',
    'sample-preparation',
    'mining-samples',
  ],
} as const

export function selectDummyArticles(
  ids: ReadonlyArray<string>,
): Array<Article> {
  return ids.map((id) => {
    const article = dummyArticles.find((item) => item.id === id)
    if (!article) throw new Error(`Unknown dummy article: ${id}`)
    return article
  })
}

export const latestPageSize = 4

export function getLatestPool(): Array<Article> {
  const first = selectDummyArticles(dummyNewsSelections.latest)
  const rest = dummyArticles.filter(
    (article) => !first.some((item) => item.id === article.id),
  )
  return [...first, ...rest]
}
