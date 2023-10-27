import React, { useEffect, useRef } from 'react';

const PongGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Define your functions here
  const drawRect = (x: number, y: number, w: number, h: number, color: string, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };

  const drawArc = (x: number, y: number, r: number, color: string, ctx: CanvasRenderingContext2D) => {
    if (ctx) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }
  };

  const resetBall = (canvas: HTMLCanvasElement, ball: any) => {
    if (canvas) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.velocityX = -ball.velocityX;
        ball.speed = 7;
    }
  };

  const drawNet = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, net: any) => {
    if (ctx) {
        for (let i = 0; i <= canvas.height; i += 15) {
            drawRect(net.x, net.y + i, net.width, net.height, net.color, ctx);
        }
    }
  };

  const drawText = (text: number, x: number, y: number, ctx: CanvasRenderingContext2D) => {
    if (ctx) {
        ctx.fillStyle = "#FFF";
        ctx.font = "75px fantasy";
        ctx.fillText(text.toString(), x, y);
    }
  };

  const collision = (b: any, p: any) => {
        p.top = p.y;
        p.bottom = p.y + p.height;
        p.left = p.x;
        p.right = p.x + p.width;

        b.top = b.y - b.radius;
        b.bottom = b.y + b.radius;
        b.left = b.x - b.radius;
        b.right = b.x + b.radius;

        return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
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
    com.y += ((ball.y - (com.y + com.height/2)))*0.1;
    
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

        // Ball object
        const ball = {
            x : canvas.width/2,
            y : canvas.height/2,
            radius : 10,
            velocityX : 5,
            velocityY : 5,
            speed : 7,
            color : "WHITE"
        }

        // User Paddle
        const user = {
            x : 0, // left side of canvas
            y : (canvas.height - 100)/2, // -100 the height of paddle
            width : 10,
            height : 100,
            score : 0,
            color : "WHITE"
        }

        // COM Paddle
        const com = {
            x : canvas.width - 10, // - width of paddle
            y : (canvas.height - 100)/2, // -100 the height of paddle
            width : 10,
            height : 100,
            score : 0,
            color : "WHITE"
        }

        // NET
        const net = {
            x : (canvas.width - 2)/2,
            y : 0,
            height : 10,
            width : 2,
            color : "WHITE"
        }

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
        return () => clearInterval(loop);
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