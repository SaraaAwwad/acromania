class AcroGame{
    
    constructor(connections){
        this._players = connections;
        this._gameRun = false;
        this._currentText = "";
        this._turns =  [];
        this._voteTime = false;
        this._votes =  [];
        var x = 0;
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
            this._userTurn(turn, socket);
        });
    }

    updateUsers(){
                
    }

    removeUser(socket){
        //socket.removeAllListeners("turn");
        
        this._players.forEach((user, idx) => {
            user.removeAllListeners("turn");
        });

        this._players.forEach((user, idx) => {
            user.on('turn', (turn) => {
                this._userTurn(turn, user);
            });
        });
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
            var j=0;
            for(j =0; j< this._turns.length; j++){
                answers += (j+1) + "-" + this._turns[j][0] + "<br>";
            }

            if(j==0){
                answers+="No given answers.";
            }else{
                answers+="- Whisper me your votes quickly!";
            }

            this._sendToUsers(answers);    
            this._voteTime = true;    
          }, 70000);
        });
      }

    _checkVotes(){

        return new Promise(resolve => {
            setTimeout(() => {
              resolve('resolved');
              this._voteTime = false; 

              var counter=[];
              for(var k =0; k < this._players.length; k++){
                    counter[k] = [this._players[k].username, this._players[k].idx, 0];
              }

              var votes = "Results: <br>";
              
              for(var i=0; i<this._votes.length; i++){
                    var answerIndex = this._votes[i][0];
                    var useridx = this._turns[answerIndex][1];

                   for(var j=0; j < counter.length; j++){
                       if(useridx == counter[j][1])
                       {
                           counter[j][2]++;
                       }
                   }
                }
                
                for (var i=0; i< counter.length; i++){
                    votes+= counter[i][0] + " : " + counter[i][2]+" <br> ";
                }
                
              this._sendToUsers(votes);      
            }, 45000);
          });
    }

    //user whispers..
    _userTurn(turn, user){
 
        if(this.isRunning()){

            if(this._voteTime){
                this._addVote(turn, user);
            }else{
                this._addAnswer(turn, user);            
            }
        }else{
            this._sendToUser(this._players.indexOf(user), `You Whispered: ${turn}`);
        }
    }

    _addVote(turn, user){

        if(this._checkVoteSubmission(user.idx)){
            this._sendToUser(this._players.indexOf(user), "Vote already submitted..");
            return;
        }

        turn--;

        if(!this._checkVoteValidation(turn, user.idx))
        {
            this._sendToUser(this._players.indexOf(user), "Please enter a valid vote..");    
            return;        
        }
        
        console.log("votes before: "+ this._votes.length);
        this._votes[this._votes.length] = [turn, user.idx];
        console.log("votes after: "+ this._votes.length);

        this._sendToUser(this._players.indexOf(user), `You voted for: ${this._turns[turn][2]}`);
        
    }
    
    _checkVoteSubmission(userIndex){
        
        for(var i =0 ; i< this._votes.length; i++){
            if(this._votes[i][1]==userIndex)
            {console.log("enta 3mlt abl keda");
            return true;}
        }
        return false;
    }

    _checkVoteValidation(vote, userIndex){

        if (isNaN(vote) || vote <0 ){
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

    _addAnswer(turn, user){

        if(this._checkAnswerSubmission(user.idx)){
            this._sendToUser(this._players.indexOf(user), "Answer already submitted..");
            return;
        }

        if(!this._checkAnswerValidation(turn)){
            this._sendToUser(this._players.indexOf(user), "Please enter a valid answer.");
            return;
        }

        var len = this._turns.length;
        console.log("before: "+len);
        this._turns[len] = [turn, user.idx, user.username];
        console.log("after: "+  this._turns.length);
    
        this._sendToUser(this._players.indexOf(user), `You Whispered: ${turn}`);        
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