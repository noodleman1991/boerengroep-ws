'use client';
import React from 'react';

import { Section } from '../layout/section';
import { motion } from 'motion/react';
import type { ContentBlock } from '@sites/cms/types';
import { RichText } from '@/components/rich-text';

export const Content = ({ data }: { data: ContentBlock }) => {
    return (
        <Section background={data.background!} className='prose prose-lg'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
            >
                <RichText data={data.body} />
            </motion.div>
        </Section>
    );
};
