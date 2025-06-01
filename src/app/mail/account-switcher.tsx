import { api } from "@/trpc/react";
import React from "react";
import {} from usehooks-ts'

type Props = {
  isCollapsed: boolean;
};

const AccountSwitcher = ({ isCollapsed }: Props) => {
  const { data } = api.account.getAccounts.useQuery();
  const { accountId, setAccountId} = React.useState
  if (!data) return null;
  return (
    <>
      {data?.map((account) => (
        <div key={account.id}>{account.emailAddress}</div>
      ))}
    </>
  );
};

export default AccountSwitcher;
