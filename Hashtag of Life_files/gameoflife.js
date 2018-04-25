/* Author:
            Matthew Ruten, 2012
*/

var GameOfLife = function(params){
  // User-set params
  var num_cells_y = params["init_cells"].length,
      num_cells_x = params["init_cells"][0].length,
      cell_width  = params["cell_width"]  || 10,
      cell_height = params["cell_height"] || 10,
      init_cells  = params["init_cells"]  || [],
      canvas_id   = params["canvas_id"]   || "life",

      colourful   = params["colourful"] || params["colorful"] || false,

      cell_array = [],
      
      display     = new GameDisplay(num_cells_x, num_cells_y, cell_width, cell_height, canvas_id, colourful),
      interval = null,    // Will store reference to setInterval method -- this should maybe be part of GameDisplay
      init        = function() {
        // Convert init_cells array of 0's and 1's to actual Cell objects
        var length_y = init_cells.length,
            length_x,
            y, x;
        // each row
        for (y = 0; y < length_y; y++) {
          length_x = init_cells[y].length;
          // each column in rows
          for (x = 0; x < length_x; x++) {
            var state = (init_cells[y][x] == 1) ? 'alive' : 'dead';
            init_cells[y][x] = new Cell(x, y, state);
          }
        }
        cell_array = init_cells;
        display.update(cell_array);
      },
      // Function to calculate the next generation of cells, based
      //  on the rules of the Game of Life
      nextGenCells = function() {
        // Implement the Game of Life rules
        // Simple algorithm:
        //  - For each cell:
        //      - Check all of its neighbours
        //      - Based on the rules, set the next gen cell to alive or dead
        
        var current_gen = cell_array,
            next_gen = [],      // New array to hold the next gen cells
            length_y = cell_array.length,
            length_x,
            y, x;
        // each row
        for (y = 0; y < length_y; y++) {
          length_x = current_gen[y].length;
          next_gen[y] = []; // Init new row
          // each column in rows
          for (x = 0; x < length_x; x++) {
            //var state = (init_cells[y][x] == 1) ? 'alive' : 'dead';
            var cell = current_gen[y][x];
            // Calculate above/below/left/right row/column values
            var row_above = (y-1 >= 0) ? y-1 : length_y-1; // If current cell is on first row, cell "above" is the last row (stitched)
            var row_below = (y+1 <= length_y-1) ? y+1 : 0; // If current cell is in last row, then cell "below" is the first row
            var column_left = (x-1 >= 0) ? x-1 : length_x - 1; // If current cell is on first row, then left cell is the last row
            var column_right = (x+1 <= length_x-1) ? x+1 : 0; // If current cell is on last row, then right cell is in the first row

            var neighbours = {
              top_left: current_gen[row_above][column_left].clone(),
              top_center: current_gen[row_above][x].clone(),
              top_right: current_gen[row_above][column_right].clone(),
              left: current_gen[y][column_left].clone(),
              right: current_gen[y][column_right].clone(),
              bottom_left: current_gen[row_below][column_left].clone(),
              bottom_center: current_gen[row_below][x].clone(),
              bottom_right: current_gen[row_below][column_right].clone()
            };

            var alive_count = 0;
            var dead_count = 0;
            for (var neighbour in neighbours) {
              if (neighbours[neighbour].getState() == "dead") {
                dead_count++;
              } else {
                alive_count++;
              }
            }

            // Set new state to current state, but it may change below
            var new_state = cell.getState();
            if (cell.getState() == "alive") {
              if (alive_count < 2 || alive_count > 3) {
                // new state: dead, overpopulation/ underpopulation
                new_state = "dead";
              } else if (alive_count === 2 || alive_count === 3) {
                // lives on to next generation
                new_state = "alive";
              }
            } else {
              if (alive_count === 3) {
                // new state: live, reproduction
                new_state = "alive";
              }
            }

            //console.log("Cell at x,y: " + x + "," + y + " has dead_count: " + dead_count + "and alive_count: " + alive_count);

            next_gen[y][x] = new Cell(x, y, new_state);
            //console.log(next_gen[y][x]);
          }
        }
        //console.log(next_gen);
/*
        next_gen = cell_array;
        next_gen[0][0].setState("dead");
        next_gen[0][1].setState("alive");
        next_gen[1][0].setState("alive");
        next_gen[1][1].setState("dead");
*/
        return next_gen;
      }
  ;
  init();
  return {
    // Returns the next generation array of cells
    step: function(){
      var next_gen = nextGenCells();
      // Set next gen as current cell array
      cell_array = next_gen;
      //console.log(next_gen);
      display.update(cell_array);
    },
    // Returns the current generation array of cells
    getCurrentGenCells: function() {
      return cell_array;
    },
    // Add "The" to function name to reduce confusion
    //  (even though we *could* technically use just setInterval)
    setTheInterval: function(the_interval) {
      interval = the_interval;
    },
    getInterval: function() {
      return interval;
    },
    init: function() {
    	init();
    }
  };
};

// This is an object that will take care of all display-related features.
// Theoretically, you should be able to use any method of display without
// too much extra code. i.e. if you want to display the game using HTML tables,
// svg, or whatever other method you feel like. Just create a new <___>Display
// Object!
var GameDisplay = function(num_cells_x, num_cells_y, cell_width, cell_height, canvas_id, colourful) {
	
  var img = new Image();
  img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABQ1JREFUeNrsnb1PVEEQwPcORFBR8AAV5UPgIDFaaeEfYGNjYWKnpUattDHxH7C2sFArE/4EjY2JjUYTQ2WhMcehIJFgDB9iAMHjnM09DDnv6+3MvJt9N5NMIcmus++3szNvdt9eIp/PGxU5klAgCkRFgSgQFQWiQFQUiAJRaQAgSdAroJ2O7TdBx0F/MtjWDnoZdLdje2vTE9Atn4CcB32O7OMC6FMG2+6C3kP20Q/6FTNbo5Yxgj5mhNr2B3QOu3xELcMEfWSF2jYdQPEKyAiy/TzoL6G2TVIEWN+AZJjs2gt6uN62RQ2kGXQQ2ceU0IlCYlvUQPoCKHVdFhhjm3dLFsUszAoGkvUNSJqgj4xQ2/I+AolzyjsL+rvRlqwl0AWhtpFMlKiBDAkN6C2gxyTYFiWQhIQXrwoTJdloQHpBW4UCocj+vAOiKa8C8c+2KIEMSVkWGGyzBc8V34CMItuvGuReA6NtZJ7rk4dweUcT6IAU22ot9NkM6VKQurrKCYK0+RYDkBToLmQfPQjbLMxn/wZZ4576Y9CrRoVDpnZmebUuWWP63NhkxiWGjOhzY5PJsEDaghiiwiPZsEDUO3glExbIkD4z9qCuHuJzDBnWZ8Ym301RyaUWIGl9btF4hy5ZHgKxJYU+fW7RBPRagAyaQvFNRYiHaEDnlY/Ff6hWXLRfOd00uGrobdD9SLceZ3gYtgJxB9nHG9AXjm3t3o4t2ubDAKEY9Cqyj0eg1xlsOwv6FtnHDdCHlEZxb1BRvOVzHR0dlmgbNxARR/x9so0biIgj/ky22a+Bqb51bFIgeNs+g+aIbGmJCgi27PINdE2obZQTZcMXD+HyDntBQLcg23JRALHvLtjjNQ0V0LmBDBh82SXW3xNGDWRE6qCJbMsoEDm22ctlvvgGJM4p78zOzKhRPMR+S7gs1DauZIMVCLaOxVXDsndhHRVi239npZsrGJ0y7oerkwQvXnMED66UjBrcoXErPxxsywexZ7nSy245IBdBTyMM3m/wJ8oPmcJeisTYdiqkbVtBzLEg35nCPkqoJasHafABgkEvMS1ZHQR9LDq02d54Wq20ZJUD0oU0uJNg0MuCgbjYlgigrJWAVBFIW6D19pAFoUDs5WmbjsHbPu/1sFlWF8GgsR6yafiqvJ118I58oDlTZUu7FJAUwaCxHrLIBCNpcAcuMLHNAmlyAdLt6SysNftL1AlIwnXJwnrIHoKUl8tDKAL6kqN3bMefXNignqqzd8Qx5d3OsKomKhxBvSPmQFyX02QtbZMl/t2uL4VlZb1aDKiS9oYG0ipg0HaNXREKBDNRErW0LwbSIiDD4vIOCiDYZKNqDCk+22sBHUf+pxPIgb8EvcYA4wjoK2QfD0DvO7a1xcXZUpnVTimu9tqqZBbpHdhZ+N7w3IvVT9DHhOG7s6tsloWRON+JxWkbG5C04EGnGxFInA822Lfsed+AYA8P2JR3mmmsIi5K9s1D0L9Qo0BogXAtV7aCvQ/ZR8Y3IPYXanqFAhkl6MM7D9GUVxgQvShZGJA4/zbIdtmj4TxE6ml3O1G2Gg0IyS/UML2lR7JcSVuyuLzDbpgd9CGgUwKx+yjYaqrk7wm985BBgr4kX6HhnYdolVcYkDinvJwFTzYg2F8422BcsrC2fTLhD1c7C9V9WfZronPG/ZjmB1P4kIVDToKeQbR/HeWSxX2BmYoCUSAqCkSBqCgQBaIiQP4KMABODzgFTQcJswAAAABJRU5ErkJggg==';
      
  var canvas = document.getElementById(canvas_id),
      ctx = canvas.getContext && canvas.getContext('2d'),
      width_pixels = num_cells_x * cell_width,
      height_pixels = num_cells_y * cell_height,
      drawGridLines = function() {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 0, 0, 1)";
        ctx.beginPath();
        // foreach column
        for (var i = 0; i <= num_cells_x; i++) {
          ctx.moveTo(i*cell_width, 0);
          ctx.lineTo(i*cell_width, height_pixels);
        }
        // foreach row
        for (var j = 0; j <= num_cells_y; j++) {
          ctx.moveTo(0, j*cell_height);
          ctx.lineTo(width_pixels, j*cell_height);
        }
        ctx.stroke();
      },
      updateCells = function(cell_array) {
        var length_y = cell_array.length,
            length_x,
            y, x;
        // each row
        for (y = 0; y < length_y; y++) {
          length_x = cell_array[y].length;
          // each column in rows
          for (x = 0; x < length_x; x++) {
            // Draw Cell on Canvas
            drawCell(cell_array[y][x]);
          }
        }
      },
      drawCell = function(cell) {
        // find start point (top left)
        var start_x = cell.getXPos() * cell_width,
            start_y = cell.getYPos() * cell_height;
        // draw rect from that point, to bottom right point by adding cell_height/cell_width
        if (cell.getState() == "alive") {
          //console.log("it's alive!");
          if (colourful === true) {
            var r=Math.floor(Math.random()*256),
                g=Math.floor(Math.random()*256),
                b=Math.floor(Math.random()*256),
                a=(Math.floor(Math.random()*6)+5)/10; // rand between 0.5 and 1.0
            ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";
          }
          ctx.fillRect(start_x, start_y, cell_width, cell_height);
          //now draw the image there
          
          ctx.drawImage(img,start_x,start_y,cell_width,cell_height);
        } else {
          ctx.clearRect(start_x, start_y, cell_width, cell_height);
        }
      },
      init = function() {
        //console.log("width_pixels: " + width_pixels);
        //console.log("height_pixels: " + height_pixels);

        // Resize Canvas
        canvas.width = width_pixels;
        canvas.height = height_pixels;

        // No grid lines, for now!
        //drawGridLines();
        
        //add a click event listener - based on http://www.quesucede.com/public/gameoflife/source.html
      	//canvas.addEventListener("click", canvasOnClickHandler, false);
      },
      canvasOnClickHandler = function(event) {
        var cell = getCursorPosition(event);
        var state = Life.grid[cell.row][cell.column]
          == Life.ALIVE ? Life.DEAD : Life.ALIVE;
        Life.grid[cell.row][cell.column] = state;
        drawCell(cell);
      },
      getCursorPosition = function(event) {
        var x;
        var y;
        if (event.pageX || event.pageY) {
          x = event.pageX;
          y = event.pageY;
        } else {
          x = event.clientX
            + document.body.scrollLeft
            + document.documentElement.scrollLeft;
          y = event.clientY
            + document.body.scrollTop
            + document.documentElement.scrollTop;
        }

        x -= gridCanvas.offsetLeft;
        y -= gridCanvas.offsetTop;
        
        var cells = GameOfLife.getCurrentGenCells();
        var cell = new Cell(Math.floor((y - 4) / Life.CELL_SIZE),
          Math.floor((x - 2) / Life.CELL_SIZE));
        return cell;
      };;
  init();
  return {
    update: function(cell_array) {
      updateCells(cell_array);
    }
  };


};

var Cell = function(x_pos, y_pos, state) {
  //console.log("Creating cell at " + x_pos + "," + y_pos + ", and cell state is: " + state);
  /*var x_pos = 0,        // X Position of Cell in Grid
      y_pos = 0,        // Y position of cell in Grid
      state = "dead",   // Cell state: dead or alive.
      asdf;*/
  return {
    x_pos: x_pos,
    y_pos: y_pos,
    state: state,
    getXPos: function() {
      return x_pos;
    },
    getYPos: function() {
      return y_pos;
    },
    getState: function() {
      return state;
    },
    setState: function(new_state) {
      state = new_state;
    },
    clone: function() {
      return new Cell(x_pos, y_pos, state);
    }
  };
};

