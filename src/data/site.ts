import { PALETTE } from '@lib/palette';

const NAME = 'Nemanja Galbinovic';
const TITLE_SEPARATOR = ' • ';

export const pageTitle = (...parts: string[]) => parts.join(TITLE_SEPARATOR);

export const site = {
  name: NAME,
  jobTitle: 'Software engineer',
  title: pageTitle(NAME, 'Portfolio'),
  ogTitle: pageTitle(NAME, 'Software engineer'),
  description:
    'Nemanja Galbinovic, a software engineer based in Serbia and working worldwide. I build software people can rely on.',
  themeColor: PALETTE.midnight,
  email: 'galbinovic584@gmail.com',
  // TODO: add the CV file to public/, then uncomment the download link in Contact.astro
  cv: '/cv.pdf',
  socials: [
    { label: 'GitHub', href: 'https://github.com/littlenines' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/galbinovic584/' },
  ],
} as const;
