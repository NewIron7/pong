export interface Ball {
    x: number;
    y: number;
    radius: number;
    velocityX: number;
    velocityY: number;
    speed: number;
    color: string;
}
  
export interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    score: number;
    color: string;
}
  
  export interface Net {
    x: number;
    y: number;
    height: number;
    width: number;
    color: string;
}
  
  // Initialize game objects
export const initializeBall = (canvas: HTMLCanvasElement): Ball => {
    return {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 10,
      velocityX: 5,
      velocityY: 5,
      speed: 7,
      color: "WHITE",
    };
};
  
export const initializeUser = (canvas: HTMLCanvasElement): Paddle => {
    return {
      x: 0,
      y: (canvas.height - 100) / 2,
      width: 10,
      height: 100,
      score: 0,
      color: "WHITE",
    };
};
  
export const initializeCom = (canvas: HTMLCanvasElement): Paddle => {
  return {
      x: canvas.width - 10,
      y: (canvas.height - 100) / 2,
      width: 10,
      height: 100,
      score: 0,
      color: "WHITE",
    };
};
  
export const initializeNet = (canvas: HTMLCanvasElement): Net => {
    return {
      x: (canvas.width - 2) / 2,
      y: 0,
      height: 10,
      width: 2,
      color: "WHITE",
    };
};  