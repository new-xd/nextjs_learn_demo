import { Inter, Lusitana } from 'next/font/google';

export const inter = Inter({ 
  subsets: ['latin'],
  fallback: ['system-ui', 'arial']
});

export const lusitana = Lusitana({ 
  weight: '400', 
  subsets: ['latin'],
  fallback: ['serif']
});