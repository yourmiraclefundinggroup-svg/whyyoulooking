/**
 * LanguageSwitcher — Compact dropdown to switch the app language.
 * Reads/writes language via the useLanguage hook from @/lib/i18n.
 */
import { useLanguage, LANGUAGES } from "@/lib/i18n";
import type { Language } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const current = LANGUAGES[language];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-1.5 px-2.5 py-1.5 h-auto text-sm font-medium border-slate-200 text-slate-700 hover:bg-slate-50 max-w-[120px] truncate"
          aria-label="Switch language"
        >
          <Globe className="h-4 w-4 flex-shrink-0 text-slate-500" />
          <span className="text-base leading-none flex-shrink-0" aria-hidden="true">
            {current.flag}
          </span>
          <span className="truncate">{current.native}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-52 max-h-80 overflow-y-auto"
      >
        {(Object.keys(LANGUAGES) as Language[]).map((code) => {
          const lang = LANGUAGES[code];
          const isActive = language === code;

          return (
            <DropdownMenuItem
              key={code}
              onClick={() => setLanguage(code)}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer"
            >
              {/* Flag */}
              <span className="text-lg leading-none w-6 text-center flex-shrink-0" aria-hidden="true">
                {lang.flag}
              </span>

              {/* Names */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 leading-tight truncate">
                  {lang.native}
                </p>
                <p className="text-xs text-slate-400 leading-tight truncate">
                  {lang.name}
                </p>
              </div>

              {/* Checkmark for active language */}
              {isActive && (
                <Check className="h-4 w-4 text-amber-500 flex-shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
