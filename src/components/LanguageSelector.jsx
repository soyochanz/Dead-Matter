import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from 'lucide-react';

const languages = [
    { code: 'en', label: 'English', flag: 'https://flagcdn.com/w40/us.png' },
    { code: 'es', label: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
    { code: 'pt', label: 'Português', flag: 'https://flagcdn.com/w40/br.png' }
];

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    useEffect(() => {
        // Update HTML lang attribute
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative group outline-none h-10 w-10 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300">
                    <Globe className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />

                    {/* Scanline effect overlay */}
                    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-white/5 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-auto min-w-[3.5rem] bg-[#0a0a0c]/95 backdrop-blur-2xl border border-white/10 text-white shadow-2xl p-1.5 rounded-xl"
            >
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className={`
              cursor-pointer flex items-center justify-center px-2 py-2 rounded-lg transition-all mb-1 last:mb-0
              ${i18n.language === lang.code ? 'bg-white/10 border border-white/5' : 'hover:bg-white/5 border border-transparent'}
            `}
                        title={lang.label}
                    >
                        <img
                            src={lang.flag}
                            alt={lang.label}
                            className="w-6 h-auto rounded-[2px] shadow-sm filter contrast-125 saturate-110"
                        />
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageSelector;
