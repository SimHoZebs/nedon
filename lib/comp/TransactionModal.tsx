import React, { useState } from "react";
import { useStoreState } from "../util/store";
import { Transaction } from "plaid";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  modalData: Transaction;
}

const TransactionModal = (props: Props) => {
  const { currentGroup } = useStoreState((state) => state);

  const [userSplit, setUserSplit] = useState(100);
  const [otherSplit, setOtherSplit] = useState(0);
  return (
    <div
      className="absolute z-10 w-screen bg-opacity-70 backdrop-blur-sm h-screen top-0 left-0 bg-zinc-900 flex items-center justify-center"
      onClick={(e) => {
        props.setShowModal(false);
        e.stopPropagation();
      }}
    >
      <div
        className="bg-zinc-900 flex flex-col w-2/3 h-2/3 p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between ">
          <div>
            <div>{props.modalData.name}</div>

            <div className="font-light text-zinc-400 text-sm">
              {props.modalData.merchant_name}
            </div>

            <div>{props.modalData.date}</div>
          </div>

          <div className="flex gap-x-1">
            <div>{props.modalData.iso_currency_code}</div>
            <div>{props.modalData.amount * -1}</div>
          </div>
        </div>

        <div>
          {currentGroup?.userArray && (
            <details>
              <summary>Split</summary>
              <div>
                <div className="">
                  <div className="flex">
                    <div>{userSplit}%</div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={userSplit}
                      onChange={(e) => {
                        setUserSplit(parseInt(e.currentTarget.value));
                        setOtherSplit(100 - parseInt(e.currentTarget.value));
                      }}
                    />
                    <div>{currentGroup?.userArray[0].id.slice(0, 8)}</div>
                  </div>
                  <div className="flex ">
                    <div>{otherSplit}%</div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={otherSplit}
                      onChange={(e) => {
                        setUserSplit(100 - parseInt(e.currentTarget.value));
                        setOtherSplit(parseInt(e.currentTarget.value));
                      }}
                    />
                    <div>{currentGroup?.userArray[1].id.slice(0, 8)}</div>
                  </div>
                </div>
              </div>
            </details>
          )}
        </div>

        <details className="overflow-y-scroll">
          <summary>Raw Data</summary>
          <div className="whitespace-pre-wrap">
            {JSON.stringify(props.modalData, null, 2)}
          </div>
        </details>
      </div>
    </div>
  );
};

export default TransactionModal;
