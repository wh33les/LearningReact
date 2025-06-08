import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";

import App1 from "./ttt1app/ttt1app";
import App2 from "./ttt2app/ttt2app";
import App3 from "./c4app/c4app";

const rootttt1 = createRoot(document.getElementById("rootttt1"));
rootttt1.render(
  <StrictMode>
    <App1 />
  </StrictMode>
);

const rootttt2 = createRoot(document.getElementById("rootttt2"));
rootttt2.render(
  <StrictMode>
    <App2 />
  </StrictMode>
);

const rootc4 = createRoot(document.getElementById("rootc4"));
rootc4.render(
  <StrictMode>
    <App3 />
  </StrictMode>
);

