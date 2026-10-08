import { Building2, FlaskConical, Grid2X2 } from 'lucide-react'

export const navigationItems = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about-us' },
  { label: 'Products', href: '/products' },
  { label: 'News', href: '/news' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Contact Us', href: '/contact-us' },
] as const

export const productBrowseItems = [
  {
    label: 'Brands',
    description: 'Explore products by brand',
    href: '/products/brands',
    icon: Building2,
  },
  {
    label: 'Types',
    description: 'Browse by product type',
    href: '/products/types',
    icon: Grid2X2,
  },
  {
    label: 'Applications',
    description: 'Find products for your workflow',
    href: '/products/applications',
    icon: FlaskConical,
  },
] as const
