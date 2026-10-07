// <define:__slib_info>
var define_slib_info_default = { isBuild: true, name: "@randajan/bounce", description: "Tiny JavaScript library for collecting tasks and processing them as a single batch", version: "1.0.0", author: { name: "Jan Randa", email: "jnranda@gmail.com", url: "https://www.linkedin.com/in/randajan/" }, env: "development", mode: "node", port: 3e3, dir: { root: "/home/randajan/dev/lib/bounce", dist: "demo/dist" } };

// node_modules/chalk/source/vendor/ansi-styles/index.js
var ANSI_BACKGROUND_OFFSET = 10;
var wrapAnsi16 = (offset = 0) => (code) => `\x1B[${code + offset}m`;
var wrapAnsi256 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
var wrapAnsi16m = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`;
var styles = {
  modifier: {
    reset: [0, 0],
    // 21 isn't widely supported and 22 does the same thing
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    overline: [53, 55],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29]
  },
  color: {
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    // Bright color
    blackBright: [90, 39],
    gray: [90, 39],
    // Alias of `blackBright`
    grey: [90, 39],
    // Alias of `blackBright`
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39]
  },
  bgColor: {
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    // Bright color
    bgBlackBright: [100, 49],
    bgGray: [100, 49],
    // Alias of `bgBlackBright`
    bgGrey: [100, 49],
    // Alias of `bgBlackBright`
    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49]
  }
};
var modifierNames = Object.keys(styles.modifier);
var foregroundColorNames = Object.keys(styles.color);
var backgroundColorNames = Object.keys(styles.bgColor);
var colorNames = [...foregroundColorNames, ...backgroundColorNames];
function assembleStyles() {
  const codes = /* @__PURE__ */ new Map();
  for (const [groupName, group] of Object.entries(styles)) {
    for (const [styleName, style] of Object.entries(group)) {
      styles[styleName] = {
        open: `\x1B[${style[0]}m`,
        close: `\x1B[${style[1]}m`
      };
      group[styleName] = styles[styleName];
      codes.set(style[0], style[1]);
    }
    Object.defineProperty(styles, groupName, {
      value: group,
      enumerable: false
    });
  }
  Object.defineProperty(styles, "codes", {
    value: codes,
    enumerable: false
  });
  styles.color.close = "\x1B[39m";
  styles.bgColor.close = "\x1B[49m";
  styles.color.ansi = wrapAnsi16();
  styles.color.ansi256 = wrapAnsi256();
  styles.color.ansi16m = wrapAnsi16m();
  styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
  Object.defineProperties(styles, {
    rgbToAnsi256: {
      value(red, green, blue) {
        if (red === green && green === blue) {
          if (red < 8) {
            return 16;
          }
          if (red > 248) {
            return 231;
          }
          return Math.round((red - 8) / 247 * 24) + 232;
        }
        return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
      },
      enumerable: false
    },
    hexToRgb: {
      value(hex) {
        const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
        if (!matches) {
          return [0, 0, 0];
        }
        let [colorString] = matches;
        if (colorString.length === 3) {
          colorString = [...colorString].map((character) => character + character).join("");
        }
        const integer = Number.parseInt(colorString, 16);
        return [
          /* eslint-disable no-bitwise */
          integer >> 16 & 255,
          integer >> 8 & 255,
          integer & 255
          /* eslint-enable no-bitwise */
        ];
      },
      enumerable: false
    },
    hexToAnsi256: {
      value: (hex) => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
      enumerable: false
    },
    ansi256ToAnsi: {
      value(code) {
        if (code < 8) {
          return 30 + code;
        }
        if (code < 16) {
          return 90 + (code - 8);
        }
        let red;
        let green;
        let blue;
        if (code >= 232) {
          red = ((code - 232) * 10 + 8) / 255;
          green = red;
          blue = red;
        } else {
          code -= 16;
          const remainder = code % 36;
          red = Math.floor(code / 36) / 5;
          green = Math.floor(remainder / 6) / 5;
          blue = remainder % 6 / 5;
        }
        const value = Math.max(red, green, blue) * 2;
        if (value === 0) {
          return 30;
        }
        let result = 30 + (Math.round(blue) << 2 | Math.round(green) << 1 | Math.round(red));
        if (value === 2) {
          result += 60;
        }
        return result;
      },
      enumerable: false
    },
    rgbToAnsi: {
      value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
      enumerable: false
    },
    hexToAnsi: {
      value: (hex) => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
      enumerable: false
    }
  });
  return styles;
}
var ansiStyles = assembleStyles();
var ansi_styles_default = ansiStyles;

// node_modules/chalk/source/vendor/supports-color/browser.js
var level = (() => {
  if (!("navigator" in globalThis)) {
    return 0;
  }
  if (globalThis.navigator.userAgentData) {
    const brand = navigator.userAgentData.brands.find(({ brand: brand2 }) => brand2 === "Chromium");
    if (brand && brand.version > 93) {
      return 3;
    }
  }
  if (/\b(Chrome|Chromium)\//.test(globalThis.navigator.userAgent)) {
    return 1;
  }
  return 0;
})();
var colorSupport = level !== 0 && {
  level,
  hasBasic: true,
  has256: level >= 2,
  has16m: level >= 3
};
var supportsColor = {
  stdout: colorSupport,
  stderr: colorSupport
};
var browser_default = supportsColor;

// node_modules/chalk/source/utilities.js
function stringReplaceAll(string, substring, replacer) {
  let index = string.indexOf(substring);
  if (index === -1) {
    return string;
  }
  const substringLength = substring.length;
  let endIndex = 0;
  let returnValue = "";
  do {
    returnValue += string.slice(endIndex, index) + substring + replacer;
    endIndex = index + substringLength;
    index = string.indexOf(substring, endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}
function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
  let endIndex = 0;
  let returnValue = "";
  do {
    const gotCR = string[index - 1] === "\r";
    returnValue += string.slice(endIndex, gotCR ? index - 1 : index) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
    endIndex = index + 1;
    index = string.indexOf("\n", endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}

// node_modules/chalk/source/index.js
var { stdout: stdoutColor, stderr: stderrColor } = browser_default;
var GENERATOR = /* @__PURE__ */ Symbol("GENERATOR");
var STYLER = /* @__PURE__ */ Symbol("STYLER");
var IS_EMPTY = /* @__PURE__ */ Symbol("IS_EMPTY");
var levelMapping = [
  "ansi",
  "ansi",
  "ansi256",
  "ansi16m"
];
var styles2 = /* @__PURE__ */ Object.create(null);
var applyOptions = (object, options = {}) => {
  if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
    throw new Error("The `level` option should be an integer from 0 to 3");
  }
  const colorLevel = stdoutColor ? stdoutColor.level : 0;
  object.level = options.level === void 0 ? colorLevel : options.level;
};
var chalkFactory = (options) => {
  const chalk2 = (...strings) => strings.join(" ");
  applyOptions(chalk2, options);
  Object.setPrototypeOf(chalk2, createChalk.prototype);
  return chalk2;
};
function createChalk(options) {
  return chalkFactory(options);
}
Object.setPrototypeOf(createChalk.prototype, Function.prototype);
for (const [styleName, style] of Object.entries(ansi_styles_default)) {
  styles2[styleName] = {
    get() {
      const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
      Object.defineProperty(this, styleName, { value: builder });
      return builder;
    }
  };
}
styles2.visible = {
  get() {
    const builder = createBuilder(this, this[STYLER], true);
    Object.defineProperty(this, "visible", { value: builder });
    return builder;
  }
};
var getModelAnsi = (model, level2, type, ...arguments_) => {
  if (model === "rgb") {
    if (level2 === "ansi16m") {
      return ansi_styles_default[type].ansi16m(...arguments_);
    }
    if (level2 === "ansi256") {
      return ansi_styles_default[type].ansi256(ansi_styles_default.rgbToAnsi256(...arguments_));
    }
    return ansi_styles_default[type].ansi(ansi_styles_default.rgbToAnsi(...arguments_));
  }
  if (model === "hex") {
    return getModelAnsi("rgb", level2, type, ...ansi_styles_default.hexToRgb(...arguments_));
  }
  return ansi_styles_default[type][model](...arguments_);
};
var usedModels = ["rgb", "hex", "ansi256"];
for (const model of usedModels) {
  styles2[model] = {
    get() {
      const { level: level2 } = this;
      return function(...arguments_) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level2], "color", ...arguments_), ansi_styles_default.color.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
  const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
  styles2[bgModel] = {
    get() {
      const { level: level2 } = this;
      return function(...arguments_) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level2], "bgColor", ...arguments_), ansi_styles_default.bgColor.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
}
var proto = Object.defineProperties(() => {
}, {
  ...styles2,
  level: {
    enumerable: true,
    get() {
      return this[GENERATOR].level;
    },
    set(level2) {
      this[GENERATOR].level = level2;
    }
  }
});
var createStyler = (open, close, parent) => {
  let openAll;
  let closeAll;
  if (parent === void 0) {
    openAll = open;
    closeAll = close;
  } else {
    openAll = parent.openAll + open;
    closeAll = close + parent.closeAll;
  }
  return {
    open,
    close,
    openAll,
    closeAll,
    parent
  };
};
var createBuilder = (self, _styler, _isEmpty) => {
  const builder = (...arguments_) => applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
  Object.setPrototypeOf(builder, proto);
  builder[GENERATOR] = self;
  builder[STYLER] = _styler;
  builder[IS_EMPTY] = _isEmpty;
  return builder;
};
var applyStyle = (self, string) => {
  if (self.level <= 0 || !string) {
    return self[IS_EMPTY] ? "" : string;
  }
  let styler = self[STYLER];
  if (styler === void 0) {
    return string;
  }
  const { openAll, closeAll } = styler;
  if (string.includes("\x1B")) {
    while (styler !== void 0) {
      string = stringReplaceAll(string, styler.close, styler.open);
      styler = styler.parent;
    }
  }
  const lfIndex = string.indexOf("\n");
  if (lfIndex !== -1) {
    string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
  }
  return openAll + string + closeAll;
};
Object.defineProperties(createChalk.prototype, styles2);
var chalk = createChalk();
var chalkStderr = createChalk({ level: stderrColor ? stderrColor.level : 0 });
var source_default = chalk;

// node_modules/@randajan/simple-lib/dist/chunk-KF2SC7L5.js
var chalkProps = Object.getOwnPropertyNames(Object.getPrototypeOf(source_default)).filter((v) => v !== "constructor");
var Logger = class _Logger extends Function {
  constructor(formater, chalkInit) {
    super();
    const chalk2 = chalkInit || source_default;
    const log2 = (...msgs) => {
      console.log(chalk2(formater(msgs)));
    };
    const self = Object.setPrototypeOf(log2.bind(), new.target.prototype);
    for (const prop of chalkProps) {
      Object.defineProperty(self, prop, { get: (_) => new _Logger(formater, chalk2[prop]), enumerable: false });
    }
    return self;
  }
};
var logger = (...prefixes) => {
  const now = (_) => (/* @__PURE__ */ new Date()).toLocaleTimeString("cs-CZ");
  prefixes = prefixes.filter((v) => !!v).join(" ");
  return new Logger((msgs) => `${prefixes} | ${now()} | ${msgs.join(" ")}`);
};

// node_modules/@randajan/simple-lib/dist/chunk-XM4YD4K6.js
var enumerable = true;
var lockObject = (o) => {
  if (typeof o !== "object") {
    return o;
  }
  const r = {};
  for (const i in o) {
    const descriptor = { enumerable };
    let val = o[i];
    if (val instanceof Array) {
      descriptor.get = (_) => [...val];
    } else {
      descriptor.value = lockObject(val);
    }
    Object.defineProperty(r, i, descriptor);
  }
  return r;
};
var info = lockObject(define_slib_info_default);

// node_modules/@randajan/simple-lib/dist/node/index.js
import { parentPort } from "worker_threads";
var log = logger(info.name, info.version, info.env);
parentPort.on("message", (msg) => {
  if (msg === "shutdown") {
    process.exit(0);
  }
});
process.on("uncaughtException", (e) => {
  console.log(e.stack);
});

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
  const int3 = setTimeout(callback, ms);
  if (unref) {
    int3?.unref?.();
  }
  return int3;
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

// demo/src/index.js
var q = index_default((c2) => {
  console.log("processQueue", c2);
  return c2.length;
}, {
  softMs: 150,
  hardMs: 5e3,
  onInit: (trigger, r) => console.log("AAA"),
  onEnd: async (trigger, r) => console.log("BBB", trigger, await r)
});
var c = 0;
var int = setInterval(async (_) => {
  q.attach(c += 1);
}, 200);
var int2 = setInterval(async (_) => {
  q.attach(c += 1);
}, 200 * 1.61);
//# sourceMappingURL=index.js.map
