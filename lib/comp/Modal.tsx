import { motion } from "framer-motion";
import type React from "react";
import { twMerge } from "tailwind-merge";

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

const Modal = (props: Props) => {
  return (
    <motion.div
      className={twMerge(
        `pointer-events-auto z-20 flex h-full w-full flex-col overflow-y-auto bg-zinc-900 shadow-lg shadow-zinc-900 lg:h-4/5 lg:w-4/5 lg:rounded-3xl lg:border lg:border-zinc-500 ${props.className}`,
      )}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      initial={{ opacity: 1, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{
        duration: 0.1,
        ease: "linear",
        scale: {
          type: "spring",
          damping: 25,
          stiffness: 250,
          restDelta: 0.01,
        },
      }}
    >
      {props.children}
    </motion.div>
  );
};

export default Modal;
