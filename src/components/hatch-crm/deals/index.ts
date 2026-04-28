import React from "react";

const DealList = React.lazy(() => import("./DealList"));

export * from "./bottleneckLabels";
export * from "./DecisionContextBlock";
export * from "./stackInfo";
export * from "./StackBlock";

export default {
  list: DealList,
};
