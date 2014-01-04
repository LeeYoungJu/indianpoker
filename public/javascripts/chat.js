var Chat = function() {
	this.chat_box = document.getElementById('chat_box');
    this.messageBox = $('#message');
    this.chat_form = $('#chat_form');
    
    this.nick = $('#nick').val();
    this.room_id = $('#room_id').val();
    
    $(this.chat_form).submit(bindEvent(this, this.submit_chat_form));
};

Chat.prototype = {
	showMessage: function(msg, color) {
		if(!color) {
			color = '#A50000';
		}
	    $(this.chat_box).append($('<p class="chat_message" style="color:' + color + ';">').text(msg));	    
	    //this.chat_box.scrollTop(this.chat_box.height());
	    var height = this.chat_box.scrollHeight - this.chat_box.clientHeight; 
        this.chat_box.scrollTop = height;
        
    }
    
    , set_sockek_obj: function(socket) {
		this.room = socket;
	}
	
	, when_exit_room: function() {	
		$(window).unbind('beforeunload');	
    	this.room.emit('leave');
    	location.href='/enter';
	}
	
	, when_forced_exit_room: function() {
		$(window).unbind('beforeunload');
		this.room.emit('forced_leave', {nick:this.nick});
    	location.href='/enter';
	}
    
    , submit_chat_form: function(e) {
    	var e = e || window.event;
    	
    	var color = 'black'; 
    	
    	e.preventDefault();
    	var msg = this.messageBox.val();
    	if($.trim(msg) !== '') {
    		this.showMessage(this.nick + ' : ' + msg, color);
    		this.room.json.send({nick:this.nick, msg:msg, color:color});
    		this.messageBox.val('');
    	}
    }
};
