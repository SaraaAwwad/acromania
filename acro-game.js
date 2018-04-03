class AcroGame{
    
    constructor(connections){
        this._players = connections;
        this._gameRun = false;
        this._currentText = "";
        this._turns =  [];
        this._voteTime = false;
        this._votes =  [];
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
        this._sendToUsers("Waiting for more players to start game..");      
        this.reset();  
    }

    reset(){
        this._currentText = "";
        this._turns =  [];
        this._voteTime = false;
        this._votes =  [];
    }

    addUser(socket, idx){
        socket.on('turn', (turn)=>{
            this._userTurn(idx, turn, socket.username);
        });
    }

    removeUser(socket){
        this._players.splice(this._players.indexOf(socket), 1);
    }

    _sendToUser(UserIndex, msg) {
        this._players[UserIndex].emit('bot message', msg);
      }
          
    _sendToUsers(msg) {
        this._players.forEach((connection) => {
          connection.emit('bot message', msg);
        });
        console.log(msg);
    }
    
    async alphabetGenerator(){

        while(this.isRunning()){
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                    
            for (var i = 0; i < 5; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));

                this._currentText = text; 
                text+=", Whisper me your answers quickly!";

                this._sendToUsers(text);

            var res = await this._checkAnswers();
            if(this._turns.length>0)
            {var votes = await this._checkVotes();}
           
            this.reset();
        }
    }

    _checkAnswers() {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve('resolved');
          
            var answers = "Answers: <br>";
            var i=0;
            for(i =0; i< this._turns.length; i++){
                answers += (i+1) + "-" + this._turns[i][0] + "<br>";
            }

            if(i==0){
                answers+="No given answers.";
            }else{
                answers+=", Whisper me your votes quickly!";
            }
            this._sendToUsers(answers);    
            this._voteTime = true;    
          }, 60000);
        });
      }

    _checkVotes(){

        return new Promise(resolve => {
            setTimeout(() => {
              resolve('resolved');
              this._voteTime = false;  
              var counter = Array(this._players.length).fill(0);
              var votes = "Results: <br>";
                for(var i=0; i<this._votes.length; i++){
                    var answerIndex = this._votes[i][0];
                    var userIndex = this._turns[answerIndex][1];
                    counter[userIndex]+=1;
                }
                
                for (var key in counter){
                    votes+= this._players[key].username + " : " + counter[key]+" <br> ";
                }
                
              this._sendToUsers(votes);      
            }, 90000);
          });
    }

    //user whispers..
    _userTurn(userIndex, turn, username){

        if(this.isRunning()){
            if(this._voteTime){
                this._addVote(userIndex, turn);
            }else{
                this._addAnswer(userIndex, turn, username);            
            }
        }else{
            this._sendToUser(userIndex, `You Whispered: ${turn}`);
        }
    }

    _addVote(userIndex, turn){
        
        if(this._checkVoteSubmission(userIndex)){
            this._sendToUser(userIndex, "Vote already submitted..");
            return;
        }

        turn--;

        if(!this._checkVoteValidation(turn, userIndex))
        {
            this._sendToUser(userIndex, "Please enter a valid vote..");    
            return;        
        }
        
        console.log("votes before: "+this._votes.length);
        this._votes[this._votes.length] = [turn, userIndex];
        console.log("votes after: "+this._votes.length);
        
        this._sendToUser(userIndex, `You voted for: ${this._turns[turn][2]}`);
        
    }
    
    _checkVoteSubmission(userIndex){
        for(var i =0 ; i< this._votes.length; i++){
            if(this._votes[i][1]==userIndex)
            return true;
        }
        return false;
    }

    _checkVoteValidation(vote, userIndex){
        if (isNaN(vote)){
            return false;
        }
        else if (this._turns.length > vote){
            if (this._turns[vote][1] == userIndex){
                return false;
            }
            return true;
        }

        return false;
    }

    _addAnswer(userIndex, turn, username){
        if(this._checkAnswerSubmission(userIndex)){
            this._sendToUser(userIndex, "Answer already submitted..");
            return;
        }

        if(!this._checkAnswerValidation(turn)){
            this._sendToUser(userIndex, "Please enter a valid answer.");
            return;
        }

        var len = this._turns.length;
        console.log("before: "+len);
        this._turns[len] = [turn, userIndex, username];
        console.log("after: "+  this._turns.length);
    
        this._sendToUser(userIndex, `You Whispered: ${turn}`);
        
    }

    _checkAnswerSubmission(userIndex){
        for(var i =0 ; i< this._turns.length; i++){
            if(this._turns[i][1]==userIndex)
            return true;
        }
        return false;
    }

    _checkAnswerValidation(answer){
        var answer = answer.toUpperCase();
        var usrAnswer = answer.split(" ");
        var matchingPattern = this._currentText;

        if(usrAnswer.length == matchingPattern.length){
            for(var i =0; i<usrAnswer.length; i++){
                if(usrAnswer[i][0]!= matchingPattern[i]){
                    return false;
                }            
            }
        }else{
            return false;
        }

        return true;
    }

}
module.exports= AcroGame;