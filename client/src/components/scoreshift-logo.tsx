interface ScoreShiftLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showWordmark?: boolean;
  variant?: 'default' | 'light' | 'dark';
}

export function ScoreShiftLogo({
  size = 'md',
  className = '',
  showWordmark = true,
  variant = 'default',
}: ScoreShiftLogoProps) {
  const iconSizes = { sm: 'w-6 h-6', md: 'w-8 h-8', lg: 'w-10 h-10', xl: 'w-12 h-12' };
  const textSizes = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl', xl: 'text-3xl' };
  const fontSizes = { sm: 'text-[9px]', md: 'text-[11px]', lg: 'text-[13px]', xl: 'text-[15px]' };

  const wordmarkColor =
    variant === 'light'
      ? 'text-white'
      : variant === 'dark'
      ? 'text-slate-900'
      : 'text-foreground';

  const accentColor =
    variant === 'light' ? 'text-amber-300' : 'text-amber-500';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Dual-circle mark */}
      <div className={`relative shrink-0 ${iconSizes[size]}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-md" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-white font-black leading-none tracking-tight ${fontSizes[size]}`}>
            SS
          </span>
        </div>
        <div
          className="absolute rounded-full border-2 border-white/30"
          style={{ inset: '-3px' }}
        />
      </div>

      {showWordmark && (
        <span className={`font-bold tracking-tight ${textSizes[size]} ${wordmarkColor}`}>
          Score<span className={accentColor}>Shift</span>
        </span>
      )}
    </div>
  );
}

interface ScoreShiftHeroLogoProps {
  className?: string;
}

export function ScoreShiftHeroLogo({ className = '' }: ScoreShiftHeroLogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-2xl shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300">
          <h1 className="text-3xl font-bold tracking-tight">Score</h1>
        </div>
        <div className="bg-white text-blue-700 px-6 py-3 rounded-2xl shadow-lg border-2 border-blue-200 transform rotate-2 hover:rotate-0 transition-transform duration-300 -mt-3 ml-4">
          <h1 className="text-3xl font-bold tracking-tight">Shift</h1>
        </div>
      </div>
    </div>
  );
}
