<?php

define('ABSPATH', __DIR__);

class WP_REST_Request {
    public function get_json_params() {
        return ['name' => 'Release test', 'email' => 'test@example.com', 'message' => 'Not delivered'];
    }
}

class WP_REST_Response {
    public $data;
    public $status;
    public function __construct($data, $status) {
        $this->data = $data;
        $this->status = $status;
    }
}

class WP_Error {
    public $code;
    public function __construct($code, $message, $data) {
        $this->code = $code;
    }
}

function add_action(...$args) {}
function sanitize_text_field($value) { return $value; }
function sanitize_email($value) { return $value; }
function sanitize_textarea_field($value) { return $value; }
function is_email($value) { return true; }
function ascentia_acquire_submission_lock($value) { return null; }
function ascentia_release_submission_lock($value) {}
function ascentia_find_inquiry_by_submission_id($value) { return 0; }
function wp_insert_post($args) { return 0; }
function is_wp_error($value) { return $value instanceof WP_Error; }
function ascentia_get_notification_recipients() { return []; }
function ascentia_build_inquiry_email(...$args) { return ''; }
function update_post_meta(...$args) {}

require __DIR__ . '/../../ascentia-inquiries/includes/rest-contact.php';
$result = ascentia_handle_contact_submission(new WP_REST_Request());
if (!($result instanceof WP_Error) || $result->code !== 'save_failed') {
    fwrite(STDERR, 'FAIL: failed wp_insert_post returned success: ' . json_encode($result) . PHP_EOL);
    exit(1);
}
echo 'PASS: failed insertion rejected; no database or email involved' . PHP_EOL;
