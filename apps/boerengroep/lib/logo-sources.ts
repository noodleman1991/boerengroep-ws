import { getImageProps } from 'next/image';

/**
 * Where the browser gets a logo from. A logo that lives on the file store is fetched through
 * the site's own picture service: it arrives small (a logo is shown some 150 pixels wide, the
 * file is often 2000) and from the site's own address. A drawing (SVG), which is small and
 * sharp at any size, and a file of the site itself are used as they are.
 */
export function logoSources(src: string): { src: string; srcSet?: string } {
  if (!/^https?:\/\//.test(src) || /\.svg(\?|$)/i.test(src)) return { src };
  // 192 wide on an ordinary screen and twice that on a sharp one covers every place a logo stands.
  const { props } = getImageProps({ src, alt: '', width: 192, height: 192 });
  return { src: props.src, srcSet: props.srcSet };
}
