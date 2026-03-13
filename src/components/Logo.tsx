import Image from 'next/image'
import clsx from 'clsx'

export function Logo({
  className,
  showText = true,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { showText?: boolean }) {
  return (
    <div
      className={clsx('flex h-16 items-center gap-2 sm:h-[4.5rem]', className)}
      {...props}
    >
      <Image
        src="/Zenvana%20logo/zenvana_exact_match.svg"
        alt="Zenvana"
        width={140}
        height={60}
        className="h-full w-auto object-contain"
        priority
      />
    </div>
  );
}
