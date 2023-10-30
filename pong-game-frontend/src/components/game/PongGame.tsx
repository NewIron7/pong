import React, { useEffect, useState } from 'react';
import socketService from '../../services/socketService';
import JoinRoom from '../joinRoom';
import GameContext, { IGameContextProps } from '../../gameContext';
import { Game } from '.';

const PongGame: React.FC = () => {

  const [isInRoom, setInRoom] = useState(false);
  const [isStarted, setStarted] = useState(false);
  const [pos, setPos] = useState(false);


  const connectSocket = async () => {
    const socket = await socketService
      .connect("http://localhost:3000")
      .catch((err) => {
      console.log("Error: ", err);
    });
  };

  useEffect(() => {

    connectSocket();

    return () => {
      socketService.disconnect();
    };

  }, []);

  const gameContextValue: IGameContextProps = {
    isInRoom,
    setInRoom,
    isStarted,
    setStarted,
    pos,
    setPos,
  }

  return (
    <GameContext.Provider value={gameContextValue} >
      <div>
      { !isInRoom && <JoinRoom /> }
      { isInRoom && <Game /> }
      </div>
    </GameContext.Provider>
    
    
  );
};

export default PongGame;