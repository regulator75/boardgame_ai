

CreateCard_advance(chance_cards, "Advance to Boardwalk", 39, true)
CreateCard_advance(chance_cards, "Advance to Reading Railroad", 5, true)
CreateCard_advance(chance_cards, "Advance to St. Charles Place", 11, true)
CreateCard_advance(chance_cards, "Advance to Illinois Avenue", 23, true)
CreateCard_advance(chance_cards, "Advance to GO", 0, true)

CreateCard_collect(chance_cards, "Building loan is due, collect 150", 150)
CreateCard_collect(chance_cards, "You get a 50 return from the bank", 50)
CreateCard_collect(chance_cards, "Speeding ticket 15", 15)

CreateCard(chance_cards,"Advance to nearest railroad. If owned by someone else pay double rent", function(game) {
		var player = game.current_player
		// TODO double rent.
		game._gotoslot_doublerent_rail_or_utility()
		if(player._slot < 5)  { game._gotoslot(5) } // 0-5
		if(player._slot < 15) { game._gotoslot(15) } 
		if(player._slot < 25) { game._gotoslot(25) } 
		if(player._slot < 35) { game._gotoslot(35) } 	
		if(player._slot < 40) { player._money += 200; game._gotoslot(5)} // will pass Go, special treatment.
	})

CreateCard(chance_cards,"Advance to nearest utility. Pay 10 times the dice roll if owned.", function(game) {
		var player = game.current_player
		// TODO double rent.
		game._gotoslot_doublerent_rail_or_utility()
		if(player._slot < X)  { game._gotoslot(X) } // 0-5
		if(player._slot < Y) { game._gotoslot(Y) } 
		if(player._slot < 40) { player._money += 200; game._gotoslot(X)} // will pass Go, special treatment.
	}) // TODO 10x if they own both?

CreateCard_advance(chance_cards, "Go to jail without passing go", 40, false)

// TODO Again?: Advance to nearest railroad. If owned by someone else pay double rent

CreateCard(chance_cards,"You have been elected chariman of the board, pay 50 to each player", function(game) {
	var ammount = (players.length - 1) * 50;
	// Check if there are enough funds.
	if(game.current_player.money() < ammount) {
		// Need to raise funds.
		player.ai.raise_money(this, ammount - player._money)
	}

	// Second check, if there are not enough funds split the money and bancrupt the player
	var perPlayerPayout
	var bancrupt = false
	if(game.current_player.money() < ammount) {
		perPlayerPayout = Math.floor(game.current_player.money() / (players.length-1))
		bancrupt = true
	} else {
		perPlayerPayout = 50 // They all got their money.
	}

	for(p in players) {
		if(p != game.current_player) {
			p._money += perPlayerPayout
			game.current_player._money -= perPlayerPayout
		}
	}

	if(bankcrupt) {
		game.current_player._money = -1
		game._remove_bancruptsy_players()
	}
}

CreateCard(chance_cards,"GET OUT OF JAIL FREE. Keep until used", function(game) { game.current_player._gojcards += 1} )

CreateCard(chance_cards,"Go 3 steps back", function(game) { 
	var destindex = (game.current_player._slot + 37 % 40)
	game._gotoslot(destindex)}


CreateCard(chance_cards,"House maintanence, Pay 25 per house and 100 per hotel", function(game) { 
	var properties = game.current_player.properties()
	var totalCost = 0;
	for(p in properties) {
		if(properties[p]._houses < 5) {
			totalCost += (properties[p]._houses * 25)
		} else {
			// Assuming hotel
			totalCost += 100
		}
	}
	PlayerPayToBank(game.current_player, totalCost)

)





Community Chest:

CreateCard_collect(community_cards, "You inherit 100",100)
CreateCard_collect(community_cards, "Bank made a mistake in your favor, collect 200", 200)
CreateCard_collect(community_cards, "Tax return, collect 200", 200)
CreateCard_collect(community_cards, "You sell shares, collect 50", 50)
CreateCard_collect(community_cards, "You won second price in a beauty contest, collect 10", 10)
CreateCard_collect(community_cards, "Return on life insurance, collect 100", 100)
CreateCard_collect(community_cards, "Vacation savings gains value, collect 100", 100)
CreateCard_collect(community_cards, "Income from consulting, collect 25", 25)

CreateCard_pay(community_cards, "Hospital bill, pay 100", 100)
CreateCard_pay(community_cards, "Doctors fee, collect 50", 50)
CreateCard_pay(community_cards, "School fees, pay 50", 50)

CreateCard_advance(community_cards, "Advance to GO", 0, true)


Its your birthday, collect 10 from each player
GET OUT OF JAIL FREE, keep until used
You get taxed for street repairs, 40 per house and 115 per hotel
GO TO JAIL



function CreateCard(deck, description, fn) {
	var index = Math.floor(Math.random() * (deck.length - 0))
	deck.splice(index, 0, {description:description, fn:fn})
}

function CreateCard_advance(deck, description, destindex, payforgo) {
	CreateCard(deck, description, function(game) {
		var player = game.current_player
		if(destindex < player._slot && payforgo) { 
			// Must pass GO to get here, lets pay some $
			player._money += 200
		}
		// This will take care of giving the 
		// ai the option to buy, pay rent, raise money
		// if needded. If destindex is jail that 
		// works too.
		game._gotoslot(destindex)
	})
}

function CreateCard_pay(deck, description, ammount) {
	CreateCard(deck, description, function(game) { PlayerPayToBank(game.current_player, ammount); }
}

function CreateCard_collect(deck, description, ammount) {
	CreateCardDeck(deck,description, function(game) { game.current_player._money += ammount})
}

function PlayerPayToBank(player, ammount) {
	var actuallyPaid;

	if(player.money() < ammount) {
		// Player does not have enough money
		player.ai.raise_money(this, ammount - player._money)
		
		// If player raised money properly, _money will now have enough.
		if(player._money < ammount) {
			// BANKRUPT!
			actuallyPaid = player._money
			player._money -= ammount;
			game._remove_bancruptsy_players()
		} else {
			// Raised money OK,
			player._money -= ammount;
			actuallyPaid = ammount
		}
	} else {
		// No problem, just pay
		player._money -= ammount;	
		actuallyPaid = ammount
	}
	return actuallyPaid
}


