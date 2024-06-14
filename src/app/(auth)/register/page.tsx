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
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()

  const onSubmit = (e: any) => {
    setLoading(true)
    e.preventDefault()
    // router.push('/thankyou')
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
        router.push('/thankyou')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <SlimLayout>
      <div className="flex">
        <Link href="/" aria-label="Home">
          <Logo className="h-24 w-auto" />
        </Link>
      </div>
      {loading ? (
        <h1 className=" text-lg font-bold text-red-500">
          Please do not refresh the page or go back form is getting submitted
        </h1>
      ) : (
        <>
          <div className=" flex w-full flex-col items-center space-y-6">
            <h2 className="mt-6 text-center text-lg font-semibold text-gray-900">
              Get started for free by filling the form or by calling us at{' '}
            </h2>
            <Button color="blue" className=" mt-4">
              <a href="tel:+91 9084702208" className="text-white">
                +91 9084702208
              </a>
            </Button>
            <h1>Or</h1>
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
              className="mt-10 grid w-full grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2"
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
          </div>
        </>
      )}
    </SlimLayout>
  )
}
