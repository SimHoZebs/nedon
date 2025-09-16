import CreateUserBtn from "@/comp/user/CreateUserBtn";

import { trpc } from "@/util/trpc";

import { ActionBtn, Button } from "lib/comp/shared/Button";
import useAutoLoadUser from "lib/hooks/useAutoLoadUser";
import { useLocalStore } from "lib/store/localStore";

const DevPage = () => {
  const { user: appUser, isLoading: appUserIsLoading } = useAutoLoadUser();
  const allUsers = trpc.dev.getAllUsers.useQuery();
  const deleteAll = trpc.dev.deleteAllUsers.useMutation();
  const deleteUser = trpc.user.delete.useMutation();
  const addConnection = trpc.user.connection.add.useMutation();
  const removeConnection = trpc.user.connection.remove.useMutation();
  const queryClient = trpc.useUtils();
  const setUserId = useLocalStore((state) => state.setUserId);
  const isDev = process.env.NODE_ENV === "development";

  return isDev ? (
    <div className="flex flex-col gap-3">
      {allUsers.data ? "User list" : "Loading available accounts...."}
      {allUsers.data?.map((user) => (
        <div className="flex rounded-md bg-zinc-800 p-1" key={user.id}>
          <div>
            <p>Name: {user.name}</p>
            <p>id: {user.id}</p>
          </div>

          <Button
            className={`after:h-full after:w-px after:bg-zinc-500 ${
              appUser?.myConnectionArray?.find(
                (connection) => connection.id === user.id,
              )
                ? "text-pink-400"
                : "text-indigo-400"
            }`}
            onClickAsync={async (e) => {
              e.stopPropagation();
              if (appUserIsLoading || !appUser) {
                console.error("No app user");
                return;
              }

              appUser.myConnectionArray?.find(
                (connection) => connection.id === user.id,
              )
                ? await removeConnection.mutateAsync({
                    userId: appUser.id,
                    connectionId: user.id,
                  })
                : await addConnection.mutateAsync({
                    userId: appUser.id,
                    connectionId: user.id,
                  });

              await queryClient.user.invalidate();
            }}
          >
            {appUser?.myConnectionArray?.find(
              (connection) => connection.id === user.id,
            ) ? (
              <span className="icon-[mdi--user-remove-outline] h-5 w-5" />
            ) : (
              <span className="icon-[mdi--user-add-outline] h-5 w-5" />
            )}
          </Button>

          {user.id !== appUser?.id && (
            <Button
              onClick={async () => {
                setUserId(user.id);
                queryClient.dev.getAllUsers.invalidate();
                queryClient.user.get.invalidate({ id: user.id });
              }}
            >
              Log in as this user
            </Button>
          )}

          <Button
            title="Delete user"
            className="text-pink-400 hover:text-pink-500"
            onClickAsync={async (e) => {
              e.stopPropagation();
              await deleteUser.mutateAsync(user.id);
              queryClient.dev.getAllUsers.invalidate();
            }}
          >
            <span className="icon-[mdi--delete-outline] h-5 w-5" />
          </Button>
        </div>
      ))}
      <CreateUserBtn />
      <ActionBtn
        variant="negative"
        onClickAsync={async () => {
          console.log("Deleting all users...");
          await deleteAll.mutateAsync();
          await queryClient.invalidate();
          setUserId(null);
          console.log("All users deleted.");
        }}
      >
        <span className="icon-[mdi--delete-outline] h-5 w-5" />
        DELETE ALL EXISTING ACCOUNTS
      </ActionBtn>
    </div>
  ) : null;
};
export default DevPage;
