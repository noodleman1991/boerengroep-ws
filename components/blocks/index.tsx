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

// Union type for both page blocks and newsletter body blocks
type BlockType = PageBlocks | any;

export const Blocks = (props: Omit<Page, "id" | "_sys" | "_values"> | { blocks: BlockType[] }) => {
    const blocks = 'blocks' in props ? props.blocks : props.blocks;

    if (!blocks) return null;

    return (
        <>
            {blocks.map(function (block: BlockType, i: number) {
                return (
                    <div key={i} data-tina-field={tinaField(block)}>
                        <Block {...block} />
                    </div>
                );
            })}
        </>
    );
};

const Block = (block: BlockType) => {
    switch (block.__typename) {
        case "PageBlocksVideo":
        case "NewsletterBodyVideo":
            return <Video data={block} />;
        case "PageBlocksHero":
        case "NewsletterBodyHero":
            return <Hero data={block} />;
        case "PageBlocksCallout":
        case "NewsletterBodyCallout":
            return <Callout data={block} />;
        case "PageBlocksStats":
        case "NewsletterBodyStats":
            return <Stats data={block} />;
        case "PageBlocksContent":
        case "NewsletterBodyContent":
            return <Content data={block} />;
        case "PageBlocksFeatures":
        case "NewsletterBodyFeatures":
            return <Features data={block} />;
        case "PageBlocksTestimonial":
        case "NewsletterBodyTestimonial":
            return <Testimonial data={block} />;
        case "PageBlocksCta":
        case "NewsletterBodyCta":
            return <CallToAction data={block} />;
        case "PageBlocksImageText":
        case "NewsletterBodyImageText":
            return <ImageText data={block} />;
        default:
            return null;
    }
};
