import React, { useState, useRef } from 'react';
import { Check, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';
const plans = [{
  name: 'STARTER',
  price: '99',
  yearlyPrice: '79',
  period: 'per month',
  features: ['3 domínios protegidos', 'Proteção básica', 'Detecção em tempo real', 'Notificação', 'Suporte 24/7'],
  description: 'Ideal para pequenos negócios e profissionais',
  buttonText: 'Mudar Plano',
  href: '#',
  isPopular: false
}, {
  name: 'PRO',
  price: '299',
  yearlyPrice: '239',
  period: 'per month',
  features: ['25 domínios protegidos', 'Tudo do Starter', 'Proteção avançada (camadas extras de verificação)', 'Notificação', 'Suporte prioritário', 'Integração com Google Analytics'],
  description: 'Perfeito para empresas em crescimento',
  buttonText: 'Plano Atual',
  href: '#',
  isPopular: true,
  isCurrent: true
}, {
  name: 'ENTERPRISE',
  price: '499',
  yearlyPrice: '399',
  period: 'per month',
  features: ['100 domínios protegidos', 'Tudo do Pro', 'Proteção multi-camada', 'Alertas em tempo real', 'Suporte prioritário'],
  description: 'Para grandes empresas com necessidades específicas',
  buttonText: 'Mudar Plano',
  href: '#',
  isPopular: false
}];
export function PricingPage({
  setActiveScreen
}) {
  const [isYearly, setIsYearly] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const switchRef = useRef<HTMLButtonElement>(null);
  const handleToggle = () => {
    setIsYearly(!isYearly);
    if (!isYearly && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight
        },
        colors: ['#22d3ee', '#67e8f9', '#06b6d4', '#0891b2'],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ['circle']
      });
    }
  };
  return <div className="p-6">
      {/* Current Plan Summary */}
      <div className="mb-12 bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Gerencie seu plano atual e explore outras opções disponíveis
            </h3>
            <div className="flex flex-col md:flex-row gap-4 md:items-center text-gray-400">
              <div className="flex items-center gap-2">
                <span>Seu plano atual:</span>
                <span className="text-cyan-400 font-semibold">PRO</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Próxima cobrança:</span>
                <span className="text-cyan-400 font-semibold">15/06/2025</span>
              </div>
            </div>
          </div>
          <button onClick={() => setActiveScreen('cancel-subscription')} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
            Gerenciar Pagamento
          </button>
        </div>
      </div>
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tight">Escolha seu Plano</h2>
        <p className="text-gray-400 text-lg">
          Todos os planos incluem acesso à nossa plataforma, ferramentas de
          proteção e suporte dedicado
        </p>
      </div>
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-3">
          <span className={`font-semibold ${!isYearly ? 'text-cyan-400' : 'text-gray-400'}`}>
            Mensal
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <button ref={switchRef} role="switch" aria-checked={isYearly} onClick={handleToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isYearly ? 'bg-cyan-600' : 'bg-gray-600'}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </label>
          <span className={`font-semibold ${isYearly ? 'text-cyan-400' : 'text-gray-400'}`}>
            Anual <span className="text-cyan-400 text-sm">(Economize 20%)</span>
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, index) => <motion.div key={index} initial={{
        y: 50,
        opacity: 1
      }} whileInView={isDesktop ? {
        y: plan.isPopular ? -20 : 0,
        opacity: 1,
        x: index === 2 ? -30 : index === 0 ? 30 : 0,
        scale: index === 0 || index === 2 ? 0.94 : 1.0
      } : {}} viewport={{
        once: true
      }} transition={{
        duration: 1.6,
        type: 'spring',
        stiffness: 100,
        damping: 30,
        delay: 0.4,
        opacity: {
          duration: 0.5
        }
      }} className={cn('rounded-2xl p-6 text-center lg:flex lg:flex-col lg:justify-center relative', plan.isPopular ? 'border-2 border-cyan-500 bg-white' : 'border border-gray-700 bg-gray-800', 'flex flex-col', !plan.isPopular && 'mt-5', index === 0 || index === 2 ? 'z-0' : 'z-10')}>
            {plan.isPopular && <div className="absolute top-0 right-0 bg-cyan-600 py-0.5 px-2 rounded-bl-xl rounded-tr-xl flex items-center">
                <Star className="text-white h-4 w-4 fill-current" />
                <span className="text-white ml-1 font-sans font-semibold">
                  Popular
                </span>
              </div>}
            <div className="flex-1 flex flex-col">
              <p className={`text-base font-semibold ${plan.isPopular ? 'text-gray-600' : 'text-gray-400'}`}>
                {plan.name}
              </p>
              <div className="mt-6 flex flex-col items-center">
                <div className="flex items-center justify-center gap-x-2">
                  <span className={`text-5xl font-bold ${plan.isPopular ? 'text-gray-900' : 'text-white'}`}>
                    ${isYearly ? plan.yearlyPrice : plan.price}
                  </span>
                  <span className={`text-sm font-semibold ${plan.isPopular ? 'text-gray-600' : 'text-gray-400'}`}>
                    /mês
                  </span>
                </div>
                {isYearly && <p className="text-xs text-cyan-400 mt-1">
                    equivalente a $
                    {isYearly ? plan.name === 'STARTER' ? '948' : plan.name === 'PRO' ? '2.868' : '4.788' : plan.yearlyPrice}
                    /ano
                  </p>}
                <p className={`text-xs mt-1 ${plan.isPopular ? 'text-gray-600' : 'text-gray-400'}`}>
                  {isYearly ? 'cobrado anualmente' : 'cobrado mensalmente'}
                </p>
              </div>
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, idx) => <li key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <span className={`text-left ${plan.isPopular ? 'text-gray-700' : 'text-gray-300'}`}>
                      {feature}
                    </span>
                  </li>)}
              </ul>
              <div className="mt-8">
                <button className={cn('w-full px-4 py-2 rounded-lg font-medium transition-all', plan.isCurrent ? 'bg-green-600 text-white cursor-default' : plan.isPopular ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-gray-700 text-white hover:bg-gray-600')} disabled={plan.isCurrent}>
                  {plan.isCurrent ? 'Plano Atual' : 'Mudar Plano'}
                </button>
              </div>
              <p className={`mt-6 text-xs ${plan.isPopular ? 'text-gray-600' : 'text-gray-400'}`}>
                {plan.description}
              </p>
            </div>
          </motion.div>)}
      </div>
    </div>;
}