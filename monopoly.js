
function DrawBoard(){
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	ctx.clearRect(0, 0, c.width, c.height);
	var background = new Image()
	background.src='board.png';
	background.onload = function() {
		ctx.drawImage(background,0,0,c.width, c.height) // ,c.width, c.height
	}
}

function CalculatePieceLocations(c) {
	// Monopoly board is 40 places. 0, 10, 20, 30 are the corners

	// Declare constants
	// var TOTAL_WIDTH = total width of board
	// property_height is a-b
	// property_width is c-d
	// a is always on 0 from edge
	//
	//         c  d
	//   +-----+--+--+------- a
	//   |     |  |  |
	//   |_____|__|__|_______ b
	// c |_____|
	// d |_____|
	//   |_____|
	//   |_____|
    //   a     b
    //
    
    var TOTAL_WIDTH = c.width;
    var TOTAL_HEIGHT = c.height; // Not neccesary to keep as separate variable, but makes it easiser to read.
    var property_width = 70;
    var property_height = (9 * property_width - TOTAL_WIDTH)/2;

    var properties[];
    // First, location of "Go", which is bottom right
    properties.push(Rect(TOTAL_WIDTH-property_width,TOTAL_HEIGHT-property_height,property_height,property_height)) // property_height two times since its a corner

    // First row.
    for(int i1 = 1 ; i1 <= 9 ; i1++) {
    	properties.push(Rect(property_height-property_width*i1,TOTAL_HEIGHT-property_height,property_width, property_height)
    }

    // Push "Jail", bottom left
    properties.push(Rect(0,TOTAL_HEIGHT-property_height,property_height,property_height)) // property_height two times since its a corner

    // second row.
    for(int i2 = 1 ; i2 <= 9; i2++) {
    	properties.push(Rect(0,TOTAL_HEIGHT-(property_height+property_width*i2), property_height,property_width)
    }

    // Push "Free parking", top left
    properties.push(Rect(0,0,property_height,property_height)) // property_height two times since its a corner

    // Third row
    for(int i3 = 1 ; i3 <= 9; i3++) {
    	properties.push(Rect(property_height*property_width*(i3-1),0, property_width, property_height)
    }

    // Push "Go to jail", top right
	properties.push(Rect(TOTAL_WIDTH-property_height,0,property_height,property_height)) 

    // Fourth row
    for(int i4 = 1 ; i4 <= 9; i4++) {
    	properties.push(Rect(TOTAL_WIDTH-property_height,0+property_height+property_width*(i4-1),property_height,property_width)) 
    }

    // property_height two times since its a corner


}

function OnLoad() {
	// Draw current board
	DrawBoard();
}