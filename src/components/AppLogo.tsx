
import { Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  subtitle?: string;
  subtitleClassName?: string;
  hideIcon?: boolean;
}

export function AppLogo({ className, iconClassName, textClassName, subtitle, subtitleClassName, hideIcon = false }: AppLogoProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="flex items-center gap-2 text-primary">
        {!hideIcon && <Wifi className={cn("h-8 w-8", iconClassName)} />}
        <span className={cn("text-2xl font-bold", textClassName)}>ELANET</span>
      </div>
      {subtitle && <span className={cn("text-sm", subtitleClassName)}>{subtitle}</span>}
    </div>
  );
}
