import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center px-6">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Welcome to Your App</h1>
        <p className="text-xl text-gray-400 mb-8">Start building something amazing</p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>
            Edit{' '}
            <code className="px-2 py-1 bg-slate-700 rounded text-cyan-400">
              src/routes/index.tsx
            </code>{' '}
            to get started
          </p>
        </div>
      </div>
    </div>
  )
}
