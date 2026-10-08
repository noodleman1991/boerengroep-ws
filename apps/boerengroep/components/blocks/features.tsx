import type { FeaturesBlock } from '@sites/cms/types';
import { RichText } from '@/components/rich-text';
import { Section } from '../layout/section';
import { BlockIcon } from './block-icon';

/** A few short items of equal weight, side by side. */
export const Features = ({ data }: { data: FeaturesBlock }) => (
    <Section background={data.background}>
        {(data.title || data.description) && (
            <div className="block-head block-head--stacked">
                {data.title && <h2>{data.title}</h2>}
                {data.description && <p>{data.description}</p>}
            </div>
        )}
        <ul className="columns">
            {(data.items ?? []).map((item, index) => (
                <li key={item.id ?? index} className="columns__item">
                    <BlockIcon name={item.icon?.name} className="columns__icon" />
                    {item.title && <h3>{item.title}</h3>}
                    <RichText data={item.text} className="rich" />
                </li>
            ))}
        </ul>
    </Section>
);
