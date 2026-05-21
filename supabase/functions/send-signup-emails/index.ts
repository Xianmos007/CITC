// =====================================================================
// Supabase Edge Function: send-signup-emails
//
// Called by the website when a volunteer signs up. Looks up the
// signup, volunteer, opportunity, and partner from the database,
// then sends two emails via Resend:
//   1. Confirmation to the volunteer
//   2. Notification to the admin (Cristian)
//
// In Stage 3 we'll add a third email to the partner ministry's
// auto-notify contact.
//
// Deploy with:
//   supabase functions deploy send-signup-emails
//
// Required environment variables (set in Supabase dashboard):
//   RESEND_API_KEY            — your Resend API key
//   ADMIN_EMAIL               — where admin notifications go
//   FROM_EMAIL                — "from" address (e.g. volunteer@thechurchinthecity.org)
//   FROM_NAME                 — display name (e.g. "Church in the City")
// =====================================================================
// @ts-nocheck — Deno types not available in Node tooling
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers so the website can call this function from the browser
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle the CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { signup_id } = await req.json();
    if (!signup_id) {
      return json({ error: 'Missing signup_id' }, 400);
    }

    // Use the service role key here so we can read across all tables
    // regardless of RLS. The function is the trusted layer.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false } }
    );

    // Fetch the signup with all related data we need for the emails
    const { data: signup, error: signupErr } = await supabase
      .from('signups')
      .select(
        `
        id,
        status,
        created_at,
        volunteer:volunteers ( id, name, email, phone, church ),
        opportunity:opportunities (
          id, title, description, date_label, time_label,
          duration_label, bring_list, coordinator_note, total_spots,
          partner:partners ( id, name, contact_name, contact_email, auto_notify )
        )
      `
      )
      .eq('id', signup_id)
      .single();

    if (signupErr || !signup) {
      console.error('Lookup failed', signupErr);
      return json({ error: 'Signup not found' }, 404);
    }

    const v = signup.volunteer;
    const o = signup.opportunity;
    const p = o?.partner;

    // Count current signups so the admin email can show "X of Y filled"
    const { data: count } = await supabase.rpc(
      'get_opportunity_signup_count',
      { opp_id: o.id }
    );

    // ----------- Compose & send the volunteer confirmation -----------
    const volunteerEmailResult = await sendEmail({
      to: v.email,
      subject: `You\u2019re confirmed for ${o.title}`,
      html: volunteerConfirmationHTML({
        volunteer: v,
        opportunity: o,
        partner: p,
        isWaitlist: signup.status === 'waitlist',
      }),
    });

    // ----------- Compose & send the admin notification -----------
    const adminEmail = Deno.env.get('ADMIN_EMAIL');
    const adminEmailResult = adminEmail
      ? await sendEmail({
          to: adminEmail,
          subject: `New signup: ${v.name} for ${o.title}`,
          html: adminNotificationHTML({
            volunteer: v,
            opportunity: o,
            partner: p,
            isWaitlist: signup.status === 'waitlist',
            filledCount: count || 0,
          }),
        })
      : { skipped: true };

    // ----------- Stage 3 will add partner notify here -----------
    // For now, log when we *would* notify a partner.
    if (p?.auto_notify && p?.contact_email) {
      console.log(
        `[Stage 3 TODO] Would notify partner ${p.name} at ${p.contact_email}`
      );
    }

    return json({
      ok: true,
      volunteer_email: volunteerEmailResult,
      admin_email: adminEmailResult,
    });
  } catch (e) {
    console.error('Function error:', e);
    return json({ error: String(e?.message || e) }, 500);
  }
});

// ---------------------------------------------------------------------
// Email-sending helper (uses Resend's REST API)
// ---------------------------------------------------------------------
async function sendEmail({ to, subject, html }) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping email');
    return { skipped: true, reason: 'no API key' };
  }

  const fromName = Deno.env.get('FROM_NAME') || 'Church in the City';
  const fromEmail =
    Deno.env.get('FROM_EMAIL') || 'volunteer@thechurchinthecity.org';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html,
      reply_to: Deno.env.get('ADMIN_EMAIL'),
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Resend error', res.status, body);
    return { ok: false, status: res.status, body };
  }
  return { ok: true, id: body?.id };
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------
// Email HTML templates (inline CSS for max email-client compatibility)
// ---------------------------------------------------------------------

function emailShell(innerHTML) {
  return `<!doctype html>
<html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:#f4f1ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fbfaf7;border:1px solid #e9e3d6;border-radius:6px;overflow:hidden;">
        <tr><td style="padding:32px 32px 8px 32px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:14px;letter-spacing:0.16em;text-transform:uppercase;color:#9a8a5e;">— Church in the City</div>
        </td></tr>
        ${innerHTML}
        <tr><td style="padding:24px 32px 32px 32px;border-top:1px solid #ecd9d6;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:14px;color:#666;line-height:1.5;">Seeking the welfare of Titusville · Jeremiah 29:7</div>
          <div style="font-family:-apple-system,sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#aaa;margin-top:8px;">thechurchinthecity.org</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function volunteerConfirmationHTML({ volunteer, opportunity, partner, isWaitlist }) {
  const firstName = (volunteer.name || '').split(' ')[0] || 'friend';
  const bringList = (opportunity.bring_list || [])
    .map(
      (b) => `<li style="margin-bottom:4px;">${escapeHtml(b)}</li>`
    )
    .join('');

  const body = `
    <tr><td style="padding:8px 32px 24px 32px;">
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:500;line-height:1.2;letter-spacing:-0.015em;color:#1a1a1a;margin:0 0 16px 0;">
        ${isWaitlist ? 'You\u2019re on the waitlist.' : 'You\u2019re confirmed.'}
      </h1>
      <p style="font-size:15px;line-height:1.6;color:#3a3a3a;margin:0 0 24px 0;">
        Hi ${escapeHtml(firstName)},<br><br>
        ${
          isWaitlist
            ? 'You\u2019re on the waitlist for this one. If someone drops, we\u2019ll let you know.'
            : 'Thank you for signing up. You\u2019re confirmed for:'
        }
      </p>

      <div style="background:#f4f1ec;border-left:3px solid #b89a5e;padding:18px 22px;margin-bottom:24px;">
        <div style="font-family:Georgia,serif;font-size:20px;font-weight:500;line-height:1.3;color:#1a1a1a;margin-bottom:6px;">
          ${escapeHtml(opportunity.title)}
        </div>
        <div style="font-family:-apple-system,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#666;">
          ${escapeHtml(opportunity.date_label || '')} · ${escapeHtml(opportunity.time_label || '')}
        </div>
        <div style="font-family:-apple-system,sans-serif;font-size:13px;color:#666;margin-top:6px;">
          Hosted by ${escapeHtml(partner?.name || 'a partner ministry')} · Titusville, FL
        </div>
      </div>

      ${
        bringList
          ? `<h3 style="font-family:Georgia,serif;font-size:16px;font-weight:500;color:#1a1a1a;margin:24px 0 8px 0;">What to bring</h3>
             <ul style="font-size:14px;line-height:1.7;color:#3a3a3a;margin:0 0 24px 0;padding-left:20px;">${bringList}</ul>`
          : ''
      }

      ${
        opportunity.coordinator_note
          ? `<h3 style="font-family:Georgia,serif;font-size:16px;font-weight:500;color:#1a1a1a;margin:24px 0 8px 0;">A note from the coordinator</h3>
             <p style="font-family:Georgia,serif;font-style:italic;font-size:16px;line-height:1.5;color:#1a1a1a;margin:0 0 24px 0;">"${escapeHtml(opportunity.coordinator_note)}"</p>`
          : ''
      }

      <p style="font-size:14px;line-height:1.6;color:#666;margin:24px 0 0 0;">
        If anything changes and you can\u2019t make it, just reply to this email and we\u2019ll find someone else for the spot.
      </p>
      <p style="font-size:14px;line-height:1.6;color:#3a3a3a;margin:16px 0 0 0;">
        We\u2019re glad you\u2019re coming.<br>
        <strong>— Church in the City</strong>
      </p>
    </td></tr>
  `;
  return emailShell(body);
}

function adminNotificationHTML({
  volunteer,
  opportunity,
  partner,
  isWaitlist,
  filledCount,
}) {
  const body = `
    <tr><td style="padding:8px 32px 24px 32px;">
      <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:500;line-height:1.2;color:#1a1a1a;margin:0 0 16px 0;">
        ${escapeHtml(volunteer.name)} just signed up.
      </h1>

      <div style="background:#f4f1ec;border-left:3px solid #b89a5e;padding:18px 22px;margin-bottom:24px;">
        <div style="font-family:Georgia,serif;font-size:18px;font-weight:500;line-height:1.3;color:#1a1a1a;margin-bottom:6px;">
          ${escapeHtml(opportunity.title)}
        </div>
        <div style="font-family:-apple-system,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#666;">
          ${escapeHtml(opportunity.date_label || '')} · ${escapeHtml(opportunity.time_label || '')}
        </div>
        <div style="font-family:-apple-system,sans-serif;font-size:13px;color:#666;margin-top:6px;">
          Partner: ${escapeHtml(partner?.name || 'Unknown')}
        </div>
      </div>

      <table cellpadding="0" cellspacing="0" style="font-size:14px;color:#3a3a3a;line-height:1.7;margin-bottom:24px;">
        <tr><td style="padding-right:16px;color:#888;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;vertical-align:top;">Status</td><td><strong>${isWaitlist ? 'Waitlist' : 'Confirmed'}</strong></td></tr>
        <tr><td style="padding-right:16px;color:#888;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;vertical-align:top;">Email</td><td>${escapeHtml(volunteer.email)}</td></tr>
        <tr><td style="padding-right:16px;color:#888;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;vertical-align:top;">Phone</td><td>${escapeHtml(volunteer.phone || '—')}</td></tr>
        <tr><td style="padding-right:16px;color:#888;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;vertical-align:top;">Church</td><td>${escapeHtml(volunteer.church || '—')}</td></tr>
        <tr><td style="padding-right:16px;color:#888;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;vertical-align:top;">Spots</td><td>${filledCount} of ${opportunity.total_spots} filled</td></tr>
      </table>

      <p style="font-size:13px;line-height:1.6;color:#888;margin:24px 0 0 0;font-style:italic;">
        Admin panel coming in Stage 3 — for now, sign-ups live in the Supabase dashboard.
      </p>
    </td></tr>
  `;
  return emailShell(body);
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
