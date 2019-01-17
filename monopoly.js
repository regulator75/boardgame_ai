//
// Data
//
var properties = [];
var players = [];

function Rect(x,y,w,h) {
	return {
		x : x,
		y:y,
		w:w,
		h:h
	}
}

function MakePlayer() {
	return {
		spot: 0,
		money: 2000,
		marker_color: "#00ff00"
	}
}

function DrawBoard(){
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	ctx.clearRect(0, 0, c.width, c.height);
	var background = new Image()
	background.src='board.png';
	background.onload = function() {
		ctx.drawImage(background,0,0,c.width, c.height) // ,c.width, c.height
		DebugDraw(ctx);
		DrawPlayerPieces(ctx);
	}
}

function GetPlayersOnSpot(spot) {
	return players.filter(function(p) { return p.spot == spot })
}

function GetLocationsForSpotAndCount(spot, playercount) {
	// Ugly lineup implementation

	function spotIsVertical(s) {
		return (s < 11 || (s>19 && s<31))
	}

	var toreturn = [];
	var prop = properties[spot];
	if(spotIsVertical(spot)) {
		spread = prop.w/3
	} else {
		spread = prop.h/3
	}
	// Impl 1, cheesy

	if(playercount == 1) {
		toreturn.push({x:prop.x+prop.w/2, y:(prop.y+prop.h/2)})
	} else {
		for(i = 0 ; i < playercount ; i++) {
			var topush = null;
			if(spotIsVertical(spot)) {
				topush = {x:prop.x+prop.w/2 + (-spread/2 + spread*(i/(playercount-1))), y:(prop.y+prop.h/2)};
			} else {
				topush = {x:prop.x+prop.w/2 , y:(prop.y+prop.h/2) + (-spread/2 + spread*(i/(playercount-1))) };
			}
			toreturn.push(topush)
		}
	}
	return toreturn;
}

function DrawPlayerPieces(ctx){

	// This algorithm looks bakwards, but its to
	// prevent pieces from being drawn on top of 
	// each other.
	for(var i = 0 ; i < 40 ; i++) { // 40 spots on the board
		var players_here = GetPlayersOnSpot(i);
		var marker_locations = GetLocationsForSpotAndCount(i,players_here.length);
		for(x = 0 ; x < players_here.length ; x++) {
			ctx.beginPath();
			ctx.arc(marker_locations[x].x, marker_locations[x].y, 20, 0, 2 * Math.PI, false);
			ctx.fillStyle = players_here[x].marker_color;
			ctx.fill();
			ctx.lineWidth = 2;
			ctx.strokeStyle = '#003300';
			ctx.stroke();
		}
	}
}


function DebugDraw(ctx) {
	ctx.beginPath();
	ctx.lineWidth = "6";
	ctx.strokeStyle = "red";
	ctx.font = "30px Verdana";
	for(p in properties) {
		r = properties[p];
		ctx.rect(r.x,r.y,r.w,r.h)
		ctx.fillText(""+p, r.x+r.w/2, r.y+r.h/2)
	}
	ctx.stroke();
}

function CalculatePieceLocations(c) {
	// Monopoly board is 40 places. 0, 10, 20, 30 are the corners

	// Declare constants
	// var TOTAL_WIDTH = total width of board
	// property_height is a-b
	// property_width is c-d
	// a is always on 0 from edge
	//
	//          c    d
	//   +------+----+----+------- a
	//   |      |    |    |
	//   |      |    |    |
	//   |______|____|____|_______ b
	//   |      |
	// c |______|
	//   |      |
	// d |______|
	//   |      |
	//   |______|
	//   |      |
	//   |      |
    //   a     b
    //
    
    var TOTAL_WIDTH = c.width;
    var TOTAL_HEIGHT = c.height; // Not neccesary to keep as separate variable, but makes it easiser to read.
    var property_width = 82;
    //var property_height = (9 * property_width - TOTAL_WIDTH)/2;
    var property_height = (TOTAL_WIDTH - (9 * property_width)) / 2;

    // First, location of "Go", which is bottom right
    properties.push(Rect(TOTAL_WIDTH-property_height,TOTAL_HEIGHT-property_height,property_height,property_height)) // property_height two times since its a corner

    // First row.
    for(var i1 = 1 ; i1 <= 9 ; i1++) {
    	properties.push(Rect(TOTAL_WIDTH-property_height-property_width*i1,TOTAL_HEIGHT-property_height,property_width, property_height))
    }

    // Push "Jail", bottom left
    properties.push(Rect(0,TOTAL_HEIGHT-property_height,property_height,property_height)) // property_height two times since its a corner

    // second row.
    for(var i2 = 1 ; i2 <= 9; i2++) {
    	properties.push(Rect(0,TOTAL_HEIGHT-(property_height+property_width*i2), property_height,property_width))
    }

    // Push "Free parking", top left
    properties.push(Rect(0,0,property_height,property_height)) // property_height two times since its a corner

    // Third row
    for(var i3 = 1 ; i3 <= 9; i3++) {
    	properties.push(Rect(property_height+	property_width*(i3-1),0, property_width, property_height))
    }

    // Push "Go to jail", top right
	properties.push(Rect(TOTAL_WIDTH-property_height,0,property_height,property_height)) 

    // Fourth row
    for(var i4 = 1 ; i4 <= 9; i4++) {
    	properties.push(Rect(TOTAL_WIDTH-property_height,0+property_height+property_width*(i4-1),property_height,property_width)) 
    }

    // property_height two times since its a corner


}

function OnLoad() {
	players.push(MakePlayer())
	players.push(MakePlayer())
	players.push(MakePlayer())
	players.push(MakePlayer())

	players[1].marker_color = "#ff00ff"
	players[2].marker_color = "#ff0000"
	players[3].marker_color = "#000000"

	players[2].spot=15
	players[3].spot=15

	// Draw current board
	CalculatePieceLocations(document.getElementById("myCanvas"));
	DrawBoard();

}