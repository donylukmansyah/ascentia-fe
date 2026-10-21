# Changelog

## 2.5.0

- Split the single-file plugin into `includes/` modules.
- Added atomic idempotency locking with `GET_LOCK` and `RELEASE_LOCK`.
- Added `ASCENTIA_INQUIRIES_LOCK_TIMEOUT` for lock timeout.
- Added complete plugin header metadata and version constant.
- Added `README.md`, `CHANGELOG.md`, and `uninstall.php`.
- Kept inquiry data on uninstall unless explicitly opted in.
- Preserved REST contract, post meta, options, hooks, and email output.

## 2.4.0

- Added `submission_id` idempotency for contact and quote submissions.
- Added queued email status tracking (`pending`, `sent`, `failed`).
- Added resend email action in WP-Admin.
