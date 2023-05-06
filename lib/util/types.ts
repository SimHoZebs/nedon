import { User, Group } from "@prisma/client";

export interface UserClientSide extends Omit<User, "ACCESS_TOKEN"> {
  hasAccessToken: boolean;
  groupArray: Group[];
}
