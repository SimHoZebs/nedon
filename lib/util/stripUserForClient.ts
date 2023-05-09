import { Group, User } from "@prisma/client";
import { UserClientSide } from "./types";

const stripUserForClient = (
  user: User | (User & { groupArray: (Group & { userArray: User[] })[] })
): UserClientSide => {
  const { ACCESS_TOKEN, ...rest } = user;

  return {
    ...rest,
    hasAccessToken: user.ACCESS_TOKEN ? true : false,
    groupArray: "groupArray" in user ? user.groupArray : undefined,
  };
};

export default stripUserForClient;
