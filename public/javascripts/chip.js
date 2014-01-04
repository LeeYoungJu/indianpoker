var Chip = function() {
	this.my_chip_box = $('#my_chip_box');
    this.your_chip_box = $('#your_chip_box');
    this.betting_box = $('#betting_box');
	
	this.my_chip = 30;
    this.your_chip = 30;
    this.my_betted_chip = 0;
    this.your_betted_chip = 0;
}

Chip.prototype = {
	set_card_obj: function(card) {
		this.card = card;
	}
	
	, set_chat_obj: function(chat) {		
		this.chat = chat;
	}
	
	, set_sockek_obj: function(socket) {
		this.room = socket;
	}
	
	, make_chip: function(box, chip, sub) {
	    var left = 0;
		var top = 10;		
		for(var i=0; i<chip; i++) {
			left += 13;
			$(box).append('<img src="/images/chip/chip.png" id="' + sub + 'chip' + i + '" class="chip_img" />');
			if(i == 15) {
				left = 20;
				top += 50;
			} else if(i == 30) {
				left = 35;
				top += 50;
			} else if(i == 45) {
				left = 50;
				top += 50;
			}
			$('#' + sub + 'chip' + i).css('top', top).css('left', left);
		}
	} 
	
	, make_betting_state_box: function(my_chip, your_chip) {
		var div = document.createElement('div');
		div.className = 'betting_state_box';
		
		var html = '<div class="left betting_chip_state"><img class="chip_state_img" src="/images/chip/chip.png" /><span class="chip_state"> X ' + my_chip + '</span></div>' +
		           '<div class="left betting_chip_state versus"><img class="chip_state_img" src="/images/chip/space.png" /><span class="chip_state">VS</span></div>' +
		           '<div class="left betting_chip_state"><img class="chip_state_img" src="/images/chip/chip.png" /><span class="chip_state"> X ' + your_chip + '</span></div>';
		           
		div.innerHTML = html;
		return div;           		
	}

	, show_betted_chip: function() {		
    	$(this.betting_box).empty();
    	$(this.betting_box).append(this.make_betting_state_box(this.my_betted_chip, this.your_betted_chip));
    	
    	$('#my_chip_smallbox').empty();
    	$('#your_chip_smallbox').empty();
    	
    	this.make_chip('#my_chip_smallbox', this.my_chip, 'my');
    	this.make_chip('#your_chip_smallbox', this.your_chip, 'your');
    	
    	$('#my_remained_chip_box').text('칩 ' + this.my_chip + '개');
    	$('#your_remained_chip_box').text('칩 ' + this.your_chip + '개');
    	
    	//$('#my_chip_smallbox').text(this.make_chip(this.my_chip));
    	//$('#your_chip_smallbox').text(this.make_chip(this.your_chip));    	
	}



	, calculate_chip: function() {				
   		if(this.card.my_card > this.card.your_card) {  
   					
   			$('.small_betting_box').css('display', 'none'); 
   			$('.first_betting_or_die_box').css('display', 'block');   			
   			this.my_chip += (this.my_betted_chip + this.your_betted_chip);
   			this.chat.showMessage('WIN!! 칩' + this.your_betted_chip + '개를 버셨습니다.', '#FF6C6C');
   			
   			this.base_betting();
   			    		 		
   		} else if(this.card.my_card < this.card.your_card) {
   					
   			$('.small_betting_box').css('display', 'none');
	   	    this.your_chip += (this.my_betted_chip + this.your_betted_chip);
	   	    this.chat.showMessage('LOSE... 칩' + this.my_betted_chip + '개를 잃으셨습니다.', '#FF6C6C');
	   	    
	   	    this.base_betting();
	   	        	        		
   		} else {
   			var is_my_turn = true;
   			$('.small_betting_box').each(function() {
   				if($(this).css('display') == 'block') {
   					is_my_turn = false;
   					return;
   				}
   			});   			
   			if(is_my_turn) {
   				$('.small_betting_box').css('display', 'none'); 
   			    $('.first_betting_or_die_box').css('display', 'block');
   			} else {
   				$('.small_betting_box').css('display', 'none');
   			}
   			   			
   			this.chat.showMessage('DRAW... 비겼습니다. 베팅된 칩 그대로 두고 다음 카드로 넘어갑니다.', '#FF6C6C');
   		}
   		
   		if(this.your_chip == 0) {
   			$('.small_betting_box').css('display', 'none');
   			$('.open_or_die_box').css('display', 'block');
   		}
   		
   		if(this.my_chip < 0) {
   			this.when_win_or_lose_game('lose');
   			alert('칩이 모두 떨어졌습니다. 게임을 지셨습니다.');   			
   			this.chat.when_exit_room();
   		} else if(this.your_chip < 0) {
   			this.when_win_or_lose_game('win');
   			alert('상대방 칩을 모두 얻었습니다. 승리하셨습니다.!!');   			
   			this.chat.when_exit_room();
   		}
   		
   		this.show_betted_chip();
   		this.card.next_card();
	}
	
	, when_win_or_lose_game: function(winOrLose) {
		this.room.emit('win_or_lose', {nick:this.chat.nick, winOrLose:winOrLose});
	}	
	
	, make_first_betting_or_die: function() {
		var div = document.createElement('div');
   		div.className = 'first_betting_or_die_box small_betting_box';
		
		var html = '<input type="text" id="betting_form" />' +
   	          	   '<input type="button" class="betting_button" value="배팅" />' +
		           '<input type="button" class="die_button" value="죽기" />';
		           
		div.innerHTML = html;
   	    return div;           
	}
	
	, make_open_or_die: function() {
		var div = document.createElement('div');
   		div.className = 'open_or_die_box small_betting_box';
		
		var html = '<input type="button" class="open_card_button" value="오픈" />' +
		           '<input type="button" class="die_button" value="죽기" />';
		           
		div.innerHTML = html;
   	    return div;       
	}
	
	, make_betting_or_die: function() {
		var div = document.createElement('div');
   		div.className = 'betting_or_die_box small_betting_box';
		
		var html = '<input type="button" id="go_betting_button" value="응하기" />' +
		           '<input type="button" class="die_button" value="죽기" />';
		           
		div.innerHTML = html;
   	    return div;           
	}

	, make_betting_box: function() {		
	   	var div = document.createElement('div');
   		div.className = 'betting_form_box small_betting_box';
	   	
   		var html = '<input type="text" id="betting_form" />' +
   	          	   '<input type="button" class="betting_button" value="배팅" />' +
   	           	   '<input type="button" class="open_card_button" value="오픈" />';
   	               
   	    div.innerHTML = html;
   	    return div;
    }
    
    , make_remained_chip_box: function(who) {
    	var div = document.createElement('div');
    	div.id = who + '_remained_chip_box';
    	div.className = 'remained_chip_box';
    	
    	return div;
    }
    
    , base_betting: function() {
    	this.my_chip--; 
        this.your_chip--;
        
        this.my_betted_chip = 1;
        this.your_betted_chip = 1;
    }
    
    , go_betting: function() {
    	var chip_gap = (this.your_betted_chip - this.my_betted_chip);
    	this.my_chip -= chip_gap;
    	this.my_betted_chip += chip_gap;
    	
    	this.show_betted_chip();
    	this.room.emit('show_betting_state', {chip_gap: chip_gap});
        this.chat.showMessage('딜러 : 베팅에 응하셨습니다. 칩 ' + chip_gap + '개를 걸었습니다. 추가배팅하시거나 카드를 오픈해 주세요');
    	this.room.json.send({nick:'딜러', msg:this.chat.nick + '님이 베팅에 응하셨습니다.'});
    	
    	$('.betting_or_die_box').css('display', 'none');
    	$('.betting_form_box').css('display', 'block');    	
    }
    
    , do_betting: function(e) {
    	var e = e || window.event;
    	var self = e.target;
    	
    	var betting_chip = $(self).prev().val();
    	betting_chip = parseInt(betting_chip);
    	
    	if(isNaN(betting_chip)) {
    		alert('숫자만 입력할 수 있습니다.');
    		$('#betting_form').val('');
    		$('#betting_form').focus();
    		return;
    	}
    	
    	if(betting_chip < 0) {
    		alert('음수는 입력하실 수 없습니다.');
    		$('#betting_form').val('');
    		$('#betting_form').focus();
    		return;
    	}
    	
    	if(betting_chip > this.my_chip) {
    		alert('본인이 가진 칩보다 많이 거실 수 없습니다.');
    		$('#betting_form').val('');
    		$('#betting_form').focus();
    		return;
    	}
    	
    	if(betting_chip > this.your_chip) {
    		alert('상대방 칩이 ' + this.your_chip + '개밖에 없습니다.');
    		$('#betting_form').val('');
    		$('#betting_form').focus();
    		return;
    	}
    	    	
    	
    	this.my_chip -= betting_chip; 
    	this.my_betted_chip += betting_chip;
    	
    	if(this.my_betted_chip < this.your_betted_chip) {
    		this.my_chip += betting_chip; 
    	    this.my_betted_chip -= betting_chip;
    		alert('최소한 상대방이 베팅한 칩 수 이상을 베팅하셔야 합니다.');    
    		$('#betting_form').val('');
    		$('#betting_form').focus();		
    		return;
    	}
    	  
    	this.show_betted_chip();
    	
    	this.room.json.send({nick:'딜러', msg:this.chat.nick + '님이 칩' + betting_chip + '개를 베팅하셨습니다. 응하시겠습니까? 죽으시겠습니까?'});
    	this.room.emit('betting_next_turn', {betting_chip:betting_chip, nick:this.chat.nick}, bindEvent(this, this.done_do_betting));
    }
    
    , done_do_betting: function() {
    	$('#betting_form').val('');    		
    	$('.small_betting_box').css('display', 'none');
    	this.chat.showMessage('딜러 : 배팅을 완료하였습니다.');
    }

};




























