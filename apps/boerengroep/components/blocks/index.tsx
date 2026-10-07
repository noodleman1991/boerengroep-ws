'use client'

import { tinaField } from "tinacms/dist/react";
import { Page, PageBlocks } from "../../tina/__generated__/types";
import { Hero } from "./hero";
import { Content } from "./content";
import { Features } from "./features";
import { Testimonial } from "./testimonial";
import { Video } from "./video";
import { Callout } from "./callout";
import { Stats } from "./stats";
import { CallToAction } from "./call-to-action";
import { ImageText } from "./image-text";
import { EventsCalendarPreview } from "./events-calendar-preview";

// Union type for both page blocks and newsletter body blocks
type BlockType = PageBlocks | any;

interface BlocksProps {
    blocks?: BlockType[];
    events?: any[];
    globalData?: any;
}

export const Blocks = (props: (Omit<Page, "id" | "_sys" | "_values"> & { events?: any[]; globalData?: any }) | BlocksProps) => {
    const blocks = 'blocks' in props ? props.blocks : props.blocks;
    const events = props.events || [];
    const globalData = props.globalData;

    if (!blocks) return null;

    return (
        <>
            {blocks.map(function (block: BlockType, i: number) {
                return (
                    <div key={i} data-tina-field={tinaField(block)}>
                        <Block {...block} events={events} globalData={globalData} />
                    </div>
                );
            })}
        </>
    );
};

const Block = (block: BlockType & { events?: any[]; globalData?: any }) => {
    switch (block.__typename) {
        case "PageBlocksVideo":
        case "NewsletterBodyVideo":
        case "PastEventBlocksVideo":
            return <Video data={block} />;
        case "PageBlocksHero":
        case "NewsletterBodyHero":
        case "PastEventBlocksHero":
            return <Hero data={block} />;
        case "PageBlocksCallout":
        case "NewsletterBodyCallout":
        case "PastEventBlocksCallout":
            return <Callout data={block} />;
        case "PageBlocksStats":
        case "NewsletterBodyStats":
        case "PastEventBlocksStats":
            return <Stats data={block} />;
        case "PageBlocksContent":
        case "NewsletterBodyContent":
        case "PastEventBlocksContent":
            return <Content data={block} />;
        case "PageBlocksFeatures":
        case "NewsletterBodyFeatures":
        case "PastEventBlocksFeatures":
            return <Features data={block} />;
        case "PageBlocksTestimonial":
        case "NewsletterBodyTestimonial":
        case "PastEventBlocksTestimonial":
            return <Testimonial data={block} />;
        case "PageBlocksCta":
        case "NewsletterBodyCta":
        case "PastEventBlocksCta":
            return <CallToAction data={block} />;
        case "PageBlocksImageText":
        case "NewsletterBodyImageText":
        case "PastEventBlocksImageText":
            return <ImageText data={block} />;
        case "PageBlocksEventsCalendarPreview":
            return <EventsCalendarPreview data={block} events={block.events} globalData={block.globalData} />;
        default:
            return null;
    }
};
