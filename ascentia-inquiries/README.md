# Ascentia Inquiries

WordPress plugin for contact and RFQ submissions from the Ascentia headless frontend.

The plugin stores every submission as an `ascentia_inquiry` post, queues an HTML email notification, and exposes two public REST endpoints for the frontend.

## Requirements

- WordPress 6.0+
- PHP 7.4+
- MySQL or MariaDB with `GET_LOCK` support

No Composer or runtime dependencies are required.

## Structure

```text
ascentia-inquiries/
├── ascentia-inquiries.php      # plugin header, constants, bootstrap
├── uninstall.php               # data retention policy
├── includes/
│   ├── bootstrap.php
│   ├── post-type.php
│   ├── helpers.php
│   ├── analytics.php
│   ├── email.php
│   ├── email-template.php
│   ├── rest-contact.php
│   ├── rest-analytics.php
│   ├── admin-settings.php
│   └── admin-inquiries.php
├── languages/
├── README.md
└── CHANGELOG.md
```

## Submission Flow

1. Frontend submits JSON to `POST /wp-json/ascentia/v1/contact`.
2. The plugin checks the honeypot, sanitizes input, and validates required fields.
3. When `submission_id` is present, the plugin acquires a MySQL named lock.
4. The plugin returns the existing post when the submission was already processed.
5. Otherwise it inserts the inquiry, builds the HTML email, and stores the email payload.
6. The email is queued through WP-Cron and sent with `wp_mail`.
7. Email status is stored on the inquiry as `pending`, `sent`, or `failed`.

The lock prevents duplicate posts when two identical requests arrive at the same time. If the lock cannot be acquired within 5 seconds, the endpoint returns HTTP 409 so the frontend can retry. If `GET_LOCK` is unavailable, the request continues without the lock.

## REST API

### `POST /wp-json/ascentia/v1/contact`

Accepted JSON fields:

- `name` required
- `email` required, valid email
- `message` required
- `type` optional, `contact` or `quote`
- `company` optional
- `phone` optional
- `product` optional
- `submission_id` optional, `[A-Za-z0-9_-]{8,64}`
- `_hp_field` honeypot, must be empty

Successful response:

```json
{
  "success": true,
  "message": "Permintaan Anda berhasil diterima.",
  "id": 123
}
```

Duplicate response:

```json
{
  "success": true,
  "message": "Permintaan Anda sudah diterima.",
  "id": 123,
  "duplicate": true
}
```

### `GET|POST /wp-json/ascentia/v1/page-view`

`GET` returns the current view count. `POST` increments it.

When an analytics key is configured, `POST` must send the `x-ascentia-analytics-key` header.

## Data Model

Custom post type:

- `ascentia_inquiry`

Post meta:

- `_inquiry_type`
- `_inquiry_name`
- `_inquiry_company`
- `_inquiry_email`
- `_inquiry_phone`
- `_inquiry_product`
- `_inquiry_message`
- `_inquiry_submission_id`
- `_inquiry_email_status`
- `_inquiry_email_payload`

Options:

- `ascentia_notification_emails`
- `ascentia_total_views`
- `ascentia_analytics_key`

Cron hook:

- `ascentia_send_inquiry_notification`

## Configuration

Open **Pesan Masuk > Pengaturan Email** in WP-Admin to set:

- Notification recipients, comma separated
- Total page views
- Analytics key

SMTP delivery is handled by FluentSMTP. Configure it under **FluentSMTP > Settings** before testing email.

For reliable email delivery, run WP-Cron from the server:

```cron
*/5 * * * * /usr/local/bin/php /home/USER/cms.ascentia.co.id/wp-cron.php >/dev/null 2>&1
```

Then add this to `wp-config.php`:

```php
define('DISABLE_WP_CRON', true);
```

Optional constants:

```php
define('ASCENTIA_INQUIRIES_LOCK_TIMEOUT', 5);
define('ASCENTIA_INQUIRIES_REMOVE_DATA_ON_UNINSTALL', false);
```

## Install and Update

1. Build a zip whose top-level folder is `ascentia-inquiries/`.
2. In WP-Admin, open **Plugins > Add Plugin > Upload Plugin**.
3. Upload the zip, install, and activate.
4. To update, upload the new zip and choose **Replace current with uploaded**.

Updating replaces plugin files only. Inquiries, options, and settings remain in the database.

## Testing Checklist

- Activate the plugin and confirm the **Pesan Masuk** menu exists.
- Open **Pengaturan Email**, save recipients, and reload the page.
- Submit a contact form and confirm the post appears in **Pesan Masuk**.
- Submit a product quote and confirm the product name is stored.
- Submit the same `submission_id` twice and confirm the second response is `duplicate`.
- Confirm the email status changes from `pending` to `sent`.
- Use **Kirim ulang email** on a non-sent inquiry.
- Open a public page and confirm `page-view` increments.
- Confirm the HTML email renders correctly in Gmail and Outlook.

## Uninstall

Uninstalling keeps inquiry data by default. Set `ASCENTIA_INQUIRIES_REMOVE_DATA_ON_UNINSTALL` to `true` in `wp-config.php` before deleting the plugin to remove all inquiries and options.

Scheduled email events are always cleared on uninstall.
