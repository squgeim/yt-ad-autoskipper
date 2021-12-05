import { render } from "preact";
import { License } from "./license";
import { ChannelPref } from "./channelPref";

function Settings() {
  return (
    <div class="container">
      <h1>Youtube Ad Auto-skipper</h1>
      <License />
      <ChannelPref />
    </div>
  );
}

render(<Settings />, document.body);
