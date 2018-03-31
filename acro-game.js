class AcroGame{
    
    constructor(connections){
        this.connections = connections;
        this._gameRun = false;
        this._currentText = "";
        this._turns = [];
        this._conLength = 0;
    }

    gameStart(){
        this._gameRun = true;
        this._sendToUsers("Game is starting..");
        this.alphabetGenerator();
    }

    isRunning(){
        if(this._gameRun)
            return true;
        else
            return false;
    }

    gameEnd(){
        this._gameRun = false;
        this._turns = [];
        this._sendToUsers("Waiting for more players to start game..");        
    }

    updateUsernames(connections){
        this.connections = connections;
        this.connections.forEach((user, idx) => {
            user.on('turn', (turn) => {
              this._userTurn(idx, turn);
            });
          });
    }

    _sendToUser(UserIndex, msg) {
        this.connections[UserIndex].emit('bot message', msg);
      }
    
          
    _sendToUsers(msg) {
        this.connections.forEach((connection) => {
          connection.emit('bot message', msg);
        });
        console.log(msg);
    }
    
    async alphabetGenerator(){
        //stopping condition

        while(this.isRunning()){
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                    
            for (var i = 0; i < 5; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));

                this._currentText = text; //for testing later..
                this._sendToUsers(text);

            var res = await this._checkGameOver();
            console.log("ana rg3t alphagenerator tani");
        }
    }

     _checkGameOver() {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve('resolved');
          
            var answers = "Answers: <br>";

            for (var key in this._turns) {
                answers+= key + "-" + this._turns[key];
                answers+= "<br>";
            }
            //console.log(answers);
            this._sendToUsers(answers);        
            this._turns = [];
            this._currentText="";

          }, 12000);
        });
      }

    //user whispers..
    _userTurn(userIndex, turn){
        //check if already whispered a valid answer
        if (this._turns[userIndex]!=null){
            this._sendToUser(userIndex, "You already played!");
            return;
        }
        //check if valid 
        //--

        //add to answers
        this._turns[userIndex] = turn;
        this._sendToUser(userIndex, `You Whispered: ${turn}`);
        
        /*for (var key in this._turns) {
            var value = this._turns[key];
            console.log(key, value);
        }*/
    }

}
module.exports= AcroGame;