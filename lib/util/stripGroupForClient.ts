import { Group, User } from "@prisma/client";
import stripUserForClient from "./stripUserForClient";
import { GroupClientSide, UserClientSide } from "./types";

const stripGroupforClient = (
  group: Group & { userArray: User[] }
): GroupClientSide => {
  const userClientSideArray: UserClientSide[] = group.userArray.map((user) =>
    stripUserForClient(user)
  );

  const clientSideGroup: GroupClientSide = {
    ...group,
    userArray: userClientSideArray,
  };

  return clientSideGroup;
};

export default stripGroupforClient;
