import { TaskEventType } from "../const";
import { ITaskDefinition } from "./ITaskDefinition";

export interface IEvent {
    type:TaskEventType; 
}

export interface IMessage extends IEvent {
    
}

export interface IConfigMessage extends IMessage {
    tasks:ITaskDefinition[]; 
}

export interface IExecMessage extends IMessage {
    task:string; 
    payload?:any;
}