/** The reason why a pending batch was completed. */
export type BounceTrigger = "size" | "hard" | "soft" | "manual";

/** A value that may be returned either synchronously or asynchronously. */
export type MaybePromise<T> = T | PromiseLike<T>;

/** Processes all tasks collected in a single batch. */
export type BounceProcessor<Task, Result> = (
    tasks: Task[],
    trigger: BounceTrigger
) => MaybePromise<Result>;

export interface BounceOptions<Result = unknown> {
    /**
     * Delay in milliseconds after the most recently attached task.
     * A value of `0` or `undefined` disables the soft timeout.
     */
    softMs?: number;

    /**
     * Maximum delay in milliseconds after the first task in a batch.
     * A value of `0` or `undefined` disables the hard timeout.
     */
    hardMs?: number;

    /** Execute the batch immediately when it reaches this size. */
    maxSize?: number;

    /**
     * Only call the processor when the batch reaches this size.
     * Smaller batches are discarded and resolve with `undefined`.
     */
    minSize?: number;

    /** Called after the first task initializes a new batch. */
    onInit?: () => unknown;

    /**
     * Called after a batch completes. The promise is already settled when the
     * callback runs. Errors thrown by the callback are ignored.
     */
    onEnd?: (
        trigger: BounceTrigger,
        result: Promise<Result | undefined>
    ) => unknown;

    /**
     * Whether timers should be unreferenced when the runtime supports it.
     * Defaults to `true`.
     */
    unref?: boolean;
}

/** Collects tasks and processes them together as a batch. */
export class Bounce<Task = unknown, Result = unknown> {
    constructor(
        processTasks: BounceProcessor<Task, Result>,
        options?: BounceOptions<Result>
    );

    /** Whether a batch is currently pending. */
    readonly state: boolean;

    /** Number of tasks in the pending batch. */
    readonly size: number;

    /** Timestamp at which the first task in the pending batch was attached. */
    readonly startAt: number | undefined;

    /** Timestamp at which the pending batch was most recently changed. */
    readonly touchAt: number | undefined;

    /** Scheduled timestamp of the soft timeout, if active. */
    readonly softEndAt: number | undefined;

    /** Scheduled timestamp of the hard timeout, if active. */
    readonly hardEndAt: number | undefined;

    /** Promise shared by all tasks in the pending batch. */
    readonly result: Promise<Result | undefined> | undefined;

    /**
     * Add a task to the current batch and optionally override its soft timeout.
     */
    attach(task: Task, softMs?: number): Promise<Result | undefined>;

    /** Process the pending batch immediately. */
    execute(): Promise<Result | undefined>;

    /** Discard the pending batch without calling the processor. */
    flush(): Promise<Result | undefined>;
}

/** Create a task batcher. */
export function createBounce<Task, Result>(
    processTasks: BounceProcessor<Task, Result>,
    options?: BounceOptions<Result>
): Bounce<Task, Result>;

export default createBounce;
