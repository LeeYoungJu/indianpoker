var mysql = require('mysql');
var DATABASE = 'dmlqhwmddml';
var conn = mysql.createConnection({
	host: '10.0.0.1'
	, port: '3306'		
	, user: 'dmlqhwmddml'
	, password: 'mtsm27521928'
	, database: DATABASE
});

var mysqlUtil = module.exports = {
	insertRoom: function(title, card, room_password, callback) {
		conn.query(
			'insert into room set ?'
			, {room_id: 'NULL', room_title: title, mem_number: 0, ready_level: 0, card: card, password: room_password}
			, function(err) {
				conn.query(
					'select max(room_id) as id from room where room_title = ?'
					, [title]
					, callback
				);
			}
		);
	}
	
	, get_user_win_lose: function(user_id, callback) {
		conn.query(
			'select win, lose from user_info where id = ?'
			, [user_id]
			, callback
		);
	}
		
	, get_card: function(room_id, callback) {
		conn.query(
			'select card from room where room_id = ?'
			, [room_id]
			, callback
		);
	}
	
	, is_empty_room: function(room_id, callback) {
		conn.query(			
			'select mem_number, ready_level from room where room_id = ?'
			, [room_id]
			, callback			
		);
	}
	
	, change_room_wait: function(room_id, callback) {
		conn.query(
			'update room set mem_number = mem_number + 1 where room_id =' + room_id
			, callback			
		);
	}
	
	, subtract_mem_number: function(room_id, callback) {
		conn.query(
			'update room set mem_number = mem_number - 1 where room_id =' + room_id
			, function(err) {
				if(err) {
					throw err;
				} else {
					conn.query(
						'select mem_number from room where room_id = ?'
						, [room_id]
						, callback
					);
				}
			}			
		);
	}
	
	, load_rooms: function(start, list_num, is_there_password, callback) {		
		if(is_there_password == 'yes') {
			var load_room_query = 'select * from room where mem_number < 2 and password is not NULL order by room_id desc limit ?, ?'
		} else if(is_there_password == 'no') {
			var load_room_query = 'select * from room where mem_number < 2 and password is NULL order by room_id desc limit ?, ?'
		} else if(is_there_password == 'all') {
			var load_room_query = 'select * from room where mem_number < 2 order by room_id desc limit ?, ?'
		}
		conn.query(
			load_room_query
			, [start, list_num]
			, callback
		);
	}	
	
	, get_total_room: function(is_there_password, callback) {
		if(is_there_password == 'yes') {
			var get_total_query = 'select count(*) as num from room where mem_number < 2 and password is not NULL'
		} else if(is_there_password == 'no') {
			var get_total_query = 'select count(*) as num from room where mem_number < 2 and password is NULL'
		} else if(is_there_password == 'all') {
			var get_total_query = 'select count(*) as num from room where mem_number < 2'
		}
		conn.query(
			get_total_query
			, callback
		)
	}
	
	, increase_ready_level: function(room_id, callback) {
		conn.query(
			'update room set ready_level = ready_level + 1 where room_id = ?'
			, [room_id]
			, function(err) {
				if(err) {
					throw err;
				} else {
					conn.query(
						'select ready_level from room where room_id = ?'
						, [room_id]
						, callback
					);
				}
			}
		);
	}
	
	, decrease_ready_level: function(room_id, callback) {
		conn.query(
			'update room set ready_level = ready_level - 1 where room_id = ?'
			, [room_id]
			, callback
		);
	}
	
	, increase_win_or_lose: function(nick, winOrLose) {
		conn.query(
			'update user_info set ' + winOrLose + ' = ' + winOrLose + ' + 1 where nick = \'' + nick + '\''
		);
	}
	
	, delete_room: function(room_id) {
		conn.query(
			'delete from room where room_id = ?'
			, [room_id]
			, function(err) {
				if(err) {
					throw err;
				}
			}
		);
	}	
	
	, register: function(id, pass, nick, callback) {
		conn.query(
			'insert into user_info values (?, sha1(?), ?, ?, ?)'
			, [id, pass, 0, 0, nick]
			, callback
		);
	}
	
	, login: function(id, pass, callback) {
		conn.query(
			'select nick, count(*) as num from user_info where id = ? and pass = sha1(?)'
			, [id, pass]
			, callback
		);
	}
	
	, check: function(type, value, callback) {		
		conn.query(
			'select count(*) as num from user_info where ' + type + ' = ?'
			, [value]
			, callback
		);
	}
}


































