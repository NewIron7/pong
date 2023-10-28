import React, { useEffect, useRef } from 'react';
import * as Rendering from './Rendering';
import * as gameObjects from './gameObjects';

const PongGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawRect = Rendering.drawRect;
  const drawArc = Rendering.drawArc;
  const drawNet = Rendering.drawNet;
  const drawText = Rendering.drawText;
  const collision = Rendering.collision;

  const resetBall = (canvas: HTMLCanvasElement, ball: any) => {
    if (canvas) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.velocityX = -ball.velocityX;
        ball.speed = 7;
    }
  };

  const update = (
    canvas: HTMLCanvasElement,
    ball: any, 
    user: any, 
    com: any ) => {
    // change the score of players, if the ball goes to the left "ball.x<0" computer win, else if "ball.x > canvas.width" the user win
    if( ball.x - ball.radius < 0 ){
        com.score++;
        resetBall(canvas, ball);
    }else if( ball.x + ball.radius > canvas.width){
        user.score++;
        resetBall(canvas, ball);
    }
    
    // the ball has a velocity
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // computer plays for itself, and we must be able to beat it
    // simple AI
    com.y += ((ball.y - (com.y + com.height/2)))*0.005;
    
    // when the ball collides with bottom and top walls we inverse the y velocity.
    if(ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height){
        ball.velocityY = -ball.velocityY;
    }
    
    // we check if the paddle hit the user or the com paddle
    let player = (ball.x + ball.radius < canvas.width/2) ? user : com;
    
    // if the ball hits a paddle
    if(collision(ball,player)){
        // play sound
        // we check where the ball hits the paddle
        let collidePoint = (ball.y - (player.y + player.height/2));
        // normalize the value of collidePoint, we need to get numbers between -1 and 1.
        // -player.height/2 < collide Point < player.height/2
        collidePoint = collidePoint / (player.height/2);
        
        // when the ball hits the top of a paddle we want the ball, to take a -45degees angle
        // when the ball hits the center of the paddle we want the ball to take a 0degrees angle
        // when the ball hits the bottom of the paddle we want the ball to take a 45degrees
        // Math.PI/4 = 45degrees
        let angleRad = (Math.PI/4) * collidePoint;
        
        // change the X and Y velocity direction
        let direction = (ball.x + ball.radius < canvas.width/2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        
        // speed up the ball everytime a paddle hits it.
        ball.speed += 0.1;
    }
  };

  const render = (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        ball: any, 
        user: any, 
        com: any, 
        net: any ) => {
    // clear the canvas
    drawRect(0, 0, canvas.width, canvas.height, "#000", ctx);
    
    // draw the user score to the left
    drawText(user.score,canvas.width/4,canvas.height/5, ctx);
    
    // draw the COM score to the right
    drawText(com.score,3*canvas.width/4,canvas.height/5, ctx);
    
    // draw the net
    drawNet(ctx, canvas, net);

    // draw the user's paddle
    drawRect(user.x, user.y, user.width, user.height, user.color, ctx);
    
    // draw the COM's paddle
    drawRect(com.x, com.y, com.width, com.height, com.color, ctx);
    
    // draw the ball
    drawArc(ball.x, ball.y, ball.radius, ball.color, ctx);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d')!;

        const ball: gameObjects.Ball = gameObjects.initializeBall(canvas);
        const user: gameObjects.Paddle = gameObjects.initializeUser(canvas);
        const com: gameObjects.Paddle = gameObjects.initializeCom(canvas);
        const net: gameObjects.Net = gameObjects.initializeNet(canvas);


        const handleMouseMove = (evt: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            user.y = evt.clientY - rect.top - user.height / 2;
        };

        canvas.addEventListener("mousemove", handleMouseMove);
        const framePerSecond = 50;
        const loop = setInterval(() => {
            update(canvas, ball, user, com);
            render(ctx, canvas, ball, user, com, net);
        }, 1000 / framePerSecond);

        // Clear the interval when the component unmounts
        return () => {
            canvas.removeEventListener("mousemove", handleMouseMove);
            clearInterval(loop);
        };
        
    }
  }, [canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      id="pong"
      width="600"
      height="400"
      style={{ border: '2px solid #FFF', position: 'absolute', margin: 'auto', top: 0, right: 0, left: 0, bottom: 0 }}
    />
  );
};

export default PongGame;