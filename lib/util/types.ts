import { User, Group, Split } from "@prisma/client";

export interface UserClientSide extends Omit<User, "ACCESS_TOKEN"> {
  hasAccessToken: boolean;
  groupArray?: Group[];
}

export interface GroupClientSide extends Group {
  userArray?: UserClientSide[];
}

export interface SplitClientSide extends Omit<Split, "id"> {
  id: string | null;
}
