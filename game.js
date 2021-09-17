var buttonColors = ["red", "blue", "green", "yellow"];
var gamePattern = [];
var randomChosenColors;
var userClickedPattern = [];
var level=0, start=0;
var playWrongSound;


$(document).keypress(function(){

  if(start===0){
    nextSequence();
    $("#level").text("Level "+level);
    start=1;
  }

});

$(".btn").click(function() {

  var userChosenColor = $(this).attr("id");
  userClickedPattern.push(userChosenColor);
  playSound(userChosenColor);
  animatePress(userChosenColor);
  checkAnswer(userClickedPattern.length-1);

});

//------------------------------------------//


function checkAnswer(currentLevel)
{

  if(userClickedPattern[currentLevel] === gamePattern[currentLevel])
  {

    console.log("success");

    if(userClickedPattern.length === gamePattern.length )
    {
      setTimeout(function(){

        nextSequence();

      },1000);
    }
  }
  else
  {
      $("#level").text("Game Over, Press any key to Restart");
      console.log("wrong");
      playWrongSound = new Audio("sounds/wrong.mp3");
      playWrongSound.play();


      $("body").addClass("wrong");
      setTimeout(function(){

        $("body").removeClass("wrong");

      },200);

      startOver();
  }

}



function nextSequence() {
  userClickedPattern=[];

  level++;
  $("#level").text("Level "+level);
  var randomNumber = Math.floor(Math.random() * 4);
  randomChosenColors = buttonColors[randomNumber];
  gamePattern.push(randomChosenColors);

  $("#" + randomChosenColors).fadeOut(100).fadeIn(100);
  playSound(randomChosenColors);

}

function playSound(name)
{
  var playSound = new Audio("sounds/" + name + ".mp3");
  playSound.play();
}

function animatePress(currentColor){

$("#" + currentColor).addClass("pressed").fadeOut(100).removeClass("pressed").fadeIn(100);
}

function startOver()
{
  level=0;
  gamePattern=[];
  start=0;

}
