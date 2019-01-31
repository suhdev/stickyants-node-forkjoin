import { ChildProcess } from "child_process";
import { TaskStatus } from "../const";

export interface IWorker {
    process:ChildProcess; 
    status:TaskStatus; 
    ready:boolean; 
}