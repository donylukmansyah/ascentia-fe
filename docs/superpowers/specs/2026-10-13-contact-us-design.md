# Contact Us

Approved in conversation: implement the existing site patterns, use the company-published Google Maps iframe for the detailed Jakarta map, accept Google's original map colors and marker.

## Layout

- `/contact-us` keeps the existing header and footer.
- Hero matches About Us: breadcrumb, heading, orange content anchor, dark photographic overlay, scroll parallax, reduced-motion support. Image: `/images/contact-us/contact-us.webp`.
- Reuse Home's contact panel, overlapping the hero inside the existing `max-w-7xl` container. Tint the form side subtly. Remove the redundant full-contact-page link here; office link points to the detailed map.
- Reuse About's Indonesia locations section in a contained layout. Keep Jakarta and Kendari markers and their office information. Do not change the About page layout.
- Render a full-width Google Maps iframe for Jakarta below the locations section. Keep the address and orange Get directions CTA outside the iframe so Google's place card, controls and attribution remain unobscured. Stack the address and CTA on mobile.

## Integration and limits

- Use the iframe URL extracted from `https://ascentia.co.id/contact-us/`, not an invented embed URL. No Google SDK, new dependency, API key or billing setup.
- Iframe has a meaningful title, lazy loading, strict-origin referrer policy, fullscreen support, responsive width and fixed responsive height.
- Directions opens Google Maps for the published company listing, using its place ID. Company address remains No.88, matching the official website.
- Existing Indonesia basemap remains MapLibre/CARTO. Its deployment key/usage permission is an existing production concern; do not claim the keyless endpoint is approved.
- Correct Jakarta's existing approximate pin to the company-linked listing coordinates `[106.7614046, -6.1972135]`. Kendari coordinates remain unchanged, not newly verified.
- No email backend is included. Native form validation remains. Submission must explicitly say the message was not sent and offer the existing email contact; preserve entered data.

## Verification

One runnable Python Playwright smoke check covers desktop/tablet/mobile layout, About hero parity, correct asset, contact panel reuse, native form validation and honest submission status, contained locations map, full-width Google iframe attributes, directions link and reduced motion. Run typecheck, lint, targeted formatting check and production build. Verify screenshots and unchanged Home/About behavior.
