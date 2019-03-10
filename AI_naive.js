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