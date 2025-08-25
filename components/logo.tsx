import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    logoSrc?: string;
    alt?: string;
    orgName?: string;
    showText?: boolean;
    href?: string;
}

export const Logo: React.FC<LogoProps> = ({
                                              size = 'md',
                                              className,
                                              logoSrc,
                                              alt = 'Logo',
                                              orgName,
                                              showText = false,
                                              href = '/',
                                          }) => {
    const sizeConfig = {
        sm: {
            container: 'h-8',
            logo: { width: 120, height: 32 },
            text: 'text-sm font-medium'
        },
        md: {
            container: 'h-12',
            logo: { width: 160, height: 48 },
            text: 'text-base font-medium'
        },
        lg: {
            container: 'h-16',
            logo: { width: 200, height: 64 },
            text: 'text-lg font-semibold'
        },
        xl: {
            container: 'h-20',
            logo: { width: 240, height: 80 },
            text: 'text-xl font-semibold'
        }
    };

    const currentSize = sizeConfig[size];

    // Default to your current logo if none provided
    const imageSrc = logoSrc || '/uploads/logo/boerengroep-logo.svg';

    const LogoContent = () => (
        <div className={cn(
            'flex items-center gap-3',
            currentSize.container,
            className
        )}>
            <div className="relative flex-shrink-0">
                <Image
                    src={imageSrc}
                    alt={alt}
                    width={currentSize.logo.width}
                    height={currentSize.logo.height}
                    className="h-full w-auto object-contain"
                    priority
                />
            </div>

            {showText && orgName && (
                <span className={cn(
                    'text-foreground whitespace-nowrap',
                    currentSize.text
                )}>
                    {orgName}
                </span>
            )}
        </div>
    );

    // Wrap in Link if href provided
    if (href) {
        return (
            <Link href={href} className="inline-flex">
                <LogoContent />
            </Link>
        );
    }

    return <LogoContent />;
};

// Hook for TinaCMS integration
export const useGlobalLogo = (globalData: any) => {
    return {
        logoSrc: globalData?.header?.logo,
        alt: globalData?.header?.logoAlt || globalData?.header?.name || 'Logo',
        orgName: globalData?.header?.name,
    };
};

export const AppLogo: React.FC<{
    globalData?: any;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    showText?: boolean;
    href?: string;
}> = ({ globalData, ...props }) => {
    const logoProps = useGlobalLogo(globalData);

    return (
        <Logo
            {...logoProps}
            {...props}
        />
    );
};
