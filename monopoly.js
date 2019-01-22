

//
// Player#1 AI
//
simple_player_ai = {
	act: function(game) {
		// Repeatedly called when its your turn until you call
		// game.rolldice()

		// APIs for actions in "game"
		// game.rolldice() - Rolls the dice, your turn is over (unless you roll two identical)
		// game.buyhouses([slots]) - Buys one house on each property in the array. All purchases will fail if not enough funds
		// game.sellhouses([slots]) - Sells one house on each property in the array. If sale would make house-status unlawfull all sales fail.
		// game.playgetoutofjailcard() - Next time you roll, if you are in jail, you will get out. Can be played before getting sent to jail.
		// game.mortage(slot) - Puts a mortage on a property.
		// game.liftmortage(slot) - Lifts a mortage on a property.

		// APIs for asking status in "game"
		// game.slot()  - Where am I at
		// game.money() - How much money do I have
		// game.properties() - returns a vector of the owned properties
		// game.players() - returns a vector of the players ID and slot as such [{index:i, slot:s}] IF s is 40 player is in jail.
		// game.player(i) - returns information about a player
		// game.player(i).money() - How much money do this player have
		// game.player(i).properties() - returns a vector of the owned properties of this player
		// game.player(i).playgetoutofjailcard() - How many get-out-of-jail cards do this player have.


		// APIs for making trades
		// game.propose_trade(player, offering, want) 
		//   offering and want should hold the format
		//   { slots : []   - The properties that are part of the transaction
		//	   money : x,   - How much cash that is involved
		//	   gojcards : x - How many get-out-of-jail cards
		//   }
		//   The return value is a non-zero trade id if the player accepted the trade
		//   To make it happen you must call commit_trade.
		//   If the trade would break a series that have houses on them the trade will 
		//   never be offered to the other party and the return value will be 0
		//   Trade IDs are expired when the "act" function returns.
		// 
		// game.commit_trade(tradeid)
	},

	consider_trade: function(game, offering, want) {
		// Called when someone offers a trade
		// return true to accept the trade. Note that this is no 
		// guarantee it will happen, the other party may still chose to 
		// not go forward
	},

	consider_purchase: function(game, slot) {
		// You have landed on a piece of land 
		// that is not owned, this is your chance to buy it
		// Return "true" if you want to buy it.
		// This function will not be called if you cant afford it
	},

	consider_choice: function(game, option) {
		// Called when you pull a card where you need to make a decision.
		// The option is from the enumeration CHOICES_X
	}
}


// Function card_option should return "false" for the first option and "true" for second. 
var CHOICES_CHANCE_OR_PAY=0





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

function MakePlayer(ai) {
	return {
		spot: 0,
		money: 2000,
		marker_color: "#00ff00",
		properties: [],
		gojcards: 0,
		ai:ai
	}
}

var all_slots = []

var TYPE_LAND = 1
var TYPE_JAILVISIT = 2 // The slot you stand in when you just walk into the jail space
var TYPE_FREEPARKING = 3
var TYPE_GOTOJAIL = 4
var TYPE_GO = 5
var TYPE_CHANCE = 6
var TYPE_COMMUNITY = 7
var TYPE_TAX = 8 // Income tax and luxury tax
var TYPE_JAILED = 9 // The slot type for slot #40, which is the actual jail when jailed.

function MakeBuyableProperty(slot, name, price, houseprice, rent, family) {
	prop = {
		type: TYPE_LAND,
		name: name,
		price: price,
		houseprice: houseprice, // Cost to build one house 
		slot: slot,
		rent: rent, // empty, 1,2,3,4 houses, hotel
		family: family, // brown, blue, pink etc. "rail" means its a railroad, "company" its the electricity of waterworks.
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
function MakeVisitingJailProperty(slot) {
	MakeGenericProperty(slot,TYPE_JAILVISIT)
}
function MakeInJailProperty(slot) {
	MakeGenericProperty(slot,TYPE_JAILED)
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
		DrawHouses(ctx);	
	}
}

function GetPlayersOnSpot(spot) {
	return players.filter(function(p) { return p.spot == spot })
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

function DrawPlayerPieces(ctx){

	// This algorithm looks bakwards, but its to
	// prevent pieces from being drawn on top of 


	// each other.
	for(var i = 0 ; i < 41 ; i++) { // 40 spots on the board + 1 for the Jail
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

var FAMILY_BROWN     = "brown"
var FAMILY_LIGHTBLUE = "light blue"
var FAMILY_PINK      = "pink"
var FAMILY_ORANGE    = "orange"
var FAMILY_RED       = "red"
var FAMILY_YELLOW    = "yellow"
var FAMILY_GREEN     = "green"
var FAMILY_ROYALBLUE = "royal blue"
var FAMILY_RAILROAD  = "rail"
var FAMILY_COMPANY   = "company"

function MakeProperties() {

    // slot, name, price, houseprice, rent, family, rail, waterelect) {
    // Normal properties
    MakeBuyableProperty(1, "Mediteraninean Avenue",  60,50,[2,10,30,90,160,250],FAMILY_BROWN);
    MakeBuyableProperty(3, "Baltic Avenue",          60,50,[4,20,60,180,320,450],FAMILY_BROWN);

    MakeBuyableProperty(6, "Oriental Avenue",        100,50,[6,30,90,270,400,550],FAMILY_LIGHTBLUE);
    MakeBuyableProperty(8, "Vermont Avenue",         100,50,[6,30,90,270,400,550],FAMILY_LIGHTBLUE);
    MakeBuyableProperty(9, "Connecut Avenue",        120,50,[8,40,100,300,450,600],FAMILY_LIGHTBLUE);

    MakeBuyableProperty(11, "St. Charles Place",     140,100,[10,50,150,450,625,750],FAMILY_PINK);
    MakeBuyableProperty(13, "States Avenue",         140,100,[10,50,150,450,625,750],FAMILY_PINK);
    MakeBuyableProperty(14, "Virginia Avenue",       160,100,[12,60,180,500,700,900],FAMILY_PINK);

    MakeBuyableProperty(16, "St. James Place",       180,100,[14,70,200,550,750,950],FAMILY_ORANGE);
    MakeBuyableProperty(18, "Tenessee Avenue",       180,100,[14,70,200,550,750,950],FAMILY_ORANGE);
    MakeBuyableProperty(19, "New York Avenue",       200,100,[16,80,220,600,800,1000],FAMILY_ORANGE);

    MakeBuyableProperty(21, "Kentucky Avenue",       220,150,[18,90,250,700,875,1050],FAMILY_RED);
    MakeBuyableProperty(23, "Indiana Avenue",        220,150,[18,90,250,700,875,1050],FAMILY_RED);
    MakeBuyableProperty(24, "Illinois Avenue",       240,150,[20,100,300,750,925,1100],FAMILY_RED);

    MakeBuyableProperty(26, "Atlantic Avenue",       260,150,[22,110,330,800,975,1150],FAMILY_YELLOW);
    MakeBuyableProperty(27, "Ventnor Avenue",        260,150,[22,110,330,800,975,1150],FAMILY_YELLOW);
    MakeBuyableProperty(29, "Marvin Gardins",        280,150,[24,120,360,850,1025,1200],FAMILY_YELLOW);    

    MakeBuyableProperty(31, "Pacific Avenue",        300,200,[26,130,390,900,1100,1275],FAMILY_GREEN);
    MakeBuyableProperty(32, "North Carolina Avenue", 300,200,[26,130,390,900,1100,1275],FAMILY_GREEN);
    MakeBuyableProperty(34, "Pennsylvania Avenue",   320,200,[28,150,450,1000,1200,1400],FAMILY_GREEN);

    MakeBuyableProperty(37, "Park Place",            350,200,[35,175,500,1100,1300,1500],FAMILY_ROYALBLUE);
    MakeBuyableProperty(39, "Boardwalk",             400,200,[50,100,200,600,1400,1700,2000],FAMILY_ROYALBLUE);

        // Railroads
    MakeBuyableProperty( 5, "Reading Railroad",      100,null,null,FAMILY_RAILROAD);
    MakeBuyableProperty(15, "Pennsylvania Railroad", 100,null,null,FAMILY_RAILROAD);
    MakeBuyableProperty(25, "B&O Railroad",          100,null,null,FAMILY_RAILROAD);
    MakeBuyableProperty(35, "Short Line",            100,null,null,FAMILY_RAILROAD);

    // Verk
    MakeBuyableProperty(12, "Electric company",      100,null,null,FAMILY_COMPANY);
    MakeBuyableProperty(28, "Water works",           100,null,null,FAMILY_COMPANY);


    MakeCardProperty(2,  TYPE_COMMUNITY)
    MakeCardProperty(7,  TYPE_CHANCE)
    MakeCardProperty(17, TYPE_COMMUNITY)
    MakeCardProperty(22, TYPE_CHANCE)
    MakeCardProperty(33, TYPE_COMMUNITY)
    MakeCardProperty(36, TYPE_CHANCE)

    // Corners
    MakeGoProperty(0)
    MakeVisitingJailProperty(10)
    MakeInJailProperty(40)  // Bonus spot. 40 is a special slot for you when you are jailed.  
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

    AddHouseToSlot(16);
    AddHouseToSlot(16);
    AddHouseToSlot(16);
    AddHouseToSlot(16);
    AddHouseToSlot(16);

    AddHouseToSlot(18);
    AddHouseToSlot(18);

    AddHouseToSlot(19);   

    AddHouseToSlot(26);
    AddHouseToSlot(26);
    AddHouseToSlot(26);

    AddHouseToSlot(27);
    AddHouseToSlot(27);

    AddHouseToSlot(29);   


    AddHouseToSlot(37);
    AddHouseToSlot(37);
    AddHouseToSlot(37);
    AddHouseToSlot(37);
    AddHouseToSlot(37);    

    AddHouseToSlot(39);           


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
	players.push(MakePlayer(null))
	players.push(MakePlayer(null))
	players.push(MakePlayer(null))
	players.push(MakePlayer(null))
	players.push(MakePlayer(null))
	players.push(MakePlayer(null))

	players[0].marker_color = "#777777"
	players[1].marker_color = "#ff00ff"
	players[2].marker_color = "#ff0000"
	players[3].marker_color = "#000000"
	players[4].marker_color = "#00ffff"
	players[5].marker_color = "#ffff00"


	players[0].spot=0
	players[1].spot=40	
	players[2].spot=6
	players[3].spot=6	
	players[4].spot=15
	players[5].spot=10 

	MakeProperties()

	// Draw current board
	CalculatePieceLocations(document.getElementById("myCanvas"));
	DrawBoard();

}