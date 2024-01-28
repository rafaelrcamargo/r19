import os from "os";

export default () => (
  <b>
    {os.platform()} {os.arch()}
  </b>
);
