
/*
 * GET home page.
 */

var conn = require('../connect_db');

function bindEvent(obj, func) {
	return function() {
		func.apply(obj, arguments);
	};
}

function makeCard(arr) {		    		
    var card = '';
    var max_length = arr.length;
    for(var i=0; i<max_length; i++) {		    					    			
   	    var ran_index = Math.round(Math.random() * (arr.length-1));		    			
    	card += arr.splice(ran_index, 1) + '.';
    }	
    card = card.substr(0, card.length-1);
    return card;
}

var Room = function(isSuccess, nick, req, res) {
	this.isSuccess = isSuccess;
	this.nick = nick;
	this.res = res;
	this.req = req;
}

Room.prototype = {
	setSuccess: function(bool) {
		this.isSuccess = bool;
	}
	
	, setNick: function(nick) {
		this.nick = nick;
	}
	
	, load_rooms_callback: function(err, rows) {
		if(err) {
			throw err;
		}
		
		this.res.render('wait_room', {
  	        isSuccess: this.isSuccess
  	        , nickname: this.nick
  	        , roomList: rows  	
        });
	}
	
	, load_rooms: function() {
		conn.load_rooms(0, 10, bindEvent(this, this.load_rooms_callback));
	}	 
}

var Login = function(id, pass, room) {
	this.id = id;
	this.pass = pass;	
	this.room = room;
}

Login.prototype = {
	login_callback: function(err, rows) {
		if(err) {
			throw err;
		}
		
		var num = rows[0].num;
		var nick = rows[0].nick;
		
		if(num == 1) {
			this.room.req.session.user_id = this.id;
			this.room.req.session.nick = nick;
  		    this.room.setNick(nick);
  		    this.room.setSuccess(true);
		} 
		
		this.room.load_rooms();
	}
	
	, do_login: function() {
		conn.login(this.id, this.pass, bindEvent(this, this.login_callback));
	}	
	
};

Register = function(id, nick, pass, room) {
	this.id = id;
	this.nick = nick;
	this.pass = pass;	
	this.room = room;
};

Register.prototype = {
	register_callback: function(err) {
		if(err) {
			throw err;
		} else {
			this.room.req.session.user_id = this.id;
			this.room.req.session.nick = this.nick;
  		    this.room.setNick(this.nick);
  		    this.room.setSuccess(true);
  		    
		    this.room.load_rooms();
		}	
	}
	
	, do_register: function() {
		conn.register(this.id, this.pass, this.nick, bindEvent(this, this.register_callback));
	}
};





exports.index = function(req, res){
	if(req.session.user_id) {
		console.log(req.session.nick);
		var room = new Room(true, req.session.nick, req, res);
		room.load_rooms();   
	} else {
		res.render('index', { title: '인디언 포커' });
	}
};

exports.register_form = function(req, res) {
	res.render('register_form', {title: '회원가입'});
};

exports.register = function(req, res) {
	var room = new Room(false, null, req, res);
	
	var id = req.body.user_id;
	var nick = req.body.nick;
	var pass = req.body.user_pass;	
	
	if(id && id.trim() !== '' && pass && pass.trim() !== '' && nick && nick.trim() !== '') {
    	var register = new Register(id, nick, pass, room);
    	register.do_register();
    }
};

exports.enter = function(req, res) {  
	var room = new Room(false, null, req, res);    
    
    var id = req.body.id;
    var pass = req.body.pass;  
    if(id && id.trim() !== '' && pass && pass.trim() !== '') {
    	var login = new Login(id, pass, room);
    	login.do_login();	
    }
};

exports.enter_get = function(req, res){
	var room = new Room(false, null, req, res);
  
    if(req.session.user_id) {
  	    room.setSuccess(true);
  	    room.setNick(req.session.nick);
	    room.load_rooms();
    } else {  	    
	    res.render('wait_room', {	  	  
		    isSuccess: false
		    , nickname: ''
	    });
    }
};

exports.logout = function(req, res) {
	if(req.session.user_id) {
		req.session.user_id = null;
		req.session.nick = null;
	}
	res.render('index', { title: '인디언 포커' });
}



exports.makeRoom = function(req, res){
  var isSuccess = false
  , title = req.body.roomname;  
  
  var card_arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  var card = makeCard(card_arr);
	
  if(title && title.trim() != '') {	  
	  var select_room_id_callback = function(err, rows) {
	  	if(err) {
	  		throw err;
	  	}
	  	isSuccess = true;
	  	room_id = rows[0].id;
	  	res.render('makeRoom', {
	  		isSuccess: isSuccess
	  		, roomid: room_id
	  		, roomname: title
	  	});
	  };
	  conn.insertRoom(title, card, select_room_id_callback);   	  
  }
};

exports.load_rooms = function(req, res){
	var load_rooms_callback = function(err, rows) {
		return rows;
	}
    conn.load_rooms(load_rooms_callback);
};

exports.join = function(req, res){
	var isSuccess = false
	, roomid = req.params.id
	, roomName = req.params.title;
	if(room_id && roomName && roomName != '') {
		isSuccess = true;
	}
	
	res.render('game_room', {
	    isSuccess: isSuccess
	    , roomid: roomid
	    , roomName: roomName
	    , nickName: req.session.nick	
	    , isMaster: req.params.isMaster		
    });
};

exports.game_room = function(req, res){
  res.render('game_room', { title: '인디언 포커' });
};