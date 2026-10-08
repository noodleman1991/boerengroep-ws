import type { ImageTextBlock } from '@sites/cms/types';
import Image from 'next/image';
import { RichText } from '@/components/rich-text';
import { mediaUrl } from '@/lib/cms-adapters';
import { Section } from '../layout/section';

/** A picture with a few paragraphs: side by side, or stacked in the middle of the page. */
export const ImageText = ({ data }: { data: ImageTextBlock }) => {
    const picture = mediaUrl(data.image?.src);
    const layout = data.layout ?? 'image-left';
    const sideBySide = layout === 'image-left' || layout === 'image-right';
    const words = <RichText data={data.content} className="rich pair__words" />;
    if (!picture) return <Section background={data.background}>{words}</Section>;

    const image = (
        <Image
            className="pair__picture"
            src={picture}
            alt={data.image?.alt ?? ''}
            width={1200}
            height={900}
            sizes={sideBySide ? '(max-width: 900px) 100vw, 50vw' : '(max-width: 900px) 100vw, 900px'}
        />
    );
    return (
        <Section background={data.background}>
            <div className={`pair pair--${layout} pair--${data.verticalAlignment ?? 'center'} pair--size-${data.imageSize ?? 'medium'}`}>
                {layout === 'text-above-center' ? (
                    <>
                        {words}
                        {image}
                    </>
                ) : (
                    <>
                        {image}
                        {words}
                    </>
                )}
            </div>
        </Section>
    );
};
