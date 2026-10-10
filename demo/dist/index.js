// demo/src/index.js
import assert from "assert/strict";

// dist/esm/index.mjs
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
    const time = this.#time;
    const tasks = this.#tasks;
    const proc = this.#proc;
    this.#time = {};
    this.#tasks = [];
    this.#proc = void 0;
    return { tasks, proc, time };
  }
  #end(trigger, proc) {
    try {
      this.#cfg.onEnd(trigger, proc.result);
    } catch {
    }
  }
  #execute(trigger) {
    const { processTasks, minSize } = this.#cfg;
    const { tasks, proc } = this.#clear();
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
    const { proc, tasks } = this.#clear();
    if (!proc) {
      return [];
    }
    proc.resolve();
    this.#end("manual", proc);
    return tasks;
  }
};
var createBounce = (processTasks, opt = {}) => new Bounce(processTasks, opt);
var index_default = createBounce;

// demo/src/index.js
var wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var section = (title) => {
  console.log(`
--- ${title} ---`);
};
var createDemo = (options = {}) => {
  const history = {
    initialized: 0,
    ended: [],
    processed: []
  };
  const queue = index_default(async (tasks, trigger) => {
    console.log(`processor (${trigger}):`, tasks);
    history.processed.push({ tasks, trigger });
    await wait(5);
    return { count: tasks.length, trigger };
  }, {
    unref: false,
    ...options,
    onInit() {
      history.initialized++;
      console.log("batch opened");
    },
    onEnd(trigger, result) {
      history.ended.push({ trigger, result });
      result.then((value) => console.log("batch closed:", trigger, value));
    }
  });
  return { queue, history };
};
section("maxSize executes a full batch");
{
  const { queue, history } = createDemo({ maxSize: 3 });
  const first = queue.attach("alpha");
  const second = queue.attach("beta");
  const third = queue.attach("gamma");
  assert.strictEqual(first, second);
  assert.strictEqual(second, third);
  assert.strictEqual(queue.state, false);
  assert.deepStrictEqual(await first, { count: 3, trigger: "size" });
  assert.deepStrictEqual(history.processed[0].tasks, ["alpha", "beta", "gamma"]);
  await wait(0);
}
section("soft timeout waits for a quiet moment");
{
  const { queue, history } = createDemo({ softMs: 35 });
  const result = queue.attach("first");
  await wait(15);
  queue.attach("second");
  assert.deepStrictEqual(await result, { count: 2, trigger: "soft" });
  assert.strictEqual(history.processed.length, 1);
  await wait(0);
}
section("hard timeout limits a continuously extended batch");
{
  const { queue } = createDemo({ softMs: 80, hardMs: 120 });
  const result = queue.attach(1);
  await wait(30);
  queue.attach(2);
  await wait(30);
  queue.attach(3);
  await wait(30);
  queue.attach(4);
  assert.deepStrictEqual(await result, { count: 4, trigger: "hard" });
  await wait(0);
}
section("execute processes a batch immediately");
{
  const { queue } = createDemo({ softMs: 1e3 });
  const attached = queue.attach("manual task");
  const executed = queue.execute();
  assert.strictEqual(attached, executed);
  assert.deepStrictEqual(await executed, { count: 1, trigger: "manual" });
  await wait(0);
}
section("flush returns tasks without processing them");
{
  const { queue, history } = createDemo({ softMs: 40 });
  const first = queue.attach({ id: 1, action: "save" });
  const second = queue.attach({ id: 2, action: "delete" });
  assert.strictEqual(first, second);
  assert.strictEqual(queue.state, true);
  assert.strictEqual(queue.size, 2);
  const pendingTasks = queue.flush();
  assert.deepStrictEqual(pendingTasks, [
    { id: 1, action: "save" },
    { id: 2, action: "delete" }
  ]);
  assert.strictEqual(await first, void 0);
  assert.strictEqual(queue.state, false);
  assert.strictEqual(queue.size, 0);
  assert.strictEqual(queue.result, void 0);
  assert.strictEqual(history.processed.length, 0);
  assert.strictEqual(history.ended.length, 1);
  assert.strictEqual(history.ended[0].trigger, "manual");
  await wait(60);
  assert.strictEqual(history.processed.length, 0, "flush must cancel the timer");
  assert.deepStrictEqual(queue.flush(), []);
  console.log("returned by flush:", pendingTasks);
}
console.log("\nAll demo checks passed.");
//# sourceMappingURL=index.js.map
