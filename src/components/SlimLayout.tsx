import Image from 'next/image'

import backgroundImage from '@/images/background-auth.jpg'

export function SlimLayout({
  children,
  variant,
}: {
  children: React.ReactNode
  variant?: 'default' | 'error'
}) {
  const isError = variant === 'error'
  return (
    <>
      <div className="relative flex min-h-full shrink-0 justify-center md:px-12 lg:px-0">
        <div
          className={`relative z-10 flex flex-1 flex-col px-4 py-10 shadow-2xl sm:justify-center md:flex-none md:px-28 dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] ${isError
              ? 'bg-white text-black dark:bg-gray-900 dark:text-gray-200'
              : 'bg-card text-foreground'
            }`}
        >
          <main className="mx-auto w-full max-w-md sm:px-4 md:w-96 md:max-w-sm md:px-0">
            {children}
          </main>
        </div>
        <div className="hidden sm:contents lg:relative lg:block lg:flex-1">
          <Image
            className="absolute inset-0 h-full w-full object-cover"
            src={backgroundImage}
            alt=""
            unoptimized
          />
        </div>
      </div>
    </>
  )
}
