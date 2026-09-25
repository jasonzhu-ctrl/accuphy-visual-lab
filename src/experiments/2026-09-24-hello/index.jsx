import { motion } from 'framer-motion'

export const meta = {
  title: 'Hello',
  description: 'Placeholder — proves the stack works (React + Tailwind + Framer Motion).',
}

export default function Hello() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 text-neutral-900">
      <motion.h1
        className="text-4xl font-semibold tracking-tight"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        Accuphy Lab
      </motion.h1>
    </main>
  )
}
