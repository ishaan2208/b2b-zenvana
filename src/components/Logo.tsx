import Image from 'next/image'
import clsx from 'clsx'

export function Logo({
  className,
  showText = true,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { showText?: boolean }) {
  return (
    <div
      className={clsx('flex items-center gap-2', className)}
      {...props}
    >
      <Image
        src="/Zenvana%20logo/zenvana_exact_match.svg"
        alt="Zenvana"
        width={140}
        height={60}
        className="h-16 w-auto object-contain sm:h-18 rounded-full border-none background-transparenbut keep "
        priority
      />
    </div>
  );
}
