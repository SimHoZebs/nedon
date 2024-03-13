import type React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  close: () => void;
}

const Modal = (props: Props) => {
  return (
    <div
      className="z-10 flex h-full w-full items-center overflow-hidden bg-zinc-950 bg-opacity-70 backdrop-blur-sm sm:justify-center"
      onMouseDown={(e) => {
        e.stopPropagation();
        props.close();
      }}
    >
      <div
        className="flex h-full w-full flex-col gap-y-2 overflow-y-auto rounded-xl bg-zinc-800 shadow-lg shadow-zinc-900 outline outline-1 outline-zinc-700 lg:h-4/5 lg:w-4/5"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        {props.children}
      </div>
    </div>
  );
};

export default Modal;
