import React, { useRef, useEffect, useState, useContext } from "react";
import * as Rendering from "./Rendering";
import * as gameObjects from "./gameObjects";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";
import gameContext from "../../gameContext";
import { Socket } from "socket.io-client";

export type IPlayPong = {
    ball: gameObjects.Ball;
    user1: gameObjects.Paddle;
    user2: gameObjects.Paddle;
};

interface IGameProps {};

export function Game(props: IGameProps) {

    let width = 600;
    let height = 400;

    const {isInRoom, setInRoom, isStarted, setStarted, pos, setPos} = useContext(gameContext);

    const [pong, setPong] = useState<IPlayPong>({
        ball: gameObjects.initializeBall(width, height),
        user1: gameObjects.initializeUser(height),
        user2: gameObjects.initializeCom(width, height),
    });

    //const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    let canvas: HTMLCanvasElement | null;

    const net: gameObjects.Net = gameObjects.initializeNet(width);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const drawRect = Rendering.drawRect;
    const drawArc = Rendering.drawArc;
    const drawNet = Rendering.drawNet;
    const drawText = Rendering.drawText;
  
    const render = (
          ctx: CanvasRenderingContext2D,
          canvas: HTMLCanvasElement,
          ball: any, 
          user1: any, 
          user2: any, 
          net: any ) => {
      // clear the canvas
      drawRect(0, 0, canvas.width, canvas.height, "#000", ctx);
      
      // draw the user score to the left
      drawText(user1.score,canvas.width/4,canvas.height/5, ctx);
      
      // draw the COM score to the right
      drawText(user2.score,3*canvas.width/4,canvas.height/5, ctx);
      
      // draw the net
      drawNet(ctx, canvas, net);
  
      // draw the user's paddle
      drawRect(user1.x, user1.y, user1.width, user1.height, user1.color, ctx);
      
      // draw the COM's paddle
      drawRect(user2.x, user2.y, user2.width, user2.height, user2.color, ctx);
      
      // draw the ball
      drawArc(ball.x, ball.y, ball.radius, ball.color, ctx);
    };

    const updateGame = (paddleY: number) => {

        if (socketService.socket) {
            gameService.updateGame(socketService.socket, paddleY);
           
        }
    };

    const onUpdateGame = () => {
        if (socketService.socket)
        {
            gameService.onUpdateGame(socketService.socket, (newPong, started) => {
                if (!newPong.user1 || !newPong.user2 || !started)
                {
                    setPong({
                        ball: gameObjects.initializeBall(width, height),
                        user1: gameObjects.initializeUser(height),
                        user2: gameObjects.initializeCom(width, height),
                    });
                }
                else
                {
                    setPong(newPong);
                }
            });
        }
        
    };

    const checkKicked = () => {
        if (socketService.socket) {
            gameService.kicked(socketService.socket, () => {
                alert("You opponent got disconnected");
                setInRoom(false);
                setStarted(false);
            });
        }
    };

    const startGame = () => {
        if (socketService.socket) {
            gameService.started(socketService.socket, (newPos) => {
                setPos(newPos);
                setStarted(true);
                setPong({
                    ball: gameObjects.initializeBall(width, height),
                    user1: gameObjects.initializeUser(height),
                    user2: gameObjects.initializeCom(width, height),
                });
            });
        }
    };

    const handleMouseMove = (evt: MouseEvent) => {
        if (!isStarted)
          return ;
        let rect;
        if (canvas)
            rect = canvas.getBoundingClientRect();
        else
            return ;
        if (pos)
          pong.user2.y = evt.clientY - rect.top - pong.user2.height / 2;
        else
          pong.user1.y = evt.clientY - rect.top - pong.user1.height / 2;
    };
  
    useEffect(() => {

        checkKicked();
        onUpdateGame();
        
        //setCanvas(canvasRef.current);
        canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d')!;

            canvas.addEventListener("mousemove", handleMouseMove);

            const framePerSecond = 25;
            const loop = setInterval(() => {
                if (!isStarted)
                    startGame();
                if (isStarted)
                {
                    updateGame(pos ? pong.user2.y : pong.user1.y);
                }
                if (canvas)
                    render(ctx, canvas, pong.ball, pong.user1, pong.user2, net);
            }, 1000 / framePerSecond);
    
            // Clear the interval when the component unmounts
            return () => {
                if (canvas)
                    canvas.removeEventListener("mousemove", handleMouseMove);
                clearInterval(loop);
                if (socketService.socket)
                    gameService.cleanUp(socketService.socket);
            };
            
        }
    }, [canvasRef, isStarted, isInRoom, pong, pos]);

    

    return (
        <div>
            <div>{!isStarted && <h3>Waiting for an opponant</h3> }</div>
            <canvas
            ref={canvasRef}
            id="pong"
            width={width}
            height={height}
            style={{ border: '2px solid #FFF', position: 'absolute', margin: 'auto', top: 0, right: 0, left: 0, bottom: 0 }}
            />
        </div>
    );
}