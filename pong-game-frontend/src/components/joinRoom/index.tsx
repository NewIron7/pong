import React, { useContext, useState } from "react";
import "./JoinRoom.css"; // Import the CSS file
import gameContext from "../../gameContext";
import socketService from "../../services/socketService";
import gameService from "../../services/gameService";

interface IJoinRoomProps {}

export function JoinRoom(props: IJoinRoomProps) {


    const [roomName, setRoomName] = useState("");
    const [isJoining, setJoining] = useState(false);

    const { setInRoom, isInRoom } = useContext(gameContext);

    const handleRoomNameChange = (e: React.ChangeEvent<any>) => {
        const value = e.target.value;
        setRoomName(value);
    };

    const joinRoom = async (e: React.FormEvent) => {
        e.preventDefault();

        const socket = socketService.socket;
        if (!roomName || roomName.trim() === "" || !socket) return ;

        setJoining(true);

        const joined = await gameService
            .joinGameRoom(socket, roomName)
            .catch( (err) => {
                alert(err.error);
            });

        if (joined)
            setInRoom(true);

        setJoining(false);

    }

    return (
        <form onSubmit={joinRoom}>
            <div className="join-room-container">
                <h4>Enter Room ID to Join the Game</h4>
                <input 
                    type="text"
                    className="room-id-input"
                    placeholder="Room ID"
                    value={roomName}
                    onChange={handleRoomNameChange}
                />
                <button
                    className="join-button"
                    type="submit"
                    disabled={isJoining}>
                        {isJoining ? "Joining..." : "Join"}
                </button>
            </div>
        </form>
    );
}

export default JoinRoom;