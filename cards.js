Chans:

CreateCard_advance(chance_cards, "Advance to Boardwalk", 39, true)
CreateCard_advance(chance_cards, "Advance to Reading Railroad", 5, true)
CreateCard_advance(chance_cards, "Advance to St. Charles Place", 11, true)
CreateCard_advance(chance_cards, "Advance to Illinois Avenue", 23, true)
CreateCard_advance(chance_cards, "Advance to GO", 0, true)

Building loan is due. Collect 150
You get a 50 return from the bank

Advance to nearest railroad. If owned by someone else pay double rent
Speeding ticket 15
Go to jail without passing go
Advance to nearest railroad. If owned by someone else pay double rent
You have been elected chariman of the board, pay 50 to each player

GET OUT OF JAIL FREE. Keep until used
Go 3 steps back
House maintanence, Pay 25 per house and 100 per hotel
Advance to nearest utility. Pay 10 times the dice roll if owned.



Community Chest:

Its your birthday, collect 10 from each player
School fees, pay 50
You inherit 100
Tax return, collect 200
You sell shares, collect 50
GET OUT OF JAIL FREE, keep until used
Hospital bill, pay 100
You get taxed for street repairs, 40 per house and 115 per hotel
You won second price in a beauty contest, collect 10
Proceed to GO
Bank made a mistake in your favor, collect 200
GO TO JAIL
Return on life insurance, collect 100
Vacation savings gains value, collect 100
Income from consulting, collect 25
Doctors fee, collect 50



function CreateCard(deck, description, fn) {
	var index = Math.floor(Math.random() * (deck.length - 0))
	deck.splice(index, 0, {description:description, fn:fn})
}

function CreateCard_advance(deck, description, destindex, payforgo) {
	CreateCard(deck, description, function(game) {
		player = game.current_player
		if(destindex < player._slot && payforgo) { 
			// Must pass GO to get here, lets pay some $
			player._money += 200
		}
		// This will take care of giving the 
		// ai the option to buy, pay rent, rais money
		// if needded. If destindex is jail that 
		// works too.
		game._gotoslot(destindex)
	})
}


function CreateCard_pay(deck, description, ammount) {
	CreateCard(deck, description, function(game) {
		player = game.current_player

		if(player.money() < ammount) {
			// Player does not have enough money
			player.ai.raise_money(this, ammount - player._money)
			
			// If player raised money properly, _money will now have enough.
			if(player._money < ammount) {
				// BANKRUPT!
				player._money -= ammount;
				game._remove_bancruptsy_players()
			} else {
				// Raised money OK,
				player._money -= ammount;
			}
		} else {
			// No problem, just pay
			player._money -= ammount;
			
		}

		
	})
}
function CreateCard_collect(deck, description, ammount) {
	CreateCardDeck(deck,description, function(game) { game.current_player._money += ammount})
}
