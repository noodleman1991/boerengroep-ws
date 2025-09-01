import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface SectionProps extends React.HTMLProps<HTMLElement> {
    background?: string;
    children: ReactNode;
}

export const Section: React.FC<SectionProps> = ({ className, children, background, ...props }) => {
    return (
        <div className={background || "bg-white"}>
            <section
                className={cn("py-12 mx-auto max-w-7xl px-6", className)}
                {...props}
            >
                {children}
            </section>
        </div>
    );
};

export const tailwindBackgroundOptions = [
    { label: "Default White", value: "bg-white" },
    { label: "Warm Neutral", value: "bg-[#F5F5F0]" },
    { label: "Cool Neutral", value: "bg-[#F8F9FA]" },

    { label: "Brand Green Very Light", value: "bg-[#44AD39]/5" },
    { label: "Brand Green Light", value: "bg-[#44AD39]/10" },
    { label: "Brand Green Soft", value: "bg-[#44AD39]/15" },
    { label: "Brand Green Medium", value: "bg-[#44AD39]/20" },
    { label: "Brand Green Strong", value: "bg-[#44AD39]/30" },

    { label: "Brand Orange Very Light", value: "bg-[#F28F07]/5" },
    { label: "Brand Orange Light", value: "bg-[#F28F07]/10" },
    { label: "Brand Orange Soft", value: "bg-[#F28F07]/15" },
    { label: "Brand Orange Medium", value: "bg-[#F28F07]/20" },

    { label: "Brand Blue Very Light", value: "bg-[#4169E1]/5" },
    { label: "Brand Blue Light", value: "bg-[#4169E1]/10" },
    { label: "Brand Blue Soft", value: "bg-[#4169E1]/15" },
    { label: "Brand Blue Medium", value: "bg-[#4169E1]/20" },

    { label: "Fresh Lime Light", value: "bg-[#32CD32]/5" },
    { label: "Fresh Lime Soft", value: "bg-[#32CD32]/10" },
    { label: "Fresh Lime Medium", value: "bg-[#32CD32]/15" },

    { label: "Deep Navy Light", value: "bg-[#1E40AF]/5" },
    { label: "Deep Navy Soft", value: "bg-[#1E40AF]/10" },
    { label: "Deep Navy Medium", value: "bg-[#1E40AF]/15" },

    { label: "Natural Tan Light", value: "bg-[#D2B48C]/10" },
    { label: "Natural Tan Medium", value: "bg-[#D2B48C]/20" },
    { label: "Natural Tan Strong", value: "bg-[#D2B48C]/30" },
];

export const sectionBlockSchemaField = {
    type: "string",
    label: "Background",
    name: "background",
    options: tailwindBackgroundOptions,
};
