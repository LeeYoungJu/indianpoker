var conn = require('./connect_db');
/*
function makeCard(arr) {		    					    		  		    		
    if(arr.length > 0) {
		var ran_index = Math.round(Math.random() * (arr.length-1));		    			
		return arr.splice(ran_index, 1);		    			
    } else {		    			
		    			
	}
}*/
/*
function makeRandomIndex(max_length) {		    					    		  		    		
    return ran_index = Math.round(Math.random() * (max_length-1));    
}*/



module.exports = function(app) {	
	var io = require('socket.io').listen(app);
		
	io.configure(function() {
		io.set('log level', 3);
		io.set('transports', [
	  	  'websocket'
	  	  , 'flashsocket'
	  	  , 'htmlfile'
		  , 'xhr-polling'
	  	  , 'jsonp-polling'
		]);
	});
	
	var Room_page = io.of('/room_page').on('connection', function(socket) {
		var get_total_room_callback = function(err, rows) {
			if(err) {
				throw err;
			}
			var total = rows[0].num;
			
			socket.emit('here_total', {total: total});			
		};
		var load_page_callback = function (err, rows) {
			if(err) {
				throw err;
			}			
			socket.emit('here_room_list', {rooms: rows});
		};
		
		conn.get_total_room('all', get_total_room_callback);		
		conn.load_rooms(0, 10, 'all', load_page_callback);
		
		
		socket.on('get_total', function(data) {
			conn.get_total_room(data.is_there_password, get_total_room_callback);
		});
		
		
		socket.on('go_other_page', function(data) {
			conn.load_rooms(data.start, data.list_num, data.is_there_password, load_page_callback);
		});
	});
	
	
	var Register = io.of('/register').on('connection', function(socket) {
		socket.on('check', function(data) {
			var check_callback = function(err, rows) {
				if(err) {
					throw err;
				} else {
					var num = rows[0].num;
					if(num == 0) {
						socket.emit('result', {isSuccess: true, type: data.type, value: data.value});
					} else {
						socket.emit('result', {isSuccess: false, type: data.type});
					}
				}				
			};
			
			conn.check(data.type, data.value, check_callback);
		});
	});
	
	var Room = io.of('/room').on('connection', function(socket) {
		var joinedRoom = null;
		
		//var is_ok1 = false;
		//var is_ok2 = false;		
		//var card_arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		//var card_arr2 = [2, 3, 5, 4, 1, 9, 8, 7, 6, 10, 10, 9, 8, 7, 6, 5, 3, 4, 2, 1];
		socket.on('join', function(data) {			
			  
			var complete_join_callback = function(err, result) {
				if(err) {
					throw err;
				}				
			};
			
			var joined_callback = function(err, rows) {
				if(err) {
					throw err;
				}				
				if(rows[0] && rows[0].mem_number < 2) {
					if(rows[0].ready_level == 1) {
						var isReady = true;
					} else if(rows[0].ready_level == 0) {
						var isReady = false;
					} else {
						isSuccess = false;
					}
					
					joinedRoom = data.room_id;
					
					conn.change_room_wait(joinedRoom, complete_join_callback);										
					
					socket.join(joinedRoom);
					socket.emit('joined', {
						isSuccess:true, nick:data.nick, isReady:isReady
					}) ;
					socket.broadcast.to(joinedRoom).emit('joined', {
						isSuccess:true, nick:data.nick, isReady:false
					});
				} else {
					socket.emit('joined', {isSuccess: false});
				}
			};
			conn.is_empty_room(data.room_id, joined_callback);
		});
		
		socket.on('send_my_nick', function(data) {
			if(joinedRoom) {
				var nick = data.nick;
				socket.broadcast.to(joinedRoom).emit('here_my_nick', {nick:nick});
			}
		});
		
		socket.on('message', function(data) {
			if(joinedRoom) {				
				socket.broadcast.to(joinedRoom).json.send(data);
			}
		});
		
		socket.on('ready', function(data, callback) {			
			var increase_callback = function(err, rows) {
				if(err) {
					throw err;
				} else {					
					var ready_level = rows[0].ready_level;
					
					if(ready_level === 2) {
						socket.emit('start');
						socket.broadcast.to(joinedRoom).emit('start');
					} else if(ready_level === 1) {						
						socket.broadcast.to(joinedRoom).emit('others_ready');
						callback();						
					}
				}
			};
			
			conn.increase_ready_level(data.room_id, increase_callback);
		});
		/*
		socket.on('cancel_ready', function(data, callback) {
			var decrease_callback = function(err) {
				if(err) {
					throw err;
				} else {									
					callback();
				}
			}
			
			conn.decrease_ready_level(data.room_id, decrease_callback);
		});*/
		
		socket.on('getCard', function(data, callback) {
			var get_card_callback = function(err, rows) {
				if(err) {
					throw err;
				} else {
					var card = rows[0].card;					
					
					callback(card);
				}
			};
			
			conn.get_card(joinedRoom, get_card_callback);
		});
		
		socket.on('betting_next_turn', function(data, callback) {			
			socket.broadcast.to(joinedRoom).emit('show_chip');						
			socket.broadcast.to(joinedRoom).emit('betting_next', data);
			callback();
		});
		
		socket.on('show_betting_state', function(data) {
			socket.broadcast.to(joinedRoom).emit('decrease_other_chip', data);
		});
		
		socket.on('open_card', function() {
			socket.emit('open_all_card');
			socket.broadcast.to(joinedRoom).emit('open_all_card');
		});
		
		socket.on('do_die', function(data) {
			socket.emit('die', data);			
			socket.broadcast.to(joinedRoom).emit('die', data);
		});
		
		socket.on('win_or_lose', function(data) {
			var winOrLose = data.winOrLose;
			var nick = data.nick;
			
			conn.increase_win_or_lose(nick, winOrLose);
		});
		
		function leave_callback(err, rows) {
			if(err) {
				throw err;
			} else {	
				if(rows[0]) {
					if(rows[0].mem_number == 0) {
					    conn.delete_room(joinedRoom);
				    } else {
					    socket.broadcast.to(joinedRoom).emit('leaved');					
				    }		
				}								
			    socket.leave(joinedRoom);
			}
		}
		
		socket.on('forced_leave', function(data) {
			var nick = data.nick;
			
			var forced_leave_callback = function(err, rows) {
				if(err) {
					throw err;
				} else {
					if(rows[0]) {
						var num = rows[0].mem_number;
					    if(num == 2) {
						    conn.increase_win_or_lose(nick, 'lose');
						    socket.broadcast.to(joinedRoom).emit('you_win');						
					    }
					    conn.subtract_mem_number(joinedRoom, leave_callback);
					}										
				}
			}
			conn.is_empty_room(joinedRoom, forced_leave_callback);
		});
		
		

		socket.on('leave', function() {
			if(joinedRoom) {								
				conn.subtract_mem_number(joinedRoom, leave_callback);				
			}
		});
	});
}





























