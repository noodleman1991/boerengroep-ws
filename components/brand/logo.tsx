import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Icon } from '../icon';

interface LogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  // TinaCMS compatible props
  logoImage?: string;
  logoType?: 'image' | 'icon';
  iconData?: {
    name?: string;
    color?: string;
    style?: string;
  };
  organizationName?: string;
}

const BoerengroepText: React.FC<{
  name?: string;
  size?: string;
  className?: string;
}> = ({ name = 'Stichting Boerengroep', size = 'md', className }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={cn('font-heading font-bold', sizeClasses[size as keyof typeof sizeClasses], className)}>
      <span className="text-brand-green">{name.split(' ')[0] || 'Stichting'}</span>
      {name.split(' ').length > 1 && (
        <span className="text-brand-tan"> {name.split(' ').slice(1).join(' ')}</span>
      )}
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className,
  logoImage,
  logoType = 'icon',
  iconData,
  organizationName = 'Stichting Boerengroep'
}) => {
  const containerSizes = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20'
  };

  // If we have a logo image, use it
  if (logoType === 'image' && logoImage) {
    return (
      <div className={cn('flex items-center gap-3', containerSizes[size], className)}>
        <Image
          src={logoImage}
          alt={organizationName}
          width={variant === 'icon' ? 48 : 200}
          height={48}
          className="h-full w-auto object-contain"
          priority
        />
        {variant === 'full' && (
          <BoerengroepText name={organizationName} size={size} />
        )}
      </div>
    );
  }

  // Fallback to icon + text (current system)
  switch (variant) {
    case 'icon':
      return (
        <div className={cn('flex items-center', className)}>
          {iconData && (
            <Icon
              data={{
                name: iconData.name || 'BiLeaf',
                color: iconData.color || 'green',
                style: iconData.style || 'float'
              }}
            />
          )}
        </div>
      );

    case 'text':
      return (
        <div className={cn('flex items-center', className)}>
          <BoerengroepText name={organizationName} size={size} />
        </div>
      );

    case 'full':
    default:
      return (
        <div className={cn('flex items-center gap-3', className)}>
          {iconData && (
            <Icon
              data={{
                name: iconData.name || 'BiLeaf',
                color: iconData.color || 'green',
                style: iconData.style || 'float'
              }}
            />
          )}
          <BoerengroepText name={organizationName} size={size} />
        </div>
      );
  }
};

// Specialized variants
export const HeaderLogo: React.FC<{
  className?: string;
  globalSettings?: any;
}> = ({ className, globalSettings }) => {
  const header = globalSettings?.header;

  return (
    <Logo
      variant="full"
      size="md"
      className={className}
      logoImage={header?.logo?.image}
      logoType={header?.logo?.type || 'icon'}
      iconData={header?.icon}
      organizationName={header?.name || 'Stichting Boerengroep'}
    />
  );
};

export const FooterLogo: React.FC<{
  className?: string;
  globalSettings?: any;
}> = ({ className, globalSettings }) => {
  const header = globalSettings?.header;

  return (
    <Logo
      variant="icon"
      size="sm"
      className={className}
      logoImage={header?.logo?.image}
      logoType={header?.logo?.type || 'icon'}
      iconData={header?.icon}
      organizationName={header?.name || 'Stichting Boerengroep'}
    />
  );
};
