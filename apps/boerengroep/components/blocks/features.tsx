"use client";
import { Icon } from "../icon";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Section } from "../layout/section";
import { motion } from 'motion/react';
import type { FeaturesBlock } from '@sites/cms/types';
import { RichText } from '@/components/rich-text';

export const Features = ({ data }: { data: FeaturesBlock }) => {
    return (
        <Section background={data.background!}>
            <motion.div 
                className="@container mx-auto max-w-5xl px-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
            >
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">{data.title}</h2>
                    <p className="mt-4">{data.description}</p>
                </div>
                <Card className="mx-auto mt-8 grid max-w-sm md:max-w-full md:grid-cols-3 md:divide-x md:divide-y-0 divide-y overflow-hidden shadow-zinc-950/5 *:text-center md:mt-16">
                    {data.items &&
                        data.items.map(function (block, i) {
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ 
                                        duration: 0.5, 
                                        ease: "easeOut",
                                        delay: i * 0.1 
                                    }}
                                    viewport={{ once: true, margin: "-100px" }}
                                >
                                    <Feature {...block!} />
                                </motion.div>
                            );
                        })}
                </Card>
            </motion.div>
        </Section>
    )
}

const CardDecorator = ({ children }: { children: React.ReactNode }) => (
    <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:bg-white/5 dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div aria-hidden className="bg-radial to-background absolute inset-0 from-transparent to-75%" />
        <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">{children}</div>
    </div>
)

type FeatureItem = NonNullable<FeaturesBlock['items']>[number];

export const Feature: React.FC<FeatureItem> = (data) => {
    return (
        <div className="group shadow-zinc-950/5">
            <CardHeader className="pb-3">

                <h3
                    className="mt-6 font-medium"
                >
                    {data.title}
                </h3>
            </CardHeader>

            <CardContent className="text-sm pb-8">
                <RichText data={data.text} />
            </CardContent>
        </div>
    );
};
