# WordPress Content Model and Frontend Data Flow

## Purpose

Ascentia is a headless redesign. WordPress and WooCommerce remain the editor
and source of truth; this frontend owns the public UI, route structure, and
presentation.

Do not parse Divi page-builder output for the new site. Model content through
WooCommerce fields, taxonomies, and REST-visible ACF fields instead.

## Read flow

```text
WordPress / WooCommerce
  → public REST response
  → feature-owned API mapper
  → typed frontend model
  → React UI
```

- `routes/` handle URL params, search params, route loaders, and composition.
- `features/products/` will own product requests, mapping, list/detail UI, and
  filtering.
- `features/articles/` will own shared news/blog requests, mapping, list/detail
  UI, and filtering.
- `lib/wordpress.ts` will contain only generic request helpers once integration
  begins; it must not contain product or article presentation logic.
- Public product reads use the WooCommerce Store API. Never expose WooCommerce
  consumer keys, WordPress passwords, or privileged tokens in `VITE_*` values.
- Test CORS from the real deployed frontend origin. If public browser fetches
  are blocked, fetch through a server-side route instead.

## Product model

WooCommerce supplies the canonical commerce fields:

| Content            | WordPress source               |
| ------------------ | ------------------------------ |
| Name, slug, status | WooCommerce product            |
| Primary image      | Product image                  |
| Supporting images  | Product gallery                |
| Short card copy    | Short description              |
| Brand              | Product taxonomy               |
| Type               | Product taxonomy               |
| Applications       | Product taxonomy, multi-select |
| Related products   | Related/curated product IDs    |

A product can belong to several applications. Example: one fusion machine may
be used for Mining, Cement, Geochemical Analysis, and Quality Control. It will
therefore appear on each matching application listing.

### Product detail fields

Use one ACF field group assigned to WooCommerce Products. Enable **Show in REST
API** in that field group's settings.

| Field name            | ACF Free field type | Required | Frontend use                      |
| --------------------- | ------------------- | -------- | --------------------------------- |
| `product_summary`     | Textarea            | No       | Detail-page introduction          |
| `product_description` | WYSIWYG             | No       | Description tab/body              |
| `key_benefits`        | WYSIWYG             | No       | Benefit list in description       |
| `specifications`      | WYSIWYG             | No       | Specifications tab                |
| `video_url`           | URL or oEmbed       | No       | Embed only when present           |
| `brochure_file`       | File                | No       | Download button only when present |
| `hero_image`          | Image               | No       | Detail-page hero override         |

The existing WooCommerce gallery remains the product image gallery. It does
not need ACF Pro.

### ACF Free limitation

ACF Free does not provide the editor-friendly repeater/flexible-content setup
needed for a specification table with arbitrary add/remove rows.

Until ACF Pro is approved:

- Write `specifications` as a controlled WYSIWYG table or definition list.
- Write benefits as a controlled WYSIWYG list.
- Keep product applications as the native multi-select taxonomy.
- Do not invent a JSON text field for editors.

If admins need an add-row specification editor later, upgrade to ACF Pro or
build a deliberately maintained custom WordPress metabox/plugin. Do not change
the frontend contract without a migration plan.

## Rich text safety

WordPress WYSIWYG and WooCommerce descriptions return HTML, not structured
JSON. The frontend may render that content only after sanitization.

- Use the already-installed `sanitize-html` package.
- Maintain a small explicit allowlist: paragraphs, headings, emphasis, strong,
  ordered/unordered lists, list items, links, blockquotes, tables, images, and
  safe media embeds if approved.
- Reject scripts, inline event handlers, iframes from unknown hosts, and unsafe
  URL schemes.
- Rich text supplies document body only. It must not control page layout,
  navigation, cards, tabs, or arbitrary CSS classes.

## Articles, news, and blogs

Use the core WordPress post endpoint for editorial content only after the
publishing model is verified.

Recommended initial model:

- One WordPress Post type.
- `news` and `blog` are categories/taxonomies.
- Shared fields: title, slug, excerpt, featured image, author, published date,
  reading time, categories, and rich body.
- The frontend's `features/articles/` owns the mapper and UI. News and Blogs
  are filters/views of the same domain until WordPress content proves they need
  separate post types.

Do not consume legacy Divi page content as an article feed.

## Optional future work

- Homepage/About editable fields can use separate ACF groups on Pages after the
  final section designs and editor workflow are agreed.
- Visitor counting is a later server-side analytics concern. Never increment a
  public counter directly in browser local state or expose a write credential.
  Define bot filtering, repeat-visit policy, consent, storage, and reporting
  before implementation.

## Implementation order

1. Finalize the product detail design and field names above.
2. Create WordPress taxonomies: Brand, Type, Application.
3. Add and REST-enable the product ACF field group.
4. Inspect actual REST responses and write frontend types plus mappers.
5. Build product listing/detail UI against fixture data, then connect REST.
6. Confirm editorial post/category workflow and implement Articles.
7. Add analytics/counter only after product and editorial content are stable.
