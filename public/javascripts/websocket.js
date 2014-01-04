$(document).ready(function() {

var room = io.connect('/room');



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
    
    room.on('leaved', function(data) {    	
    	showMessage(data.nick + '님이 나가셨습니다.');
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
    
//message ------------------------------------------------------------------------------------------------------------------------    
    
    $('#chat_form').submit(function(e) {
    	e.preventDefault();
    	var msg = messageBox.val();
    	if($.trim(msg) !== '') {
    		showMessage(nick + ' : ' + msg);
    		room.json.send({nick:nick, msg:msg});
    		messageBox.val('');
    	}
    });
    
    
room.on('others_ready', function() {
    	$(your_state_button).text('ready');
    });
    
    room.on('start', function() {
    	$('.state').remove();
    	
    	room.emit('getCard', {nick:nick}, set_card);
    });    
    
    room.on('message', function(data) {
    	showMessage(data.nick + ' : ' + data.msg);
    });

//betting ------------------------------------------------------------------------------------------------------------------------



room.on('betting_next', function(data) {    	
    	$('.betting_form_box').css('display', 'block');
    	var your_betting_chip = data.betting_chip;
    	
    	chip.your_chip -= your_betting_chip;
    	chip.your_betted_chip += your_betting_chip;
    	
    	show_betted_chip();
    });



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





// chip ------------------------------------------------------------------------------------------------------------------------


room.on('show_chip', function() {    	
    show_betted_chip();
});












//card ------------------------------------------------------------------------------------------------------------------------


room.on('open_all_card', function() {
   	show_my_card();
   	
	$(betting_box).empty();
    $(betting_box).append(makeResultView());    	
    
   	window.setTimeout(calulate_chip, 2000);
});






});












