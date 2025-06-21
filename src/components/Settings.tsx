import React, { useState } from 'react';
import { GlobeIcon, ClipboardCopyIcon, CheckIcon } from 'lucide-react';
export function Settings() {
  const [selectedDomain, setSelectedDomain] = useState('minhapagina.com.br');
  const [checkoutUrl, setCheckoutUrl] = useState('https://minhapagina.com.br/checkout');
  const [redirectUrl, setRedirectUrl] = useState('https://minhapagina.com.br');
  const [copied, setCopied] = useState(false);
  const domains = ['minhapagina.com.br', 'ofertaespecial.com', 'cursoonline.net'];
  const [domainConfigs, setDomainConfigs] = useState({
    'minhapagina.com.br': {
      checkoutUrl: 'https://minhapagina.com.br/checkout',
      redirectUrl: 'https://minhapagina.com.br'
    },
    'ofertaespecial.com': {
      checkoutUrl: 'https://ofertaespecial.com/checkout',
      redirectUrl: 'https://ofertaespecial.com'
    },
    'cursoonline.net': {
      checkoutUrl: 'https://cursoonline.net/checkout',
      redirectUrl: 'https://cursoonline.net'
    }
  });
  const generateScript = () => {
    return `<script src="https://alertaclone.com/script.js"
  data-domain="${selectedDomain}"
  data-checkout="${checkoutUrl}"
  data-redirect="${redirectUrl}"
  data-mode="completo">
</script>`;
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(generateScript());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleDomainChange = domain => {
    setSelectedDomain(domain);
    // Load the saved configuration for the selected domain
    if (domainConfigs[domain]) {
      setCheckoutUrl(domainConfigs[domain].checkoutUrl);
      setRedirectUrl(domainConfigs[domain].redirectUrl);
    }
  };
  const handleConfigUpdate = (field, value) => {
    const newConfig = {
      ...domainConfigs[selectedDomain],
      [field]: value
    };
    setDomainConfigs({
      ...domainConfigs,
      [selectedDomain]: newConfig
    });
    // Update current values
    if (field === 'checkoutUrl') setCheckoutUrl(value);
    if (field === 'redirectUrl') setRedirectUrl(value);
  };
  return <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Configurações de Script</h1>
      <div className="space-y-6">
        {/* Domain Selector */}
        <section className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <GlobeIcon className="text-cyan-400 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Selecionar Domínio</h2>
          </div>
          <select value={selectedDomain} onChange={e => handleDomainChange(e.target.value)} className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-gray-200">
            {domains.map(domain => <option key={domain} value={domain}>
                {domain}
              </option>)}
          </select>
        </section>
        {/* Instructions Section */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Como usar seu script de proteção
          </h2>
          <p className="text-gray-300 mb-6">
            Copie o script abaixo e cole na página original do seu site.
          </p>
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <span className="text-cyan-400">🧩</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-200 mb-1">
                  Recomendação:
                </h3>
                <p className="text-sm text-gray-400">
                  Insira este código logo antes da tag &lt;/body&gt; ou no
                  &lt;head&gt; do seu HTML.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <span className="text-yellow-400">⚠</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-200 mb-1">
                  Importante:
                </h3>
                <p className="text-sm text-gray-400">
                  Esse script valida o domínio de origem e ativa sua proteção
                  contra clonagem. Sem ele, seu site não será monitorado.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <span className="text-cyan-400">💡</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-200 mb-1">
                  Dica:
                </h3>
                <p className="text-sm text-gray-400">
                  Se você usa um construtor de sites como Shopify, Wix ou
                  WordPress, procure a seção de "Código personalizado",
                  "Head/Body Scripts" ou "Integrações de terceiros".
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Script Block */}
        <section className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-semibold">Script Gerado</h2>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm relative group">
            <button onClick={handleCopy} className="absolute top-3 right-3 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 opacity-0 group-hover:opacity-100" title="Copiar Script">
              {copied ? <CheckIcon size={16} className="text-green-400" /> : <ClipboardCopyIcon size={16} className="text-gray-400 hover:text-gray-300" />}
            </button>
            <pre className="whitespace-pre-wrap text-gray-300 pr-12">
              {generateScript()}
            </pre>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Este script é exclusivo para o domínio selecionado.
          </p>
          <button onClick={handleCopy} className="mt-4 flex items-center px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors">
            <ClipboardCopyIcon size={16} className="mr-2" />
            {copied ? 'Copiado!' : 'Copiar código'}
          </button>
        </section>
        {/* Configuration Block */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Configurações para {selectedDomain}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Link de Checkout Principal
              </label>
              <input type="url" value={checkoutUrl} onChange={e => handleConfigUpdate('checkoutUrl', e.target.value)} placeholder="https://seusite.com/checkout" className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Redirecionar visitante para este domínio
              </label>
              <input type="url" value={redirectUrl} onChange={e => handleConfigUpdate('redirectUrl', e.target.value)} placeholder="https://seusite.com" className="w-full px-3 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" />
            </div>
          </div>
        </section>
      </div>
    </div>;
}