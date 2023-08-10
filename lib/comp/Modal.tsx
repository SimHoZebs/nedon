import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const Modal = (props: Props) => {
  return (
    <div
      className="absolute left-0 top-0 z-10 flex h-[100dvh] w-[100dvw] items-center overflow-hidden bg-zinc-950 bg-opacity-70 backdrop-blur-sm sm:justify-center"
      onMouseDown={(e) => {
        props.setShowModal(false);
        e.stopPropagation();
      }}
    >
      <div
        className="flex h-full w-full flex-col gap-y-2 rounded-xl bg-zinc-800 p-4 shadow-lg shadow-zinc-900 outline outline-1 outline-zinc-700 sm:h-4/5 sm:w-4/5"
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
