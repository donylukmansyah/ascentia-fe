import { LogoLoader } from '#/components/ui/logo-loader'
import logoMark from '../../../public/brand/logo-mark.png?inline'

export function RouteLoading() {
  return (
    <div
      aria-busy="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background p-5"
    >
      <LogoLoader src={logoMark} label="Loading page…" />
    </div>
  )
}
