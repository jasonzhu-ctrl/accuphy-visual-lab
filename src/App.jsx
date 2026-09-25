import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { experiments } from './experiments'

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1))
  useEffect(() => {
    const onChange = () => setHash(window.location.hash.slice(1))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

function Gallery() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Accuphy Lab</h1>
        <p className="mt-2 text-neutral-500">Design experiments for accuphy.ca. Pick one to open.</p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {experiments.map((e, i) => (
            <motion.li
              key={e.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <a
                href={`#${e.slug}`}
                className="block rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="font-medium">{e.title}</div>
                <div className="mt-1 text-sm text-neutral-500">{e.description || e.slug}</div>
              </a>
            </motion.li>
          ))}
        </ul>
      </div>
    </main>
  )
}

export default function App() {
  const hash = useHash()
  const current = experiments.find((e) => e.slug === hash)
  if (!current) return <Gallery />
  const { Component } = current
  return (
    <>
      <a
        href="#"
        className="ac-back fixed left-4 top-4 z-50 px-3.5 py-1.5 text-xs font-semibold text-white"
      >
        ← Lab
      </a>
      <Component />
    </>
  )
}
