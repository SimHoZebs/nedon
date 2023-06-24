import { Group, User } from "@prisma/client";
import { UserClientSide } from "./types";

const stripUserSecrets = ({
  ACCESS_TOKEN,
  ...rest
}: User & { groupArray: Group[] }): UserClientSide => {
  return { ...rest, hasAccessToken: ACCESS_TOKEN ? true : false };
};

export default stripUserSecrets;
