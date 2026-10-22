<?php

if (!defined('ABSPATH')) {
    exit;
}

function ascentia_build_inquiry_email($post_id, $subject, $type, $name, $email, $company, $phone, $product, $message) {
    $admin_link = admin_url('post.php?post=' . $post_id . '&action=edit');
    $time_str   = current_time('d F Y, H:i') . ' WIB';

    $safe_name    = esc_html($name);
    $safe_email   = esc_html($email);
    $safe_message = nl2br(esc_html($message));
    $badge_title  = ($type === 'quote') ? 'MINTA PENAWARAN' : 'KONTAK UMUM';
    $badge_bg     = ($type === 'quote') ? '#FFF7ED' : '#EFF6FF';
    $badge_border = ($type === 'quote') ? '#FED7AA' : '#BFDBFE';
    $badge_color  = ($type === 'quote') ? '#C2410C' : '#288AC6';

    $font_stack = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif";
    $optional_rows = '';
    if (!empty($company)) {
        $optional_rows .= '
        <tr>
          <td style="padding-bottom: 12px; font-family: ' . $font_stack . ';">
            <div style="font-family: ' . $font_stack . '; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">Perusahaan / Instansi</div>
            <div style="font-family: ' . $font_stack . '; font-size: 15px; font-weight: 500; color: #334155; margin-top: 2px;">' . esc_html($company) . '</div>
          </td>
        </tr>';
    }
    if (!empty($phone)) {
        $optional_rows .= '
        <tr>
          <td style="padding-bottom: 12px; font-family: ' . $font_stack . ';">
            <div style="font-family: ' . $font_stack . '; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">Telepon / WhatsApp</div>
            <div style="font-family: ' . $font_stack . '; font-size: 15px; font-weight: 500; color: #334155; margin-top: 2px;">' . esc_html($phone) . '</div>
          </td>
        </tr>';
    }
    if (!empty($product)) {
        $optional_rows .= '
        <tr>
          <td style="padding-bottom: 12px; font-family: ' . $font_stack . ';">
            <div style="font-family: ' . $font_stack . '; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">Produk Terkait</div>
            <div style="font-family: ' . $font_stack . '; font-size: 15px; font-weight: 600; color: #288AC6; margin-top: 2px;">' . esc_html($product) . '</div>
          </td>
        </tr>';
    }

    return <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{$subject}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    body, table, td, div, p, a, span, h1 {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif !important;
    }
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, div, p, a, span, h1 {
      font-family: Arial, sans-serif !important;
    }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: {$font_stack}; -webkit-font-smoothing: antialiased; color: #0F172A;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 48px 16px; font-family: {$font_stack};">
    <tr>
      <td align="center" style="font-family: {$font_stack};">
        <!-- Wrapper Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.04), 0 8px 10px -6px rgba(15, 23, 42, 0.02); font-family: {$font_stack};">
          
          <!-- Top Accent Bar (Solid CTA Orange) -->
          <tr>
            <td height="4" bgcolor="#F28B3B" style="background-color: #F28B3B; height: 4px; line-height: 4px; font-size: 4px;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; border-bottom: 1px solid #F1F5F9; font-family: {$font_stack};">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: {$font_stack};">
                <tr>
                  <td style="font-family: {$font_stack};">
                    <div style="font-family: {$font_stack}; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #288AC6; text-transform: uppercase; margin-bottom: 4px;">
                      PT ASCENTIA ARSYA ANALITIKA
                    </div>
                    <div style="font-family: {$font_stack}; font-size: 13px; color: #64748B;">
                      Notifikasi Formulir Website
                    </div>
                  </td>
                  <td align="right" valign="top" style="font-family: {$font_stack};">
                    <span style="font-family: {$font_stack}; display: inline-block; background-color: {$badge_bg}; color: {$badge_color}; border: 1px solid {$badge_border}; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; letter-spacing: 0.5px;">
                      {$badge_title}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 40px; font-family: {$font_stack};">
              
              <!-- Greeting / Summary -->
              <h1 style="font-family: {$font_stack}; margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #0F172A; line-height: 1.3;">
                Pesan baru dari {$safe_name}
              </h1>
              <div style="font-family: {$font_stack}; font-size: 13px; color: #64748B; margin-bottom: 24px;">
                Diterima pada {$time_str}
              </div>

              <!-- Sender Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 28px; font-family: {$font_stack};">
                <tr>
                  <td style="padding: 20px 24px; font-family: {$font_stack};">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: {$font_stack};">
                      <tr>
                        <td style="padding-bottom: 12px; font-family: {$font_stack};">
                          <div style="font-family: {$font_stack}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">Nama Pengirim</div>
                          <div style="font-family: {$font_stack}; font-size: 15px; font-weight: 600; color: #0F172A; margin-top: 2px;">{$safe_name}</div>
                        </td>
                      </tr>
                      {$optional_rows}
                      <tr>
                        <td style="font-family: {$font_stack};">
                          <div style="font-family: {$font_stack}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">Work Email</div>
                          <div style="font-family: {$font_stack}; font-size: 15px; margin-top: 2px;">
                            <a href="mailto:{$safe_email}" style="font-family: {$font_stack}; color: #288AC6; text-decoration: none; font-weight: 500;">{$safe_email}</a>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message Block -->
              <div style="font-family: {$font_stack}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748B; margin-bottom: 8px;">
                Isi Pesan
              </div>
              <div style="font-family: {$font_stack}; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-left: 4px solid #288AC6; border-radius: 8px; padding: 20px 24px; font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 32px; white-space: pre-wrap;">{$safe_message}</div>

              <!-- Call to Action Buttons -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="font-family: {$font_stack};">
                <tr>
                  <td style="border-radius: 8px; background-color: #288AC6; font-family: {$font_stack};" align="center">
                    <a href="mailto:{$safe_email}?subject=Re:%20Inquiry%20Ascentia%20Website" style="font-family: {$font_stack}; font-size: 13px; font-weight: 600; color: #FFFFFF; text-decoration: none; padding: 12px 22px; border-radius: 8px; display: inline-block;">
                      Balas Email Langsung &rarr;
                    </a>
                  </td>
                  <td width="12"></td>
                  <td style="border-radius: 8px; background-color: #F1F5F9; border: 1px solid #E2E8F0; font-family: {$font_stack};" align="center">
                    <a href="{$admin_link}" target="_blank" style="font-family: {$font_stack}; font-size: 13px; font-weight: 600; color: #334155; text-decoration: none; padding: 12px 20px; border-radius: 8px; display: inline-block;">
                      Buka di WP-Admin
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #F1F5F9; padding: 24px 40px; text-align: center; color: #94A3B8; font-size: 12px; line-height: 1.6; font-family: {$font_stack};">
              <div style="font-family: {$font_stack}; font-weight: 600; color: #475569; margin-bottom: 4px;">PT Ascentia Arsya Analitika</div>
              <div style="font-family: {$font_stack};">Business Park Kebon Jeruk D2-12, Jl. Meruya Ilir No. 88, Jakarta Barat 11620</div>
              <div style="font-family: {$font_stack}; margin-top: 6px;">
                <a href="https://ascentia.co.id" style="font-family: {$font_stack}; color: #64748B; text-decoration: none;">ascentia.co.id</a> &bull; <a href="mailto:sales@ascentia.co.id" style="font-family: {$font_stack}; color: #64748B; text-decoration: none;">sales@ascentia.co.id</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;
}
