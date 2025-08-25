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
    const sizeConfig = {
        xs: {
            container: 'h-6',
            logo: { width: 96, height: 24 },
            text: 'text-xs font-medium'
        },
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

    const LogoContent = () => (
        <div className={cn(
            'flex items-center gap-3',
            currentSize.container,
            className
        )}>
            {logoSrc && (
                <div className="relative flex-shrink-0">
                    <Image
                        src={logoSrc}
                        alt={alt}
                        width={currentSize.logo.width}
                        height={currentSize.logo.height}
                        className="h-full w-auto object-contain"
                        priority={priority}
                    />
                </div>
            )}

            {showText && orgName && (
                <span className={cn(
                    'text-foreground whitespace-nowrap',
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

// Enhanced hook for TinaCMS integration with better error handling
export const useGlobalLogo = (globalData: any) => {
    const header = globalData?.header;

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
                    'font-semibold text-foreground',
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
            showText={shouldShowText}
            priority={priority}
            {...props}
        />
    );
};

// Specialized variants for common use cases
export const HeaderLogo: React.FC<{
    globalData?: any;
    className?: string;
}> = ({ globalData, className }) => (
    <AppLogo
        globalData={globalData}
        size="md"
        showText={true}
        href="/"
        priority={true}
        className={cn("transition-opacity hover:opacity-80", className)}
    />
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
