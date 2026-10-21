<?php

if (!defined('ABSPATH')) {
    exit;
}

function ascentia_register_analytics_route() {
    register_rest_route('ascentia/v1', '/page-view', [
        'methods'             => ['POST', 'GET'],
        'callback'            => 'ascentia_handle_page_view',
        'permission_callback' => '__return_true',
    ]);
}
add_action('rest_api_init', 'ascentia_register_analytics_route');

function ascentia_handle_page_view(WP_REST_Request $request) {
    if ($request->get_method() !== 'POST') {
        return new WP_REST_Response([
            'success' => true,
            'views'   => ascentia_get_page_views(),
        ], 200);
    }

    $analytics_key = defined('ASCENTIA_ANALYTICS_KEY')
        ? (string) ASCENTIA_ANALYTICS_KEY
        : (string) get_option('ascentia_analytics_key', '');

    if ($analytics_key !== '') {
        $provided_key = (string) $request->get_header('x-ascentia-analytics-key');
        if (!hash_equals($analytics_key, $provided_key)) {
            return new WP_Error('invalid_analytics_key', 'Invalid analytics key.', ['status' => 403]);
        }
    }

    if (!ascentia_increment_page_views()) {
        return new WP_Error('page_view_failed', 'Gagal menyimpan kunjungan.', ['status' => 500]);
    }

    return new WP_REST_Response([
        'success' => true,
        'views'   => ascentia_get_page_views(),
    ], 200);
}
