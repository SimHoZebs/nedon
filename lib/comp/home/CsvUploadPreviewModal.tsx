import { trpc } from "@/util/trpc";

import type { UnsavedTx } from "@/types/tx";

import { ActionBtn } from "../Button";
import Modal from "../Modal";

interface Props {
  unsavedTxArray: UnsavedTx[];
}

const CsvUploadPreviewModal = (props: Props) => {
  const createManyTx = trpc.tx.createMany.useMutation();
  const queryClient = trpc.useUtils();

  return (
    <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <Modal className="overflow-hidden">
        <div className="sticky top-0 bg-zinc-800 p-3">
          <ActionBtn
            onClickAsync={async () => {
              await createManyTx.mutateAsync(props.unsavedTxArray);
              await queryClient.tx.getAll.invalidate();
            }}
          >
            Upload
          </ActionBtn>
        </div>

        <div className="flex w-full justify-center overflow-y-scroll p-4">
          <table className="table-fixed border-separate border-spacing-x-3">
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Account</th>
            </tr>

            {props.unsavedTxArray.map((tx) => (
              <tr key={tx.name}>
                <td>{tx.name}</td>
                <td>{tx.date}</td>
                <td>{tx.amount}</td>
                <td>{tx.catArray.at(-1)?.name}</td>
                <td>{tx.accountId}</td>
              </tr>
            ))}
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default CsvUploadPreviewModal;
