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

var all_slots = []

var TYPE_LAND = 1
var TYPE_JAIL = 2
var TYPE_FREEPARKING = 3
var TYPE_GOTOJAIL = 4
var TYPE_GO = 5
var TYPE_CHANCE = 6
var TYPE_COMMUNITY = 7
var TYPE_TAX = 8 // Income tax and luxury tax

function MakeBuyableProperty(slot, name, price, houseprice, rent, family, rail, waterelect) {
	prop = {
		type: TYPE_LAND,
		name: name,
		price: price,
		houseprice: houseprice, // Cost to build one house 
		slot: slot,
		rent: rent, // empty, 1,2,3,4 houses, hotel
		family: family, // brown, blue, pink etc.
		isRailroad: false, // duh.. is this a gas-station
		isWaterOrElectricity : waterelect,
		houses: 0 // 5 is hotel
	}
	all_slots[slot] = prop;
}

function MakeCardProperty(slot, type) {
	MakeGenericProperty(slot,type)
}
function MakeGoProperty(slot) {
	MakeGenericProperty(slot,TYPE_GO)
}
function MakeJailProperty(slot) {
	MakeGenericProperty(slot,TYPE_JAIL)
}
function MakeFreeParkingProperty(slot) {
	MakeGenericProperty(slot,TYPE_FREEPARKING)
}
function MakeGoToJailProperty(slot) {
	MakeGenericProperty(slot,TYPE_GOTOJAIL)
}
function MakeTaxProperty(slot, cost) {
	prop = {
		type: TYPE_TAX,
		slot: slot,
		cost : cost
	}
	all_slots[slot] = prop;	
}


function MakeGenericProperty(slot, type) {
	prop = {
		type: type,
		slot: slot,
	}
	all_slots[slot] = prop;
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
		DrawPlayerPieces
	}
}

function GetPlayersOnSpot(spot) {
	return players.filter(function(p) { return p.spot == spot })
}

function UI_GetLocationsForSpotAndCount(spot, playercount, spacing, trans_x, trans_y) {
	// Ugly lineup implementation

	function spotIsVertical(s) {
		var row = UI_GetRowForSlot(s);
		return row==1 || row==3
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
		toreturn.push({x:prop.x+prop.w/2, y:(prop.y+prop.h/2)})
	} else {
		for(i = 0 ; i < playercount ; i++) {
			var topush = null;
			if(spotIsVertical(spot)) {
				topush = {x:+trans_x + prop.x+prop.w/2 + (-spread/2 + spread*(i/(playercount-1))), y:+trans_y + (prop.y+prop.h/2)};
			} else {
				topush = {x:+trans_x + prop.x+prop.w/2 , y:+trans_y + (prop.y+prop.h/2) + (-spread/2 + spread*(i/(playercount-1))) };
			}
			toreturn.push(topush)
		}
	}
	return toreturn;
}

function DrawPlayerPieces(ctx){

	// This algorithm looks bakwards, but its to
	// prevent pieces from being drawn on top of 

	var houseimage = new Image();
	houseimage.src="monopoly_green_house.png"
	houseimage.onload = function() {
		// each other.
		for(var i = 0 ; i < 40 ; i++) { // 40 spots on the board
			var players_here = GetPlayersOnSpot(i);
			var marker_locations = UI_GetLocationsForSpotAndCount(i,players_here.length,0.33, 0,0);
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
}

function DrawHouses(ctx) {
	for(var i = 0 ; i < 40 ; i++) { // 40 spots on the board
		var green_houses_here = UI_GetGreenHousesAtSlot(i)

		var trans_x = 0;
		var trans_y = 0;
		row = UI_GetRowForSlot(i);
		switch(row) {
			case 0: trans_y = -50; break;
			case 1: trans_x = +50; break;
			case 2: trans_y = +50; break;
			case 3: trans_x = -50; break;
		}		
		// Cheat, use the player locatoin algorithm. Them move towards center.
		var marker_locations = UI_GetLocationsForSpotAndCount(i,green_houses_here.length, 0.4, trans_x, trans_y);
		
		for(x = 0 ; x < green_houses_here.length ; x++) {
			ctx.beginPath();

			ctx.drawImage('monopoly_green_house.png')
			ctx.arc(marker_locations[x].x, marker_locations[x].y, 20, 0, 2 * Math.PI, false);
			ctx.fillStyle = '#00ff00';
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
        properties.push(Rect(property_height+    property_width*(i3-1),0, property_width, property_height))
    }

    // Push "Go to jail", top right
    properties.push(Rect(TOTAL_WIDTH-property_height,0,property_height,property_height)) 

    // Fourth row
    for(var i4 = 1 ; i4 <= 9; i4++) {
        properties.push(Rect(TOTAL_WIDTH-property_height,0+property_height+property_width*(i4-1),property_height,property_width)) 
    }

    // property_height two times since its a corner


}

//
// House management
//

function AddHouseToSlot(slot) {
	// First, make sure its buildable
	if(all_slots[slot].type != TYPE_LAND || all_slots[slot].houses == 5) {
		// Cant build here.
		return false;
	} else {
		// OPTIONAL RULE IN FUTURE: Limit the number of houses that can co-exist onboard.
		all_slots[slot].houses += 1
		return true;
	}
}

function RemoveHouseFromSlot(slot) {
	if(all_slots[slot].type != TYPE_LAND || all_slots[slot].houses == 0) {
		// Cant build here.
		return false;
	} else {
		all_slots[slot].houses -= 1
		return true;
	}
}

function UI_GetGreenHousesAtSlot(slot) {
	if(all_slots[slot].type != TYPE_LAND || all_slots[slot].houses == 5) { // 5 is hotel
		return 0;
	} else {
		return all_slots[slot].houses
	}
}

function UI_GetHotelsAtSlot(slot) {
	if(all_slots[slot].type != TYPE_LAND || all_slots[slot].houses != 5) { // 5 is hotel
		return 0;
	} else {
		return 1; // Five houses == i hotel
	}
}

function UI_GetRowForSlot(slot) {
	if(slot < 10) return 0;
	if(slot < 20) return 1;
	if(slot < 30) return 2;
	if(slot < 40) return 3;
	// Yeah yeah, this could be tighly done with one integer operation, dividing by 10 and floor,
}



function MakeProperties() {

    // slot, name, price, houseprice, rent, family, rail, waterelect) {
    // Normal properties
    MakeBuyableProperty(1, "Mediteraninean Avenue",  60,50,[2,10,30,90,160,250],"brown",false,false);
    MakeBuyableProperty(3, "Baltic Avenue",          60,50,[4,20,60,180,320,450],"brown",false,false);

    MakeBuyableProperty(6, "Oriental Avenue",        100,50,[6,30,90,270,400,550],"light blue",false,false);
    MakeBuyableProperty(8, "Vermont Avenue",         100,50,[6,30,90,270,400,550],"light blue",false,false);
    MakeBuyableProperty(9, "Connecut Avenue",        120,50,[8,40,100,300,450,600],"light blue",false,false);

    MakeBuyableProperty(11, "St. Charles Place",     140,100,[10,50,150,450,625,750],"pink",false,false);
    MakeBuyableProperty(13, "States Avenue",         140,100,[10,50,150,450,625,750],"pink",false,false);
    MakeBuyableProperty(14, "Virginia Avenue",       160,100,[12,60,180,500,700,900],"pink",false,false);

    MakeBuyableProperty(16, "St. James Place",       180,100,[14,70,200,550,750,950],"orange",false,false);
    MakeBuyableProperty(18, "Tenessee Avenue",       180,100,[14,70,200,550,750,950],"orange",false,false);
    MakeBuyableProperty(19, "New York Avenue",       200,100,[16,80,220,600,800,1000],"orange",false,false);

    MakeBuyableProperty(21, "Kentucky Avenue",       220,150,[18,90,250,700,875,1050],"red",false,false);
    MakeBuyableProperty(23, "Indiana Avenue",        220,150,[18,90,250,700,875,1050],"red",false,false);
    MakeBuyableProperty(24, "Illinois Avenue",       240,150,[20,100,300,750,925,1100],"red",false,false);

    MakeBuyableProperty(26, "Atlantic Avenue",       260,150,[22,110,330,800,975,1150],"yellow",false,false);
    MakeBuyableProperty(27, "Ventnor Avenue",        260,150,[22,110,330,800,975,1150],"yellow",false,false);
    MakeBuyableProperty(29, "Marvin Gardins",        280,150,[24,120,360,850,1025,1200],"yellow",false,false);    

    MakeBuyableProperty(31, "Pacific Avenue",        300,200,[26,130,390,900,1100,1275],"green",false,false);
    MakeBuyableProperty(32, "North Carolina Avenue", 300,200,[26,130,390,900,1100,1275],"green",false,false);
    MakeBuyableProperty(34, "Pennsylvania Avenue",   320,200,[28,150,450,1000,1200,1400],"green",false,false);

    MakeBuyableProperty(37, "Park Place",            350,200,[35,175,500,1100,1300,1500],"royal blue",false,false);
    MakeBuyableProperty(39, "Boardwalk",             400,200,[50,100,200,600,1400,1700,2000],"royal blue",false,false);

        // Railroads
    MakeBuyableProperty( 5, "Reading Railroad",      100,null,null,"rail",true,false);
    MakeBuyableProperty(15, "Pennsylvania Railroad", 100,null,null,"rail",true,false);
    MakeBuyableProperty(25, "B&O Railroad",          100,null,null,"rail",true,false);
    MakeBuyableProperty(35, "Short Line",            100,null,null,"rail",true,false);

    // Verk
    MakeBuyableProperty(12, "Electric company",      100,null,null,"verk",false,true);
    MakeBuyableProperty(28, "Water works",           100,null,null,"verk",false,true);


    MakeCardProperty(2,  TYPE_COMMUNITY)
    MakeCardProperty(7,  TYPE_CHANCE)
    MakeCardProperty(17, TYPE_COMMUNITY)
    MakeCardProperty(22, TYPE_CHANCE)
    MakeCardProperty(33, TYPE_COMMUNITY)
    MakeCardProperty(36, TYPE_CHANCE)

    // Corners
    MakeGoProperty(0)
    MakeJailProperty(10)
    MakeFreeParkingProperty(20)
    MakeGoToJailProperty(30)

    // Death and taxes
    MakeTaxProperty(4,200) // TODO check numbers
    MakeTaxProperty(38,100) // TODO check numbers


    // Add fake houses
    AddHouseToSlot(6);
    AddHouseToSlot(6);
    AddHouseToSlot(6);

    AddHouseToSlot(8);
    AddHouseToSlot(8);

    AddHouseToSlot(9);
	// Chance-slots
}

//
// Pseudo code
// 
// While(PlayerHaveNotRolledDice()) {
//    ask her to make deals
// }
// RollDice()
// MoveForward()
// p = GetProperty()
// Switch(p) {
// case Property
//}
//}



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

	MakeProperties()

	// Draw current board
	CalculatePieceLocations(document.getElementById("myCanvas"));
	DrawBoard();
	DrawHouses();

}