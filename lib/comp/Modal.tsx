import { motion } from "framer-motion";
import type React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

const Modal = (props: Props) => {
  return (
    <motion.div
      className="pointer-events-auto z-10 flex h-full w-full flex-col gap-y-2 overflow-y-auto rounded-xl bg-zinc-800 shadow-lg shadow-zinc-900 outline outline-1 outline-zinc-700 lg:h-4/5 lg:w-4/5"
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
