<?php

if (!defined('ABSPATH')) {
    exit;
}

function ascentia_register_contact_route() {
    register_rest_route('ascentia/v1', '/contact', [
        'methods'             => 'POST',
        'callback'            => 'ascentia_handle_contact_submission',
        'permission_callback' => '__return_true',
    ]);
}
add_action('rest_api_init', 'ascentia_register_contact_route');

function ascentia_handle_contact_submission(WP_REST_Request $request) {
    $params = $request->get_json_params();
    if (empty($params)) {
        $params = $request->get_body_params();
    }

    if (!empty($params['_hp_field'])) {
        return new WP_REST_Response(['success' => true, 'message' => 'Message received.'], 200);
    }

    $name    = isset($params['name']) && is_string($params['name']) ? sanitize_text_field(trim($params['name'])) : '';
    $email   = isset($params['email']) && is_string($params['email']) ? sanitize_email(trim($params['email'])) : '';
    $message = isset($params['message']) && is_string($params['message']) ? sanitize_textarea_field(trim($params['message'])) : '';
    $type    = isset($params['type']) && in_array($params['type'], ['quote', 'contact'], true) ? $params['type'] : 'contact';
    $company = isset($params['company']) && is_string($params['company']) ? sanitize_text_field(trim($params['company'])) : '';
    $phone   = isset($params['phone']) && is_string($params['phone']) ? sanitize_text_field(trim($params['phone'])) : '';
    $product = isset($params['product']) && is_string($params['product']) ? sanitize_text_field(trim($params['product'])) : '';
    $submission_id = isset($params['submission_id']) && is_string($params['submission_id']) ? sanitize_text_field(trim($params['submission_id'])) : '';

    if (empty($name)) {
        return new WP_Error('missing_name', 'Nama wajib diisi.', ['status' => 400]);
    }
    if (empty($email) || !is_email($email)) {
        return new WP_Error('invalid_email', 'Format email tidak valid.', ['status' => 400]);
    }
    if (empty($message)) {
        return new WP_Error('missing_message', 'Pesan tidak boleh kosong.', ['status' => 400]);
    }
    if ($submission_id !== '' && !preg_match('/^[A-Za-z0-9_-]{8,64}$/', $submission_id)) {
        return new WP_Error('invalid_submission_id', 'ID pengajuan tidak valid.', ['status' => 400]);
    }

    $lock = ascentia_acquire_submission_lock($submission_id);
    if ($lock === false) {
        return new WP_Error(
            'submission_in_progress',
            'Permintaan sedang diproses. Silakan coba lagi.',
            ['status' => 409]
        );
    }

    try {
        $existing_id = ascentia_find_inquiry_by_submission_id($submission_id);
        if ($existing_id) {
            return new WP_REST_Response([
                'success'   => true,
                'message'   => 'Permintaan Anda sudah diterima.',
                'id'        => $existing_id,
                'duplicate' => true,
            ], 200);
        }

        $type_label = ($type === 'quote') ? '[Penawaran]' : '[Kontak]';
        $post_id    = wp_insert_post([
            'post_type'    => 'ascentia_inquiry',
            'post_status'  => 'publish',
            'post_title'   => sprintf('%s %s (%s)', $type_label, $name, $company ?: $email),
            'post_content' => $message,
            'meta_input'   => [
                '_inquiry_type'    => $type,
                '_inquiry_name'    => $name,
                '_inquiry_company' => $company,
                '_inquiry_email'   => $email,
                '_inquiry_phone'   => $phone,
                '_inquiry_product' => $product,
                '_inquiry_message' => $message,
                '_inquiry_submission_id' => $submission_id,
            ],
        ]);

        if (empty($post_id) || is_wp_error($post_id)) {
            return new WP_Error('save_failed', 'Gagal menyimpan pesan ke database.', ['status' => 500]);
        }

        $recipients = ascentia_get_notification_recipients();
        $subject    = sprintf('[Ascentia Website] %s dari %s', ($type === 'quote' ? 'Permintaan Penawaran' : 'Pesan Baru'), $name);
        $html_body  = ascentia_build_inquiry_email($post_id, $subject, $type, $name, $email, $company, $phone, $product, $message);
        $headers    = [
            'Content-Type: text/html; charset=UTF-8',
            'Reply-To: ' . $name . ' <' . $email . '>',
        ];

        if (!empty($recipients)) {
            ascentia_queue_inquiry_notification($post_id, $recipients, $subject, $html_body, $headers);
        } else {
            update_post_meta($post_id, '_inquiry_email_status', 'failed');
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => 'Permintaan Anda berhasil diterima.',
            'id'      => $post_id,
        ], 200);
    } finally {
        ascentia_release_submission_lock($lock);
    }
}
