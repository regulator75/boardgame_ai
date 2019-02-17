

//
// Player#1 AI
//
simple_player_ai = {
	turn: function(game) {
		// Called when its your turn. End your turn and roll the dice by returning from this function.

		// APIs for actions in "game"
		// game.buyhouse([slots]) - Buys one house on each property in the array. All purchases will fail if not enough funds or if house configuration is illegal
		// game.buyhouse(slots) - Buys one house on one property. Purchases will fail if not enough funds or if house configuration is illegal
		// game.sellhouses([slots]) - Sells one house on each property in the array. If sale would make house-status unlawfull all sales fail.
		// game.playgetoutofjailcard() - Next time you roll, if you are in jail, you will get out. Can be played before getting sent to jail.
		// game.paytogetoutjail() - Pay money to get out of jail 
		// game.mortage(slot) - Puts a mortage on a property.
		// game.liftmortage(slot) - Lifts a mortage on a property.

		// APIs for asking status in "game"
		// game.slot()  - Where am I at
		// game.money() - How much money do I have
		// game.getoutofjailcards() - How many "Get out of jail"  do I have
		// game.injail() - Am I in jail?
		// game.property(slot) - return information about the property on the slot
		// game.property(slot).owner() - returns the player who owns the object
		// game.property(slot).price() - Price to buy the property
		// game.property(slot).mortaged() - Is there a mortage on the property
		// game.property(slot).houseprice() - How much is the price of a houses
		// game.property(slot).houses()
		// game.property(slot).slot() - returns the slot of the property
		// game.property([slots]) - return a vector of property information.
		// game.set_complement(slot) -- returns the other properties that would be needed to complete the set, given this slot
		// game.properties() - returns a vector of the owned properties
		// game.players() - returns a vector of the players ID and slot as such [{index:i, slot:s}] IF s is 40 player is in jail.
		// game.player(i) - returns information about a player
		// game.player(i).money() - How much money do this player have
		// game.player(i).properties() - returns a vector of the owned properties of this player
		// game.player(i).getoutofjailcards() - How many get-out-of-jail cards do this player have.
		// game.player(i).get_properties_missing_from_sets() - what properties would give this AI an monopoly

		// APIs for helping the AI determining things
		// These are plain support function that could be implemented by the AI 
		// itself, but it should not have to
		// game.get_sets()
		//   returns a vector of vectors of properties that makes up sets.
		//
		// game.get_properties_missing_from_sets()
		//   returns a vector of vectors of properties that if aquired makes a set
		//   Note that this list of propertis are NOT owned by the AI at this time.
		//




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
		//   Trade IDs are expired when the "turn" function returns.
		// 
		// game.commit_trade(tradeid)

		//
		// API for getting information about property
		// game.property(slot)
		// 
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
		// If you do not have the money to buy it, you can use the mortage, sellhouses, and trade APIs to secure money
		// 
	},

	consider_choice: function(game, option) {
		// Called when you pull a card where you need to make a decision.
		// The option is from the enumeration CHOICES_X
	},

	raise_money: function(game, lacking_funds) {
		// You need to raise money because of landing on something costly.
		// You can access the trade API, as well as selling houses or mortageing properties.
		// lacking_funds is the positive value of what the ai 
		// would see from calling "money()"
	}
}

function RollDice() {
	return Math.floor(Math.random() * 6) + 1;
}

function tick() {

	player = players[next_player]

	game.set_active_player(player)
	if(!player || !player.ai ) {
		var breakme=null
	}
	player.ai.turn(game)
	game.expunge_trade_records() // dont leave lingering trades
	var last = double_rolls_so_far == 2;

	if( game._rolldice(last) && !last) {
		double_rolls_so_far++;
	} else {
		next_player++;
		next_player%=players.length
		double_rolls_so_far = 0;
	}

	return players.length > 1; // Stop if someone won
}

function MakeGame() {
	return {
		current_player : null,
		set_active_player: function(ap) { this.current_player = ap},

		// API offered to AI
		slot: function() { return this.current_player.slot() },
		money: function() { return this.current_player.money() },
		properties: function() { return this.current_player.properties() }, // TODO make deep copy.
		property: function(slot) { 
			if(slot.constructor === Array) {
				var toreturn = []
				for(s in slot) {
					toreturn.push(this.property(slot[s])); // recursive to deal with nested arrays.
				}
				return toreturn;
			} else {
				return all_slots[slot] // TODO make index safe.				
			}
		},

		injail: function() { return this.slot() == 40},
		getoutofjailcards: function() { return this._gojcards },

		buyhouse: function(slot) {
			if(slot.constructor === Array) {
				// TODO implement this
				null.ImNotHereYet()
			} else {
				p = this.property(slot)

				var ownall = OwnAllInFamily(this.current_player, p.family)

				var havemoney = this.money() - p.houseprice() > 0

				var lessthanhotel = p.houses() < 5

				var onmortage = p.mortaged()

				// This is just to make sure the AI does not do anything stupid. like build condos on the tracks

				var notrailroadorcompany = (p.family != "rail" && p.family != "company")

				// Check that buying a house here does not put it more than one house off compared to other properties
				// in the family. (Lengt of vector of houses that currently have less houses than the one where you want to buy another one)
				var houseconfigok = this.property(this.property_complements(slot)).filter(elem => elem.houses() < p.houses()).length == 0

				if( ownall && havemoney && houseconfigok && lessthanhotel && !onmortage && notrailroadorcompany) {
					// We are good to go!
					this.current_player._money -= p.houseprice()
					p._houses ++
				}
			}
		},

		property_complements: function(slot) {
			return GetPropertiesInFamily_Slots(all_slots[slot].family).filter(v => v!= slot)
		},


		playgetoutofjailcard: function() {
			if(this.current_player._gojcards > 0 && this.current_player.slot() == 40 ) { // have card, is in jail.
				this.current_player._gojcards--;
				_gotoslot(10);
			}
		},

		// Trades
		trades_offered : [],
		_create_trade_record : function(other_player, offer,want) {
			this.trades_offered.push({player:other_player, offer: offer, want: want, valid: true})
			return this.trades_offered.length // Trade ID is simply vector index + 1
		},
		expunge_trade_records : function() {
			this.trades_offered.forEach(function(t){t.valid = false}) // Make them invalid incase someone will try to exeecute them later.
			this.trades_offered = []
		},

		// Moves

		_rolldice: function(last) {
			// TODO figure out how to get money out if they tried to roll three times to get out of jail and failed.
			d1 = RollDice()
			d2 = RollDice()
			if(last && d1==d2) {
				this._gotoslot(40) //jail

			} else if(this.current_player.slot() == 40 && d1 == d2){ // Currently in jail
				// Lucky roll, got out
				this._gotoslot(10+d1+d2) //10 is the "visiting jail" slot
			} else {
				var newslot = this.current_player.slot() + d1 + d2
				if(newslot > 39) { // Passing or landing on GO
					newslot -= 40
					this.current_player._money += 200 // COLLECT 200 WHEN PASSING GO
				}

				this._gotoslot(newslot)
			}
			return d1==d2

		},
		// This function is used by Chance cards and community chest cards
		// to double rent for rails and utilities, if hit by the next move
		_gotoslot_doublerent_rail_or_utility : function() {
			this._gotoslot_double = true;
		},
		_gotoslot : function(slot) {
			// Is this a property owned by someone

			this.current_player._slot = slot;
			prop = all_slots[slot]

			var rent = 0;
			var recieving_player = null;
			// If there is rent but no recieving player it goes to the bank, 'cause taxes.

			switch(all_slots[slot].type) {
				case TYPE_LAND:
					// Check if we need to pay
					if(prop.owner() != null && prop.owner() != this.current_player) {
						recieving_player = prop.owner() 
						// Need to pay...
						rent = CalculateRent(slot)
					} else if(prop.owner() == null) {
						// No-one ownes this slot, lets see if the AI wants to buy it
						want_to_buy = this.current_player.ai.consider_purchase(this, slot)

						if(want_to_buy && prop.price() <= this.current_player._money) {
							// Its a DEAL!
							prop._owner = this.current_player
							this.current_player._money -= prop.price()
						}
					}
					break;
				case TYPE_JAILED:
				case TYPE_FREEPARKING:
				case TYPE_JAILVISIT:
					// Nothing
					break;
				case TYPE_GO:
					// Nothing by landing here. Payment for passing go
					// is calculated elsewhere
					break;
				case TYPE_GOTOJAIL:
					// No cost, just update location.. 
					player._slot = 40
					break;
				case TYPE_TAX:
					rent = prop.cost
					break;
				case TYPE_CHANCE:
					cards_DrawChance(this);
					break;
				case TYPE_COMMUNITY:
					cards_DrawCommunity(this);
					break;


			}

			// Special fix for community card that demans
			// twice the paymet for rail or company slots
			if(all_slots[slot].family == "rail" || all_slots[slot].family == "company") {
				rent *= 2
			}


			if(rent > 0){

				if(this.current_player._money < rent) {
					// Player need to raise money

					this.current_player.ai.raise_money(this, rent - this.current_player._money)

					// If the player could not raise the money, out of business.
					if(this.current_player._money < rent) {
						// BANKRUPT!
						if(recieving_player != null)
							recieving_player._money += this.current_player._money; // Gets all his cash
						this.current_player._money -= rent; // Should land in negative territory

						//
						// Remove the player from the board
						//
						this._remove_bancruptsy_players()

					} else {
						// Player recovered
						if(recieving_player != null)
							recieving_player._money += rent; 
						this.current_player._money -= rent; // Should stay in positive territory
					}
				} else {
					// simply give the other player the money
					this.current_player._money -= rent

					if(recieving_player) {
						recieving_player._money += rent
					}
				}
			}

			_gotoslot_double = false
		},

		_remove_bancruptsy_players: function() {
			removeus = players.filter(function(p) { return p._money < 0 })
			for(s in all_slots) {
				if(removeus.includes(all_slots[s]._owner)) {
					// Any owned properties goes back to the bank, that
					// means they should be freed of houses etc.
					all_slots[s]._owner = null
					all_slots[s]._houses = 0; // why they would leave hosues is a mystery
					all_slots[s]._mortaged = false; // TODO check rules on this
				}
					
			}

			players = players.filter(function(p) { return p._money >=0 })			
		},

		get_sets: function() {
			//
			// returns a vector of slots that are complete sets. So for example, if the AI
			// owns the first, second and last set on the board, the return value 
			// would be [[1,3],[6,7,8],[37,39]]
			var toreturn = []
			var ownedfamilies = GetAllFamiliesOfBuildablePropertiesOwned(this.current_player)
			for(f in ownedfamilies) {
				if( OwnAllInFamily(this.current_player,ownedfamilies[f])) {
					toreturn.push(GetPropertiesInFamily_Slots(ownedfamilies[f]))
				}
			}
			return toreturn
		},
		
		get_properties_missing_from_sets : function() {
			return this.current_player.get_properties_missing_from_sets()
		},

		paytogetoutjail: function() {
			if(this.injail() && this.current_player.money() >= 50) {
				this.current_player._money -= 50
				this._gotoslot(10)
			}
		},

		player: function(p) { 
			if(isNaN(p)) {
				return p
			} else {
				return players[p]
			}
		},


		_checkAssets: function(player, assets) {
			var moneyOk = player.money() >= assets.money
			var gojcardsOk = player.getoutofjailcards() >= assets.gojcards

			// this would be cleaner with reduce
			var props = player.properties()
			var filtered = props.filter(p => assets.slots.indexOf(p.slot) != -1)
			var slotsOk = filtered.length == assets.slots.length

			// Now, check if any assets transfered would break a monopoly that
			// have houses.
			// TODO

			return moneyOk && gojcardsOk && slotsOk
		},


		propose_trade: function(player, offering, want ) {
			// Step 0, round of any decimals in offerings.
			offering.money = Math.round(offering.money)
			want.money = Math.round(want.money)

			// Step 1, make sure both players can give up what is offered/asked
		
			if(! this._checkAssets(this.current_player, offering) || !this._checkAssets(player,want)) {
				// Trade cant happen anyway
				tradeid = 0
			} else {
				var tradeid = 0
				if( player.ai.consider_trade(this, offering, want) ) {
					tradeid = this._create_trade_record(player, offering, want)
				}
			}
			return tradeid
		},
		commit_trade: function(tradeid) {
			// Must re-validate that trade can happen, player may have done other stuff between offer and commit
			trade = this.trades_offered[tradeid-1]
			if(trade.valid && this._checkAssets(this.current_player, trade.offer) && this._checkAssets(trade.player, trade.want)) {
				// Actually move stuff

				// $$
				this.current_player._money += trade.want.money
				trade.player._money -= trade.want.money
				this.current_player._money -= trade.offer.money
				trade.player._money += trade.offer.money

				// GOJ
				this.current_player._gojcards += trade.want.gojcards
				trade.player._gojcards -= trade.want.gojcards
				this.current_player._gojcards -= trade.offer.gojcards
				trade.player._gojcards += trade.offer.gojcards

				// Properties
				for(i in trade.offer.slots ) {
					game.property(trade.offer.slots[i])._owner = trade.player
				}
				for(i in trade.want.slots ) {
					game.property(trade.want.slots[i])._owner = this.current_player
				}

				// Flag as done
				trade.valid = false
			}
		}
	}
}

// Function card_option should return "false" for the first option and "true" for second. 
var CHOICES_CHANCE_OR_PAY=0





//
// Data
//
var properties = [];
var players = [];
var original_players = []; // for UI and debugging
var game = null;
var next_player = 0;
var double_rolls_so_far = 0;

function Rect(x,y,w,h) {
	return {
		x : x,
		y:y,
		w:w,
		h:h
	}
}

var colorcount = 0
var colors_of_players = [
"#777777",
"#ff00ff",
"#ff0000",
"#000000",
"#00ffff",
"#ffff00"]
function GetNextColor() {
	colorcount++
	colorcount%=colors_of_players.length
	return colors_of_players[colorcount]

}

function MakePlayer(ai) {
	return {
		_slot: 0,
		_money: 2000,
		marker_color: GetNextColor(),
		_gojcards: 0,
		ai:ai,
		money:       function() { return this._money },
		slot:        function() { return this._slot  },
		properties:  function() { return all_slots.filter(property => property._owner == this) },
		getoutofjailcards:    function() { return this._gojcards  },
		get_properties_missing_from_sets: function() { 
			var toreturn = []
			var ownedfamilies = GetAllFamiliesOfBuildablePropertiesOwned(this)
			for(f in ownedfamilies) {
				if( OwnAllInFamilyExceptOne(this,ownedfamilies[f])) {
					var allPropsInFamily = GetPropertiesInFamily(ownedfamilies[f])
					var notOwnedPropInFamily = allPropsInFamily.filter(p => p.owner() != this)
					var slot_not_owned = notOwnedPropInFamily[0].slot
					toreturn.push(slot_not_owned)
				}
			}
			return toreturn			
		}

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
		_price: price,
		_houseprice: houseprice, // Cost to build one house 
		slot: slot,
		rent: rent, // empty, 1,2,3,4 houses, hotel
		family: family, // brown, blue, pink etc. "rail" means its a railroad, "company" its the electricity of waterworks.
		_houses: 0, // 5 is hotel
		_mortaged : false, // Is the house under mortage?
		_owner: null,
		houseprice : function(){return this._houseprice},
		houses :     function(){return this._houses},
		mortaged:    function(){return this._mortaged},
		owner:       function(){return this._owner},
		price:       function(){return this._price}

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


function GetPropertiesInFamily(f) {
	return all_slots.filter(p => p.family == f)
}

function GetPropertiesInFamily_Slots(f) {
	return all_slots.reduce(
		function(acc, prop, idx){
			if(prop.family==f){
				acc.push(idx)
			}
			return acc
		},[])
}

function CountOwnedInFamily(player,f) {
	return GetPropertiesInFamily(f).filter(p => p.owner() == player)
}

function OwnAllInFamily(owner, family) {
	var propsnotowned = GetPropertiesInFamily(family).filter(function(p){return p.owner() != owner})
	return propsnotowned.length == 0
}

function OwnAllInFamilyExceptOne(owner, family) {
	var propsnotowned = GetPropertiesInFamily(family).filter(function(p){return p.owner() != owner})
	return propsnotowned.length == 1	
}


function GetAllFamiliesOfBuildablePropertiesOwned(owner) {
	v_needs_map = all_slots.filter(function(f){return f._owner == owner && f.family != "rail" && f.family!="company";})
	v = v_needs_map.map(function(f){return f.family})
	x = [...new Set(v)]
	return x;
}



// Assumes
//  1. Its a property that you can build houses on (TYPE_LAND)
//  2. The property have an owner.
function CalculateRent(slot) {
	var p = all_slots[slot]

	// All paths must set "rent"
	var rent = null

	if(p.family == FAMILY_RAILROAD) {
		// Depending on how many railroads the same player owns
		// the rent is different.
		cnt = CountOwnedInFamily(p.owner(),FAMILY_RAILROAD)
		rent = p.rent[cnt]; //

	} else if(p.family == FAMILY_COMPANY) {
		// If one propertiy is owned, 
		dices = RollDice() + RollDice() // TODO this is not supposed to be a re-roll, the last rolled dice is what should be used.
		cnt = CountOwnedInFamily(p.owner(),FAMILY_COMPANY)
		rent = p.rent[cnt-1] * dices
	} else {

		// Plain old property

		// is there any buildings on the slot?
		if(p.houses() > 0) {
			rent = p.rent[p.houses()]
		}
		// No building, but maybe same owner for everythign in the family?
		else if(OwnAllInFamily(p.owner(), p.family) ) {
			// same owner, double the price
			rent = p.rent[0] * 2
		} else {
			// Just plain rent
			rent = p.rent[0]
		}
	}

	return rent
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
    MakeBuyableProperty( 5, "Reading Railroad",      100,null,[25,50,100,200],FAMILY_RAILROAD); // rent is special
    MakeBuyableProperty(15, "Pennsylvania Railroad", 100,null,[25,50,100,200],FAMILY_RAILROAD); // rent is special
    MakeBuyableProperty(25, "B&O Railroad",          100,null,[25,50,100,200],FAMILY_RAILROAD); // rent is special
    MakeBuyableProperty(35, "Short Line",            100,null,[25,50,100,200],FAMILY_RAILROAD); // rent is special

    // Verk
    MakeBuyableProperty(12, "Electric company",      100,null,[4,10],FAMILY_COMPANY); // rent is special
    MakeBuyableProperty(28, "Water works",           100,null,[4,10],FAMILY_COMPANY); // rent is special


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

naive_ai = {
	turn: function(game) {
		const flatten = (ary) => ary.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []) // https://stackoverflow.com/questions/27266550/how-to-flatten-nested-array-in-javascript


		//
		// Am I in Jail? If so, can I get out?
		//
		if(game.injail()) {
			// Can I get out using a card?
			if(game.getoutofjailcards() > 0)
				game.playgetoutofjailcard()
			// Can I get out using Money? (Do I?)
			else if(game.money() > 200) {
				game.paytogetoutjail()
			}
		}

		//
		// Should I free up properties that I have mortaged?
		//



		//
		// Can I make a trade?
		// 

		// For each pair i have, se if someone wants to sell me the last one
		var props_to_buy = game.get_properties_missing_from_sets()
		for(pi in props_to_buy) {
			p = game.property(props_to_buy[pi])
			if(p.owner()) {
				// propose a trade
				other_player = game.player(p.owner())
				var trade_id = game.propose_trade(
					other_player,
					{slots:[], money:game.money()*0.8, gojcards:0},
					{slots:[p.slot], money:0, gojcards:0})

				if(trade_id) {
					game.commit_trade(trade_id)
				}


		//   { slots : []   - The properties that are part of the transaction
		//	   money : x,   - How much cash that is involved
		//	   gojcards : x - How many get-out-of-jail cards
		//   }


			}
		}
		//
		// Can I build on any property?
		//

		// Algorithm. Flatten the array of properties, build backwards on each property
		// while we can afford it.

		var props_to_build_on = game.property(game.get_sets())
		

		flat_props = flatten(props_to_build_on).reverse()

		for(pi in flat_props) {
			if(flat_props[pi].houseprice() < game.money()*0.75) {
				game.buyhouse(flat_props[pi].slot)
			}
		}

	},

	consider_trade: function(game, offering, want) {
		return true; // SURE we take ANY TRADE
	},

	consider_purchase: function(game, slot) {
		return true; // IM BUYING EVERYTHING
	},

	consider_choice: function(game, option) {
		return true; // I DONT KNOW BUT LEFT IS COOL
	},

	raise_money: function(game, lacking_funds) {
		// Just fail..
	}
}


				
var interval = null
function runner() {



	if( tick() ) {
		//var keepOnRunning = true;//document.getElementById("autorun").checked	
		//var runFast = false;//document.getElementById("fastrun").checked
	} else {
		// Game over. Restart
		window.clearInterval(interval)
		interval = null
	}
	UI_DrawBoard();
	UI_DrawPlayerStats()

}
function OnLoad() {

	game = MakeGame()
	players.push(MakePlayer(naive_ai))
	players.push(MakePlayer(naive_ai))
	players.push(MakePlayer(naive_ai))
	players.push(MakePlayer(naive_ai))

	original_players = players.slice()

	MakeProperties()

	// Draw current board
	CalculatePieceLocations(document.getElementById("myCanvas"));
	UI_CreateDIVsForPlayers()
	UI_DrawBoard();
	UI_DrawPlayerStats()
	cards_init()

	//runner();
	interval = window.setInterval(function(){runner()}, 50);


}