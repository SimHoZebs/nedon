import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const Modal = (props: Props) => {
  return (
    <div
      className="absolute left-0 top-0 z-10 flex h-screen w-screen items-center justify-center bg-zinc-900 bg-opacity-70 backdrop-blur-sm"
      onMouseDown={(e) => {
        props.setShowModal(false);
        e.stopPropagation();
      }}
    >
      <div
        className="flex h-fit w-3/5 flex-col gap-y-3 rounded-md bg-zinc-900 p-3 shadow-lg shadow-zinc-950"
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
