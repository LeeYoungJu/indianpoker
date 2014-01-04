$(document).ready(function() {
    var room = io.connect('/room');
    var nick = $('#nick').val();
    var room_id = $('#room_id').val();
    var chat_box = $('#chat_box');
    var messageBox = $('#message');
    var my_state_button = $('#my_state');    
    var your_state_button = $('#your_state');
    var betting_box = $('#betting_box');
    
    var my_card_box = $('#my_card_box');
    var your_card_box = $('#your_card_box');
    
    var my_chip_box = $('#my_chip_box');
    var your_chip_box = $('#your_chip_box');
    
    var isMaster = $('#isMaster').val();
    
    
    var chip = {
    	my_chip: 30
        , your_chip: 30
        , my_betted_chip: 0
        , your_betted_chip: 0
    }
    
    var turn = 0;
    
    var card = {
    	my_card: null
    	, your_card: null
    	, card_arr: new Array()
    }
    
    function showMessage(msg) {
	    chat_box.append($('<p>').text(msg));	    
	    chat_box.scrollTop(chat_box.height());
    }
        
    room.on('connect', function() {    
    	
    		
	    room.emit('join', {roomName:$('#roomName').text(), nick:nick, room_id: room_id});
    });
    
    room.on('joined', function(data) {
	    if(data.isSuccess) {	    	
   			showMessage(data.nick + '님이 입장하셨습니다.');   			
    	} else {
    		alert('인원이 초과되었습니다.');
    		window.location.href = '/enter';
    	}
    });
    
    $('#chat_form').submit(function(e) {
    	e.preventDefault();
    	var msg = messageBox.val();
    	if($.trim(msg) !== '') {
    		showMessage(nick + ' : ' + msg);
    		room.json.send({nick:nick, msg:msg});
    		messageBox.val('');
    	}
    });
        
    
    room.on('message', function(data) {
    	showMessage(data.nick + ' : ' + data.msg);
    });
    
    $(my_state_button).click(function(e) {
    	var e = e || window.event;
    	var self = e.target;
    	
    	if($(self).attr('isready') == 'no') {
    		room.emit('ready', {room_id:room_id}, function() {    		
    			$(self).attr('isready', 'yes').text('cancel');
    	    });
    	} else {
    		room.emit('cancel_ready', {room_id:room_id}, function() {
	    		$(self).attr('isready', 'no').text('ready');
    		});    			
    	}
    	
    });
    
    $('#leave').click(function(e) {
    	var date = new Date().getTime();
    	room.emit('leave', {nick:nick});
    	location.href='/enter?' + date;
    });
        
    room.on('others_ready', function() {
    	$(your_state_button).text('ready');
    });
    
    room.on('start', function() {
    	$('.state').remove();
    	
    	room.emit('getCard', {nick:nick}, set_card);
    });
    
    function base_betting() {
    	chip.my_chip--; 
        chip.your_chip--;
        
        chip.my_betted_chip = 1;
        chip.your_betted_chip = 1;
    }
    
    function show_betted_chip() {
    	$(betting_box).empty();
    	$(betting_box).append('<div>' + chip.my_betted_chip + ' vs ' + chip.your_betted_chip +'</div>');
    	
    	$('#my_chip_smallbox').text(make_chip(chip.my_chip));
    	$('#your_chip_smallbox').text(make_chip(chip.your_chip));    	
    }
    
    function make_chip(chip) {
    	return chip;
    }
    
    function make_card(card) {
    	return card;
    }
    
    room.on('show_chip', function() {    	
    	show_betted_chip();
    });
    
    function set_card(getting_card) {    	
    	card.card_arr = getting_card.split('.');   
    	next_card(); 	    	
    	
    	base_betting();
    	show_betted_chip();
    	
    	$(my_chip_box).append('<div id="my_chip_smallbox">' + chip.my_chip + '</div>').append(make_betting_box());    	
    	$(your_chip_box).append('<div id="your_chip_smallbox">' + chip.your_chip + '</div>');
    	
    	if(isMaster == 'master') {
    		
    	} else {
    		$('.betting_form_box').css('display', 'none');
    	}    	
    	
    	$('#betting_button').click(do_betting);
    	$('#open_card_button').click(do_open);
    	$('#die_button').click(do_die);    	
    }
    
    function next_card() {
    	if(isMaster == 'master') {
    		card.my_card = card.card_arr[turn];
    		card.your_card = card.card_arr[turn+1];    		
    		turn = turn + 2;
    	} else {
    		card.my_card = card.card_arr[turn+1];
    		card.your_card = card.card_arr[turn];    		
    		turn = turn + 2;
    	}
    	
    	$(my_card_box).empty();
    	$(your_card_box).empty();
    	$(your_card_box).append(make_card(card.your_card));
    }
        
    function do_betting() {
    	var betting_chip = $('#betting_form').val();
    	
    	if(isNaN(betting_chip)) {
    		alert('숫자만 입력할 수 있습니다.');
    		$('#betting_form').val('');
    		$('#betting_form').focus();
    		return;
    	}
    	
    	if(betting_chip < 0) {
    		alert('제대로된 칩수를 입력해 주세요');
    		return;
    	}
    	betting_chip = parseInt(betting_chip);    	
    	
    	chip.my_chip -= betting_chip; 
    	chip.my_betted_chip += betting_chip;
    	
    	if(chip.my_betted_chip < chip.your_betted_chip) {
    		chip.my_chip += betting_chip; 
    	    chip.my_betted_chip -= betting_chip;
    		alert('최소한 상대방이 베팅한 칩 수 이상을 베팅하실 수 있습니다.');    		
    		return;
    	}
    	  
    	show_betted_chip(); 	
    	
    	room.emit('betting_next_turn', {betting_chip:betting_chip}, done_do_betting);
    }
    
    function done_do_betting() {
    	$('.betting_form_box').css('display', 'none');
    }
    
    room.on('betting_next', function(data) {    	
    	$('.betting_form_box').css('display', 'block');
    	var your_betting_chip = data.betting_chip;
    	
    	chip.your_chip -= your_betting_chip;
    	chip.your_betted_chip += your_betting_chip;
    	
    	show_betted_chip();
    });
    
    function do_open() {    	
        room.emit('open_card');
    }
    
    room.on('open_all_card', function() {
    	show_my_card();
    	
   		$(betting_box).empty();
   		$(betting_box).append(makeResultView());    	
    	
    	window.setTimeout(calulate_chip, 1500);
    });
    
    function makeResultView() {
    	if(card.my_card > card.your_card) {
    		var explain = '당신의 카드가 더 높습니다.! 칩 획득!';
    	} else {
    		var explain = '배팅한 만큼 칩을 잃었습니다.';
    	}
    	
    	var div = document.createElement('div');
    	div.className = 'explain_result';
    	div.innerHTML = explain;
    	
    	return div;
    }
    
    function calulate_chip() {
    	if(card.my_card > card.your_card) {    			
    		chip.my_chip += (chip.my_betted_chip + chip.your_betted_chip);    		 		
    	} else {    		
    	    chip.your_chip += (chip.my_betted_chip + chip.your_betted_chip);    	        		
    	}
    	base_betting();
    	show_betted_chip();
    	next_card();
    }
    
    function show_my_card() {
    	$(my_card_box).empty();
    	$(my_card_box).append(make_card(card.my_card));
    }
    
    
    function do_die() {
    	
    }
    
    function make_betting_box() {
    	var div = document.createElement('div');
    	div.className = 'betting_form_box';
    	
    	var html = '<input type="text" id="betting_form" />' +
    	           '<input type="button" id="betting_button" value="배팅" />' +
    	           '<input type="button" id="open_card_button" value="오픈" />' +
    	           '<input type="button" id="die_button" value="die" />';
    	div.innerHTML = html;
    	return div;
    }
    
    room.on('leaved', function(data) {    	
    	showMessage(data.nick + '님이 나가셨습니다.');
    });
})  




























  