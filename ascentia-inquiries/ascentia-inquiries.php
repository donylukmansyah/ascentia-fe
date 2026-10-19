<?php
/**
 * Plugin Name: Ascentia Inquiries (Contact & RFQ Submissions)
 * Description: Captures contact & RFQ submissions, stores in WP-Admin, and dispatches executive HTML email notifications.
 * Version: 2.1.0
 * Author: PT Ascentia Arsya Analitika
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Registrasi Custom Post Type untuk Pesan Masuk
add_action('init', function () {
    $labels = [
        'name'               => 'Pesan Masuk',
        'singular_name'      => 'Pesan Masuk',
        'menu_name'          => 'Pesan Masuk',
        'name_admin_bar'     => 'Pesan Masuk',
        'add_new'            => 'Tambah Baru',
        'add_new_item'       => 'Tambah Pesan Baru',
        'new_item'           => 'Pesan Baru',
        'edit_item'          => 'Lihat Pesan',
        'view_item'          => 'Lihat Pesan',
        'all_items'          => 'Semua Pesan',
        'search_items'       => 'Cari Pesan',
        'not_found'          => 'Belum ada pesan masuk.',
        'not_found_in_trash' => 'Tidak ada pesan di tempat sampah.',
    ];

    register_post_type('ascentia_inquiry', [
        'labels'             => $labels,
        'public'             => false,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'menu_position'      => 26,
        'menu_icon'          => 'dashicons-email-alt',
        'supports'           => ['title'],
        'capability_type'    => 'post',
        'map_meta_cap'       => true,
        'show_in_rest'       => false,
    ]);
});

// 2. Menu Pengaturan Email di Bawah Menu "Pesan Masuk"
add_action('admin_menu', function () {
    add_submenu_page(
        'edit.php?post_type=ascentia_inquiry',
        'Pengaturan Notifikasi Email',
        'Pengaturan Email',
        'manage_options',
        'ascentia_inquiry_settings',
        'ascentia_render_inquiry_settings'
    );
});

add_action('admin_init', function () {
    register_setting('ascentia_inquiry_settings_group', 'ascentia_notification_emails');
});

function ascentia_render_inquiry_settings() {
    ?>
    <div class="wrap">
        <h1>Pengaturan Notifikasi Email</h1>
        <p>Tentukan alamat email penerima setiap kali ada calon klien yang mengisi formulir kontak atau penawaran di website.</p>
        
        <form method="post" action="options.php">
            <?php
            settings_fields('ascentia_inquiry_settings_group');
            $current_emails = get_option('ascentia_notification_emails', get_option('admin_email'));
            ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">
                        <label for="ascentia_notification_emails">Email Penerima</label>
                    </th>
                    <td>
                        <input
                            type="text"
                            id="ascentia_notification_emails"
                            name="ascentia_notification_emails"
                            value="<?php echo esc_attr($current_emails); ?>"
                            class="regular-text"
                            style="width: 100%; max-width: 520px;"
                        />
                        <p class="description" style="margin-top: 8px;">
                            Bisa memasukkan lebih dari satu email, pisahkan dengan tanda koma (<code>,</code>).<br>
                            Contoh: <code>sales@ascentia.co.id, direktur@ascentia.co.id</code>
                        </p>
                    </td>
                </tr>
            </table>

            <?php submit_button('Simpan Pengaturan'); ?>
        </form>
    </div>
    <?php
}

// 3. Kolom Kustom di Tabel Pesan Masuk
add_filter('manage_ascentia_inquiry_posts_columns', function ($columns) {
    return [
        'cb'              => '<input type="checkbox" />',
        'inquiry_type'    => 'Tipe',
        'inquiry_name'    => 'Nama & Perusahaan',
        'inquiry_email'   => 'Kontak',
        'inquiry_message' => 'Ringkasan Pesan',
        'date'            => 'Waktu Masuk',
    ];
});

add_action('manage_ascentia_inquiry_posts_custom_column', function ($column, $post_id) {
    switch ($column) {
        case 'inquiry_type':
            $type = get_post_meta($post_id, '_inquiry_type', true) ?: 'contact';
            if ($type === 'quote' || $type === 'rfq') {
                echo '<span style="background: #288AC6; color: #fff; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 11px;">Minta Penawaran</span>';
            } else {
                echo '<span style="background: #64748B; color: #fff; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 11px;">Kontak Umum</span>';
            }
            break;

        case 'inquiry_name':
            $name    = get_post_meta($post_id, '_inquiry_name', true) ?: get_the_title($post_id);
            $company = get_post_meta($post_id, '_inquiry_company', true);
            echo '<strong><a href="' . esc_url(get_edit_post_link($post_id)) . '">' . esc_html($name) . '</a></strong>';
            if ($company) {
                echo '<br><span style="color: #64748B; font-size: 12px;">' . esc_html($company) . '</span>';
            }
            break;

        case 'inquiry_email':
            $email = get_post_meta($post_id, '_inquiry_email', true);
            $phone = get_post_meta($post_id, '_inquiry_phone', true);
            if ($email) {
                echo '<a href="' . esc_url('mailto:' . $email) . '">' . esc_html($email) . '</a>';
            } else {
                echo '-';
            }
            if ($phone) {
                echo '<br><span style="color: #64748B; font-size: 12px;">Tel: ' . esc_html($phone) . '</span>';
            }
            break;

        case 'inquiry_message':
            $product = get_post_meta($post_id, '_inquiry_product', true);
            $message = get_post_meta($post_id, '_inquiry_message', true) ?: get_post_field('post_content', $post_id);
            if ($product) {
                echo '<span style="color: #288AC6; font-weight: 600; font-size: 12px;">Produk: ' . esc_html($product) . '</span><br>';
            }
            echo esc_html(wp_trim_words($message, 12, '...'));
            break;
    }
}, 10, 2);

// 4. Meta Box Detail Pesan Masuk di WP-Admin
add_action('add_meta_boxes', function () {
    add_meta_box(
        'ascentia_inquiry_details',
        'Detail Pesan Masuk',
        function ($post) {
            $type    = get_post_meta($post->ID, '_inquiry_type', true) ?: 'contact';
            $name    = get_post_meta($post->ID, '_inquiry_name', true) ?: get_the_title($post->ID);
            $company = get_post_meta($post->ID, '_inquiry_company', true);
            $email   = get_post_meta($post->ID, '_inquiry_email', true);
            $phone   = get_post_meta($post->ID, '_inquiry_phone', true);
            $product = get_post_meta($post->ID, '_inquiry_product', true);
            $message = get_post_meta($post->ID, '_inquiry_message', true) ?: $post->post_content;
            ?>
            <table class="form-table">
                <tr>
                    <th style="width: 160px;">Tipe Pengajuan</th>
                    <td>
                        <strong><?php echo esc_html($type === 'quote' ? 'Permintaan Penawaran Harga (Beli)' : 'Kontak Umum'); ?></strong>
                    </td>
                </tr>
                <tr>
                    <th>Nama Pengirim</th>
                    <td><strong><?php echo esc_html($name); ?></strong></td>
                </tr>
                <?php if ($company): ?>
                <tr>
                    <th>Perusahaan / Instansi</th>
                    <td><?php echo esc_html($company); ?></td>
                </tr>
                <?php endif; ?>
                <tr>
                    <th>Email</th>
                    <td>
                        <a href="<?php echo esc_url('mailto:' . $email); ?>"><?php echo esc_html($email); ?></a>
                    </td>
                </tr>
                <?php if ($phone): ?>
                <tr>
                    <th>No. Telepon / WhatsApp</th>
                    <td><?php echo esc_html($phone); ?></td>
                </tr>
                <?php endif; ?>
                <?php if ($product): ?>
                <tr>
                    <th>Produk yang Ditanyakan</th>
                    <td><strong style="color: #288AC6;"><?php echo esc_html($product); ?></strong></td>
                </tr>
                <?php endif; ?>
                <tr>
                    <th>Waktu Masuk</th>
                    <td><?php echo esc_html(get_the_date('d F Y, H:i', $post)); ?> WIB</td>
                </tr>
                <tr>
                    <th>Isi Pesan</th>
                    <td>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #1e293b;"><?php echo esc_html($message); ?></div>
                    </td>
                </tr>
            </table>
            <?php
        },
        'ascentia_inquiry',
        'normal',
        'high'
    );
});

// 5. REST API Endpoint: POST /wp-json/ascentia/v1/contact
add_action('rest_api_init', function () {
    register_rest_route('ascentia/v1', '/contact', [
        'methods'             => 'POST',
        'callback'            => 'ascentia_handle_contact_submission',
        'permission_callback' => '__return_true',
    ]);
});

function ascentia_handle_contact_submission(WP_REST_Request $request) {
    $params = $request->get_json_params();
    if (empty($params)) {
        $params = $request->get_body_params();
    }

    // Anti-spam silent honeypot
    if (!empty($params['_hp_field'])) {
        return new WP_REST_Response(['success' => true, 'message' => 'Message received.'], 200);
    }

    $name    = isset($params['name']) ? sanitize_text_field(trim($params['name'])) : '';
    $email   = isset($params['email']) ? sanitize_email(trim($params['email'])) : '';
    $message = isset($params['message']) ? sanitize_textarea_field(trim($params['message'])) : '';
    $type    = isset($params['type']) && in_array($params['type'], ['quote', 'contact']) ? $params['type'] : 'contact';
    $company = isset($params['company']) ? sanitize_text_field(trim($params['company'])) : '';
    $phone   = isset($params['phone']) ? sanitize_text_field(trim($params['phone'])) : '';
    $product = isset($params['product']) ? sanitize_text_field(trim($params['product'])) : '';

    if (empty($name)) {
        return new WP_Error('missing_name', 'Nama wajib diisi.', ['status' => 400]);
    }
    if (empty($email) || !is_email($email)) {
        return new WP_Error('invalid_email', 'Format email tidak valid.', ['status' => 400]);
    }

    // Validasi DNS MX domain email (pastikan domain aktif memiliki mail server)
    $domain = substr(strrchr($email, "@"), 1);
    if (!empty($domain) && function_exists('checkdnsrr')) {
        if (!checkdnsrr($domain, 'MX') && !checkdnsrr($domain, 'A')) {
            return new WP_Error('invalid_domain', 'Domain email tidak aktif atau tidak ditemukan.', ['status' => 400]);
        }
    }

    if (empty($message)) {
        return new WP_Error('missing_message', 'Pesan tidak boleh kosong.', ['status' => 400]);
    }

    // 1. Simpan ke Database WordPress (WP-Admin)
    $type_label = ($type === 'quote') ? '[RFQ]' : '[Kontak]';
    $post_id = wp_insert_post([
        'post_type'    => 'ascentia_inquiry',
        'post_status'  => 'publish',
        'post_title'   => sprintf('%s %s (%s)', $type_label, $name, $company ?: $email),
        'post_content' => $message,
    ]);

    if (is_wp_error($post_id)) {
        return new WP_Error('save_failed', 'Gagal menyimpan pesan ke database.', ['status' => 500]);
    }

    update_post_meta($post_id, '_inquiry_type', $type);
    update_post_meta($post_id, '_inquiry_name', $name);
    update_post_meta($post_id, '_inquiry_company', $company);
    update_post_meta($post_id, '_inquiry_email', $email);
    update_post_meta($post_id, '_inquiry_phone', $phone);
    update_post_meta($post_id, '_inquiry_product', $product);
    update_post_meta($post_id, '_inquiry_message', $message);

    // 2. Ambil Daftar Penerima Email dari Pengaturan Admin
    $raw_setting = get_option('ascentia_notification_emails', '');
    $recipients  = [];

    if (!empty($raw_setting)) {
        $parts = explode(',', $raw_setting);
        foreach ($parts as $part) {
            $cleaned = sanitize_email(trim($part));
            if (is_email($cleaned)) {
                $recipients[] = $cleaned;
            }
        }
    }

    if (empty($recipients)) {
        $admin_email = get_option('admin_email');
        if (is_email($admin_email)) {
            $recipients[] = $admin_email;
        }
    }

    $subject    = sprintf('[Ascentia Website] %s dari %s', ($type === 'quote' ? 'Permintaan Penawaran' : 'Pesan Baru'), $name);
    $admin_link = admin_url('post.php?post=' . $post_id . '&action=edit');
    $time_str   = current_time('d F Y, H:i') . ' WIB';

    // 3. Template HTML Email Modern, Elegan & Minimalis
    $safe_name    = esc_html($name);
    $safe_email   = esc_html($email);
    $safe_message = nl2br(esc_html($message));
    $badge_title  = ($type === 'quote') ? 'MINTA PENAWARAN (RFQ)' : 'KONTAK UMUM';
    $badge_bg     = ($type === 'quote') ? '#FFF7ED' : '#EFF6FF';
    $badge_border = ($type === 'quote') ? '#FED7AA' : '#BFDBFE';
    $badge_color  = ($type === 'quote') ? '#C2410C' : '#288AC6';

    // Item opsional jika ada isinya
    $optional_rows = '';
    if (!empty($company)) {
        $optional_rows .= '
        <tr>
          <td style="padding-bottom: 12px;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">Perusahaan / Instansi</div>
            <div style="font-size: 15px; font-weight: 600; color: #0F172A; margin-top: 2px;">' . esc_html($company) . '</div>
          </td>
        </tr>';
    }
    if (!empty($phone)) {
        $optional_rows .= '
        <tr>
          <td style="padding-bottom: 12px;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">Telepon / WhatsApp</div>
            <div style="font-size: 15px; font-weight: 500; color: #334155; margin-top: 2px;">' . esc_html($phone) . '</div>
          </td>
        </tr>';
    }
    if (!empty($product)) {
        $optional_rows .= '
        <tr>
          <td style="padding-bottom: 12px;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">Produk Terkait</div>
            <div style="font-size: 15px; font-weight: 600; color: #288AC6; margin-top: 2px;">' . esc_html($product) . '</div>
          </td>
        </tr>';
    }

    $html_body = <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{$subject}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <!--[if mso]>
  <style type="text/css">
    body, table, td, div, p, a, span {
      font-family: 'Segoe UI', Arial, sans-serif !important;
    }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0F172A;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 48px 16px;">
    <tr>
      <td align="center">
        <!-- Wrapper Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.04), 0 8px 10px -6px rgba(15, 23, 42, 0.02);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="4" style="background-color: #F28B3B; line-height: 4px; font-size: 4px;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; border-bottom: 1px solid #F1F5F9;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #288AC6; text-transform: uppercase; margin-bottom: 4px;">
                      PT ASCENTIA ARSYA ANALITIKA
                    </div>
                    <div style="font-size: 13px; color: #64748B;">
                      Notifikasi Formulir Website
                    </div>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: {$badge_bg}; color: {$badge_color}; border: 1px solid {$badge_border}; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; letter-spacing: 0.5px;">
                      {$badge_title}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 40px;">
              
              <!-- Greeting / Summary -->
              <h1 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #0F172A; line-height: 1.3;">
                Pesan baru dari {$safe_name}
              </h1>
              <div style="font-size: 13px; color: #64748B; margin-bottom: 24px;">
                Diterima pada {$time_str}
              </div>

              <!-- Sender Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">Nama Pengirim</div>
                          <div style="font-size: 15px; font-weight: 600; color: #0F172A; margin-top: 2px;">{$safe_name}</div>
                        </td>
                      </tr>
                      {$optional_rows}
                      <tr>
                        <td>
                          <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94A3B8;">Work Email</div>
                          <div style="font-size: 15px; margin-top: 2px;">
                            <a href="mailto:{$safe_email}" style="color: #288AC6; text-decoration: none; font-weight: 500;">{$safe_email}</a>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message Block -->
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748B; margin-bottom: 8px;">
                Isi Pesan
              </div>
              <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-left: 4px solid #288AC6; border-radius: 8px; padding: 20px 24px; font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 32px; white-space: pre-wrap;">{$safe_message}</div>

              <!-- Call to Action Buttons -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius: 8px; background-color: #288AC6;" align="center">
                    <a href="mailto:{$safe_email}?subject=Re:%20Inquiry%20Ascentia%20Website" style="font-size: 13px; font-weight: 600; color: #FFFFFF; text-decoration: none; padding: 12px 22px; border-radius: 8px; display: inline-block;">
                      Balas Email Langsung &rarr;
                    </a>
                  </td>
                  <td width="12"></td>
                  <td style="border-radius: 8px; background-color: #F1F5F9; border: 1px solid #E2E8F0;" align="center">
                    <a href="{$admin_link}" target="_blank" style="font-size: 13px; font-weight: 600; color: #334155; text-decoration: none; padding: 12px 20px; border-radius: 8px; display: inline-block;">
                      Buka di WP-Admin
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #F1F5F9; padding: 24px 40px; text-align: center; color: #94A3B8; font-size: 12px; line-height: 1.6;">
              <div style="font-weight: 600; color: #475569; margin-bottom: 4px;">PT Ascentia Arsya Analitika</div>
              <div>Business Park Kebon Jeruk D2-12, Jl. Meruya Ilir No. 88, Jakarta Barat 11620</div>
              <div style="margin-top: 6px;">
                <a href="https://ascentia.co.id" style="color: #64748B; text-decoration: none;">ascentia.co.id</a> &bull; <a href="mailto:sales@ascentia.co.id" style="color: #64748B; text-decoration: none;">sales@ascentia.co.id</a>
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

    $headers = [
        'Content-Type: text/html; charset=UTF-8',
        'Reply-To: ' . $name . ' <' . $email . '>',
    ];

    if (!empty($recipients)) {
        wp_mail($recipients, $subject, $html_body, $headers);
    }

    return new WP_REST_Response([
        'success' => true,
        'message' => 'Permintaan Anda berhasil diterima.',
        'id'      => $post_id,
    ], 200);
}
