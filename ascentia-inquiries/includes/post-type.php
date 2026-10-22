<?php

if (!defined('ABSPATH')) {
    exit;
}

function ascentia_register_inquiry_post_type() {
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
}
add_action('init', 'ascentia_register_inquiry_post_type');
