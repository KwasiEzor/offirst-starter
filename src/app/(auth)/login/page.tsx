import LoginForm from './LoginForm'

interface LoginPageProps {
  searchParams: Promise<{
    redirect?: string | string[]
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const redirectParam = params.redirect
  const redirectTo =
    typeof redirectParam === 'string' ? redirectParam : '/dashboard'

  return <LoginForm redirectTo={redirectTo} />
}
