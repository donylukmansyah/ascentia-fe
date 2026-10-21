<?php

if (!defined('ABSPATH')) {
    exit;
}

function ascentia_find_inquiry_by_submission_id($submission_id) {
    if ($submission_id === '') {
        return 0;
    }

    $inquiries = get_posts([
        'post_type'              => 'ascentia_inquiry',
        'post_status'            => 'publish',
        'posts_per_page'         => 1,
        'fields'                 => 'ids',
        'no_found_rows'          => true,
        'meta_key'               => '_inquiry_submission_id',
        'meta_value'             => $submission_id,
        'ignore_sticky_posts'    => true,
        'update_post_meta_cache' => false,
        'update_post_term_cache' => false,
    ]);

    return empty($inquiries) ? 0 : (int) $inquiries[0];
}

function ascentia_acquire_submission_lock($submission_id) {
    if ($submission_id === '') {
        return null;
    }

    global $wpdb;

    $lock_name = 'ascentia_inq_' . md5($wpdb->prefix . $submission_id);
    $timeout   = defined('ASCENTIA_INQUIRIES_LOCK_TIMEOUT')
        ? (int) ASCENTIA_INQUIRIES_LOCK_TIMEOUT
        : 5;
    $timeout   = max(1, $timeout);
    $result    = $wpdb->get_var(
        $wpdb->prepare('SELECT GET_LOCK(%s, %d)', $lock_name, $timeout)
    );

    if ((string) $result === '1') {
        return $lock_name;
    }

    if ((string) $result === '0') {
        return false;
    }

    return null;
}

function ascentia_release_submission_lock($lock_name) {
    if (!is_string($lock_name) || $lock_name === '') {
        return;
    }

    global $wpdb;

    $wpdb->query($wpdb->prepare('SELECT RELEASE_LOCK(%s)', $lock_name));
}
