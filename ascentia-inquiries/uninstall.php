<?php

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

wp_clear_scheduled_hook('ascentia_send_inquiry_notification');

if (
    !defined('ASCENTIA_INQUIRIES_REMOVE_DATA_ON_UNINSTALL')
    || !ASCENTIA_INQUIRIES_REMOVE_DATA_ON_UNINSTALL
) {
    return;
}

$inquiries = get_posts([
    'post_type'      => 'ascentia_inquiry',
    'post_status'    => ['publish', 'draft', 'pending', 'private', 'future', 'trash'],
    'posts_per_page' => -1,
    'fields'         => 'ids',
    'no_found_rows'  => true,
]);

foreach ($inquiries as $inquiry_id) {
    wp_delete_post($inquiry_id, true);
}

delete_option('ascentia_notification_emails');
delete_option('ascentia_total_views');
delete_option('ascentia_analytics_key');
