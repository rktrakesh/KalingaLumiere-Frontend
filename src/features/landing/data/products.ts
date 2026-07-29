export interface LandingProduct {
  id: string;
  name: string;
  collection: 'Regular' | 'Premium';
  /** Path under /public — drop the real photo at this location. */
  image: string;
  /** Optional packaging shot shown as a secondary frame inside the modal. */
  boxImage?: string;
  tagline: string;
  description: string;
}

export const regularCollection: LandingProduct[] = [
  {
    id: 'lavender',
    name: 'Lavender',
    collection: 'Regular',
    image: '/assets/products/lavender.png',
    boxImage: '/assets/products/lavender_box.png',
    tagline: 'Calm, unhurried, restorative',
    description:
      'A soft floral composition drawn from fields of lavender, rolled by hand into a slow, even burn that settles a room the moment it is lit.',
  },
  {
    id: 'chandan',
    name: 'Chandan',
    collection: 'Regular',
    image: '/assets/products/chandan.png',
    boxImage: '/assets/products/chandan_box.png',
    tagline: 'The quiet weight of sandalwood',
    description:
      'Pure sandalwood at its heart — warm, milky, and grounding. A fragrance carried through generations of Kalinga Lumière households.',
  },
  {
    id: 'mogra',
    name: 'Mogra',
    collection: 'Regular',
    image: '/assets/products/mogra.png',
    boxImage: '/assets/products/mogra_box.png',
    tagline: 'Jasmine at first light',
    description:
      'The bright, dew-fresh scent of jasmine in early morning bloom, captured while its fragrance is at its most alive.',
  },
  {
    id: 'nag-champa',
    name: 'Nag Champa',
    collection: 'Regular',
    image: '/assets/products/nag_champa.png',
    tagline: 'A signature since the beginning',
    description:
      'Our most recognised blend — champa flower and warm resins layered together into a fragrance that has defined incense for decades.',
  },
];

export const premiumCollection: LandingProduct[] = [
  {
    id: 'premium-kasturi',
    name: 'Kasturi',
    collection: 'Premium',
    image: '/assets/products/premium_kasturi.png',
    tagline: 'Rare. Musked. Unforgettable.',
    description:
      'An opulent musk composition reserved for our Premium Collection — deep, velvety, and built to linger long after the last ember fades.',
  },
  {
    id: 'premium-mysore-chandanam',
    name: 'Mysore Chandanam',
    collection: 'Premium',
    image: '/assets/products/premium_mysore_chandanam.png',
    tagline: 'Heritage sandalwood, refined',
    description:
      'Sourced in the tradition of Mysore\'s legendary sandalwood, refined into our finest expression of chandan — smoother, richer, longer-lasting.',
  },
  {
    id: 'premium-oudh',
    name: 'Oudh',
    collection: 'Premium',
    image: '/assets/products/premium_oudh.png',
    tagline: 'The rarest wood, distilled',
    description:
      'A dark, resinous oudh blend for those who seek intensity — smoky, ambered, and unmistakably premium from the very first curl of smoke.',
  },
];
