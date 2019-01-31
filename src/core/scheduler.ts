import {fork} from 'child_process'; 
import { IWorker } from './IWorker';
import { TaskStatus, TaskEventType } from '../const';
import * as Rx from 'rxjs'; 
import { ITask } from './ITask';
import { IEvent } from './IEvent';

export async function createSchedulerForIterator(iter:IterableIterator<ITask>,processes:number = 5){
    return new Promise(async (res)=>{
        const workers:IWorker[] = [];
        let inProgressWorkers = 0; 

        function exit(){
            workers.forEach(e=>{
                e.process.send({
                    type:TaskEventType.Kill
                });
            });
        }
    
        function next(){
            var val = iter.next();
            const firstAvailableWorker = workers.find(e=>e.ready && e.status === TaskStatus.IDLE);
            if (typeof val.value !== "undefined"){
                inProgressWorkers++; 
                firstAvailableWorker.process.send({
                    type:TaskEventType.Execute, 
                    payload:val.value
                });
            }
            if (val.done && inProgressWorkers === 0){
                exit();
                res();
            }
        }
    
        function createWorker(){
            const process = fork('./executor.js'); 
            const w = {
                status:TaskStatus.IDLE, 
                process,
                ready:false
            }; 
            process.on('message',(evt:IEvent)=>{
                switch(evt.type){
                    case TaskEventType.ConfigAck:
                    w.ready = true; 
                    next(); 
                    break;
                    case TaskEventType.Completed:
                    inProgressWorkers--; 
                    next(); 
                    break;
                }
            });
            workers.push(w);
        }

        for(var i=0;i<processes;i++){
            createWorker();
        }

    });
}

export async function createSchedulerForTasks(tasks:ITask[],processes:number = 5){
    const it = function*(){
        for(var item of tasks){
            yield item; 
        }
    };
    const iter = it(); 
    return createSchedulerForIterator(iter,processes);   
}
