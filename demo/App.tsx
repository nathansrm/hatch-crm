import { CRM } from "@/components/hatch-crm/root/CRM";
import {
  authProvider,
  dataProvider,
} from "@/components/hatch-crm/providers/fakerest";
import { memoryStore } from "ra-core";

const App = () => (
  <CRM
    dataProvider={dataProvider}
    authProvider={authProvider}
    store={memoryStore()}
  />
);

export default App;
