import React, { useEffect, useRef, useState } from 'react';
import * as Rendering from './Rendering';
import * as gameObjects from './gameObjects';
import { io, Socket } from 'socket.io-client';

const PongGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [roomId, setRoomId] = useState(''); // Add this state variable

  // Create the WebSocket connection here
  const socket: Socket = io('http://localhost:3000'); // Replace with your server URL

  // Add event listeners for socket events
  socket.on('connect', () => {
    console.log('Connected to the server');
  });
  
  const handleJoined = () => {
    if (socket && roomId) {
      socket.emit('joinPong', { roomId }, (response: any) => {
        if (!response)
          console.log('Room full');
        else
          console.log('You joined a room:', response);
      });
    }
  };

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d')!;

        let pos: number;
        let start: boolean = false;
        const ball: gameObjects.Ball = gameObjects.initializeBall(canvas);
        let user1: gameObjects.Paddle = gameObjects.initializeUser(canvas);
        let user2: gameObjects.Paddle = gameObjects.initializeCom(canvas);
        const net: gameObjects.Net = gameObjects.initializeNet(canvas);

        // Add event listeners for socket events
        socket.on('startPong', (position) => {
          console.log('Received startPong event with position:', position);
          pos = position;
          start = true;
          return position;
        });

        // Add an event listener for 'updatePong' event
        socket.on('updatePong', (data) => {
          if (!start)
            return ;

          socket.emit('updatePaddle', {paddleY: pos ? user2.y : user1.y} );
          // Process the 'updatePong' event data received from the server
          // Update the game state based on the data
          // For example, update ball position, player positions, and redraw the canvas
          console.log('Received updatePong event with data:', data);

          // Update the game state and render it
          // You can access and update ball, user, com, net, etc. here
          // For example:
          ball.x = data.ball.x;
          ball.y = data.ball.y;
          user1 = data.user1;
          user2 = data.user2;

          return (data);
        });

        const handleMouseMove = (evt: MouseEvent) => {
            if (!start)
              return ;
            const rect = canvas.getBoundingClientRect();
            if (pos)
              user2.y = evt.clientY - rect.top - user2.height / 2;
            else
              user1.y = evt.clientY - rect.top - user1.height / 2;
        };

        canvas.addEventListener("mousemove", handleMouseMove);
        const framePerSecond = 50;
        const loop = setInterval(() => {
            render(ctx, canvas, ball, user1, user2, net);
        //}, 1000);
        }, 1000 / framePerSecond);

        // Clear the interval when the component unmounts
        return () => {
            canvas.removeEventListener("mousemove", handleMouseMove);
            clearInterval(loop);

            // Close the WebSocket connection
            socket.disconnect();
        };
        
    }
  }, [canvasRef]);

  return (
    <div>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={handleJoined}>Join Room</button>
      <canvas
        ref={canvasRef}
        id="pong"
        width="600"
        height="400"
        style={{ border: '2px solid #FFF', position: 'absolute', margin: 'auto', top: 0, right: 0, left: 0, bottom: 0 }}
      />
    </div>
    
  );
};

export default PongGame;