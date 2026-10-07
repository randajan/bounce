
const _triggers = ["size", "hard", "soft", "manual"];


const MAX_TIMEOUT = 2 ** 31 - 1;

export const validateTimeout = (ms, label) => {
    if (ms == null || ms === 0) { return ms; }
    if (!Number.isFinite(ms) || ms < 0 || ms > MAX_TIMEOUT) {
        throw new RangeError(`${label} to be a finite positive number. Received '${ms}'`);
    }
    return ms;
};

export const validatePositiveInteger = (num, label) => {
    if (num == null) { return num; }
    if (!Number.isInteger(num) || num <= 0) {
        throw new RangeError(`${label} to be a positive integer. Received '${num}'`);
    }
    return num;
};

export const toArray = any=>{
    if (any == null) { return []; }
    if (Array.isArray(any)) { return any; }
    return [ any ];
}


export const createPromiseApi = () => {
    const proc = {};
    proc.result = new Promise((res, rej) => {
        proc.resolve = res;
        proc.reject = rej;
    });
    return proc;
}

export const formatCfg = (processTasks, opt = {}) => {
    const cfg = { };
    opt = typeof opt === "object" ? opt : {};

    if (typeof processTasks !== "function") { throw TypeError("Bounce(...) expects first argument to be a function"); }
    cfg.processTasks = async (...a)=>processTasks(...a);

    if (!opt.onInit) { cfg.onInit = () => { }; }
    else if (typeof opt.onInit !== "function") { throw TypeError("Bounce(...) expects opt.onInit to be a function"); }
    else { cfg.onInit = opt.onInit; }

    if (!opt.onEnd) { cfg.onEnd = () => { }; }
    else if (typeof opt.onEnd !== "function") { throw TypeError("Bounce(...) expects opt.onEnd to be a function"); }
    else { cfg.onEnd = opt.onEnd; }

    cfg.minSize = validatePositiveInteger(opt.minSize, "Bounce(...) expects opt.minSize");
    cfg.maxSize = validatePositiveInteger(opt.maxSize, "Bounce(...) expects opt.maxSize");
    cfg.hardMs = validateTimeout(opt.hardMs, "Bounce(...) expects opt.hardMs");
    cfg.softMs = validateTimeout(opt.softMs, "Bounce(...) expects opt.softMs");
    cfg.unref = !!(opt.unref ?? true);

    return cfg;
}

export const setTimeoutUnref = (callback, ms, unref = false) => {
    const int = setTimeout(callback, ms);
    if (unref) { int?.unref?.(); }
    return int;
}

export const validateTrigger = (trigger, method)=>{
    if (_triggers.includes(trigger)) { return trigger; }
    throw new TypeError(`Bounce${method} trigger expects to be one of: '${_triggers.join("|")}'`);
}