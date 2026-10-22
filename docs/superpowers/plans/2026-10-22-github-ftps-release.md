# GitHub FTPS release plan

Scope: user-approved GitHub Actions build and encrypted upload using the three existing repository secrets. FTP account must be restricted to `/home/u1725665/ascentia-frontend`. No live cutover, automatic restart, WordPress overwrite, dependency changes, commit, push, or external login during implementation.

- [ ] Create manual-only `.github/workflows/deploy-ftp.yml`: Node 24, pinned actions, pnpm 10.32.1, frozen install, typecheck/lint/format, Node unit/boundary checks, production build and fixture SSR/contact tests. Archive `.output`, `app.js`, `package.json` including compressed/hidden assets. No `.env` or WP files.
- [ ] Separate upload job from build, default upload disabled. Require default branch and explicit folder confirmation; inject FTP secrets into upload step only. Audit high/critical findings block upload, not artifact generation. No audit bypass.
- [ ] Add stdlib FTPS uploader: validate inputs, enforce certificate and data TLS, reject WP/public_html roots, new unique `releases/<run-attempt-sha>` only, verify sizes, publish completion marker last, never delete/overwrite/restart. Test with local fake FTP, including conflict/TLS/write failure cases; no real FTP credentials used.
- [ ] Add one cPanel/GitHub guide showing secrets, manual run, artifact/security gate, release paths and initial Passenger configuration/rollback. Explain FTPS upload does not configure domains/environment or guarantee zero downtime.
- [ ] Run unit checks, workflow YAML/schema/static validation, typecheck/lint/format and build/fixture tests locally. Record unresolved hosting/auth/TLS/Passenger verification separately.
