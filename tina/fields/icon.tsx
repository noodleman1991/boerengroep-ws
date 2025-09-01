'use client';
import React from 'react';
import { Button, wrapFieldsWithMeta } from 'tinacms';
import { BiChevronRight } from 'react-icons/bi';
import { GoCircleSlash } from 'react-icons/go';
import { Icon, IconOptions } from '../../components/icon';
import { Popover, PopoverButton, Transition, PopoverPanel } from '@headlessui/react';
import { ColorPickerInput, ColorOption, colorOptions } from './color';

// Define icon style options as const for type safety
const iconStyleOptions = ['circle', 'float', 'minimal'] as const;
type IconStyle = typeof iconStyleOptions[number];

// Interface for icon picker input props
interface IconPickerInputProps {
    input: {
        name: string;
        value: string;
        onChange: (value: string) => void;
    };
}

// Interface for icon data
interface IconData {
    name: string;
    size: string;
    color: ColorOption;
}

// Type guard to check if a string is a valid icon name
const isValidIconName = (name: string): name is keyof typeof IconOptions => {
    return name in IconOptions;
};

// Type-safe function to parse icon names
const parseIconName = (name: string): string => {
    const splitName = name.split(/(?=[A-Z])/);
    if (splitName.length > 1) {
        return splitName.slice(1).join(' ');
    } else {
        return name;
    }
};

// Type-safe function to get filtered icon names
const getFilteredIcons = (filter: string): string[] => {
    return Object.keys(IconOptions).filter((name): name is keyof typeof IconOptions => {
        return name.toLowerCase().includes(filter.toLowerCase());
    });
};

export const IconPickerInput = wrapFieldsWithMeta<IconPickerInputProps>(({ input }) => {
    const [filter, setFilter] = React.useState<string>('');

    const filteredBlocks = React.useMemo(() => {
        return getFilteredIcons(filter);
    }, [filter]);

    const inputLabel = isValidIconName(input.value)
        ? parseIconName(input.value)
        : 'Select Icon';

    const InputIcon = isValidIconName(input.value)
        ? IconOptions[input.value]
        : null;

    const handleIconSelect = (iconName: string): void => {
        input.onChange(iconName);
        setFilter('');
    };

    const handleClearSelection = (): void => {
        input.onChange('');
        setFilter('');
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setFilter(event.target.value);
    };

    return (
        <div className='relative z-[1000]'>
            <input type='text' id={input.name} className='hidden' {...input} />
            <Popover>
                {({ open }) => (
                    <>
                        <PopoverButton>
                            <Button
                                className={`
                  text-sm h-11 px-4 transition-all duration-200 ease-out
                  ${InputIcon ? 'h-11' : 'h-10'}
                  ${open ? 'bg-[#44AD39]/10 border-[#44AD39]/30 text-[#44AD39]' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}
                `}
                                size='custom'
                                rounded='full'
                            >
                                {InputIcon && <InputIcon className='w-7 mr-2 h-auto text-[#44AD39]' />}
                                <span className='font-medium'>{inputLabel}</span>
                                <BiChevronRight className={`w-4 h-auto ml-2 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
                            </Button>
                        </PopoverButton>

                        <div className='absolute w-full min-w-[192px] max-w-2xl -bottom-2 left-0 translate-y-full z-[9999]'>
                            <Transition
                                enter='transition duration-200 ease-out'
                                enterFrom='transform opacity-0 scale-95 -translate-y-2'
                                enterTo='transform opacity-100 scale-100 translate-y-0'
                                leave='transition duration-150 ease-in'
                                leaveFrom='transform opacity-100 scale-100 translate-y-0'
                                leaveTo='transform opacity-0 scale-95 -translate-y-2'
                            >
                                <PopoverPanel className='relative overflow-hidden rounded-lg shadow-xl bg-white border border-gray-200 backdrop-blur-sm'>
                                    {({ close }) => (
                                        <div className='max-h-[24rem] flex flex-col w-full h-full'>
                                            {/* Search Header */}
                                            <div className='bg-gray-50/80 p-3 border-b border-gray-100 backdrop-blur-sm sticky top-0 z-10'>
                                                <input
                                                    type='text'
                                                    className='
                            bg-white text-sm rounded-md border border-gray-200
                            py-2 px-3 w-full block placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-[#44AD39]/20 focus:border-[#44AD39]
                            transition-all duration-200
                          '
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        event.preventDefault();
                                                    }}
                                                    value={filter}
                                                    onChange={handleFilterChange}
                                                    placeholder='Search icons...'
                                                />
                                            </div>

                                            {/* No Results */}
                                            {filteredBlocks.length === 0 && (
                                                <div className='relative text-center py-8 px-4 text-gray-400 bg-gray-50/30'>
                                                    <GoCircleSlash className='w-8 h-8 mx-auto mb-2 text-gray-300' />
                                                    <p className='text-sm font-medium'>No icons found</p>
                                                    <p className='text-xs'>Try a different search term</p>
                                                </div>
                                            )}

                                            {/* Icons Grid */}
                                            {filteredBlocks.length > 0 && (
                                                <div className='w-full grid grid-cols-6 auto-rows-auto p-3 gap-1 overflow-y-auto bg-white'>
                                                    {/* Clear Selection Button */}
                                                    <button
                                                        type='button'
                                                        className='
                              relative rounded-lg text-center py-3 px-2 flex flex-col items-center justify-center
                              outline-none transition-all ease-out duration-200
                              hover:bg-gray-50 hover:scale-105
                              focus:bg-gray-100 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-[#44AD39]/20
                              group
                            '
                                                        onClick={() => {
                                                            handleClearSelection();
                                                            close();
                                                        }}
                                                        title="Clear selection"
                                                        aria-label="Clear icon selection"
                                                    >
                                                        <GoCircleSlash className='w-6 h-6 text-gray-300 group-hover:text-gray-400 transition-colors' />
                                                        <span className='text-[10px] text-gray-400 mt-1 font-medium'>Clear</span>
                                                    </button>

                                                    {/* Icon Options */}
                                                    {filteredBlocks.map((name) => {
                                                        const parsedName = parseIconName(name);
                                                        return (
                                                            <button
                                                                key={name}
                                                                type='button'
                                                                className='
                                  relative flex flex-col items-center justify-center rounded-lg
                                  py-3 px-2 outline-none transition-all ease-out duration-200
                                  hover:bg-[#44AD39]/5 hover:scale-105
                                  focus:bg-[#44AD39]/10 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-[#44AD39]/20
                                  group
                                '
                                                                onClick={() => {
                                                                    handleIconSelect(name);
                                                                    close();
                                                                }}
                                                                title={parsedName}
                                                                aria-label={`Select ${parsedName} icon`}
                                                            >
                                                                <Icon
                                                                    data={{
                                                                        name: name,
                                                                        size: 'custom',
                                                                        color: 'brand-green',
                                                                    }}
                                                                    className='w-6 h-6 text-[#44AD39] group-hover:scale-110 transition-transform duration-200'
                                                                />
                                                                <span className='text-[9px] text-gray-400 mt-1 font-medium leading-tight text-center max-w-full truncate'>
                                  {parsedName.split(' ').slice(0, 2).join(' ')}
                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </PopoverPanel>
                            </Transition>
                        </div>
                    </>
                )}
            </Popover>
        </div>
    );
});

// Type-safe icon schema with proper field definitions
export const iconSchema = {
    type: 'object' as const,
    label: 'Icon',
    name: 'icon',
    fields: [
        {
            type: 'string' as const,
            label: 'Icon',
            name: 'name',
            ui: {
                component: IconPickerInput,
            },
        },
        {
            type: 'string' as const,
            label: 'Color',
            name: 'color',
            ui: {
                component: ColorPickerInput,
            },
        },
        {
            name: 'style',
            label: 'Style',
            type: 'string' as const,
            options: iconStyleOptions.map(style => ({
                label: style.charAt(0).toUpperCase() + style.slice(1),
                value: style,
            })),
        },
    ],
} as const;

// Export types for use in other components
export type { IconPickerInputProps, IconData, IconStyle };
