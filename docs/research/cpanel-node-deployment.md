# cPanel deployment: Ascentia frontend

## Findings

- `pnpm start` fails because the current `package.json` has no `scripts.start`
  and no fallback `server.js`. Reproduced locally with exit code 1:
  `ERR_PNPM_NO_SCRIPT_OR_SERVER`.
- The existing build is a Node server, not a static export.
  `.output/nitro.json` identifies `preset: node-server` and
  `serverEntry: server/index.mjs`.
- The production entry point is `node .output/server/index.mjs`. Nitro documents
  this command and deployment of the complete standalone `.output` directory.
  It supports `PORT`/`NITRO_PORT` and `HOST`/`NITRO_HOST`. [1]
- Local smoke check started that existing entry point on `127.0.0.1:43219`;
  `GET /robots.txt` returned HTTP 200. This proves startup and static serving,
  not every SSR page, WordPress connectivity, or cPanel compatibility.
- `vite preview` is for local preview, not the production server. [2]

## Immediate local command

With an existing build:

```sh
node .output/server/index.mjs
```

To support `pnpm start`, the proposed package script is:

```json
"start": "node .output/server/index.mjs"
```

This research does not modify `package.json` or deployment configuration.

## Can cPanel host it?

Yes, conditionally. The hosting plan must provide a persistent Node.js
application runtime and HTTP routing to it. cPanel Application Manager uses
Phusion Passenger; hosting providers can enable or disable the interface. [3]
A PHP/static-only plan cannot run this build merely by uploading files to
`public_html`. Uploading only `.output/public` also omits the server used by
SSR and server functions. [1]

There are different deployment interfaces:

- **CloudLinux Setup Node.js App:** Node.js Selector uses Passenger. Its docs
  warn about ESM startup loading and document a CommonJS wrapper using dynamic
  import. Nitro's entry is ESM (`.mjs`), so a wrapper may be needed. [4]
- **cPanel Application Manager:** Passenger defaults to `app.js`. A different
  startup filename requires Passenger configuration; on shared hosting, the
  provider may need to configure this. Do not assume this interface has the
  same startup controls as CloudLinux. [5]
- **Newer cPanel Meridian Node.js deployment:** official docs describe Git/ZIP
  deployment, Node version selection, package manager detection, build output,
  runtime environment variables, and managed application processes. Availability
  depends on the hosting account. [6]

## Conditional Passenger setup

For a panel that allows setting a startup filename, keep the complete
`.output` under the application root. A possible `app.cjs` startup wrapper:

```js
import('./.output/server/index.mjs').catch((error) => {
  console.error(error)
  process.exit(1)
})
```

Set startup file to `app.cjs`, application mode to production, and restart via
its application manager. This follows CloudLinux's documented ESM workaround;
this project's wrapper has not been tested on the user's hosting. [4]
Passenger manages application port binding; do not expose port 3000 publicly
as a substitute for domain routing. [5]

Use a Node version compatible with the installed dependencies. The installed
Vite package currently requires `^20.19.0 || >=22.12.0` for builds; Node
22.12+ is a suitable baseline to request from the host. Build on Linux/CI when
platform-specific dependencies are involved instead of copying Windows
`node_modules` to Linux.

Set runtime environment variables through the hosting interface:

- `NODE_ENV=production`
- `WORDPRESS_URL` pointing to the publicly reachable production WordPress
  origin, not the development `http://ascentia-local.local` value.

Do not expose source files, `.env`, or the server bundle as downloadable files.
Keep application files outside the public document root where supported;
serve public assets through the configured app/public directory.

## Information still needed

A screenshot of cPanel's available Node.js interface, available Node versions,
and hosting provider/plan. Without these, support is conditional, not verified.
The local startup check does not establish production WordPress availability.

## Sources

1. Nitro Node.js deployment: https://nitro.build/deploy/runtimes/node
2. Vite production preview warning: https://vite.dev/guide/static-deploy
3. cPanel Application Manager: https://docs.cpanel.net/cpanel/software/application-manager/
4. CloudLinux Node.js Selector requirements and ESM limitation: https://docs.cloudlinux.com/cloudlinuxos/cloudlinux_os_components/#node-js-selector
5. cPanel Node.js application startup and Passenger port binding: https://docs.cpanel.net/knowledge-base/web-services/how-to-install-a-node.js-application/
6. cPanel Meridian Node.js deployment: https://docs.cpanel.net/cpanel/meridian/websites/deploy-a-website-with-nodejs/
