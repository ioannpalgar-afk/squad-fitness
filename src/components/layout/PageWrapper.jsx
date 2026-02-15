import { motion } from 'framer-motion'

export default function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`px-4 pb-24 pt-6 ${className}`}
    >
      {children}
    </motion.div>
  )
}
