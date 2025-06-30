import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const {
      scriptId,
      eventType,
      eventData,
      domain,
      url,
      timestamp
    } = await req.json();

    if (!scriptId || !eventType) {
      return new Response('Missing required fields', { status: 400, headers: corsHeaders });
    }

    // Buscar domínio protegido
    const { data: protectedDomain } = await supabase
      .from('protected_domains')
      .select('id, domain')
      .eq('script_id', scriptId)
      .single();

    if (!protectedDomain) {
      return new Response('Script not found', { status: 404, headers: corsHeaders });
    }

    // Obter IP do visitante
    const visitorIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     req.headers.get('cf-connecting-ip') ||
                     'unknown';

    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Registrar analytics
    await supabase.from('script_analytics').insert({
      protected_domain_id: protectedDomain.id,
      event_type: eventType,
      event_data: eventData,
      visitor_ip: visitorIp,
      user_agent: userAgent
    });

    // Se for detecção de clone, registrar também na tabela específica
    if (eventType === 'clone_detected') {
      await supabase.from('clone_detections').insert({
        protected_domain_id: protectedDomain.id,
        clone_domain: domain,
        visitor_ip: visitorIp,
        user_agent: userAgent,
        page_url: url,
        actions_taken: [eventType]
      });
    }

    // Se for fim de sessão, atualizar tempo na página
    if (eventType === 'session_end' && eventData.timeOnPage) {
      const { data: existingDetection } = await supabase
        .from('clone_detections')
        .select('id')
        .eq('protected_domain_id', protectedDomain.id)
        .eq('clone_domain', domain)
        .eq('visitor_ip', visitorIp)
        .order('detected_at', { ascending: false })
        .limit(1)
        .single();

      if (existingDetection) {
        await supabase
          .from('clone_detections')
          .update({
            time_on_page: eventData.timeOnPage,
            actions_taken: ['clone_detected', 'session_end']
          })
          .eq('id', existingDetection.id);
      }
    }

    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Tracker error:', error);
    return new Response('Internal server error', { status: 500, headers: corsHeaders });
  }
});