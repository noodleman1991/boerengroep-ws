'use client';
import type { FormBlock as FormData } from '@sites/cms/types';
import { RichText } from '@/components/rich-text';
import { SiteForm, type SiteFormData } from '@/components/site-form';
import { Section } from '../layout/section';

/** A form from the admin panel on a page, with a title and a few words above it. */
export const FormBlock = ({ data }: { data: FormData }) => {
    const form = data.form && typeof data.form === 'object' ? (data.form as unknown as SiteFormData) : null;
    if (!form) return null;
    return (
        <Section background={data.background}>
            <div className="block-narrow form-block">
                {data.title && <h2>{data.title}</h2>}
                <RichText data={data.intro} className="form-block__intro" />
                <SiteForm form={form} />
            </div>
        </Section>
    );
};
