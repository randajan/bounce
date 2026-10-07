// src/tools.js
var MAX_TIMEOUT = 2 ** 31 - 1;
var validateTimeout = (ms, label) => {
  if (ms == null || ms === 0) {
    return ms;
  }
  if (!Number.isFinite(ms) || ms < 0 || ms > MAX_TIMEOUT) {
    throw new RangeError(`${label} to be a finite positive number. Received '${ms}'`);
  }
  return ms;
};
var validatePositiveInteger = (num, label) => {
  if (num == null) {
    return num;
  }
  if (!Number.isInteger(num) || num <= 0) {
    throw new RangeError(`${label} to be a positive integer. Received '${num}'`);
  }
  return num;
};
var createPromiseApi = () => {
  const proc = {};
  proc.result = new Promise((res, rej) => {
    proc.resolve = res;
    proc.reject = rej;
  });
  return proc;
};
var formatCfg = (processTasks, opt = {}) => {
  const cfg = {};
  opt = typeof opt === "object" ? opt : {};
  if (typeof processTasks !== "function") {
    throw TypeError("Bounce(...) expects first argument to be a function");
  }
  cfg.processTasks = async (...a) => processTasks(...a);
  if (!opt.onInit) {
    cfg.onInit = () => {
    };
  } else if (typeof opt.onInit !== "function") {
    throw TypeError("Bounce(...) expects opt.onInit to be a function");
  } else {
    cfg.onInit = opt.onInit;
  }
  if (!opt.onEnd) {
    cfg.onEnd = () => {
    };
  } else if (typeof opt.onEnd !== "function") {
    throw TypeError("Bounce(...) expects opt.onEnd to be a function");
  } else {
    cfg.onEnd = opt.onEnd;
  }
  cfg.minSize = validatePositiveInteger(opt.minSize, "Bounce(...) expects opt.minSize");
  cfg.maxSize = validatePositiveInteger(opt.maxSize, "Bounce(...) expects opt.maxSize");
  cfg.hardMs = validateTimeout(opt.hardMs, "Bounce(...) expects opt.hardMs");
  cfg.softMs = validateTimeout(opt.softMs, "Bounce(...) expects opt.softMs");
  cfg.unref = !!(opt.unref ?? true);
  return cfg;
};
var setTimeoutUnref = (callback, ms, unref = false) => {
  const int = setTimeout(callback, ms);
  if (unref) {
    int?.unref?.();
  }
  return int;
};

// src/index.js
var Bounce = class {
  #cfg;
  #int = {};
  #proc;
  #tasks = [];
  #ex = {};
  #time = {};
  constructor(processTasks, opt = {}) {
    this.#cfg = formatCfg(processTasks, opt);
    this.#ex.soft = () => this.#execute("soft");
    this.#ex.hard = () => this.#execute("hard");
  }
  get state() {
    return !!this.#proc;
  }
  get size() {
    return this.#tasks.length;
  }
  get startAt() {
    return this.#time.startAt;
  }
  get touchAt() {
    return this.#time.touchAt;
  }
  get softEndAt() {
    return this.#time.soft;
  }
  get hardEndAt() {
    return this.#time.hard;
  }
  get result() {
    return this.#proc?.result;
  }
  #setTimeout(trigger, ms) {
    const tt = this.#int[trigger];
    if (tt != null) {
      clearTimeout(tt);
    }
    delete this.#int[trigger];
    delete this.#time[trigger];
    if (!this.#proc || !(ms > 0)) {
      return;
    }
    this.#int[trigger] = setTimeoutUnref(this.#ex[trigger], ms, this.#cfg.unref);
    this.#time[trigger] = ms + this.#time.touchAt;
  }
  #init() {
    this.#time.startAt = this.#time.touchAt;
    this.#proc = createPromiseApi();
    this.#setTimeout("hard", this.#cfg.hardMs);
    try {
      this.#cfg.onInit();
    } catch {
    }
  }
  #clear() {
    this.#setTimeout("hard", 0);
    this.#setTimeout("soft", 0);
    this.#time = {};
    this.#tasks = [];
    this.#proc = void 0;
  }
  #end(trigger, proc) {
    try {
      this.#cfg.onEnd(trigger, proc.result);
    } catch {
    }
  }
  #execute(trigger) {
    const { processTasks, minSize } = this.#cfg;
    const tasks = this.#tasks;
    const proc = this.#proc;
    this.#clear();
    if (!proc) {
      return Promise.resolve();
    }
    if (tasks.length < minSize) {
      proc.resolve();
      this.#end(trigger, proc);
    } else {
      processTasks(tasks, trigger).then(proc.resolve, proc.reject).finally((_) => this.#end(trigger, proc));
    }
    return proc.result;
  }
  attach(task, softMs = void 0) {
    const { softMs: softMsDef, maxSize } = this.#cfg;
    this.#setTimeout("soft", 0);
    const tasks = this.#tasks;
    tasks.push(task);
    this.#time.touchAt = Date.now();
    if (this.#tasks.length === 1) {
      this.#init();
    }
    if (maxSize && tasks.length >= maxSize) {
      return this.#execute("size");
    } else {
      this.#setTimeout("soft", validateTimeout(softMs) ?? softMsDef);
    }
    return this.#proc.result;
  }
  execute() {
    return this.#execute("manual");
  }
  flush() {
    const proc = this.#proc;
    this.#clear();
    if (!proc) {
      return Promise.resolve();
    }
    proc.resolve();
    this.#end("manual", proc);
    return proc.result;
  }
};
var createBounce = (processTasks, opt = {}) => new Bounce(processTasks, opt);
var index_default = createBounce;
export {
  Bounce,
  createBounce,
  index_default as default
};
//# sourceMappingURL=index.mjs.map
