import { formatCfg, createPromiseApi, setTimeoutUnref, validateTimeout } from "./tools";


export class Bounce {

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

    get state() { return !!this.#proc; }
    get size() { return this.#tasks.length; }
    get startAt() { return this.#time.startAt; }
    get touchAt() { return this.#time.touchAt; }
    get softEndAt() { return this.#time.soft; }
    get hardEndAt() { return this.#time.hard; }
    get result() { return this.#proc?.result; }

    #setTimeout(trigger, ms) {
        const tt = this.#int[trigger];
        if (tt != null) { clearTimeout(tt); }
        delete this.#int[trigger];
        delete this.#time[trigger];
        if (!this.#proc || !(ms > 0)) { return; }
        this.#int[trigger] = setTimeoutUnref(this.#ex[trigger], ms, this.#cfg.unref);
        this.#time[trigger] = ms + this.#time.touchAt;
    }

    #init() {
        this.#time.startAt = this.#time.touchAt;
        this.#proc = createPromiseApi();
        this.#setTimeout("hard", this.#cfg.hardMs);
        try { this.#cfg.onInit(); } catch { }
    }

    #clear() {
        this.#setTimeout("hard", 0);
        this.#setTimeout("soft", 0);
        this.#time = {};
        this.#tasks = [];
        this.#proc = undefined;
    }

    #end(trigger, proc) {
        try { this.#cfg.onEnd(trigger, proc.result); } catch { }
    }

    #execute(trigger) {
        const { processTasks, minSize } = this.#cfg;
        const tasks = this.#tasks;
        const proc = this.#proc;

        this.#clear();
        if (!proc) { return Promise.resolve(); }
        if (tasks.length < minSize) {
            proc.resolve();
            this.#end(trigger, proc);
        } else {
            processTasks(tasks, trigger)
                .then(proc.resolve, proc.reject)
                .finally(_ => this.#end(trigger, proc));
        }

        return proc.result;
    }

    attach(task, softMs = undefined) {
        const { softMs: softMsDef, maxSize } = this.#cfg;
        this.#setTimeout("soft", 0);
        const tasks = this.#tasks;

        tasks.push(task);
        this.#time.touchAt = Date.now();

        if (this.#tasks.length === 1) { this.#init(); }

        if (maxSize && tasks.length >= maxSize) { return this.#execute("size"); }
        else { this.#setTimeout("soft", validateTimeout(softMs) ?? softMsDef); }
        return this.#proc.result;
    }

    execute() {
        return this.#execute("manual");
    }

    flush() {
        const proc = this.#proc;
        this.#clear();
        if (!proc) { return Promise.resolve();  }
        proc.resolve();
        this.#end("manual", proc);
        return proc.result;
    }

}
