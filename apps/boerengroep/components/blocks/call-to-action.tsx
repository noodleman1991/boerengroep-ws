'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icon } from '../icon';
import { Section } from '../layout/section';
import { motion } from 'motion/react';
import type { CtaBlock } from '@sites/cms/types';

export const CallToAction = ({ data }: { data: CtaBlock }) => {
    return (
        <Section>
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
            >
                <h2 className="text-balance text-4xl font-semibold lg:text-5xl">{data.title}</h2>
                <p className="mt-4">{data.description}</p>

                <motion.div
                    className="mt-12 flex flex-wrap justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {data.actions && data.actions.map(action => (
                        <div
                            key={action!.label}
                            className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5">
                            <Button
                                asChild
                                size="lg"
                                variant={action!.type === 'link' ? 'ghost' : 'default'}
                                className="rounded-xl px-5 text-base">
                                <Link href={action!.link!}>
                                    {action?.icon && (<Icon data={action?.icon} />)}
                                    <span className="text-nowrap">{action!.label}</span>
                                </Link>
                            </Button>
                        </div>
                    ))}
                </motion.div>
            </motion.div>
        </Section>
    )
}
