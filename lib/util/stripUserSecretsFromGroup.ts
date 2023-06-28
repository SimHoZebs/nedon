import { Group, User } from "@prisma/client";
import stripUserSecrets from "./stripUserSecrets";
import { GroupClientSide, UserClientSide } from "./types";

const stripUserSecretsFromGroup = (
  group: Group & { userArray: User[] }
): GroupClientSide => {
  const userClientSideArray: UserClientSide[] = group.userArray.map((user) =>
    stripUserSecrets(user)
  );

  const groupClientSide: GroupClientSide = {
    ...group,
    userArray: userClientSideArray,
  };

  return groupClientSide;
};

export default stripUserSecretsFromGroup;
