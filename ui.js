function UI_DrawBoard(){
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	ctx.clearRect(0, 0, c.width, c.height);
	var background = new Image()
	background.src='board.png';
	background.onload = function() {
		ctx.drawImage(background,0,0,c.width, c.height) // ,c.width, c.height
		DebugDraw(ctx);
		DrawPlayerPieces(ctx);
		DrawHouses(ctx);	
	}
}

function GetPlayersOnSpot(slot) {
	return players.filter(function(p) { return p.slot() == slot })
}

function UI_GetLocationsForSpotAndCount(spot, playercount, spacing, trans_x, trans_y) {
	// Ugly lineup implementation

	function spotIsVertical(s) {
		var row = UI_GetRowForSlot(s);
		return row==0 || row==2
	}

	var toreturn = [];
	var prop = properties[spot];
	if(spotIsVertical(spot)) {
		spread = prop.w*spacing
	} else {
		spread = prop.h*spacing
	}
	// Impl 1, cheesy

	if(playercount == 1) {
		toreturn.push({x:trans_x +prop.x+prop.w/2, y:trans_y + (prop.y+prop.h/2)})
	} else {
		for(i = 0 ; i < playercount ; i++) {
			var topush = null;
			if(spotIsVertical(spot)) {
				topush = {x:trans_x + prop.x+prop.w/2 + (-spread/2 + spread*(i/(playercount-1))), y:trans_y + (prop.y+prop.h/2)};
			} else {
				topush = {x:trans_x + prop.x+prop.w/2 , y:trans_y + (prop.y+prop.h/2) + (-spread/2 + spread*(i/(playercount-1))) };
			}
			toreturn.push(topush)
		}
	}
	return toreturn;
}





function UI_GetGreenHousesAtSlot(slot) {
	if(all_slots[slot].type != TYPE_LAND || all_slots[slot].houses() == 5) { // 5 is hotel
		return 0;
	} else {
		return all_slots[slot].houses()
	}
}

function UI_GetHotelsAtSlot(slot) {
	if(all_slots[slot].type != TYPE_LAND || all_slots[slot].houses() != 5) { // 5 is hotel
		return 0;
	} else {
		return 1; // Five houses == i hotel
	}
}

function UI_GetRowForSlot(slot) {
	if(slot < 10) return 0;
	if(slot < 20) return 1;
	if(slot < 30) return 2;
	if(slot < 41) return 3; // slot 40 is for jailed folks.
	// Yeah yeah, this could be tighly done with one integer operation, dividing by 10 and floor,
}

function UI_GeneratePlayerStatuses() {
	// Ugly-ass HTML generation for now.
	toreturn = "";
	for(p in players) {
		toreturn += "<h3>" + players[p].name + "</h3>"
		toreturn += "Money: " + players[p].money + "<br>"
		toreturn += "Get out of jail cards: " +players[p].gojcards + "<br>"
		for(prop in players[p].properties) {
			toreturn += players[p].properties[prop].name + "</br>"
		}
		toreturn += "<hr>"
	}

	return toreturn;

}

function DebugDraw(ctx) {

	for(p in properties) {
		ctx.beginPath();
		ctx.lineWidth = "6";
		ctx.strokeStyle = "red";
		ctx.font = "30px Verdana";
		r = properties[p];
		if(all_slots[p]._owner) { // Not all properties are owneable..
			ctx.strokeStyle = all_slots[p].owner().marker_color
			ctx.rect(r.x,r.y,r.w,r.h)
		} else {
			ctx.strokeStyle = "gray"
		}

		ctx.fillText(""+p, r.x+r.w/2, r.y+r.h/2)
		ctx.stroke();	
	}

}

function DrawPlayerPieces(ctx){

	// This algorithm looks bakwards, but its to
	// prevent pieces from being drawn on top of 


	// each other.
	for(var i = 0 ; i < 41 ; i++) { // 40 spots on the board + 1 for the Jail
		var players_here = GetPlayersOnSpot(i);
		var marker_locations = UI_GetLocationsForSpotAndCount(i,players_here.length,0.33, 0,0);
		var fsold = ctx.fillStyle
		for(x = 0 ; x < players_here.length ; x++) {
			ctx.beginPath();
			ctx.arc(marker_locations[x].x, marker_locations[x].y, 20, 0, 2 * Math.PI, false);
			ctx.fillStyle = players_here[x].marker_color;
			ctx.fill();
			ctx.lineWidth = 2;
			ctx.strokeStyle = '#003300';
			ctx.stroke();
		}
		ctx.fillStyle = fsold
	}
}

function DrawHouses(ctx) {

	var house_img_size = 50

	var houseimage = new Image();
	var hotelimage = new Image();

	//
	// Chain-load the two images then draw.
	//

	hotelimage.src="monopoly_red_house.png"

	// Chain calls, when both are loaded do the drawing.
	hotelimage.onload = function() {
		houseimage.src="monopoly_green_house.png"
		houseimage.onload = function() {
			for(var i = 0 ; i < 40 ; i++) { // 40 spots on the board
				var green_houses_here = UI_GetGreenHousesAtSlot(i)
				var red_houses_here = UI_GetHotelsAtSlot(i)

				// Since we are cheating and using the player-marker calculations
				// for spread, we need to move the houses closer to the center of the
				// board to make it look good.
				var trans_x = 0;
				var trans_y = 0;
				row = UI_GetRowForSlot(i);
				switch(row) {
					case 0: trans_y = -50; break;
					case 1: trans_x = +50; break;
					case 2: trans_y = +50; break;
					case 3: trans_x = -50; break;
				}		

				// Dont use top left corner as origin, but the center of the house.
				trans_x -= house_img_size/2;
				trans_y -= house_img_size/2;

				// Figure out if we are drawing a hotel or a normal house.
				var imageToUse = red_houses_here ? hotelimage : houseimage;

				// Cheat, use the player location algorithm. Them move towards center.
				var houses = red_houses_here>0 ? red_houses_here : green_houses_here;
				var marker_locations = UI_GetLocationsForSpotAndCount(i,houses, 0.5, trans_x, trans_y);

				// Actually draw.
				ctx.beginPath();				
				for(x = 0 ; x < houses ; x++) { // For each house
					ctx.drawImage(imageToUse,marker_locations[x].x, marker_locations[x].y,house_img_size,house_img_size)
				}
				ctx.stroke();				
			}
		}
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

    // Push "Jail", bottom left. Adjust it slightly so
    // the visiting pieces (on slot 10) is further out than the truly jailed ones (on slot 40)
    var jailscale = 0.7;
    properties.push(Rect(0,TOTAL_HEIGHT-property_height*jailscale,property_height*jailscale,property_height*jailscale)) // property_height two times since its a corner

    // second row.
    for(var i2 = 1 ; i2 <= 9; i2++) {
    	properties.push(Rect(0,TOTAL_HEIGHT-(property_height+property_width*i2), property_height,property_width))
    }

    // Push "Free parking", top left
    properties.push(Rect(0,0,property_height,property_height)) // property_height two times since its a corner

    // Third row
    for(var i3 = 1 ; i3 <= 9; i3++) {
        properties.push(Rect(property_height+    property_width*(i3-1),0, property_width, property_height))
    }

    // Push "Go to jail", top right
    properties.push(Rect(TOTAL_WIDTH-property_height,0,property_height,property_height)) 

    // Fourth row
    for(var i4 = 1 ; i4 <= 9; i4++) {
        properties.push(Rect(TOTAL_WIDTH-property_height,0+property_height+property_width*(i4-1),property_height,property_width)) 
    }

	// When you are Jailed, you are in slot 40, overlayed with the jail visit.  
    properties.push(Rect(property_height*(1-jailscale),TOTAL_HEIGHT-property_height,property_height*jailscale,property_height*jailscale)) 



}

function PlayerDivname(p) {
	return p.marker_color
}

var TEMPLATE = `
<div id=\"PLAYERNAME\" >
Money: <div id=\"PLAYERNAME_money\"> </div><br>
GOJ cards:<div id=\"PLAYERNAME_gojcards\"> </div><br>
Properties:<br><div id=\"PLAYERNAME_properties\"> </div>
</div><br><hr>`;



function UI_CreateDIVsForPlayers() {
	players_div = document.getElementById("players")
	for(pi in players) {
		var addthis = TEMPLATE.replace(/PLAYERNAME/g,PlayerDivname(players[pi]))
		players_div.innerHTML += addthis
	}
}

function UI_DrawPlayerStats() {

	for(var pi in original_players) {
		pl = original_players[pi]
		UI_UpdatePlayerMoney(pl)
		UI_UpdatePlayerProperties(pl)
		UI_UpdatePlayerGOJcards(pl)
	}
}

function UI_UpdatePlayerMoney(p) {
	var elem = document.getElementById(PlayerDivname(p) + "_money")
	elem.innerHTML = p.money()
}

function UI_UpdatePlayerProperties(p) {
	var elem = document.getElementById(PlayerDivname(p) + "_properties")
	var htmlToSet = ""
	props = p.properties()
	for(pi in props) {
		htmlToSet += props[pi].name + "<br>"
	}
	elem.innerHTML = htmlToSet

}

function UI_UpdatePlayerGOJcards(p) {
	var elem = document.getElementById(PlayerDivname(p) + "_gojcards")
	elem.innerHTML = p.getoutofjailcards()
}