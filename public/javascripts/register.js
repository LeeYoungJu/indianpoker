$(document).ready(function() {
	var socket = io.connect('/register');
	
	var check_obj = {
		id: false
		, nick: false
	};
	
	var form = document.register_form;
			
	var id_form = form.user_id;
	var nick_form = form.nick;		
	var pass_form = form.user_pass;
	var pass_confirm_form = form.pass_confirm;
	
	var checked_id = null;
	var checked_nick = null;	
	
	var $check_button = $('.check_button');
	//var $pass_check_button = $('#check_pass_button');
	
	var $register_button = $('#register_button');
	
	$register_button.on('click', function() {
		var filled_id = id_form.value;
		var filled_nick = nick_form.value;
		var filled_pass = pass_form.value;
		var filled_pass_confirm = pass_confirm_form.value;		
		
		if(filled_id && filled_id.trim() !== '' && filled_pass && filled_pass.trim() !== '' && filled_nick && filled_nick.trim() !== '') {
			if(filled_pass !== filled_pass_confirm) {
				alert('비밀번호가 일치하지 않습니다.');
				return;
			}
			if(filled_nick.length > 17) {
				alert('닉네임은 17자를 넘을 수 없습니다.');
				return;
			}
		} else {
			alert('빈칸이 있습니다.');
			return
		}
		
		for(var check in check_obj) {
			if(check_obj[check] == false) {
				alert(check + ' 중복체크를 해야합니다.');				
				return;
			} 
		}
		if(filled_id !== checked_id) {
			alert('id 중복체크를 해야합니다.');
			check_obj['id'] = false;
			return;
		}
		if(filled_nick !== checked_nick) {
			alert('닉네임 중복체크를 해야합니다.');
			check_obj['nick'] = false;
			return;
		}
		
		form.submit();
	});
	
	
	socket.on('connect', function() {    		
	    console.log('connect success!');
    });
    
    $check_button.on('click', function(e) {
    	var type = this.id.substr(6);    	
    	var value = $(this).parent().parent().find('input').val();
    	
    	if(type == 'id') {
    		checked_id = value;    		
    	} else if(type == 'nick') {
    		checked_nick = value;    		
    	}    
    	
    	socket.emit('check', {type: type, value: value});
    });
    
    socket.on('result', function(data) {
    	var data_type = data.type;
    	if(data_type == 'id') {
    		var type = '아이디';
    	} else if(data_type == 'nick') {
    		var type = '닉네임';
    	}
    	if(data.isSuccess) {
    		alert('없는 ' + type + '입니다. 사용하실 수 있습니다.');
    		check_obj[data_type] = true;
    		checked_ + data_type = data.value;
    	} else {
    		alert('이미 존재하는 ' + type + '입니다.');
    		$('#' + data_type + '_input').val('').focus();
    	}
    });
});




















