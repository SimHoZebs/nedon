import React, { useEffect, useState } from "react";

import { ErrorDataItem } from "../util/dataUtil";
import Link from "next/link";

interface Props {
  error: ErrorDataItem;
}

const errorPaths: { [key: string]: string } = {
  ITEM_ERROR: "item",
  INSTITUTION_ERROR: "institution",
  API_ERROR: "api",
  ASSET_REPORT_ERROR: "assets",
  BANK_TRANSFER_ERROR: "bank-transfers",
  INVALID_INPUT: "invalid-input",
  INVALID_REQUEST: "invalid-request",
  INVALID_RESULT: "invalid-result",
  OAUTH_ERROR: "oauth",
  PAYMENT_ERROR: "payment",
  RATE_LIMIT_EXCEEDED: "rate-limit-exceeded",
  RECAPTCHA_ERROR: "recaptcha",
  SANDBOX_ERROR: "sandbox",
};

const Error = (props: Props) => {
  const [path, setPath] = useState("");

  useEffect(() => {
    const errorType = props.error.error_type!;
    const errorPath = errorPaths[errorType];

    setPath(
      `https://plaid.com/docs/errors/${errorPath}/#${props.error.error_code?.toLowerCase()}`
    );
  }, [props.error]);

  return (
    <>
      <div className=""></div>
      <div className="">
        <div>{props.error.status_code ? props.error.status_code : "error"}</div>
        <div className="">
          <div className="">
            <span className="">Error code: </span>
            <span className="">
              <div className="">
                {props.error.error_code}
                <div className=""></div>
              </div>
            </span>
          </div>
          <div className="">
            <span className="">Type: </span>
            <span className=""></span>
          </div>
          <div className="">
            <span className="">Message: </span>
            <span className="">
              {props.error.display_message == null
                ? props.error.error_message
                : props.error.display_message}
            </span>
          </div>
        </div>
        <Link target="_blank" href={path}>
          Learn more
        </Link>
      </div>
    </>
  );
};

Error.displayName = "Error";

export default Error;
