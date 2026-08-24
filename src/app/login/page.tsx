import { LoginForm } from '@/components/LoginForm'
import { BrandTile } from '@/components/Brand'

export const metadata = { title: 'Sign in' }

export default async function LoginPage(props: { searchParams: Promise<{ next?: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="glow-field flex min-h-screen flex-col items-center justify-center bg-header px-4 py-12">
      <div className="w-full max-w-sm animate-scale-in">
        <div className="mb-8 flex flex-col items-center text-white">
          <BrandTile className="h-12 w-12" />
          <h1 className="mt-4 text-xl font-bold">AWS UET Taxila Admin</h1>
          <p className="mt-1 text-center text-sm text-white/60">
            Sign in to manage builders and record evaluations.
          </p>
        </div>

        <div className="card card-pad">
          <LoginForm next={searchParams.next} />
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          Only programme organisers and mentors have accounts.
        </p>
      </div>
    </div>
  )
}
