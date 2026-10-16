# Contact Us map research

Research only. No application changes. 9router search/fetch unavailable (no configured routes); fallback web tools used. Scope: existing About hero, Home contact panel, contained Indonesia “Our Locations”, then full-width Jakarta neighborhood map.

## Location evidence

[Ascentia’s official Contact Us page](https://ascentia.co.id/contact-us/) confirms: **Business Park Kebon Jeruk D2-12 Jl. Meruya Ilir No. 88 Meruya, Jakarta Barat 11620**. It also lists Kendari: Jl. Malaka Kawasan Citraland Kendari, Blok A01/015, Kendari, Sulawesi Tenggara.

Its HTML embeds [this Google Maps business map](https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.499615793719!2d106.75899919999999!3d-6.1976212!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f732cee5f301%3A0xd5820281aa2b0926!2sPT%20ASCENTIA%20ARSYA%20ANALITIKA!5e0!3m2!1sen!2sid!4v1660119025592!5m2!1sen!2sid). Fetching that iframe’s actual HTML identifies **PT ASCENTIA ARSYA ANALITIKA**, matching Ascentia’s website and phone, with business coordinates **latitude -6.1972135, longitude 106.7614046** and place ID `ChIJAfPlzjL3aS4RJgkrqoECgtU`.

Therefore the evidence-backed MapLibre candidate is **[106.7614046, -6.1972135]**. Existing **[106.753, -6.1657]** lies roughly 3.6 km away; it is not supported by the company-linked business map. The iframe URL’s `106.75899919999999,-6.1976212` is not the business position: use the returned entity coordinates, not URL viewport values. Google lists street number **No.1**, while Ascentia publishes **No.88**; preserve company copy pending owner confirmation. Coordinates identify the listed business, not a surveyed entrance. Kendari’s exact pin remains unverified.

## Exactly two implementation options

### 1. Reuse MapLibre GL / CARTO Positron — preferred visual fit

Installed `maplibre-gl ^6.13.0`; `src/components/ui/map.tsx` already supplies OfficeMap, HTML pins, DOM popups, cooperative gestures, compact attribution. No new dependency needed. [MapLibre’s marker example](https://maplibre.org/maplibre-gl-js/docs/examples/add-custom-icons-with-markers/) and [popup example](https://maplibre.org/maplibre-gl-js/docs/examples/display-a-popup/) support this approach.

[CARTO describes Positron](https://github.com/CartoDB/basemap-styles) as light gray, suitable for point data. The [existing style JSON](https://basemaps.cartocdn.com/gl/positron-gl-style/style.json) is near-white, but not screenshot-exact: background `#fafaf8`, buildings `#dfdfdf`, some roads white. [Map.setPaintProperty/setLayoutProperty](https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/) permit selective gray roads, white blocks, subdued labels after style load. Custom HTML pin **#288AC6**, separate address card, orange **#F28B3B** directions CTA stay fully controllable. Avoid whole-container grayscale: it also desaturates the pin/card. Keep address and directions accessible outside interactive map content.

**Provider blocker:** current CARTO repository says an API key is required; commercial free tier is up to 1M tile requests/month. [Basemap terms](https://carto.com/legal/basemap-terms/) require issued-key acceptance and CARTO + OpenStreetMap attribution. A working keyless endpoint does not establish production permission. Confirm permitted browser basemap-key configuration with CARTO; never expose privileged platform credentials. [TileJSON](https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json) carries both credits. Preserve attribution control, unobscured by the card; verify compact expansion on mobile.

### 2. Google Maps iframe — simplest fallback, weaker match

[Google’s share/embed workflow](https://support.google.com/maps/answer/144361) supplies copyable iframe HTML; the company already uses it. Distinguish this from [Maps Embed API](https://developers.google.com/maps/documentation/embed/embedding-map), whose `/embed/v1/` URLs require an API key. Neither needs a React dependency. Published iframe avoids adding privileged credentials, but offers no documented arbitrary road/building palette or custom blue-marker interface. Parent CSS cannot style cross-origin internals; grayscale affects Google’s own marker too. An external orange CTA/address card is possible, but cannot replace or obscure Google attribution/UI. The documented API minimum is 200×200 px.

## Recommendation / gates

Reuse MapLibre for both scales, retaining existing hero/contact modules. Resolve CARTO commercial/key terms first; confirm Jakarta address discrepancy and business pin with owner. If provider approval cannot be obtained, use the company-linked Google iframe with an explicitly accepted palette/pin compromise. Verify neighborhood coverage and responsive attribution during implementation; this research did not inspect screenshots or run visual tests.
