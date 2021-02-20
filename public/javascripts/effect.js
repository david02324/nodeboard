var duration = 300;
var $side = $('#sidebar');

$('#menu-button-line-wrapper').click(function(){
    $('.line').removeClass('init');
    $('#line-top').toggleClass('line-top').toggleClass('top-reverse');
    $('#line-mid').toggleClass('line-mid').toggleClass('mid-reverse');
    $('#line-bot').toggleClass('line-bot').toggleClass('bot-reverse');

        $side.toggleClass('open');

        if($side.hasClass('open')) {
            $side.stop(true).animate({left:'0px'}, duration);
            $('#menu-button').animate({left:'300px'},duration);
        }else{
            $side.stop(true).animate({left:'-300px'}, duration);
            $('#menu-button').animate({left:'0px'},duration);
        };
});