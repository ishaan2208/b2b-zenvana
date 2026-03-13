import Link from 'next/link'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Logo } from '@/components/Logo'

export default function NotFound() {
  return (
    <div className="shell flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">
        <section className="section-rule flex flex-1 flex-col items-center justify-center bg-background px-4 py-16 sm:py-20 lg:py-28">
          <div className="container-shell flex flex-col items-center text-center">
            <Link
              href="/"
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
              aria-label="Zenvana – Home"
            >
              <Logo className="h-20 w-auto sm:h-24 md:h-28 lg:h-32" />
            </Link>
            <div className="eyebrow mt-10 sm:mt-12">Error</div>
            <p className="mt-2 font-mono text-4xl font-semibold tabular-nums text-foreground sm:text-5xl md:text-6xl">
              404
            </p>
            <h1 className="display-title mt-4 text-2xl sm:text-3xl lg:text-4xl">
              Page not found
            </h1>
            <p className="body-copy mt-4 max-w-md">
              Sorry, we couldn’t find the page you’re looking for. Head back home
              to discover stays and book direct.
            </p>
            <div className="mt-8">
              <Link href="/" className="site-button-dark">
                Go back home
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
