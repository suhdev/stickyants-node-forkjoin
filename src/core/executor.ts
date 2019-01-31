import { IMessage, IConfigMessage, IExecMessage } from "./IEvent";
import { TaskEventType, TaskStatus } from "../const";
import { ITaskDefinition } from "./ITaskDefinition";

let tasks:ITaskDefinition[] = null; 
let status = TaskStatus.IDLE; 
let currentPayload:any = null; 

function finish(){ 
    process.send({
        type:TaskEventType.Finished, 
    });
}

function error(err){
    process.send({
        type:TaskEventType.Failed,
        message:err.message
    });
}

function complete(){
    currentPayload = undefined;
    status = TaskStatus.IDLE;
    process.send({
        type:TaskEventType.Completed,
    });
}

async function execute(taskKey,payload){
    var task = tasks.find(e=>e.key === taskKey); 
    if (!task){
        error(new Error(`Invalid task key, could not find task with key: ${taskKey}`)); 
        complete();
        return; 
    }
    const fn = task.exports || (task.exports=require(task.filePath)); 
    let funct = fn; 
    if (!fn){
        error(new Error("Invalid file path")); 
        complete();
        return; 
    }
    if (task.exportedKey){
        funct = fn[task.exportedKey]; 
    }
    if (typeof funct !== "function"){
        error(new Error("Invalid exported function from task file")); 
        complete();
        return; 
    }
    try {
        currentPayload = payload; 
        status = TaskStatus.Working; 
        await funct(payload); 
        finish();
    }catch(err){
        error(err); 
    }finally{
        complete();
    }
}

process.on('message',(evt:IMessage)=>{
    switch(evt.type){
        case TaskEventType.Config:
        const {tasks:t} = evt as IConfigMessage; 
        tasks = t;
        process.send({
            type:TaskEventType.ConfigAck
        });
        break;
        case TaskEventType.Execute:
        const {task:taskKey,payload} = evt as IExecMessage;
        execute(taskKey,payload);
        break;
        case TaskEventType.Kill:
        process.send({
            type:TaskEventType.Completed,
        });
        process.exit(0);
        break;
        case TaskEventType.Stats:
        process.send({
            type:TaskEventType.StatsResult,
            status, 
            currentPayload
        });
        break;
    }
});