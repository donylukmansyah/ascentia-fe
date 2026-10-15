import { LogoLoader } from '#/components/ui/logo-loader'

export function RouteLoading() {
  return (
    <div
      aria-busy="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-5"
    >
      <LogoLoader src="/brand/logo-mark.png" label="Loading page…" />
    </div>
  )
}
