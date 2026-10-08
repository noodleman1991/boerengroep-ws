import type { TestimonialBlock } from '@sites/cms/types';
import Image from 'next/image';
import { mediaUrl } from '@/lib/cms-adapters';
import { Section } from '../layout/section';

/** What people say, in their own words. */
export const Testimonial = ({ data }: { data: TestimonialBlock }) => (
    <Section background={data.background}>
        {(data.title || data.description) && (
            <div className="block-head block-head--stacked">
                {data.title && <h2>{data.title}</h2>}
                {data.description && <p>{data.description}</p>}
            </div>
        )}
        <div className="quotes">
            {(data.testimonials ?? []).map((item, index) => {
                const portrait = mediaUrl(item.avatar, 'thumbnail');
                return (
                    <figure key={item.id ?? index} className="quote">
                        <blockquote>{item.quote}</blockquote>
                        <figcaption>
                            {portrait && <Image src={portrait} alt="" width={96} height={96} />}
                            <span>
                                <strong>{item.author}</strong>
                                {item.role}
                            </span>
                        </figcaption>
                    </figure>
                );
            })}
        </div>
    </Section>
);
