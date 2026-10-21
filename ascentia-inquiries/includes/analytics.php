<?php

if (!defined('ABSPATH')) {
    exit;
}

function ascentia_get_page_views() {
    return max(0, (int) get_option('ascentia_total_views', 0));
}

function ascentia_increment_page_views() {
    global $wpdb;

    $updated = $wpdb->query(
        $wpdb->prepare(
            "INSERT INTO {$wpdb->options} (option_name, option_value, autoload)
             VALUES (%s, '1', 'no')
             ON DUPLICATE KEY UPDATE option_value = CAST(option_value AS UNSIGNED) + 1",
            'ascentia_total_views'
        )
    );

    if ($updated === false) {
        return false;
    }

    wp_cache_delete('ascentia_total_views', 'options');
    wp_cache_delete('notoptions', 'options');
    wp_cache_delete('alloptions', 'options');

    return true;
}
