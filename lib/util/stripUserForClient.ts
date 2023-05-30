import { Friend, Group, User } from "@prisma/client";
import { UserClientSide } from "./types";

const stripUserSecrets = ({
  ACCESS_TOKEN,
  ...rest
}: User & { groupArray?: Group[]; friendArray?: Friend[] }): UserClientSide => {
  return { ...rest, hasAccessToken: ACCESS_TOKEN ? true : false };
};

export default stripUserSecrets;
