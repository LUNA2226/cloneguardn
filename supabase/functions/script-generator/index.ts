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

      // Gerar ID único para o script
      const scriptId = generateScriptId();
      
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

      // Gerar script ofuscado
      const obfuscatedScript = generateObfuscatedScript(scriptId, domain, settings);

      return new Response(
        JSON.stringify({
          scriptId,
          script: obfuscatedScript,
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
        // Retornar script principal
        const { data: domain } = await supabase
          .from('protected_domains')
          .select('domain, settings')
          .eq('script_id', scriptId)
          .single();

        if (!domain) {
          return new Response('// Script not found', {
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

function generateScriptId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateObfuscatedScript(scriptId: string, domain: string, settings: any): string {
  const randomPath = generateRandomPath();
  const obfuscatedVars = generateObfuscatedVars();
  
  return `(function(){var ${obfuscatedVars.a}='${scriptId}',${obfuscatedVars.b}='${domain}';
if(location.hostname===${obfuscatedVars.b}){var ${obfuscatedVars.c}=document.createElement('script');
${obfuscatedVars.c}.src='${Deno.env.get('SUPABASE_URL')}/functions/v1/script-generator?scriptId='+${obfuscatedVars.a};
${obfuscatedVars.c}.async=true;document.head.appendChild(${obfuscatedVars.c});}})();`;
}

function generateRandomPath(): string {
  const paths = ['cdn', 'assets', 'static', 'js', 'lib', 'core'];
  const files = ['p.js', 'a.js', 'c.js', 'main.js', 'app.js', 'core.js'];
  return `/${paths[Math.floor(Math.random() * paths.length)]}/${files[Math.floor(Math.random() * files.length)]}`;
}

function generateObfuscatedVars(): { [key: string]: string } {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const vars: { [key: string]: string } = {};
  
  ['a', 'b', 'c', 'd', 'e'].forEach(key => {
    let varName = '';
    for (let i = 0; i < 2; i++) {
      varName += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    vars[key] = varName;
  });
  
  return vars;
}

function generateMainScript(scriptId: string, originalDomain: string, settings: any): string {
  return `
(function() {
  'use strict';
  
  var config = {
    scriptId: '${scriptId}',
    originalDomain: '${originalDomain}',
    settings: ${JSON.stringify(settings)},
    apiUrl: '${Deno.env.get('SUPABASE_URL')}/functions/v1/script-tracker'
  };
  
  var analytics = {
    startTime: Date.now(),
    pageViews: 0,
    clicks: 0,
    actions: []
  };
  
  function isClonedSite() {
    return location.hostname !== config.originalDomain;
  }
  
  function sendAnalytics(eventType, data) {
    fetch(config.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scriptId: config.scriptId,
        eventType: eventType,
        eventData: data,
        domain: location.hostname,
        url: location.href,
        timestamp: Date.now()
      })
    }).catch(function() {});
  }
  
  function trackPageView() {
    analytics.pageViews++;
    sendAnalytics('page_view', {
      domain: location.hostname,
      url: location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    });
  }
  
  function trackClick(event) {
    analytics.clicks++;
    sendAnalytics('click', {
      element: event.target.tagName,
      text: event.target.textContent?.substring(0, 100),
      href: event.target.href || null
    });
  }
  
  function addViewCounter() {
    var counter = document.createElement('div');
    counter.style.cssText = 'position:fixed;top:10px;right:10px;background:#000;color:#fff;padding:5px 10px;border-radius:3px;font-size:12px;z-index:999999;';
    counter.textContent = 'Views: ' + analytics.pageViews;
    document.body.appendChild(counter);
    
    setInterval(function() {
      counter.textContent = 'Views: ' + analytics.pageViews;
    }, 1000);
  }
  
  function redirectToOriginal() {
    var redirectUrl = config.settings.redirect_url || 'https://' + config.originalDomain;
    sendAnalytics('redirect', { from: location.href, to: redirectUrl });
    location.href = redirectUrl;
  }
  
  function applySabotage() {
    var style = document.createElement('style');
    style.textContent = \`
      * { filter: blur(2px) !important; }
      a { pointer-events: none !important; }
      button { pointer-events: none !important; }
      input { pointer-events: none !important; }
    \`;
    document.head.appendChild(style);
    
    setTimeout(function() {
      document.body.style.transform = 'rotate(180deg)';
    }, 3000);
  }
  
  function replaceLinks() {
    var links = document.querySelectorAll('a[href]');
    links.forEach(function(link) {
      if (link.href.includes('checkout') || link.href.includes('buy') || link.href.includes('purchase')) {
        link.href = config.settings.checkout_url || 'https://' + config.originalDomain;
        link.style.border = '2px solid red';
      }
    });
  }
  
  function replaceImages() {
    if (!config.settings.replacement_image_url) return;
    
    var images = document.querySelectorAll('img');
    images.forEach(function(img) {
      img.src = config.settings.replacement_image_url;
      img.alt = 'Protected Content';
    });
  }
  
  function applyVisualInterference() {
    var style = document.createElement('style');
    style.textContent = \`
      body { 
        animation: shake 0.5s infinite !important;
        filter: hue-rotate(180deg) !important;
      }
      @keyframes shake {
        0% { transform: translateX(0px); }
        25% { transform: translateX(5px); }
        50% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
        100% { transform: translateX(0px); }
      }
      p, h1, h2, h3, h4, h5, h6 {
        color: red !important;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5) !important;
      }
    \`;
    document.head.appendChild(style);
  }
  
  function init() {
    trackPageView();
    addViewCounter();
    
    document.addEventListener('click', trackClick);
    
    if (isClonedSite()) {
      sendAnalytics('clone_detected', {
        originalDomain: config.originalDomain,
        cloneDomain: location.hostname
      });
      
      if (config.settings.redirect) {
        setTimeout(redirectToOriginal, 2000);
      }
      
      if (config.settings.visual_sabotage) {
        applySabotage();
      }
      
      if (config.settings.replace_links) {
        replaceLinks();
      }
      
      if (config.settings.replace_images) {
        replaceImages();
      }
      
      if (config.settings.visual_interference) {
        applyVisualInterference();
      }
    }
    
    window.addEventListener('beforeunload', function() {
      var timeOnPage = Math.floor((Date.now() - analytics.startTime) / 1000);
      sendAnalytics('session_end', {
        timeOnPage: timeOnPage,
        totalClicks: analytics.clicks,
        totalViews: analytics.pageViews
      });
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;
}