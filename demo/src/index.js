
import { info, log } from "@randajan/simple-lib/node";
import bounce from "../../dist/esm/index.mjs";



const q = bounce((c)=>{
    console.log("processQueue", c);
    return c.length;
}, {
    softMs:150,
    hardMs:5000,
    onInit:(trigger, r)=>console.log("AAA"),
    onEnd:async (trigger, r)=>console.log("BBB", trigger, await r)
});

let c = 0;
const int = setInterval(async _=>{
    
    q.attach(c+=1);
}, 200);

const int2 = setInterval(async _=>{
    
    q.attach(c+=1);
}, 200*1.61);