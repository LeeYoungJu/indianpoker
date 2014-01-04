            $(document).ready(function() {
				var form = document.login_form;
				var id_form = form.id;
				var pass_form = form.pass;				
				var $submit_button = $('#submit_button');
				var $register_button = $('#register_button');
				
				$(id_form).one('focus', focus_login_form);
				$(pass_form).one('focus', focus_login_form);
				
				$(id_form).on('keyup', key_event_in_loginform);
				$(pass_form).on('keyup', key_event_in_loginform);
				
				$submit_button.on('click', go_login);
				
				$register_button.on('click', go_register_form);
				
				function focus_login_form(e) {
					var e = e || window.event;
					var self = e.target;
					
					if($(self).attr('name') == 'pass') {
						$(self).attr('type', 'password');
					}
					
					$(self).val('');
				}
				
				function key_event_in_loginform(e) {
					var e = e || window.event;
					if(e.keyCode == 13) {						
						go_login();
					}
				}
				
				function go_login() {					
					if(id_form.value == '') {
						alert('아이디를 입력해주세요.');
						return;
					} else if(pass_form.value == '') {
						alert('비밀번호를 입력해주세요.');
						return;
					}
					
					form.submit();					
				}
				
				function go_register_form() {
					window.location.href = '/register_form';
				}
			});
			

















