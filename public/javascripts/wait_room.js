$(document).ready(function() {
	var socket = io.connect('/room_page');
		
	var room_page = {
		no: 0
		, list_num: 10		
	};
	
	socket.on('here_total', function(data) {
		room_page.total = Math.ceil(data.total/room_page.list_num);
		show_page_indicator(room_page.no+1, room_page.total);
	});
	
	var $room_list_box = $('#room_list_box');
	var $page_indicator_box = $('.page_indicator_box');
	
	var $logout_button = $('#logout_button');
	var $reload_button = $('.reload_button');
	
	var $left_button = $('#left_button');
	var $right_button = $('#right_button');
	
	var $rule_video_button = $('#rule_video_button');
	$rule_video_button.on('click', function() {
		window.open('http://www.youtube.com/watch?v=_ecOIxPWMmU');
	});
	
	$left_button.on('click', function() {
		if(room_page.no>0) {
			room_page.no--;
			var start = room_page.no * room_page.list_num;
		
		    socket.emit('go_other_page', {start: start, list_num: room_page.list_num});
		}		
	});
	
	$right_button.on('click', function() {						
		if(!room_page.total) {
			alert('방이 없거나 로딩중입니다. 잠시만 기다려 주세요...');
			return;
		}
		if((room_page.no+1) < room_page.total) {						
			room_page.no++;
		    var start = room_page.no * room_page.list_num;
		    
		    socket.emit('go_other_page', {start: start, list_num: room_page.list_num});
		}	
	});
	
	socket.on('here_room_list', function(data) {
			
		var rooms = data.rooms;
		$room_list_box.empty();
		
		for(var i=0; i<rooms.length; i++) {
			$room_list_box.append(make_room_list(rooms[i]));
		}
		show_page_indicator(room_page.no+1, room_page.total);
	});
	
	function make_room_list(room) {
		var div = document.createElement('div');
		div.className = 'room_list';
		var html = '<div class="room_title left">' + room.room_title + '</div>' +
		           '<div class="enter_button left" onclick="location.href=\'/join/' + room.room_title + '/' + room.room_id + '/guest\'">입장</div>';
		
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











