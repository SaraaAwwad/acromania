class AcroGame{
    
    constructor(connections){
        this.connections = connections;
        this._gameRun = false;
        
    }

    gameStart(){
        this._gameRun = true;
        this._sendToUsers("Game is starting..");
    }

    isRunning(){
        if(this._gameRun)
            return true;
        else
            return false;
    }

    gameEnd(){
        this._gameRun = false;
        this._sendToUsers("Waiting for more players to start game..");        
    }

    updateUsernames(connections){
        this.connections = connections;
    }

    _sendToPlayer(playerIndex, msg) {
        this._players[playerIndex].emit('message', msg);
      }
    
    _sendToUsers(msg) {
        this.connections.forEach((connection) => {
          connection.emit('bot message', msg);
        });
        console.log(msg);
    }
    
    
}
module.exports= AcroGame;