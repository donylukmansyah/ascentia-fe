<?php

if (!defined('ABSPATH')) {
    exit;
}

function ascentia_sanitize_notification_emails($value) {
    $value = is_string($value) ? $value : '';
    $emails = [];

    foreach (explode(',', $value) as $email) {
        $email = sanitize_email(trim($email));
        if (is_email($email)) {
            $emails[] = $email;
        }
    }

    return implode(', ', $emails);
}

function ascentia_register_admin_menu() {
    add_submenu_page(
        'edit.php?post_type=ascentia_inquiry',
        'Pengaturan Notifikasi Email',
        'Pengaturan Email',
        'manage_options',
        'ascentia_inquiry_settings',
        'ascentia_render_inquiry_settings'
    );
}
add_action('admin_menu', 'ascentia_register_admin_menu');

function ascentia_register_inquiry_settings() {
    register_setting('ascentia_inquiry_settings_group', 'ascentia_notification_emails', [
        'type'              => 'string',
        'sanitize_callback' => 'ascentia_sanitize_notification_emails',
        'default'           => '',
    ]);
    register_setting('ascentia_inquiry_settings_group', 'ascentia_total_views', [
        'type'              => 'integer',
        'sanitize_callback' => 'absint',
        'default'           => 0,
    ]);
    register_setting('ascentia_inquiry_settings_group', 'ascentia_analytics_key', [
        'type'              => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default'           => '',
    ]);
}
add_action('admin_init', 'ascentia_register_inquiry_settings');

function ascentia_render_inquiry_settings() {
    ?>
    <div class="wrap">
        <h1>Pengaturan Notifikasi Email & Kunjungan</h1>
        <p>Tentukan alamat email penerima notifikasi formulir dan kelola statistik kunjungan website.</p>
        
        <form method="post" action="options.php">
            <?php
            settings_fields('ascentia_inquiry_settings_group');
            $current_emails = get_option('ascentia_notification_emails', get_option('admin_email'));
            $current_views  = (int) get_option('ascentia_total_views', 0);
            $current_key    = (string) get_option('ascentia_analytics_key', '');
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
                <tr>
                    <th scope="row">
                        <label for="ascentia_total_views">Total Kunjungan Website</label>
                    </th>
                    <td>
                        <input
                            type="number"
                            id="ascentia_total_views"
                            name="ascentia_total_views"
                            value="<?php echo esc_attr($current_views); ?>"
                            class="regular-text"
                            style="width: 100%; max-width: 200px;"
                            min="0"
                        />
                        <p class="description" style="margin-top: 8px;">
                            Bertambah satu setiap halaman diakses. Satu orang yang membuka 10 halaman dihitung 10 kunjungan. Ubah manual di sini bila perlu, misalnya untuk reset ke 0.
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="ascentia_analytics_key">Analytics Key</label>
                    </th>
                    <td>
                        <input
                            type="text"
                            id="ascentia_analytics_key"
                            name="ascentia_analytics_key"
                            value="<?php echo esc_attr($current_key); ?>"
                            class="regular-text"
                            style="width: 100%; max-width: 520px;"
                            autocomplete="off"
                        />
                        <p class="description" style="margin-top: 8px;">
                            Opsional. Harus sama dengan <code>ASCENTIA_ANALYTICS_KEY</code> di environment frontend. Kosongkan untuk mengizinkan tanpa key (khusus lokal).
                        </p>
                    </td>
                </tr>
            </table>

            <?php submit_button('Simpan Pengaturan'); ?>
        </form>
    </div>
    <?php
}
