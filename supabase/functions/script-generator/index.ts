import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import JavaScriptObfuscator from 'npm:javascript-obfuscator@4.0.2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      const { domain, settings } = await req.json();

      if (!domain) {
        return new Response(
          JSON.stringify({ error: 'Domain is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Gerar ID único completamente aleatório (sem referências)
      const scriptId = generateObfuscatedId();
      
      // Salvar domínio protegido
      const { data: protectedDomain, error: insertError } = await supabase
        .from('protected_domains')
        .insert({
          user_id: user.id,
          domain: domain,
          script_id: scriptId,
          settings: settings || {}
        })
        .select()
        .single();

      if (insertError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create protected domain' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          scriptId,
          domain: protectedDomain
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'PUT') {
      const { scriptId, settings } = await req.json();

      const { error: updateError } = await supabase
        .from('protected_domains')
        .update({ 
          settings,
          updated_at: new Date().toISOString()
        })
        .eq('script_id', scriptId)
        .eq('user_id', user.id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update settings' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const scriptId = url.searchParams.get('scriptId');

      if (scriptId) {
        // Retornar script principal completamente ofuscado
        const { data: domain } = await supabase
          .from('protected_domains')
          .select('domain, settings')
          .eq('script_id', scriptId)
          .single();

        if (!domain) {
          return new Response('', {
            headers: { ...corsHeaders, 'Content-Type': 'application/javascript' }
          });
        }

        const mainScript = generateMainScript(scriptId, domain.domain, domain.settings);
        
        return new Response(mainScript, {
          headers: { ...corsHeaders, 'Content-Type': 'application/javascript' }
        });
      }

      // Listar domínios protegidos do usuário
      const { data: domains } = await supabase
        .from('protected_domains')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      return new Response(
        JSON.stringify({ domains: domains || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Script generator error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateObfuscatedId(): string {
  // Gera ID completamente aleatório sem referências
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateObfuscatedVars(): { [key: string]: string } {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const vars: { [key: string]: string } = {};
  
  // Gerar nomes de variáveis completamente aleatórios
  ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'].forEach(key => {
    let varName = '';
    for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) {
      varName += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    vars[key] = varName;
  });
  
  return vars;
}

function generateRandomStrings(): { [key: string]: string } {
  // Gerar strings aleatórias para mascarar as reais
  const randomStrings = {
    domain1: generateRandomDomain(),
    domain2: generateRandomDomain(),
    url1: generateRandomUrl(),
    url2: generateRandomUrl(),
    url3: generateRandomUrl(),
    endpoint1: generateRandomEndpoint(),
    endpoint2: generateRandomEndpoint(),
  };
  
  return randomStrings;
}

function generateRandomDomain(): string {
  const prefixes = ['api', 'cdn', 'static', 'assets', 'core', 'lib', 'app'];
  const suffixes = ['tech', 'cloud', 'net', 'io', 'dev', 'app', 'web'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const random = Math.random().toString(36).substring(2, 6);
  return `${prefix}${random}.${suffix}`;
}

function generateRandomUrl(): string {
  return `https://${generateRandomDomain()}/${Math.random().toString(36).substring(2, 8)}`;
}

function generateRandomEndpoint(): string {
  const endpoints = ['api/v1/data', 'core/analytics', 'lib/tracker', 'cdn/assets', 'app/metrics'];
  return endpoints[Math.floor(Math.random() * endpoints.length)];
}

function generateMainScript(scriptId: string, originalDomain: string, settings: any): string {
  const obfVars = generateObfuscatedVars();
  const randomStrs = generateRandomStrings();
  
  // Script principal com máxima ofuscação - TODAS as informações sensíveis são mascaradas
  const rawScript = `
(function() {
  'use strict';
  
  // Configuração ofuscada - valores reais misturados com falsos
  var ${obfVars.a} = {
    ${obfVars.b}: '${scriptId}',
    ${obfVars.c}: '${originalDomain}',
    ${obfVars.d}: ${JSON.stringify(settings)},
    ${obfVars.e}: '${Deno.env.get('SUPABASE_URL')}/functions/v1/script-tracker',
    ${obfVars.f}: '${randomStrs.domain1}',
    ${obfVars.g}: '${randomStrs.domain2}',
    ${obfVars.h}: '${randomStrs.url1}',
    ${obfVars.i}: '${randomStrs.url2}',
    ${obfVars.j}: '${randomStrs.url3}',
    ${obfVars.k}: '${randomStrs.endpoint1}',
    ${obfVars.l}: '${randomStrs.endpoint2}'
  };
  
  // Dados de sessão ofuscados
  var ${obfVars.m} = {
    ${obfVars.n}: Date.now(),
    ${obfVars.o}: 0,
    ${obfVars.p}: 0,
    ac: [],
    ${obfVars.f}: false,
    ${obfVars.g}: null,
    ${obfVars.h}: []
  };
  
  // Função de verificação de domínio ofuscada
  function ${obfVars.a}1() {
    var ${obfVars.a}2 = location.hostname;
    var ${obfVars.a}3 = ${obfVars.a}.${obfVars.c};
    
    // Adicionar verificações falsas para confundir
    if (${obfVars.a}2 === ${obfVars.a}.${obfVars.f}) return false;
    if (${obfVars.a}2 === ${obfVars.a}.${obfVars.g}) return false;
    
    return ${obfVars.a}2 !== ${obfVars.a}3;
  }
  
  // Função de comunicação ofuscada
  function ${obfVars.a}4(t, d) {
    try {
      var ${obfVars.a}5 = ${obfVars.a}.${obfVars.e};
      
      // Adicionar endpoints falsos para confundir
      if (Math.random() > 0.5) {
        var ${obfVars.a}6 = 'https://' + ${obfVars.a}.${obfVars.f} + '/' + ${obfVars.a}.${obfVars.k};
      } else {
        var ${obfVars.a}6 = 'https://' + ${obfVars.a}.${obfVars.g} + '/' + ${obfVars.a}.${obfVars.l};
      }
      
      fetch(${obfVars.a}5, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptId: ${obfVars.a}.${obfVars.b},
          eventType: t,
          eventData: d,
          domain: location.hostname,
          url: location.href,
          timestamp: Date.now()
        })
      }).catch(function() {});
    } catch(e) {}
  }
  
  // Função de rastreamento de visualizações ofuscada
  function ${obfVars.a}7() {
    ${obfVars.m}.${obfVars.o}++;
    ${obfVars.a}4('page_view', {
      domain: location.hostname,
      url: location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    });
  }
  
  // Função de rastreamento de cliques ofuscada
  function ${obfVars.a}8(e) {
    ${obfVars.m}.${obfVars.p}++;
    ${obfVars.a}4('click', {
      element: e.target.tagName,
      text: e.target.textContent ? e.target.textContent.substring(0, 100) : '',
      href: e.target.href || null
    });
  }
  
  // Função de redirecionamento ofuscada
  function ${obfVars.a}9() {
    var ${obfVars.a}10 = ${obfVars.a}.${obfVars.d}.redirect_url || 'https://' + ${obfVars.a}.${obfVars.c};
    
    // Adicionar URLs falsas para confundir
    var ${obfVars.a}11 = [
      ${obfVars.a}.${obfVars.h},
      ${obfVars.a}.${obfVars.i},
      ${obfVars.a}.${obfVars.j},
      ${obfVars.a}10
    ];
    
    var ${obfVars.a}12 = ${obfVars.a}11[${obfVars.a}11.length - 1];
    
    ${obfVars.a}4('redirect', { from: location.href, to: ${obfVars.a}12 });
    setTimeout(function() {
      location.href = ${obfVars.a}12;
    }, Math.floor(Math.random() * 2000) + 1000);
  }
  
  // Função de sabotagem visual ofuscada
  function ${obfVars.a}13() {
    var ${obfVars.a}14 = document.createElement('style');
    var ${obfVars.a}15 = Math.random().toString(36).substring(2, 8);
    
    ${obfVars.a}14.textContent = \`
      * { 
        filter: blur(\${Math.floor(Math.random() * 5) + 2}px) contrast(0.5) !important; 
        transition: all 0.3s ease !important;
      }
      a, button, input, select, textarea { 
        pointer-events: none !important; 
        cursor: not-allowed !important;
      }
      img { 
        filter: grayscale(100%) blur(\${Math.floor(Math.random() * 8) + 3}px) !important; 
      }
      .\${${obfVars.a}15} {
        animation: \${${obfVars.a}15}shake 0.5s infinite !important;
      }
      @keyframes \${${obfVars.a}15}shake {
        0% { transform: translateX(0px) translateY(0px); }
        25% { transform: translateX(\${Math.floor(Math.random() * 10) + 2}px) translateY(-\${Math.floor(Math.random() * 10) + 2}px); }
        50% { transform: translateX(-\${Math.floor(Math.random() * 10) + 2}px) translateY(\${Math.floor(Math.random() * 10) + 2}px); }
        75% { transform: translateX(\${Math.floor(Math.random() * 10) + 2}px) translateY(\${Math.floor(Math.random() * 10) + 2}px); }
        100% { transform: translateX(0px) translateY(0px); }
      }
    \`;
    document.head.appendChild(${obfVars.a}14);
    
    setTimeout(function() {
      document.body.style.transform = 'rotate(' + (Math.floor(Math.random() * 360)) + 'deg)';
      document.body.style.transition = 'transform 2s ease';
      document.body.className += ' ' + ${obfVars.a}15;
    }, Math.floor(Math.random() * 3000) + 1000);
  }
  
  // Função de substituição de links ofuscada
  function ${obfVars.a}16() {
    var ${obfVars.a}17 = document.querySelectorAll('a[href]');
    var ${obfVars.a}18 = ${obfVars.a}.${obfVars.d}.checkout_url || 'https://' + ${obfVars.a}.${obfVars.c};
    
    // Adicionar URLs falsas para confundir
    var ${obfVars.a}19 = [
      ${obfVars.a}.${obfVars.h} + '/checkout',
      ${obfVars.a}.${obfVars.i} + '/buy',
      ${obfVars.a}.${obfVars.j} + '/purchase',
      ${obfVars.a}18
    ];
    
    var ${obfVars.a}20 = ${obfVars.a}19[${obfVars.a}19.length - 1];
    
    ${obfVars.a}17.forEach(function(link) {
      var ${obfVars.a}21 = link.href.toLowerCase();
      var ${obfVars.a}22 = [
        'checkout', 'buy', 'purchase', 'cart', 'payment', 'order', 
        'comprar', 'finalizar', 'pagamento', 'carrinho'
      ];
      
      var ${obfVars.a}23 = ${obfVars.a}22.some(function(keyword) {
        return ${obfVars.a}21.includes(keyword);
      });
      
      if (${obfVars.a}23) {
        link.href = ${obfVars.a}20;
        link.style.border = '2px solid #' + Math.floor(Math.random()*16777215).toString(16);
        link.style.background = '#' + Math.floor(Math.random()*16777215).toString(16);
      }
    });
  }
  
  // Função de substituição de imagens ofuscada
  function ${obfVars.a}24() {
    if (!${obfVars.a}.${obfVars.d}.replacement_image_url) return;
    
    var ${obfVars.a}25 = document.querySelectorAll('img');
    var ${obfVars.a}26 = ${obfVars.a}.${obfVars.d}.replacement_image_url;
    
    // Adicionar URLs de imagens falsas para confundir
    var ${obfVars.a}27 = [
      ${obfVars.a}.${obfVars.h} + '/image.jpg',
      ${obfVars.a}.${obfVars.i} + '/photo.png',
      ${obfVars.a}.${obfVars.j} + '/pic.gif',
      ${obfVars.a}26
    ];
    
    var ${obfVars.a}28 = ${obfVars.a}27[${obfVars.a}27.length - 1];
    
    ${obfVars.a}25.forEach(function(img) {
      img.src = ${obfVars.a}28;
      img.alt = 'Protected Content - ' + Math.random().toString(36).substring(2, 8);
      img.style.border = '3px solid #' + Math.floor(Math.random()*16777215).toString(16);
    });
  }
  
  // Função de interferência visual ofuscada
  function ${obfVars.a}29() {
    var ${obfVars.a}30 = document.createElement('style');
    var ${obfVars.a}31 = Math.random().toString(36).substring(2, 8);
    var ${obfVars.a}32 = Math.random().toString(36).substring(2, 8);
    
    ${obfVars.a}30.textContent = \`
      body { 
        animation: \${${obfVars.a}31} 0.5s infinite !important;
        filter: hue-rotate(\${Math.floor(Math.random() * 360)}deg) saturate(\${Math.floor(Math.random() * 3) + 1}) !important;
      }
      @keyframes \${${obfVars.a}31} {
        0% { transform: translateX(0px) translateY(0px) rotate(0deg); }
        25% { transform: translateX(\${Math.floor(Math.random() * 10) + 2}px) translateY(-\${Math.floor(Math.random() * 10) + 2}px) rotate(\${Math.floor(Math.random() * 10)}deg); }
        50% { transform: translateX(-\${Math.floor(Math.random() * 10) + 2}px) translateY(\${Math.floor(Math.random() * 10) + 2}px) rotate(-\${Math.floor(Math.random() * 10)}deg); }
        75% { transform: translateX(\${Math.floor(Math.random() * 10) + 2}px) translateY(\${Math.floor(Math.random() * 10) + 2}px) rotate(\${Math.floor(Math.random() * 10)}deg); }
        100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
      }
      p, h1, h2, h3, h4, h5, h6, span, div {
        color: #\${Math.floor(Math.random()*16777215).toString(16)} !important;
        text-shadow: \${Math.floor(Math.random() * 5) + 1}px \${Math.floor(Math.random() * 5) + 1}px \${Math.floor(Math.random() * 8) + 2}px rgba(0,0,0,0.8) !important;
        animation: \${${obfVars.a}32} 1s infinite !important;
      }
      @keyframes \${${obfVars.a}32} {
        0%, 50% { opacity: 1; transform: scale(1); }
        51%, 100% { opacity: \${Math.random() * 0.5 + 0.3}; transform: scale(\${Math.random() * 0.3 + 0.9}); }
      }
    \`;
    document.head.appendChild(${obfVars.a}30);
  }
  
  // Função principal de inicialização ofuscada
  function ${obfVars.a}33() {
    ${obfVars.a}7();
    
    document.addEventListener('click', ${obfVars.a}8);
    
    // Verificar se é um clone
    if (${obfVars.a}1()) {
      ${obfVars.a}4('clone_detected', {
        originalDomain: ${obfVars.a}.${obfVars.c},
        cloneDomain: location.hostname,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      });
      
      // Aplicar ações baseadas nas configurações
      var ${obfVars.a}34 = Math.floor(Math.random() * 5000) + 2000;
      var ${obfVars.a}35 = Math.floor(Math.random() * 3000) + 1000;
      var ${obfVars.a}36 = Math.floor(Math.random() * 2000) + 500;
      
      if (${obfVars.a}.${obfVars.d}.redirect) {
        setTimeout(${obfVars.a}9, ${obfVars.a}34);
      }
      
      if (${obfVars.a}.${obfVars.d}.visual_sabotage) {
        setTimeout(${obfVars.a}13, ${obfVars.a}35);
      }
      
      if (${obfVars.a}.${obfVars.d}.replace_links) {
        setTimeout(${obfVars.a}16, 500);
        setInterval(${obfVars.a}16, 3000);
      }
      
      if (${obfVars.a}.${obfVars.d}.replace_images) {
        setTimeout(${obfVars.a}24, 1000);
        setInterval(${obfVars.a}24, 5000);
      }
      
      if (${obfVars.a}.${obfVars.d}.visual_interference) {
        setTimeout(${obfVars.a}29, ${obfVars.a}36);
      }
    }
    
    // Rastrear fim da sessão
    window.addEventListener('beforeunload', function() {
      var ${obfVars.a}37 = Math.floor((Date.now() - ${obfVars.m}.${obfVars.n}) / 1000);
      ${obfVars.a}4('session_end', {
        timeOnPage: ${obfVars.a}37,
        totalClicks: ${obfVars.m}.${obfVars.p},
        totalViews: ${obfVars.m}.${obfVars.o},
        domain: location.hostname
      });
    });
    
    // Adicionar verificações anti-debug
    setInterval(function() {
      if (window.devtools && window.devtools.open) {
        ${obfVars.a}4('debug_detected', { timestamp: Date.now() });
      }
    }, 1000);
  }
  
  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ${obfVars.a}33);
  } else {
    ${obfVars.a}33();
  }
  
  // Adicionar proteção contra modificação do script
  Object.freeze(${obfVars.a});
  Object.freeze(${obfVars.m});
  
})();
`;

  // Aplicar ofuscação MÁXIMA com javascript-obfuscator
  const obfuscatedResult = JavaScriptObfuscator.obfuscate(rawScript, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    numbersToExpressions: true,
    simplify: true,
    stringArrayShuffle: true,
    splitStrings: true,
    stringArrayThreshold: 1,
    transformObjectKeys: true,
    unicodeEscapeSequence: false,
    identifierNamesGenerator: 'hexadecimalNumber',
    renameGlobals: false,
    selfDefending: true,
    stringArray: true,
    rotateStringArray: true,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.6,
    debugProtection: true,
    debugProtectionInterval: 2000,
    disableConsoleOutput: true,
    domainLock: [],
    domainLockRedirectUrl: 'about:blank',
    forceTransformStrings: [],
    identifierNamesCache: null,
    identifiersPrefix: '',
    ignoreRequireImports: false,
    inputFileName: '',
    log: false,
    renameProperties: true,
    renamePropertiesMode: 'unsafe',
    reservedNames: [],
    reservedStrings: [],
    seed: Math.floor(Math.random() * 1000000),
    sourceMap: false,
    sourceMapBaseUrl: '',
    sourceMapFileName: '',
    sourceMapMode: 'separate',
    sourceMapSourcesMode: 'sources-content',
    splitStringsChunkLength: 3,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 1,
    stringArrayEncoding: ['base64', 'rc4'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: 'function',
    target: 'browser',
    unicodeEscapeSequence: false
  });

  return obfuscatedResult.getObfuscatedCode();
}