'use client'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { SelectField, TextField } from '@/components/Fields'
import { Logo } from '@/components/Logo'
import { SlimLayout } from '@/components/SlimLayout'
import { type Metadata } from 'next'
import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { set } from 'react-hook-form'

// export const metadata: Metadata = {
//   title: 'Sign Up',
// }

export default function Register() {
  // const form = useForm({})

  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()

  const onSubmit = (e: any) => {
    e.preventDefault()
    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
        firstName: firstname,
        lastName: lastname,
        phone,
        email,
      })
      .then((res) => {
        console.log(res)
        setFirstname('')
        setLastname('')
        setPhone('')
        setEmail('')
        router.push('/')
      })
  }

  return (
    <SlimLayout>
      <div className="flex">
        <Link href="/" aria-label="Home">
          <Logo className="h-10 w-auto" />
        </Link>
      </div>
      <h2 className="mt-20 text-lg font-semibold text-gray-900">
        Get started for free
      </h2>
      {/* <p className="mt-2 text-sm text-gray-700">
        Already registered?{' '}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:underline"
        >
          Sign in
        </Link>{' '}
        to your account.
      </p> */}
      <form
        action="#"
        className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2"
      >
        <TextField
          label="First name"
          name="first_name"
          type="text"
          autoComplete="given-name"
          required
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
        />
        <TextField
          label="Last name"
          name="last_name"
          type="text"
          autoComplete="family-name"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          required
        />
        <TextField
          className="col-span-full"
          label="Phone number"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <TextField
          className="col-span-full"
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {/* <TextField
          className="col-span-full"
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        /> */}
        {/* <SelectField
          className="col-span-full"
          label="How did you hear about us?"
          name="referral_source"
        >
          <option>AltaVista search</option>
          <option>Super Bowl commercial</option>
          <option>Our route 34 city bus ad</option>
          <option>The “Never Use This” podcast</option>
        </SelectField> */}
        <div className="col-span-full">
          <Button
            onClick={onSubmit}
            type="submit"
            variant="solid"
            color="blue"
            className="w-full"
          >
            <span>
              Register <span aria-hidden="true">&rarr;</span>
            </span>
          </Button>
        </div>
      </form>
    </SlimLayout>
  )
}
