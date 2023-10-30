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
export const initializeBall = (width: number, height: number): Ball => {
    return {
      x: width / 2,
      y: height / 2,
      radius: 10,
      velocityX: 5,
      velocityY: 5,
      speed: 7,
      color: "WHITE",
    };
};
  
export const initializeUser = (height: number): Paddle => {
    return {
      x: 0,
      y: (height - 100) / 2,
      width: 10,
      height: 100,
      score: 0,
      color: "WHITE",
    };
};
  
export const initializeCom = (width: number, height: number): Paddle => {
  return {
      x: width - 10,
      y: (height - 100) / 2,
      width: 10,
      height: 100,
      score: 0,
      color: "RED",
    };
};
  
export const initializeNet = (width: number): Net => {
    return {
      x: (width - 2) / 2,
      y: 0,
      height: 10,
      width: 2,
      color: "WHITE",
    };
};  