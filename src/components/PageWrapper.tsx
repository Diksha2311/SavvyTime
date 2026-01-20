import { motion } from "framer-motion";


interface PageWrapperProps {
  children: ReactNode;
}

const PageWrapper = ({ children }: PageWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.3, 
        ease: [0.25, 1, 0.5, 1] 
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;