import React from "react";

const DealList = React.lazy(() => import("./DealList"));

export * from "./bottleneckLabels";
export * from "./stackInfo";

export default {
  list: DealList,
};
