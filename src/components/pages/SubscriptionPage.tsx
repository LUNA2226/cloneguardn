import React from 'react';
import { ArrowLeftIcon, AlertCircleIcon, FileTextIcon, CheckCircleIcon } from 'lucide-react';
export function SubscriptionPage() {
  const subscription = {
    plan: 'Premium',
    status: 'active',
    nextRenewal: '2024-02-15',
    price: 'R$ 99,90',
    billingCycle: 'mensal'
  };
  return <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <h1 className="text-2xl font-bold">Minha Assinatura</h1>
      </div>
      {/* Current Plan */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">
              Plano {subscription.plan}
            </h2>
            <div className="flex items-center">
              {subscription.status === 'active' ? <CheckCircleIcon size={16} className="text-green-400 mr-2" /> : <AlertCircleIcon size={16} className="text-yellow-400 mr-2" />}
              <span className="text-sm text-gray-300">
                {subscription.status === 'active' ? 'Assinatura Ativa' : 'Assinatura Cancelada'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {subscription.price}
            </div>
            <div className="text-sm text-gray-400">
              Cobrança {subscription.billingCycle}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Próxima renovação</p>
            <p className="text-lg font-medium">
              {new Date(subscription.nextRenewal).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Status do pagamento</p>
            <p className="text-lg font-medium text-green-400">Confirmado</p>
          </div>
        </div>
      </div>
      {/* Features */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Recursos do seu plano</h3>
        <ul className="space-y-3">
          {['Até 5 domínios protegidos', 'Detecção em tempo real', 'Proteção contra clonagem avançada', 'Suporte prioritário 24/7', 'Relatórios detalhados'].map((feature, index) => <li key={index} className="flex items-center text-gray-300">
              <CheckCircleIcon size={16} className="text-cyan-400 mr-2" />
              {feature}
            </li>)}
        </ul>
      </div>
      {/* Actions */}
      <div className="space-y-4">
        <button className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center">
          <AlertCircleIcon size={18} className="mr-2" />
          Cancelar Assinatura
        </button>
        <button className="flex items-center text-gray-400 hover:text-gray-300 text-sm">
          <FileTextIcon size={16} className="mr-2" />
          Ver Termos do Contrato
        </button>
      </div>
    </div>;
}