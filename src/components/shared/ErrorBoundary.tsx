import { Link, useRouter } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ErrorBoundaryProps {
  error: Error
  reset?: () => void
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const router = useRouter()

  const handleReset = () => {
    if (reset) {
      reset()
    } else {
      router.invalidate()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="border-destructive w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <AlertCircle className="text-destructive h-16 w-16" />
          </div>
          <CardTitle className="text-3xl">Oops!</CardTitle>

          <CardDescription className="text-lg">
            Something went wrong
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-md p-3">
            <p className="text-destructive font-mono text-sm break-words">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleReset} variant="default" className="flex-1">
              Try Again
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
