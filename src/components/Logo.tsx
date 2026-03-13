import Image from 'next/image'
import clsx from 'clsx'

export function Logo({
  className,
  showText = true,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { showText?: boolean }) {
  return (
    <div
      className={clsx('flex h-16 items-center gap-2 overflow-hidden sm:h-[4.5rem]', className)}
      {...props}
    >
      <Image
        src="/Zenvana%20logo/zenvana_exact_match.svg"
        alt="Zenvana"
        width={140}
        height={60}
        className="block h-full w-auto object-contain border-0 outline-none dark:[clip-path:inset(1px_0_0_1px)]"
        priority
      />
    </div>
  );
}
