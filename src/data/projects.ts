export interface ProjectLink {
  label: 'demo' | 'github' | 'npm';
  href: string;
}

export interface Project {
  name: string;
  description: string;
  tech: string[];
  links: ProjectLink[];
  status?: string;
}

const quillPlugin = (name: string, demo: string): ProjectLink[] => [
  { label: 'demo', href: demo },
  { label: 'github', href: `https://github.com/littlenines/${name}` },
  { label: 'npm', href: `https://www.npmjs.com/package/${name}` },
];

export const projects: Project[] = [
  {
    name: 'portfolio',
    description: 'This site: a cyberpunk city-pop portfolio with a layered skyline and smooth GSAP motion.',
    tech: ['Astro', 'TypeScript', 'SCSS', 'GSAP'],
    links: [{ label: 'github', href: 'https://github.com/littlenines/portfolio' }],
  },
  {
    name: 'resize-quill-image',
    description:
      'Drag-to-resize for images in the Quill editor, with keyboard modifiers for aspect ratio and a live size badge.',
    tech: ['JavaScript', 'React'],
    links: quillPlugin('resize-quill-image', 'https://resize-quill-image.vercel.app/'),
  },
  {
    name: 'quill-image-alt',
    description: 'Add and edit image alt text right inside Quill, with a warning badge on images that are missing it.',
    tech: ['TypeScript', 'React'],
    links: quillPlugin('quill-image-alt', 'https://quill-image-alt.vercel.app/'),
  },
  {
    name: 'quill-tablekit',
    description:
      'Full table support for Quill 2: merge and split cells, resize, sort, and paste tables from Word, Excel or Google Docs.',
    tech: ['TypeScript', 'React'],
    links: quillPlugin('quill-tablekit', 'https://quill-tablekit.vercel.app'),
  },
];
