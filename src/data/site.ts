export const site = {
  name: 'Nemanja Galbinovic',
  title: 'Nemanja Galbinovic Portfolio',
  ogTitle: 'Nemanja Galbinovic · Software engineer',
  description: 'A cyberpunk city-pop portfolio with a layered skyline and smooth GSAP motion.',
  themeColor: '#1B1233',
  email: 'galbinovic584@gmail.com',
  // TODO: add the CV file to public/, then uncomment the download link in Contact.astro
  cv: '/cv.pdf',
  socials: [
    { label: 'GitHub', href: 'https://github.com/littlenines' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/galbinovic584/' },
  ],
} as const;
