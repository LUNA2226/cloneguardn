import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeIcon } from 'lucide-react';
export function LanguageSwitcher() {
  const {
    i18n,
    t
  } = useTranslation();
  const languages = [{
    code: 'en',
    name: t('languages.en')
  }, {
    code: 'pt',
    name: t('languages.pt')
  }, {
    code: 'es',
    name: t('languages.es')
  }];
  return <div className="relative inline-block">
      <select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)} className="appearance-none bg-gray-700 border border-gray-600 text-white rounded-lg pl-8 pr-4 py-2 cursor-pointer focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500">
        {languages.map(lang => <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>)}
      </select>
      <GlobeIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
    </div>;
}