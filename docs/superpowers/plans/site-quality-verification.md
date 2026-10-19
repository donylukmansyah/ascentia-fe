# Site Quality Verification Plan

**Goal:** Fix measured production performance, accessibility and SEO defects; leave repeatable browser and Lighthouse evidence.

**Architecture:** Preserve routes, CMS contracts and visual structure. Test real production HTML and browser interactions; intercept contact submissions before they reach the server. Keep audit tools outside application dependencies.

**Constraints:** No real email/CMS writes, no commits, no generated route edits, no promise of a perfect score. Preserve unrelated untracked files. Use installed Python Playwright and temporary Lighthouse CLI tooling.

## Execution

- [ ] Record production Lighthouse mobile/desktop baseline and exact failing elements.
- [ ] Add `scripts/verify/verify-site-quality.py`: production-only HTTP/browser checks, responsive navigation/search, product/editorial flows, contact validation/failure/success with network interception, contrast and overflow checks. Save evidence outside the repo.
- [ ] Run failing checks before fixes. Add valid `public/robots.txt`, descriptive About CTA, accessible CTA text colors, correct image dimensions and compositor-friendly hero progress. Change other code only when measurements identify a defect.
- [ ] Rebuild and rerun browser checks, existing pure assertions, typecheck, scoped formatting/lint and Lighthouse. Compare identical mobile/desktop settings; report real scores and remaining limitations.
- [ ] Document runnable commands in README. Leave the production preview available separately from development; provide artifact and URL paths.
