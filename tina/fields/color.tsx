import React from 'react';
import { wrapFieldsWithMeta } from 'tinacms';

// Define color options as const assertion for strict typing
export const colorOptions = [
    'brand-green',
    'brand-orange',
    'brand-blue',
    'brand-lime',
    'brand-navy',
    'brand-tan',
    'neutral-warm',
    'neutral-cool',
    'white'
] as const;

// Create type from the color options
export type ColorOption = typeof colorOptions[number];

// Color variant types
export type ColorVariant = 'solid' | 'light' | 'outline';

// Interface for the color picker input props
interface ColorPickerInputProps {
    input: {
        name: string;
        value: ColorOption | '';
        onChange: (value: ColorOption | '') => void;
    };
}

// Type-safe color classes mapping
const inputClasses: Record<ColorOption, string> = {
    'brand-green': 'bg-[#44AD39] border-[#44AD39] shadow-[#44AD39]/20',
    'brand-orange': 'bg-[#F28F07] border-[#F28F07] shadow-[#F28F07]/20',
    'brand-blue': 'bg-[#4169E1] border-[#4169E1] shadow-[#4169E1]/20',
    'brand-lime': 'bg-[#32CD32] border-[#32CD32] shadow-[#32CD32]/20',
    'brand-navy': 'bg-[#1E40AF] border-[#1E40AF] shadow-[#1E40AF]/20',
    'brand-tan': 'bg-[#D2B48C] border-[#D2B48C] shadow-[#D2B48C]/20',
    'neutral-warm': 'bg-[#F5F5F0] border-[#E5E5DC] shadow-[#E5E5DC]/20',
    'neutral-cool': 'bg-[#F8F9FA] border-[#E9ECEF] shadow-[#E9ECEF]/20',
    'white': 'bg-white border-gray-200 shadow-gray-100/20',
} as const;

// Type-safe color labels mapping
const colorLabels: Record<ColorOption, string> = {
    'brand-green': 'Brand Green',
    'brand-orange': 'Brand Orange',
    'brand-blue': 'Brand Blue',
    'brand-lime': 'Fresh Lime',
    'brand-navy': 'Deep Navy',
    'brand-tan': 'Natural Tan',
    'neutral-warm': 'Warm Neutral',
    'neutral-cool': 'Cool Neutral',
    'white': 'Pure White',
} as const;

export const ColorPickerInput = wrapFieldsWithMeta<ColorPickerInputProps>(({ input }) => {
    const handleColorChange = (color: ColorOption): void => {
        input.onChange(color);
    };

    const isValidColor = (color: string): color is ColorOption => {
        return colorOptions.includes(color as ColorOption);
    };

    return (
        <>
            <input type='text' id={input.name} className='hidden' {...input} />
            <div className='flex gap-3 flex-wrap items-center'>
                {colorOptions.map((color) => {
                    const isSelected = input.value === color;
                    return (
                        <div key={color} className='flex flex-col items-center gap-1'>
                            <button
                                type='button'
                                className={`
                  w-10 h-10 rounded-full border-2 transition-all duration-200 ease-out
                  ${inputClasses[color]} 
                  ${isSelected
                                    ? 'ring-2 ring-offset-2 ring-[#44AD39] scale-110 shadow-lg'
                                    : 'hover:scale-105 hover:shadow-md'
                                }
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#44AD39]
                `}
                                onClick={() => handleColorChange(color)}
                                title={colorLabels[color]}
                                aria-label={`Select ${colorLabels[color]}`}
                            >
                                {isSelected && (
                                    <svg
                                        className="w-5 h-5 mx-auto text-white drop-shadow-sm"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </button>
                            {isSelected && (
                                <span className='text-xs font-medium text-gray-600 text-center leading-tight'>
                  {colorLabels[color]}
                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
});

// Interface for color class configurations
interface ColorClassConfig {
    solid: string;
    light: string;
    outline: string;
}

// Type-safe color class mapping for components
const colorClassMap: Record<ColorOption, ColorClassConfig> = {
    'brand-green': {
        solid: 'bg-[#44AD39] text-white border-[#44AD39]',
        light: 'bg-[#44AD39]/10 text-[#44AD39] border-[#44AD39]/20',
        outline: 'bg-transparent text-[#44AD39] border-[#44AD39]'
    },
    'brand-orange': {
        solid: 'bg-[#F28F07] text-white border-[#F28F07]',
        light: 'bg-[#F28F07]/10 text-[#F28F07] border-[#F28F07]/20',
        outline: 'bg-transparent text-[#F28F07] border-[#F28F07]'
    },
    'brand-blue': {
        solid: 'bg-[#4169E1] text-white border-[#4169E1]',
        light: 'bg-[#4169E1]/10 text-[#4169E1] border-[#4169E1]/20',
        outline: 'bg-transparent text-[#4169E1] border-[#4169E1]'
    },
    'brand-lime': {
        solid: 'bg-[#32CD32] text-white border-[#32CD32]',
        light: 'bg-[#32CD32]/10 text-[#32CD32] border-[#32CD32]/20',
        outline: 'bg-transparent text-[#32CD32] border-[#32CD32]'
    },
    'brand-navy': {
        solid: 'bg-[#1E40AF] text-white border-[#1E40AF]',
        light: 'bg-[#1E40AF]/10 text-[#1E40AF] border-[#1E40AF]/20',
        outline: 'bg-transparent text-[#1E40AF] border-[#1E40AF]'
    },
    'brand-tan': {
        solid: 'bg-[#D2B48C] text-gray-800 border-[#D2B48C]',
        light: 'bg-[#D2B48C]/10 text-[#D2B48C] border-[#D2B48C]/20',
        outline: 'bg-transparent text-[#D2B48C] border-[#D2B48C]'
    },
    'neutral-warm': {
        solid: 'bg-[#F5F5F0] text-gray-700 border-[#E5E5DC]',
        light: 'bg-[#F5F5F0]/50 text-gray-600 border-[#E5E5DC]/30',
        outline: 'bg-transparent text-gray-600 border-[#E5E5DC]'
    },
    'neutral-cool': {
        solid: 'bg-[#F8F9FA] text-gray-700 border-[#E9ECEF]',
        light: 'bg-[#F8F9FA]/50 text-gray-600 border-[#E9ECEF]/30',
        outline: 'bg-transparent text-gray-600 border-[#E9ECEF]'
    },
    'white': {
        solid: 'bg-white text-gray-700 border-gray-200',
        light: 'bg-white/70 text-gray-600 border-gray-100',
        outline: 'bg-transparent text-gray-700 border-gray-200'
    }
} as const;

// Type-safe function to get color classes with proper fallback
export const getColorClasses = (
    color: ColorOption | string,
    variant: ColorVariant = 'solid'
): string => {
    // Type guard to check if color is valid
    const isValidColorOption = (c: string): c is ColorOption => {
        return colorOptions.includes(c as ColorOption);
    };

    // Use provided color if valid, otherwise fallback to brand-green
    const validColor: ColorOption = isValidColorOption(color) ? color : 'brand-green';

    return colorClassMap[validColor][variant];
};

// Utility function to validate color options at runtime
export const validateColorOption = (color: unknown): ColorOption | null => {
    if (typeof color === 'string' && colorOptions.includes(color as ColorOption)) {
        return color as ColorOption;
    }
    return null;
};

// Export types for use in other components
export type { ColorPickerInputProps, ColorClassConfig };
