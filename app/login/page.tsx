import LoginForm from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <center><h1 className="text-pretty text-3xl font-semibold text-zinc-100">Welcome to SolarWatch</h1></center>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
