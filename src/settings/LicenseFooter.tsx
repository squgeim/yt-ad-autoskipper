import { JSXInternal } from "preact/src/jsx";
import { API } from "../constants/api";
import Element = JSXInternal.Element;

export function LicenseFooter(): Element {
  return (
    <div class="license-footer">
      <p>
        You support the development of this extension with an annual payment.
        <br />
        <a href={API.CANCEL}>Click here to cancel future payments.</a>
      </p>
    </div>
  );
}
