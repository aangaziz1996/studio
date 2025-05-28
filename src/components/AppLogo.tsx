import { Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function AppLogo({ className, iconClassName, textClassName }: AppLogoProps) {
  return (
    <div className={cn("flex items-center gap-2 text-primary", className)}>
      <Wifi className={cn("h-8 w-8", iconClassName)} />
      <span className={cn("text-2xl font-bold", textClassName)}>ELANET</span>
    </div>
  );
}
