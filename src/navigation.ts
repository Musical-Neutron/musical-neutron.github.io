import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Home',
      href: getPermalink('/'),
      links: [
        {
          text: 'About',
          href: getPermalink('/#about'),
        },
        // {
        //   text: 'News',
        //   href: getBlogPermalink(),
        // },
        {
          text: 'CV',
          href: getPermalink('cv'),
        },
        // {
        //   text: 'Mobile App',
        //   href: getPermalink('/homes/mobile-app'),
        // },
        // {
        //   text: 'Personal',
        //   href: getPermalink('/homes/personal'),
        // },
      ],
    },
    {
      text: 'News',
      href: getBlogPermalink(),
      links: [
        // {
        //   text: 'News List',
        //   href: getBlogPermalink(),
        // },
        // {
        //   text: 'Article',
        //   href: getPermalink('20260112-marie-curie', 'post'),
        // },
        // {
        //   text: 'Article (with MDX)',
        //   href: getPermalink('markdown-elements-demo-post', 'post'),
        // },
        // {
        //   text: 'Category Page',
        //   href: getPermalink('tutorials', 'category'),
        // },
        // {
        //   text: 'Tag Page',
        //   href: getPermalink('astro', 'tag'),
        // },
      ],
    },
    {
      text: 'Research',
      href: getPermalink('/research'),
      links: [
        { text: 'Galaxy-environment connection', href: '/research#galaxy-environment' },
        { text: 'Warm dark matter', href: '/research#warm-dark-matter' },
        { text: 'The Local Group', href: '/research#local-group' },
        { text: 'Satellite galaxies', href: '/research#satellite-galaxies' },
        // { text: 'UDGs in the Local Group', href: '/research#udgs-local-group' },
      ],
    },
    {
      text: 'Contact',
      href: getPermalink('contact'),
      links: [
        // {
        //   text: 'Contact',
        //   href: getPermalink('contact'),
        // },
        {
          text: 'Press',
          href: getPermalink('press'),
        },
      ],
    },
    // {
    //   text: 'Widgets',
    //   href: '#',
    // },
  ],
  // actions: [{ text: 'Download', href: 'https://github.com/arthelokyo/astrowind', target: '_blank' }],
};

const researchLinks =
  headerData.links.find((link) => link.text === 'Research')?.links ?? [];

export const getFooterData = (personal: {
  myName: string;
  mySite: string;
  contactEmail: string;
  projectNumber: string;
  projectAcronym: string;
  copyYear: string;
}) => {
  return {
    links: [
      {
        title: 'Home',
        links: [
          { text: 'About', href: '/#about' },
          { text: 'News', href: getBlogPermalink() },
          { text: 'CV', href: '/cv' },
          // { text: 'Team', href: '#' },
          // { text: 'Enterprise', href: '#' },
          // { text: 'Customer stories', href: '#' },
          // { text: 'Pricing', href: '#' },
          // { text: 'Resources', href: '#' },
        ],
      },
      {
        title: 'Research',
        links: researchLinks,
      },
      {
        title: 'Contact',
        links: [
          { text: 'Contact', href: '/contact' },
          { text: 'Press', href: '/press' },
          // { text: 'Acknowledgement', href: '#' },
        ],
      },
      // {
      //   title: 'Company',
      //   links: [
      //     { text: 'About', href: '#' },
      //     { text: 'Careers', href: '#' },
      //     { text: 'Press', href: '#' },
      //     { text: 'Inclusion', href: '#' },
      //     { text: 'Social Impact', href: '#' },
      //     { text: 'Shop', href: '#' },
      //   ],
      // },
    ],
    // secondaryLinks: [
    //   { text: 'Terms', href: getPermalink('/terms') },
    //   { text: 'Privacy Policy', href: getPermalink('/privacy') },
    // ],
    socialLinks: [
      // { ariaLabel: 'X', icon: 'tabler:brand-x', href: '#' },
      // { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
      { ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: 'https://www.linkedin.com/in/oliver-n-a4134b231/' },
      { ariaLabel: 'Bluesky', icon: 'tabler:brand-bluesky', href: 'https://bsky.app/profile/musical-neutron.bsky.social' },
      { ariaLabel: 'ORCiD', cssIconClass: 'ai ai-orcid', href: 'https://orcid.org/0000-0002-2769-9507' },
      { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/Musical-Neutron' },
      // { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
    ],
    footNote: `
    <img class="h-5 w-auto md:h-6 md:w-auto md:-mt-0.5 mr-1.5 rtl:mr-0 rtl:ml-1.5 float-left rtl:float-right shrink-0" src="${getAsset('/images/eu_flag_colour.png')}" alt="European Union emblem" loading="lazy"></img>
    Financially supported by the <a href="https://marie-sklodowska-curie-actions.ec.europa.eu/">European Union</a>. &copy; <a href=${personal.mySite}>${personal.myName}</a> ${personal.copyYear}. All rights reserved.
  `,
  };
};
