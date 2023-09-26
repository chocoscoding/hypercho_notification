import winston from "winston";

interface customLevel{
        levels: {
            critical: number;
            warn: number;
            info: number;
            debug: number;
            silly: number;
        };
        colors: {
            critical: string;
            warn: string;
            info: string;
            debug: string;
            silly: string;
        }
}


const CustomLevels: customLevel = {
    levels: {
        critical: 0,
        warn: 1,
        info: 2,
        debug: 5,
        silly: 6
    },
    colors: {
        critical: 'red',
        warn: 'yellow',
        info: 'white',
        debug: 'blue',
        silly: 'violet'
    }
  };
  
  export const log = winston.createLogger({
    levels: CustomLevels.levels,
    format: winston.format.json(),
  transports: [
    new winston.transports.Console()  ]
  }) as winston.Logger & Record<keyof typeof CustomLevels['levels'], winston.LeveledLogMethod>;
  