<?php

if (!defined('ABSPATH')) {
    exit;
}

function ascentia_add_inquiry_columns($columns) {
    return [
        'cb'                   => '<input type="checkbox" />',
        'inquiry_type'         => 'Tipe',
        'inquiry_name'         => 'Nama & Perusahaan',
        'inquiry_email'        => 'Kontak',
        'inquiry_message'      => 'Ringkasan Pesan',
        'inquiry_email_status' => 'Email',
        'date'                 => 'Waktu Masuk',
    ];
}
add_filter('manage_ascentia_inquiry_posts_columns', 'ascentia_add_inquiry_columns');

function ascentia_render_inquiry_column($column, $post_id) {
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

        case 'inquiry_email_status':
            $status = get_post_meta($post_id, '_inquiry_email_status', true) ?: 'pending';
            $styles = [
                'sent'    => 'background:#DCFCE7;color:#166534;',
                'pending' => 'background:#FEF3C7;color:#92400E;',
                'failed'  => 'background:#FEE2E2;color:#991B1B;',
            ];
            $labels = [
                'sent'    => 'Terkirim',
                'pending' => 'Menunggu',
                'failed'  => 'Gagal',
            ];
            $style = isset($styles[$status]) ? $styles[$status] : $styles['pending'];
            $label = isset($labels[$status]) ? $labels[$status] : $labels['pending'];
            echo '<span style="' . esc_attr($style) . 'padding:3px 8px;border-radius:4px;font-weight:600;font-size:11px;">' . esc_html($label) . '</span>';
            break;
    }
}
add_action('manage_ascentia_inquiry_posts_custom_column', 'ascentia_render_inquiry_column', 10, 2);

function ascentia_add_resend_row_action($actions, $post) {
    if ($post->post_type !== 'ascentia_inquiry') {
        return $actions;
    }
    if (get_post_meta($post->ID, '_inquiry_email_status', true) === 'sent') {
        return $actions;
    }

    $url = wp_nonce_url(
        admin_url('post.php?post=' . $post->ID . '&action=ascentia_resend_email'),
        'ascentia_resend_email_' . $post->ID
    );
    $actions['ascentia_resend_email'] = '<a href="' . esc_url($url) . '">Kirim ulang email</a>';

    return $actions;
}
add_filter('post_row_actions', 'ascentia_add_resend_row_action', 10, 2);

function ascentia_handle_resend_action() {
    if (!isset($_GET['action']) || $_GET['action'] !== 'ascentia_resend_email') {
        return;
    }

    $post_id = isset($_GET['post']) ? absint($_GET['post']) : 0;
    if (!$post_id || !current_user_can('edit_post', $post_id)) {
        return;
    }

    check_admin_referer('ascentia_resend_email_' . $post_id);
    ascentia_send_inquiry_notification($post_id);
    wp_safe_redirect(admin_url('edit.php?post_type=ascentia_inquiry&ascentia_resent=1'));
    exit;
}
add_action('admin_init', 'ascentia_handle_resend_action');

function ascentia_render_resend_notice() {
    if (isset($_GET['ascentia_resent'])) {
        echo '<div class="notice notice-success is-dismissible"><p>Email notifikasi diproses ulang.</p></div>';
    }
}
add_action('admin_notices', 'ascentia_render_resend_notice');

function ascentia_register_inquiry_meta_box() {
    add_meta_box(
        'ascentia_inquiry_details',
        'Detail Pesan Masuk',
        'ascentia_render_inquiry_meta_box',
        'ascentia_inquiry',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'ascentia_register_inquiry_meta_box');

function ascentia_render_inquiry_meta_box($post) {
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
}
