$(document).ready(function() {
	var socket = io.connect('/room_page');
		
	var room_page = {
		no: 0
		, list_num: 10	
		, is_there_password: 'all'	
	};
	
	
	
	socket.on('here_total', function(data) {		
		room_page.total = Math.ceil(data.total/room_page.list_num);
		show_page_indicator(room_page.no+1, room_page.total);
	});
	
	var $room_list_box = $('#room_list_box');
	input_loading_div();
	
	var $page_indicator_box = $('.page_indicator_box');
	
	var $logout_button = $('#logout_button');
	var $reload_button = $('.reload_button');
	
	var $left_button = $('#left_button');
	var $right_button = $('#right_button');
	
	var $password_checkbox = $('#password_checkbox');
	var $room_password = $('#room_password');
	$room_password.on('keyup', function(e) {
		var e = e || window.event;
		var self = e.target;
		
		var value = $(self).val();
		if(value.length > 15) {
			alert("최대 15자까지 가능합니다.");
			var value = value.substr(0, value.length-1);
			$(self).val(value);
		}
	});
	
	$password_checkbox.on('change', function() {
		toggle_password_checkbox($(this));
	});
	
	function input_loading_div() {
		$room_list_box.empty();
		var loading = '<div class="loading">loading . . . </div>';
		$room_list_box.append(loading);
	}
	
	function toggle_password_checkbox(password_checkbox) {
		if(password_checkbox.attr('is_password') == 'yes') {
			password_checkbox.attr('is_password', 'no');
			$room_password.css('display', 'none');
			$room_password.val('');
		} else {
			password_checkbox.attr('is_password', 'yes');
			$room_password.css('display', 'inline');
			$room_password.focus();
		}
	}
	
	var $password_room_filter = $('.password_room_filter');
	$password_room_filter.on('click', function() {
		input_loading_div();
		room_page.is_there_password =  $(this).val();
		
		socket.emit('get_total', {is_there_password: room_page.is_there_password})
		
		room_page.no = 0;
		var start = room_page.no * room_page.list_num;
		
		socket.emit('go_other_page', {start: start, list_num: room_page.list_num, is_there_password: room_page.is_there_password});
	});
	
	var $rule_video_button = $('#rule_video_button');
	$rule_video_button.on('click', function() {
		window.open('http://www.youtube.com/watch?v=_ecOIxPWMmU');
	});
	
	$left_button.on('click', function() {		
		if(room_page.no>0) {
			input_loading_div();
			room_page.no--;
			var start = room_page.no * room_page.list_num;
		
		    socket.emit('go_other_page', {start: start, list_num: room_page.list_num, is_there_password: room_page.is_there_password});
		}		
	});
	
	$right_button.on('click', function() {						
		if(!room_page.total) {
			alert('방이 없거나 로딩중입니다. 잠시만 기다려 주세요...');
			return;
		}
		if((room_page.no+1) < room_page.total) {
			input_loading_div();						
			room_page.no++;
		    var start = room_page.no * room_page.list_num;
		    
		    socket.emit('go_other_page', {start: start, list_num: room_page.list_num, is_there_password: room_page.is_there_password});
		}	
	});
	
	$('.enter_button').click(click_enter_button);
	
	socket.on('here_room_list', function(data) {					
		var rooms = data.rooms;
		$room_list_box.empty();
		
		for(var i=0; i<rooms.length; i++) {
			$room_list_box.append(make_room_list(rooms[i]));
		}
		show_page_indicator(room_page.no+1, room_page.total);
		
		$('.enter_button').click(click_enter_button);
	});
	
	function click_enter_button(e) {
		var e = e || window.event;
		var self = e.target;
		var room = self.parentNode.parentNode.info;
		var password_box = $(self).parent().next().find('.room_password_text');
			
		var room_title = room.room_title;		
		var room_id = room.room_id;
		if(room.password) {
			var origin_room_password = room.password;
			var input_room_password = password_box.val();
			if(input_room_password == '' || (origin_room_password != input_room_password)) {
				alert('비밀번호가 일치하지 않습니다.');
				password_box.focus();
				return;
			}
		}
		
		window.location.href= '/join/' + room_title + '/' + room_id + '/guest';
	}
	
	function make_room_list(room) {
		var div = document.createElement('div');
		div.className = 'room_list';
		div.info = room;
		var html = '<div class="room_title_and_enter_button"><div class="room_title left">' + room.room_title + '</div>' +
		           '<div class="enter_button left">입장</div></div>';
		if(room.password) {
			html += '<div class="input_room_password">방 비밀번호 입력 : <input type="text" class="room_password_text"></div>'
			
		}           
		
		div.innerHTML = html;           
		return div;
	}
	
	function show_page_indicator(current, total) {
		$page_indicator_box.empty();
		$page_indicator_box.append(current + ' / ' + total);
	}
	
	$logout_button.on('click', function() {
		window.location.href = '/logout';
	});
	
	$reload_button.on('click', function() {
		window.location.href = '/enter';
	});
});











