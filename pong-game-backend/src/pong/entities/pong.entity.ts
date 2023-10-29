export class Ball {
    x: number;
    y: number;
    radius: number;
    velocityX: number;
    velocityY: number;
    speed: number;
    color: string;
}

export class Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    score: number;
    color: string;
}

export class Room {
    start: boolean;
    id: string;
    users: string[];
    ball: Ball;
}

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
  
export const initializeOpponent = (width: number, height: number): Paddle => {
  return {
      x: width - 10,
      y: (height - 100) / 2,
      width: 10,
      height: 100,
      score: 0,
      color: "RED",
    };
};
