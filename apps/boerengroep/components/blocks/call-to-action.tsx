import type { CtaBlock } from '@sites/cms/types';
import { Section } from '../layout/section';
import { Actions } from './actions';

/** One clear next step, usually at the end of a page. */
export const CallToAction = ({ data }: { data: CtaBlock }) => (
    <Section background={data.background}>
        <div className="closing">
            <div>
                {data.title && <h2>{data.title}</h2>}
                {data.description && <p>{data.description}</p>}
            </div>
            <Actions actions={data.actions} tone={data.background === 'leaf' || data.background === 'harvest' ? 'ink' : 'leaf'} />
        </div>
    </Section>
);
