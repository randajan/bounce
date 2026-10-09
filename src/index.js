import { Bounce } from "./Bounce"
import { setTimeoutUnref, validateTimeout } from "./tools";

export { Bounce, setTimeoutUnref, validateTimeout  }

export const createBounce = (processTasks, opt = {}) => new Bounce(processTasks, opt);

export default createBounce;