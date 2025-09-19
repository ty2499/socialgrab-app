import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileOptimizedLayoutProps {
  children: ReactNode;
  className?: string;
  enablePullToRefresh?: boolean;
  preventOverscroll?: boolean;
}

export default function MobileOptimizedLayout({
  children,
  className,
  enablePullToRefresh = false,
  preventOverscroll = true
}: MobileOptimizedLayoutProps) {
  return (
    <div 
      className={cn(
        "min-h-screen bg-background",
        // Prevent overscroll on mobile
        preventOverscroll && "overscroll-none",
        // Mobile-first responsive design
        "w-full max-w-full",
        // Safe area for iPhone notch and other mobile UI elements
        "safe-area-inset supports-[padding:max(0px)]:p-[max(0px,env(safe-area-inset-top))_max(0px,env(safe-area-inset-right))_max(0px,env(safe-area-inset-bottom))_max(0px,env(safe-area-inset-left))]",
        // Touch optimization
        "touch-manipulation",
        className
      )}
      style={{
        // Prevent pull-to-refresh unless explicitly enabled
        ...(!enablePullToRefresh && {
          touchAction: 'pan-x pan-y',
          overscrollBehavior: 'none'
        }),
        // Webkit specific mobile optimizations
        WebkitOverflowScrolling: 'touch',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {children}
    </div>
  );
}