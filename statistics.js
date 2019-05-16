// Statistics file
// This file intend to be used to produce stats and present/save

var time_counter;

function stats_init() {
	time_counter = 0;
	// Too late and too sick to do this properly
	recorded_boards[0]=new Array()
	recorded_boards[1]=new Array()
	recorded_boards[2]=new Array()
	recorded_boards[3]=new Array()
}

var ownable_properties=[1,3,5,6,8,9,11,12,13,14,15,16,18,19,21,23,24,26,27,29,31,32,34,35,37,39];

var recorded_boards= new Array();

function stats_RecordBoard(playerid) {
	var o = new Object();
	++time_counter;
	o['time'] = time_counter.toString();
	o['playerid'] = playerid.toString();
	o['money'] = original_players[playerid].money().toString()
	o['loss_level'] = "0"// Assume win... for now.
	for(idx in ownable_properties) {
		var owned = all_slots[ownable_properties[idx]].owner() == original_players[playerid]
		o[ownable_properties[idx].toString()] = owned?1:0

	}
	recorded_boards[playerid].push(o);
}

function stats_RecordLoss(playerid, loss_level) {
	for(r in recorded_boards[playerid]){
		recorded_boards[playerid]['loss_level'] = loss_level
	}
}

var headers=['time','playerid','money','loss_level',1,3,5,6,8,9,11,12,13,14,15,16,18,19,21,23,24,26,27,29,31,32,34,35,37,39]

function stats_dump_hdr(){
	var toreturn = ""
	for(h in headers) {
		toreturn += headers[h] + ", "
	}
	return toreturn
}

function stats_dump_data(){
	var toreturn = ""
	for(playerid in recorded_boards) {
		for(record in recorded_boards[playerid]) {
			for(h in headers) {
				toreturn += recorded_boards[playerid][record][headers[h]] + ", "
			}
			toreturn += "<br>"
		}
	}
	return toreturn

}
