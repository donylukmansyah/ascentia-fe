<?php

if (!defined('ABSPATH')) {
    exit;
}

function ascentia_get_notification_recipients() {
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

    return $recipients;
}

function ascentia_queue_inquiry_notification($post_id, $recipients, $subject, $html_body, $headers) {
    $post_id = absint($post_id);
    if (!$post_id) {
        return;
    }

    update_post_meta($post_id, '_inquiry_email_payload', [
        'recipients' => array_values(array_filter($recipients, 'is_email')),
        'subject'    => $subject,
        'body'       => $html_body,
        'headers'    => $headers,
    ]);
    update_post_meta($post_id, '_inquiry_email_status', 'pending');

    wp_schedule_single_event(time(), 'ascentia_send_inquiry_notification', [$post_id]);
}
add_action('ascentia_send_inquiry_notification', 'ascentia_send_inquiry_notification', 10, 1);

function ascentia_send_inquiry_notification($post_id) {
    $post_id = absint($post_id);
    if (!$post_id || get_post_type($post_id) !== 'ascentia_inquiry') {
        return;
    }
    if (get_post_meta($post_id, '_inquiry_email_status', true) === 'sent') {
        return;
    }

    $payload = get_post_meta($post_id, '_inquiry_email_payload', true);
    if (!is_array($payload) || empty($payload['recipients'])) {
        update_post_meta($post_id, '_inquiry_email_status', 'failed');
        return;
    }

    try {
        $sent = wp_mail(
            $payload['recipients'],
            isset($payload['subject']) ? $payload['subject'] : '',
            isset($payload['body']) ? $payload['body'] : '',
            isset($payload['headers']) ? $payload['headers'] : []
        );
    } catch (Throwable $e) {
        $sent = false;
    }

    update_post_meta($post_id, '_inquiry_email_status', $sent ? 'sent' : 'failed');
    if ($sent) {
        delete_post_meta($post_id, '_inquiry_email_payload');
    }
}
