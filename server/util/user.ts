import type { GroupClientSide } from "@/types/group";
import type { UserClientSide } from "@/types/user";
import type { Group, User } from "@prisma/client";

export function stripUserSecrets({
  ACCESS_TOKEN,
  ...rest
}: User & {
  myConnectionArray?: User[];
}): UserClientSide {
  return { ...rest, hasAccessToken: !!ACCESS_TOKEN };
}

export const stripUserSecretsFromGroup = (
  group: Group & { userArray: User[] },
): GroupClientSide => {
  const userClientSideArray: UserClientSide[] = group.userArray.map((user) =>
    stripUserSecrets(user),
  );

  const groupClientSide: GroupClientSide = {
    ...group,
    userArray: userClientSideArray,
  };

  return groupClientSide;
};
