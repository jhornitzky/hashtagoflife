function game_toggle(game, force) {
  var interval = game.getInterval();
  if (force == "stop" || interval !== null) {
    // Stop
    clearInterval(interval);
    game.setTheInterval(null);
  } else {
    // start
    interval = setInterval(game.step, 100);
    game.setTheInterval(interval);
  }
}

function add_listeners(game, example_num) {
  $("#" + example_num + " .toggle, #" + example_num + " canvas").click(function(){
    game_toggle(game);
  });
  $("#" + example_num + " .step").click(function(){
    game_toggle(game, "stop");
    game.step();
  });
}

var mob_cutoff = 700;

var cell_size = 100;
if ($(window).width() < mob_cutoff ) cell_size=25; 

var example3_cells = [];

//Specify the cells I want
//var rand_num = Math.floor(Math.random()*100)+10;
var rand_num = not_so_rand_num = 20;
for (var i=0; i < rand_num; i++) {
  example3_cells[i] = [];
  for (var j=0; j < rand_num; j++) {
    example3_cells[i][j] = Math.floor(Math.random()*2);
  }
}

var game3 = new GameOfLife({
  canvas_id:    "life-example3",
  cell_width:   cell_size,
  cell_height:  cell_size,
  init_cells:   example3_cells,
  colourful:    true
});
add_listeners(game3, "example3");
    