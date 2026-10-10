
import assert from "assert/strict";
import createBounce from "../../dist/esm/index.mjs";


const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const section = title => {
    console.log(`\n--- ${title} ---`);
};

const createDemo = (options = {}) => {
    const history = {
        initialized: 0,
        ended: [],
        processed: []
    };

    const queue = createBounce(async (tasks, trigger) => {
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
            result.then(value => console.log("batch closed:", trigger, value));
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
    const { queue } = createDemo({ softMs: 1_000 });
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
    assert.strictEqual(await first, undefined);
    assert.strictEqual(queue.state, false);
    assert.strictEqual(queue.size, 0);
    assert.strictEqual(queue.result, undefined);
    assert.strictEqual(history.processed.length, 0);
    assert.strictEqual(history.ended.length, 1);
    assert.strictEqual(history.ended[0].trigger, "manual");

    await wait(60);
    assert.strictEqual(history.processed.length, 0, "flush must cancel the timer");
    assert.deepStrictEqual(queue.flush(), []);

    console.log("returned by flush:", pendingTasks);
}


console.log("\nAll demo checks passed.");
