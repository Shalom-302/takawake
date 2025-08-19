import { motion } from "framer-motion";

const AnimateCheck = () => {
    return (
        <motion.svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <motion.path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, pathOffset: 1 }}
                animate={{ pathLength: 1, pathOffset: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            />
        </motion.svg>
    );
};

export default AnimateCheck;
