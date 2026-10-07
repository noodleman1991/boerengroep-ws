import { Section } from "../layout/section";
import type { StatsBlock } from '@sites/cms/types';

export const Stats = ({ data }: { data: StatsBlock }) => {
    return (
        <Section background={data.background!}>
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
                    <h2 className="text-4xl font-medium lg:text-5xl">{data.title}</h2>
                    <p>{data.description}</p>
                </div>

                <div className="grid divide-y *:text-center md:grid-cols-3 md:divide-x md:divide-y-0">
                    {data.stats?.map((stat, index) => (
                        <div key={index} className="space-y-4 py-4">
                            <div className="text-5xl font-bold">{stat!.stat}</div>
                            <p>{stat!.type}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    )
}
