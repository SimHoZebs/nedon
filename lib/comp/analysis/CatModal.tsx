import catStyleArray from "@/util/catStyle";
import type { TreedCatWithTx } from "@/util/types";
import { CloseBtn } from "../Button";
import { H2 } from "../Heading";
import Input from "../Input";
import Modal from "../Modal";

interface Props {
  setShowModal: (show: boolean) => void;
  modalData: TreedCatWithTx;
}

const CatModal = (props: Props) => {
  return (
    <Modal>
      <div className="flex flex-col gap-y-2 items-start p-1">
        <div className="flex w-full justify-end">
          <CloseBtn
            onClose={() => {
              props.setShowModal(false);
            }}
          />
        </div>
        <div className="flex gap-x-3">
          <span
            className={`h-8 w-8 ${catStyleArray[props.modalData.name].icon} ${
              catStyleArray[props.modalData.name].textColor
            }`}
          />
          <H2>{props.modalData.name}</H2>
        </div>

        <div>
          <p>Budget</p>
          <Input className="border border-zinc-700 rounded-md" type="number" />
        </div>

        {props.modalData.subCatArray.length > 0 && (
          <details className="flex flex-col gap-y-2">
            <summary>Sub categories</summary>
            <pre className="text-sm">
              {JSON.stringify(props.modalData.subCatArray, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </Modal>
  );
};
export default CatModal;
