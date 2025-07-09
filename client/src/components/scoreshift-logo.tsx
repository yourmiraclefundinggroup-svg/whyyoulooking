interface ScoreShiftLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

export function ScoreShiftLogo({ size = 'md', className = '', animated = false }: ScoreShiftLogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const paddingClasses = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1',
    lg: 'px-4 py-2',
    xl: 'px-6 py-3'
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className={`
        bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-bold
        ${sizeClasses[size]} ${paddingClasses[size]}
        ${animated ? 'hover:shadow-md transition-all duration-200 hover:scale-105' : ''}
      `}>
        Score
      </div>
      <div className={`
        text-blue-700 font-bold ${sizeClasses[size]}
        ${animated ? 'hover:text-blue-800 transition-colors duration-200' : ''}
      `}>
        Shift
      </div>
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