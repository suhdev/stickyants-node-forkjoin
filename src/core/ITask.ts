export interface ITask {
    execute():Promise<any>; 
    cancel():Promise<void>;
}