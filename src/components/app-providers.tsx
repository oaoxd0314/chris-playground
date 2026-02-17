import { ThemeProvider } from '@/hooks/use-theme'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
