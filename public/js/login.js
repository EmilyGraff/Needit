/**
 * @author Bastien Granger
 */

$( document ).ready(function() {
	$('#login-form').hide();
	$('#signup-form').hide();
	$('#more-options').hide();
});

function printLoginForm() {
	if($('#signup').is(':visible')) {
		$('#signup').hide();
		$('#login-form').delay(300).show("slide", { direction: "right"}, 300);
	}else {
		$('#login-form').hide();
		$('#signup').delay(300).show("slide", { direction: "right"}, 300);
	}
	
}

function printSignupForm() {
	if($('#login').is(':visible')) {
		$('#login').hide("slide", {direction: "left"}, 300);
		$('#signup-form').delay(300).show("slide", { direction: "left"}, 300);
	}else {
		$('#signup-form').hide("slide", {direction: "left"}, 300);
		$('#login').delay(300).show("slide", { direction: "left"}, 300);
	}
	
}

function printMoreOptions() {
	$('#more').hide();
	$('#more-options').show(200);
}
