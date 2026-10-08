'use client';
import type { NewsletterSignupBlock as NewsletterSignupData } from '@sites/cms/types';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { Section } from '../layout/section';

/** The newsletter box on a page: words on the left, the field on the right. */
export const NewsletterSignupBlock = ({ data }: { data: NewsletterSignupData }) => (
    <Section background={data.background}>
        <NewsletterSignup source="page" layout="band" heading={data.heading} intro={data.intro} />
    </Section>
);
