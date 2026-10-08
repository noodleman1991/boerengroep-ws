import type { StatsBlock } from '@sites/cms/types';
import { Section } from '../layout/section';

/** A few figures, set large in the lettering of the logo. */
export const Stats = ({ data }: { data: StatsBlock }) => (
    <Section background={data.background}>
        {(data.title || data.description) && (
            <div className="block-head block-head--stacked">
                {data.title && <h2>{data.title}</h2>}
                {data.description && <p>{data.description}</p>}
            </div>
        )}
        <dl className="figures">
            {(data.stats ?? []).map((stat, index) => (
                <div key={stat.id ?? index}>
                    <dt>{stat.type}</dt>
                    <dd>{stat.stat}</dd>
                </div>
            ))}
        </dl>
    </Section>
);
