// Statistics file
// This file intend to be used to produce stats and present/save

var time_counter;
var game_counter;

function stats_init() {
	game_counter = 0;
	// Too late and too sick to do this properly

}

function stats_new_game() {
	game_counter ++;
	time_counter = 0;
	recorded_boards=new Array()
	recorded_boards[0]=new Array()
	recorded_boards[1]=new Array()
	recorded_boards[2]=new Array()
	recorded_boards[3]=new Array()
}

var ownable_properties=[1,3,5,6,8,9,11,12,13,14,15,16,18,19,21,23,24,26,27,29,31,32,34,35,37,39];
var families =[[1,3],[6,8,9],[11,13,14],[16,18,19],[21,23,24],[26,27,29],[31,32,34],[37,39]];
var recorded_boards= new Array();

function _getPlayerID(player) {
	return original_players.findIndex(x => x == player)
}

function stats_RecordBoard(player) {
	playerid = _getPlayerID(player)
	var o = new Object();
	++time_counter;
	o['game'] = game_counter.toString();
	o['time'] = time_counter.toString();
	o['playerid'] = playerid.toString();
	o['money'] = original_players[playerid].money().toString()
	if(original_players[playerid].money() < 0) {
		break_shit()
	}

	o['loss_level'] = 0// Assume win... for now.
	for(idx in ownable_properties) {
		var owned = all_slots[ownable_properties[idx]].owner() == original_players[playerid]
		o[ownable_properties[idx].toString()] = owned?1:0

	}
	// Check if we own all in any family
	for(idx_families in families) {
		var ownall = true;
		for(propid in families[idx_families]) {
			ownall &= 1 == ownable_properties[families[idx_families][propid]]
		}
		o[_fam_name(idx_families)] = ownall?1:0
	}
	recorded_boards[playerid].push(o);
}

function stats_RecordLoss(player, loss_level) {
	playerid = _getPlayerID(player)	
	for(r in recorded_boards[playerid]){
		recorded_boards[playerid][r]['loss_level'] = loss_level
	}
}

function _fam_name(famidx) {
	var FamName = "F_";
	for(propid in families[famidx]) {
		FamName+=families[famidx][propid] + "_"
	}
	FamName = FamName.substring(0, FamName.length-1);
	return FamName
}

var headers=['game','time','playerid','money','loss_level',1,3,5,6,8,9,11,12,13,14,15,16,18,19,21,23,24,26,27,29,31,32,34,35,37,39]

function stats_dump_hdr(){
	var toreturn = ""
	for(h in headers) {
		toreturn += headers[h] + ", "
	}
	for(idx_families in families) {
		toreturn+=_fam_name(idx_families) + ", "
	}	

	return toreturn
}

function stats_dump_data(){
	var toreturn = ""
	for(playerid in recorded_boards) {
		for(record in recorded_boards[playerid]) {
			r = recorded_boards[playerid][record]
			for(h in headers) {
				toreturn += r[headers[h]] + ", "
			}
				// Check if we own all in any family
			for(idx_families in families) {
				toreturn+=r[_fam_name(idx_families)] + ", "
			}
			toreturn += "\n"
		}
	}
	return toreturn

}
