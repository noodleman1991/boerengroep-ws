import type { ContentBlock } from '@sites/cms/types';
import { RichText } from '@/components/rich-text';
import { Section } from '../layout/section';

/** Running text. Editors choose how wide it runs. */
export const Content = ({ data }: { data: ContentBlock }) => (
    <Section background={data.background}>
        <RichText data={data.body} className={`rich rich--${data.width ?? 'normal'}`} />
    </Section>
);
