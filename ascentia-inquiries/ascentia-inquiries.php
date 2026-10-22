<?php
/**
 * Plugin Name: Ascentia Inquiries (Contact & RFQ Submissions)
 * Description: Captures contact & RFQ submissions, stores in WP-Admin, and queues executive HTML email notifications.
 * Version: 2.5.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: PT Ascentia Arsya Analitika
 * License: Proprietary
 * Text Domain: ascentia-inquiries
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

define('ASCENTIA_INQUIRIES_VERSION', '2.5.0');
define('ASCENTIA_INQUIRIES_FILE', __FILE__);
define('ASCENTIA_INQUIRIES_PATH', plugin_dir_path(__FILE__));

require_once ASCENTIA_INQUIRIES_PATH . 'includes/bootstrap.php';
