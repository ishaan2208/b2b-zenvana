'use client'

import { formatPrice, discountPercent, splitTotalIntoBaseAndTax } from '@/lib/price'
import { cn } from '@/lib/utils'
import { PriceWithTax } from '@/components/PriceWithTax'

type PriceWithMarketRateProps = {
  /** Direct (payable) amount */
  amount: number
  /** Market rate (OTA / list price). When present and > amount, shows strikethrough + % off */
  marketAmount?: number
  /** Currency symbol, default ₹ */
  currency?: string
  /** Optional suffix e.g. " per room", " /night" */
  suffix?: string
  /** Size: sm, default, lg, xl, 2xl */
  size?: 'sm' | 'default' | 'lg' | 'xl' | '2xl'
  className?: string
  inline?: boolean
  /** Show base + tax breakup for the direct amount. Default true */
  showTaxBreakup?: boolean
  /** Where to show discount: 'badge' (pill) or 'inline' (text). Default 'badge' */
  discountVariant?: 'inline' | 'badge'
}

/**
 * E-commerce style price: market rate (strikethrough) + direct rate + percentage discount.
 * Use wherever we show room/plan rates so users see "₹X → ₹Y" and "Z% off" like MakeMyTrip/OTA.
 */
export function PriceWithMarketRate({
  amount,
  marketAmount,
  currency = '₹',
  suffix = '',
  size = 'default',
  className,
  inline = false,
  showTaxBreakup = true,
  discountVariant = 'badge',
}: PriceWithMarketRateProps) {
  const hasDiscount =
    marketAmount != null && marketAmount > amount && marketAmount > 0
  const percentOff = hasDiscount ? discountPercent(marketAmount, amount) : 0

  const sizeClasses = {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  }[size]

  if (!hasDiscount) {
    return (
      <PriceWithTax
        amount={amount}
        currency={currency}
        suffix={suffix}
        size={size}
        className={className}
        inline={inline}
        showTaxBreakup={showTaxBreakup}
      />
    )
  }

  const marketStr = formatPrice(marketAmount!)
  const discountLabel = `${percentOff}% off`
  const { base, tax } = splitTotalIntoBaseAndTax(amount)
  const baseStr = formatPrice(base)
  const taxStr = formatPrice(tax)
  const totalStr = formatPrice(amount)
  const taxSizeClasses = {
    sm: 'text-[10px]',
    default: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
    '2xl': 'text-lg',
  }[size]

  const directPriceContent = showTaxBreakup ? (
    <>
      <span className={cn(sizeClasses, 'font-medium text-foreground')}>
        {currency}
        {baseStr}
      </span>
      <span className={cn(taxSizeClasses, 'ml-1  text-sm text-[0.75em] font-normal text-muted-foreground')}>
        + {currency}
        {taxStr}{' '}
        <span className=" text-xs font-light text-muted-foreground">(GST)</span>
      </span>
    </>
  ) : (
    <span className={cn(sizeClasses, 'font-medium text-foreground')}>
      {currency}
      {totalStr}
    </span>
  )

  const content = (
    <>
      <span
        className={cn(
          sizeClasses,
          'font-medium text-muted-foreground line-through decoration-muted-foreground/80'
        )}
        aria-label={`Market rate ${currency}${marketStr}`}
      >
        {currency}
        {marketStr}
      </span>
      <span className="ml-1.5 inline-flex items-baseline gap-0.5">
        {directPriceContent}
      </span>
      {discountVariant === 'badge' && (
        <span
          className="ml-2 inline-flex items-center rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300"
          aria-label={`${percentOff} percent off`}
        >
          {discountLabel}
        </span>
      )}
      {discountVariant === 'inline' && (
        <span className="ml-1.5 text-sm text-muted-foreground">({discountLabel})</span>
      )}
      {suffix && (
        <span className={cn(sizeClasses, 'text-muted-foreground')}>{suffix}</span>
      )}
    </>
  )

  if (inline) {
    return (
      <span className={cn('inline-flex flex-wrap items-baseline gap-0.5', className)}>
        {content}
      </span>
    )
  }
  return (
    <span
      className={cn(
        'inline-flex flex-wrap items-baseline gap-0.5',
        className
      )}
    >
      {content}
    </span>
  )
}
