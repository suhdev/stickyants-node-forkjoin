export enum TaskEventType {
    Config = 'CONFIG', 
    ConfigAck = 'CONFIG_ACK', 
    Execute = 'EXEC', 
    Failed = 'FAILED', 
    Kill = 'KILL',
    Finished = 'EXEC_FINISHED',
    Completed = 'COMPLETED',
    Stats = 'STATS',
    StatsResult = 'STATS_RESULT',
}

export enum TaskStatus {
    IDLE = 0, 
    Working = 1
}