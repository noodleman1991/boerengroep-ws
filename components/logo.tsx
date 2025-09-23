import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface LogoProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    logoSrc?: string;
    alt?: string;
    orgName?: string;
    showText?: boolean;
    href?: string;
    textClassName?: string;
    priority?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
                                              size = 'md',
                                              className,
                                              logoSrc,
                                              alt = 'Logo',
                                              orgName,
                                              showText = false,
                                              href,
                                              textClassName,
                                              priority = false,
                                          }) => {
    // Updated size configs with proper aspect ratio for wide logo (2.84:1)
    const sizeConfig = {
        xs: {
            container: 'h-6',
            logo: { width: 72, height: 24 }, // 3:1 ratio
            text: 'text-xs font-medium'
        },
        sm: {
            container: 'h-8',
            logo: { width: 96, height: 32 }, // 3:1 ratio
            text: 'text-sm font-medium'
        },
        md: {
            container: 'h-14',
            logo: { width: 168, height: 56 }, // 3:1 ratio, 20% bigger than original
            text: 'text-base font-medium'
        },
        lg: {
            container: 'h-16',
            logo: { width: 192, height: 64 }, // 3:1 ratio
            text: 'text-lg font-semibold'
        },
        xl: {
            container: 'h-20',
            logo: { width: 240, height: 80 }, // 3:1 ratio
            text: 'text-xl font-semibold'
        }
    };

    const currentSize = sizeConfig[size];

    const LogoContent = () => (
        <div className={cn(
            'flex items-center gap-3',
            currentSize.container,
            className
        )}>
            <div className={cn(
                'relative flex-shrink-0 overflow-hidden',
                currentSize.container
            )}>
                <Image
                    src="/uploads/branding/boerengroep-logo-zwart.png"
                    alt="Boerengroep Logo"
                    width={currentSize.logo.width}
                    height={currentSize.logo.height}
                    className="h-full w-auto object-contain object-left"
                    unoptimized
                    priority
                    style={{
                        maxWidth: 'none', // Allow image to use full calculated width
                    }}
                />
            </div>

            {showText && orgName && (
                <span className={cn(
                    'text-foreground whitespace-nowrap font-heading',
                    currentSize.text,
                    textClassName
                )}>
                    {orgName}
                </span>
            )}
        </div>
    );

    // Wrap in Link if href provided
    if (href) {
        return (
            <Link href={href as any} className="inline-flex">
                <LogoContent />
            </Link>
        );
    }

    return <LogoContent />;
};

// hook for TinaCMS integration with better error handling
export const useGlobalLogo = (globalData: any) => {
    const header = globalData?.header;

    // Debug logging for production issues
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        console.log('Logo data:', {
            logoSrc: header?.logo,
            hasLogo: Boolean(header?.logo),
            globalData: Boolean(globalData)
        });
    }

    return {
        logoSrc: header?.logo,
        alt: header?.logoAlt || header?.name || 'Organization Logo',
        orgName: header?.name,
        hasLogo: Boolean(header?.logo),
        hasName: Boolean(header?.name),
    };
};

// Main component for app-wide usage
export const AppLogo: React.FC<{
    globalData?: any;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    textClassName?: string;
    showText?: boolean;
    href?: string;
    priority?: boolean;
}> = ({
          globalData,
          showText,
          priority = false,
          ...props
      }) => {
    const logoProps = useGlobalLogo(globalData);

    // Determine whether to show text based on availability and props
    const shouldShowText = showText && logoProps.hasName;

    // If no logo is available, show just the text (fallback)
    if (!logoProps.hasLogo && logoProps.hasName) {
        return (
            <div className={cn('flex items-center', props.className)}>
                <span className={cn(
                    'font-heading font-semibold text-foreground',
                    props.textClassName
                )}>
                    {logoProps.orgName}
                </span>
            </div>
        );
    }

    return (
        <Logo
            {...logoProps}
            showText={false} // use - shouldShowText - for boolean condition based o available app data
            priority={priority}
            {...props}
        />
    );
};

// Specialized variants for common use cases
export const HeaderLogo: React.FC<{
    globalData?: any;
    className?: string;
}> = ({ className }) => (
    <Link href="/" className="inline-flex">
        <div className={cn(
            'flex items-center h-14 transition-opacity hover:opacity-80',
            className
        )}>
            <Image
                src="/uploads/branding/boerengroep-logo-zwart.png"
                alt="Boerengroep Logo"
                width={168}
                height={56}
                className="h-full w-auto object-contain object-left"
                unoptimized
                priority
            />
        </div>
    </Link>
);

export const FooterLogo: React.FC<{
    globalData?: any;
    className?: string;
    withText?: boolean;
}> = ({ globalData, className, withText = false }) => (
    <AppLogo
        globalData={globalData}
        size="sm"
        showText={withText}
        className={className}
    />
);

// Utility to get organization name for other components
export const useOrgName = (globalData: any): string => {
    return globalData?.header?.name || 'Organization';
};
