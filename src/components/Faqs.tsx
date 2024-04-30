import Image from 'next/image'

import { Container } from '@/components/Container'
import backgroundImage from '@/images/background-faqs.jpg'

const faqs = [
  [
    {
      question: 'What is StaySystems?',
      answer:
        'StaySystems is a cutting-edge property management software designed to streamline operations, enhance guest experiences, and increase revenue for property managers and owners. It provides tools that simplify the work of front office staff and ensures the efficient management of your properties.',
    },
    {
      question:
        'How does StaySystems make the front office operations easier??',
      answer:
        'Our software automates many routine tasks, including reservations, guest check-in/check-out, and billing, which significantly reduces manual workload and minimizes the chance of human error. This allows front office staff to focus more on providing exceptional service to guests.',
    },
    {
      question: 'Can StaySystems help in preventing revenue leakage and theft?',
      answer:
        'Yes, StaySystems includes robust security features and detailed auditing capabilities to track all transactions and interactions. This transparency helps prevent any potential revenue leakage and theft, ensuring financial safety and integrity.',
    },
  ],
  [
    {
      question: 'In what ways does StaySystems enhance guest experiences?',
      answer:
        'StaySystems enhances guest experiences by enabling seamless interactions from booking to check-out. Our platform includes features for personalized service, such as tailored recommendations and efficient issue resolution, ensuring every guest feels valued and well cared for.',
    },
    {
      question: 'How can StaySystems increase our property’s revenue?',
      answer:
        'By improving operational efficiency and guest satisfaction, StaySystems helps increase repeat bookings and positive reviews. Additionally, our analytics tools provide insights into revenue management, helping you make data-driven decisions to optimize pricing and promotions.',
    },
    {
      question: 'Is StaySystems suitable for all types of properties?',
      answer:
        'Absolutely! StaySystems is versatile and can be tailored to meet the needs of various types of properties, including hotels, resorts, vacation rentals, and residential complexes.',
    },
  ],
  [
    {
      question: 'What support does StaySystems offer to its users?',
      answer:
        'We provide 24/7 customer support through multiple channels including phone, email, and live chat. Our dedicated team is always ready to help you with any questions or issues you may encounter.',
    },
    {
      question: 'How can I get started with StaySystems?',
      answer:
        'Getting started is easy! Contact our sales team through our website, and we’ll guide you through the setup process. We offer a variety of training resources and support to ensure a smooth transition and successful implementation.',
    },
  ],
]

export function Faqs() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-32"
    >
      <Image
        className="absolute left-1/2 top-0 max-w-none -translate-y-1/4 translate-x-[-30%]"
        src={backgroundImage}
        alt=""
        width={1558}
        height={946}
        unoptimized
      />
      <Container className="relative">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2
            id="faq-title"
            className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl"
          >
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            If you can’t find what you’re looking for, email our support team at{' '}
            <a
              href="mailto:support@staysytems.in"
              className=" italic text-indigo-500"
            >
              support@staysytems.in
            </a>
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3"
        >
          {faqs.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role="list" className="flex flex-col gap-y-8">
                {column.map((faq, faqIndex) => (
                  <li key={faqIndex}>
                    <h3 className="font-display text-lg leading-7 text-slate-900">
                      {faq.question}
                    </h3>
                    <p className="mt-4 text-sm text-slate-700">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
