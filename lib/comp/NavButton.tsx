import React from "react";
import Button from "./Button";
import { NextRouter } from "next/router";

interface Props extends React.HtmlHTMLAttributes<HTMLButtonElement> {
  router: NextRouter;
  route: string;
}

const NavButton = (props: Props) => {
  return (
    <Button
      className={props.router.pathname === props.route ? "border " : ""}
      onClick={() => props.router.push(props.route)}
    >
      {props.children}
    </Button>
  );
};

export default NavButton;
