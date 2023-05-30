import { User, Group, Friend } from "@prisma/client";

export interface UserClientSide extends Omit<User, "ACCESS_TOKEN"> {
  hasAccessToken: boolean;
  groupArray?: Group[];
  friendArray?: Friend[];
}

export interface GroupClientSide extends Group {
  userArray?: UserClientSide[];
}
