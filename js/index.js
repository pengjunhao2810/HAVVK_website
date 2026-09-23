var s2_swiper = new Swiper('.s2_swiper', {
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: {
        el: '.part2 .s2_dot',
        clickable: true,
    },
    navigation: {
        nextEl: '.part2 .s2_next',
        prevEl: '.part2 .s2_prev',
    },
});
var new_swiper = new Swiper('.new_swiper', {
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: {
        el: '.partnew .s2_dot',
        clickable: true,
    },
    navigation: {
        nextEl: '.partnew .s2_next',
        prevEl: '.partnew .s2_prev',
    },
});

$('.s3_box').hover(function(){
    $('.s3_box').removeClass('show');
    $(this).addClass('show');
});


function scrollFun() {
    var sTop = $(window).scrollTop();

    $.each($('.part'), function() {
        if (sTop >= $(this).offset().top - $(window).height() / 1.2 &&
            sTop < $(this).offset().top + $(this).height()*1.2) {
            $(this).addClass('show');
        } else {
            $(this).removeClass('show');
        }
    });
}
scrollFun()
$(window).on('scroll', scrollFun);

function navscroll(e) {
	var scrollT = $(e).offset().top
	$("body,html").animate({
		scrollTop: scrollT
	})
}

//背景音乐
var audionum = false;
var musicBg=$('#audioBg')[0],
		musicBtn=$('.bgm');
function initMusicBtn() {
	musicBg.play();
	musicBtn.addClass('music_on');
	if(musicBg.paused){
		musicBtn.removeClass('music_on');
	}
 $('#audioBg').on('timeupdate', function () {
     musicBtn.addClass('music_on');
 }).on('pause', function () {
     musicBtn.removeClass('music_on');
 });

 document.addEventListener("WeixinJSBridgeReady", function () {
     musicBg.play();
 }, false);
 musicBtn.click(function () {
 	if(musicBg.paused){
 		audionum = true;
 	}else{
 		audionum = false;
 	}
     $(this).toggleClass('music_on');
     if ($(this).hasClass('music_on')) {
         musicBg.play();
     } else {
         musicBg.pause();
     }
 });
}
document.addEventListener('visibilitychange', function() {
	var audio = document.querySelector('audio');
	if(document.hidden) {
		audio.pause();
	} else {
		if(audionum){
			audio.play();
		}
	}
})
$(function(){
	initMusicBtn();
}) 
$('body').one('click',function(e){
	if (!$(e.target).closest(".bgm").length){
		if(!audionum){
	    	musicBg.play();
	    	musicBtn.addClass('music_on')
	    	audionum = true;
		}
	}
});