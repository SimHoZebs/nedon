interface Props {
  isDesktop: boolean;
  isLoading: boolean;
  accountName: string;
}

const AccountName = (props: Props) => (
  <p
    className={`${props.isDesktop ? "hidden lg:block" : "lg:hidden"} h-6 w-40 font-light text-xs text-zinc-400 md:text-sm ${
      props.isLoading && "animate-pulse rounded-lg bg-zinc-700"
    } `}
  >
    {props.accountName}
  </p>
);
export default AccountName;
