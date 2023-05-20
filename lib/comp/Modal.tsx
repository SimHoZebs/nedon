import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const Modal = (props: Props) => {
  return (
    <div
      className="absolute z-10 w-screen bg-opacity-70 backdrop-blur-sm h-screen top-0 left-0 bg-zinc-900 flex items-center justify-center"
      onClick={(e) => {
        props.setShowModal(false);
        e.stopPropagation();
      }}
    >
      <div
        className="bg-zinc-900 flex flex-col w-1/2 h-1/2 p-3 shadow-lg shadow-zinc-950 gap-y-3"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {props.children}
      </div>
    </div>
  );
};

export default Modal;
