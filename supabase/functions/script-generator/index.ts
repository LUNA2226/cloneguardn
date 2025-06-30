import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

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

      // Gerar ID único para o script (sem referências ao domínio)
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
        // Retornar script principal ofuscado
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

function generateRandomPath(): string {
  const paths = ['assets', 'static', 'lib', 'core', 'js', 'cdn'];
  const files = ['p.js', 'a.js', 'c.js', 'main.js', 'app.js', 'core.js', 'bundle.js'];
  return `/${paths[Math.floor(Math.random() * paths.length)]}/${files[Math.floor(Math.random() * files.length)]}`;
}

function generateObfuscatedVars(): { [key: string]: string } {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const vars: { [key: string]: string } = {};
  
  ['a', 'b', 'c', 'd', 'e', 'f', 'g'].forEach(key => {
    let varName = '';
    for (let i = 0; i < Math.floor(Math.random() * 2) + 2; i++) {
      varName += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    vars[key] = varName;
  });
  
  return vars;
}

function generateMainScript(scriptId: string, originalDomain: string, settings: any): string {
  const obfVars = generateObfuscatedVars();
  
  return `
(function() {
  'use strict';
  
  var ${obfVars.a} = {
    ${obfVars.b}: '${scriptId}',
    ${obfVars.c}: '${originalDomain}',
    ${obfVars.d}: ${JSON.stringify(settings)},
    ${obfVars.e}: '${Deno.env.get('SUPABASE_URL')}/functions/v1/script-tracker'
  };
  
  var ${obfVars.f} = {
    ${obfVars.g}: Date.now(),
    pv: 0,
    cl: 0,
    ac: []
  };
  
  function ${obfVars.a}1() {
    return location.hostname !== ${obfVars.a}.${obfVars.c};
  }
  
  function ${obfVars.a}2(t, d) {
    try {
      fetch(${obfVars.a}.${obfVars.e}, {
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
  
  function ${obfVars.a}3() {
    ${obfVars.f}.pv++;
    ${obfVars.a}2('page_view', {
      domain: location.hostname,
      url: location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    });
  }
  
  function ${obfVars.a}4(e) {
    ${obfVars.f}.cl++;
    ${obfVars.a}2('click', {
      element: e.target.tagName,
      text: e.target.textContent ? e.target.textContent.substring(0, 100) : '',
      href: e.target.href || null
    });
  }
  
  function ${obfVars.a}5() {
    var ${obfVars.a}6 = document.createElement('div');
    ${obfVars.a}6.style.cssText = 'position:fixed;top:10px;right:10px;background:rgba(0,0,0,0.8);color:#fff;padding:8px 12px;border-radius:4px;font-size:12px;z-index:999999;font-family:monospace;';
    ${obfVars.a}6.textContent = 'Views: ' + ${obfVars.f}.pv;
    document.body.appendChild(${obfVars.a}6);
    
    setInterval(function() {
      ${obfVars.a}6.textContent = 'Views: ' + ${obfVars.f}.pv;
    }, 1000);
  }
  
  function ${obfVars.a}7() {
    var ${obfVars.a}8 = ${obfVars.a}.${obfVars.d}.redirect_url || 'https://' + ${obfVars.a}.${obfVars.c};
    ${obfVars.a}2('redirect', { from: location.href, to: ${obfVars.a}8 });
    setTimeout(function() {
      location.href = ${obfVars.a}8;
    }, Math.floor(Math.random() * 2000) + 1000);
  }
  
  function ${obfVars.a}9() {
    var ${obfVars.a}10 = document.createElement('style');
    ${obfVars.a}10.textContent = \`
      * { 
        filter: blur(3px) contrast(0.5) !important; 
        transition: all 0.3s ease !important;
      }
      a, button, input, select, textarea { 
        pointer-events: none !important; 
        cursor: not-allowed !important;
      }
      img { 
        filter: grayscale(100%) blur(5px) !important; 
      }
    \`;
    document.head.appendChild(${obfVars.a}10);
    
    setTimeout(function() {
      document.body.style.transform = 'rotate(180deg)';
      document.body.style.transition = 'transform 2s ease';
    }, 3000);
  }
  
  function ${obfVars.a}11() {
    var ${obfVars.a}12 = document.querySelectorAll('a[href]');
    ${obfVars.a}12.forEach(function(link) {
      var ${obfVars.a}13 = link.href.toLowerCase();
      if (${obfVars.a}13.includes('checkout') || ${obfVars.a}13.includes('buy') || 
          ${obfVars.a}13.includes('purchase') || ${obfVars.a}13.includes('cart') ||
          ${obfVars.a}13.includes('payment') || ${obfVars.a}13.includes('order')) {
        link.href = ${obfVars.a}.${obfVars.d}.checkout_url || 'https://' + ${obfVars.a}.${obfVars.c};
        link.style.border = '2px solid #ff0000';
        link.style.background = '#ffcccc';
      }
    });
  }
  
  function ${obfVars.a}14() {
    if (!${obfVars.a}.${obfVars.d}.replacement_image_url) return;
    
    var ${obfVars.a}15 = document.querySelectorAll('img');
    ${obfVars.a}15.forEach(function(img) {
      img.src = ${obfVars.a}.${obfVars.d}.replacement_image_url;
      img.alt = 'Protected Content';
      img.style.border = '3px solid red';
    });
  }
  
  function ${obfVars.a}16() {
    var ${obfVars.a}17 = document.createElement('style');
    ${obfVars.a}17.textContent = \`
      body { 
        animation: ${obfVars.a}shake 0.5s infinite !important;
        filter: hue-rotate(180deg) saturate(2) !important;
      }
      @keyframes ${obfVars.a}shake {
        0% { transform: translateX(0px) translateY(0px); }
        25% { transform: translateX(5px) translateY(-5px); }
        50% { transform: translateX(-5px) translateY(5px); }
        75% { transform: translateX(5px) translateY(5px); }
        100% { transform: translateX(0px) translateY(0px); }
      }
      p, h1, h2, h3, h4, h5, h6, span, div {
        color: #ff0000 !important;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8) !important;
        animation: ${obfVars.a}blink 1s infinite !important;
      }
      @keyframes ${obfVars.a}blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
      }
    \`;
    document.head.appendChild(${obfVars.a}17);
  }
  
  function ${obfVars.a}18() {
    ${obfVars.a}3();
    ${obfVars.a}5();
    
    document.addEventListener('click', ${obfVars.a}4);
    
    if (${obfVars.a}1()) {
      ${obfVars.a}2('clone_detected', {
        originalDomain: ${obfVars.a}.${obfVars.c},
        cloneDomain: location.hostname
      });
      
      if (${obfVars.a}.${obfVars.d}.redirect) {
        setTimeout(${obfVars.a}7, Math.floor(Math.random() * 3000) + 2000);
      }
      
      if (${obfVars.a}.${obfVars.d}.visual_sabotage) {
        setTimeout(${obfVars.a}9, Math.floor(Math.random() * 2000) + 1000);
      }
      
      if (${obfVars.a}.${obfVars.d}.replace_links) {
        setTimeout(${obfVars.a}11, 500);
        setInterval(${obfVars.a}11, 3000);
      }
      
      if (${obfVars.a}.${obfVars.d}.replace_images) {
        setTimeout(${obfVars.a}14, 1000);
        setInterval(${obfVars.a}14, 5000);
      }
      
      if (${obfVars.a}.${obfVars.d}.visual_interference) {
        setTimeout(${obfVars.a}16, Math.floor(Math.random() * 1000) + 500);
      }
    }
    
    window.addEventListener('beforeunload', function() {
      var ${obfVars.a}19 = Math.floor((Date.now() - ${obfVars.f}.${obfVars.g}) / 1000);
      ${obfVars.a}2('session_end', {
        timeOnPage: ${obfVars.a}19,
        totalClicks: ${obfVars.f}.cl,
        totalViews: ${obfVars.f}.pv
      });
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ${obfVars.a}18);
  } else {
    ${obfVars.a}18();
  }
})();
`.trim();
}