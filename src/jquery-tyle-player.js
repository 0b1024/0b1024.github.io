 /*!
 * jQuery Tyle Player v0.1.0 - cardnews player
 * https://github.com/tyleteam/jquery-tyle-player
 *
 * Copyright 2016 Tubloo Co, Ltd. zidell and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * Date: 2016-11-19
 */

(function ($) {
    $.fn.tylePlayer = function(slides, options){
        $.tylePlayer.init($(this), slides, options);
    },
    $.tylePlayer = {
        isTouchable : false,
        transitionTime : 300,

        init : function($container, slides, options){
            // determine touch or not
            this.isTouchable = 'ontouchstart' in window // works on most browsers 
            || 'onmsgesturechange' in window; // works on ie10
            if(/Edge\/|Trident\/|MSIE /.test(navigator.userAgent)){
                this.isTouchable = false;
            }

            if(typeof options===undefined){
                options = {};
            }
            // set default
            options = $.extend(true, {
                width: 510,
                height: 510,
                background: '#000',
                enablePageIndicator : true,
                enableFullscreen : true,
                lastSlideLabel : 'AI Design Tool',
                lastSlideLink : 'https://tyle.io',
                onStart : function(){
                    console.log("onStart");
                },
                onEnd : function(){
                    console.log("onEnd");
                },
                onNext : function(slideNo){
                    console.log("next slideNo", slideNo);
                },
                onPrev : function(slideNo){
                    console.log("prev slideNo", slideNo);
                },
                onReplay : function(){
                    console.log("replay");
                }
            }, options);


            // generate slide doms
            var $slides = [];
            var index = slides.length + 30;

            slides.map(function(src, i){
                $slides.push([
                '<div class="tyle-card index-',i,'" style="z-index:',(index-i),';">',
                    '<div class="tyle-evt" style="background-image:url(',src,');"></div>',
                '</div>'
                ].join(''));
            });

            $slides.push([
                '<div class="tyle-card index-100" style="z-index:1;">',
                    '<div class="tyle-evt"></div>',
                '</div>'
            ].join(''));    

            var lastLink = '';
            if(options.lastSlideLabel!==''){
                lastLink = '<a class="tyle-btn-link">'+options.lastSlideLabel+'</a>';
            }

            $player = $([
                '<div class="tyle-card-wrapper">',
                    '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" class="tyle-ratio">',
                    '<div class="tyle-progress-bar" data-rows="',(slides.length),'">',
                        '1/',(slides.length),
                    '</div>',
                    '<div class="tyle-play-wrapper">',
                        $slides.join(''),
                    '</div>',
                    '<div class="tyle-first-slide">',
                        'Slide to next >',
                    '</div>',
                    '<div class="tyle-fullscreen tyle-btn">',
                    '</div>',
                    '<div class="tyle-last-slide">',
                        '<a class="tyle-btn-replay">',
                            '<span class="tyle-btn-replay">',
                                'Replay',
                            '</span>',
                            lastLink,
                        '</a>',
                    '</div>',
                '</div>'
            ].join(''));
            for(var i in options){
                $player.data(i, options[i]);
            }
            $player.addClass('indicator-'+(options.enablePageIndicator?'y':'n'));
            $player.addClass('fullscreen-enabled-'+(options.enableFullscreen?'y':'n'));

            this.resize($player);

            $container.empty().append($player);

            this.initDom($player);
            
        },

        resize : function($player){
            var width = $player.data('width'),
                height = $player.data('height');
            // var ratio = width / height;
            $player.css({
                'max-width' : width+'%',
                'max-height' : height+'%'
            });
        },


        initDom : function($player){
            $player
                .find('.tyle-card')
                .first()
                .addClass('tyle-active')
                .next()
                .addClass('tyle-prepare')
                .css({
                    'transform' : 'translate3d(0, 0, -100px)',
                    'opacity' : 1
                });

            if(this.isTouchable){
                ;
            }else{
                // click
                $player.find('.tyle-first-slide');
                $player.addClass('no-touch');
            }
            $player.addClass('now-index-1');

            // ????????? ????????????.
            this.bindingEvents($player);

            $player.data('onStart')();
        },

        bindingEvents : function($player){
            $player.on('touchstart.tyle mousedown.tyle', function(e){
                e.preventDefault();
                e.stopPropagation();
                if(e.target.className.indexOf('tyle-btn')>-1) return false;
                jQuery.tylePlayer.events.touchStart(this, jQuery.tylePlayer.eventJudge(e).xPosition, jQuery.tylePlayer.eventJudge(e).yPosition);
            }).on('touchmove.tyle mousemove.tyle', function(e){
                if(jQuery.tylePlayer.touchStartX === null || jQuery.tylePlayer.touchStartY === null){
                    return false;
                }
                if(e.target.className.indexOf('tyle-btn')>-1) return false;
                return jQuery.tylePlayer.events.touchMove(this, jQuery.tylePlayer.eventJudge(e).xPosition, jQuery.tylePlayer.eventJudge(e).yPosition);
            }).on('touchend.tyle mouseup.tyle', function(e){
                if(e.target.className.indexOf('tyle-btn-replay')>-1){
                    jQuery.tylePlayer.events.replay($(this).closest('.tyle-card-wrapper'));
                    return false;
                }
                if(e.target.className.indexOf('tyle-btn-link')>-1){
                    jQuery.tylePlayer.events.link($(this).closest('.tyle-card-wrapper'));
                    return false;
                }
                if(jQuery.tylePlayer.touchStartX === null || e.target.className.indexOf('tyle-btn')>-1){
                    return false;
                }
                jQuery.tylePlayer.events.touchEnd(this);
                jQuery.tylePlayer.touchStartX = null;
                jQuery.tylePlayer.touchStartY = null;
            });
            $player.find('.tyle-fullscreen').on('click.tyle', function(e){
                $(this).parents('.tyle-card-wrapper').toggleClass('fullscreen');
                return false;
            });

        },

        events : {
            touchStart : function(th, x, y){
                jQuery.tylePlayer.touchStartX = jQuery.tylePlayer.touchMoveX = x;
                jQuery.tylePlayer.touchStartY = jQuery.tylePlayer.touchMoveY = y;
            },
            touchMove : function(th, x, y){
                jQuery.tylePlayer.touchMoveX = x;
                jQuery.tylePlayer.touchMoveY = y;
                // ?????? ?????? ??????, ????????? ??????????????????
                var gapX = jQuery.tylePlayer.touchStartX - jQuery.tylePlayer.touchMoveX;
                var gapY = jQuery.tylePlayer.touchStartY - jQuery.tylePlayer.touchMoveY;
                var $active = $(th).find('.tyle-active');
                var direction = gapX > 0 ? 'left' : (gapX < 0 ? 'right' : '');
                var width = $(th).outerWidth();
                gapX = Math.abs(gapX); // ?????? ?????? ????????? ???????????????..
                var basePx = 100*gapX/width-100;
                var opacity = 1+basePx/100;
                if(direction=='right'){
                    // ???????????????(back)
                    opacity = 1-opacity;
                    $active
                    .prev() // ?????? ????????? ????????? ?????? ?????????..
                    .addClass('tyle-moving') // ???????????? ?????? ??????????????????.. 
                    .css({
                        'transform' : 'translate3d('+(width*-1+gapX)+'px, '+(gapY*-0.5)+'px, 0)',
                        'opacity' : ((gapX*1)/width)
                    })
                    .next() // ?????? ???????????? ???..
                    .css({ // ????????? ????????????.
                        'transform' : 'translate3d(0, 0, '+(basePx*-1-100)+'px)'
                    })
                    .next()
                    .removeClass('tyle-prepare');
                }else if(direction=='left'){
                    // ?????????????????????
                    $active
                    .addClass('tyle-moving')
                    .css({
                        'transform' : 'translate3d('+(gapX*-1)+'px, '+(gapY*-0.5)+'px, 0)',
                        'opacity' : ((width-gapX*1)/width)
                    })
                    .next()
                    .css({
                        'transform' : 'translate3d(0, 0, '+(basePx)+'px)'
                    });
                }
                if(direction!='' && gapX > 10){
                    return false;
                }
                return true;
            },
            touchEnd : function(th){
                var gapX = jQuery.tylePlayer.touchStartX - jQuery.tylePlayer.touchMoveX;
                var gapY = jQuery.tylePlayer.touchStartY - jQuery.tylePlayer.touchMoveY;
                var $active = $(th).find('.tyle-active');
                var direction = gapX > 0 ? 'left' : (gapX < 0 ? 'right' : 'tap');
                gapX = Math.abs(gapX); // ?????? ?????? ????????? ???????????????..
                var threshold = 30;
                
                if(direction=='right'){
                    // ???????????????
                    var $prev = $active.prev().removeClass('tyle-moving').addClass('tyle-transitionable');
                    if(gapX < threshold){
                        console.log('???????????? ??????');
                        $prev
                        .css({
                            'transform': 'translate3d('+($(th).outerWidth()*-1)+'px, 0, 0)',
                            'opacity' : 0
                        });

                        setTimeout(function(){ // 
                            $prev.removeClass('tyle-transitionable');
                        }, jQuery.tylePlayer.transitionTime);
                    }else{
                        console.log('???????????? ??????');
                        jQuery.tylePlayer.move($active, 'prev', gapY);
                    }
                }else{
                    // ???????????? ?????????
                    $active.removeClass('tyle-moving').addClass('tyle-transitionable');
                    if(gapX<5 || gapX > threshold){ // 0??? ?????? ????????? tap??????.
                        console.log('?????????????????? ??????');
                        if(gapX==0){
                            $(th).addClass('tapping');
                            setTimeout(function(){
                                $(th).removeClass('tapping');
                            }, 300);
                        }
                        jQuery.tylePlayer.move($active, 'next', gapY);
                    }else{
                        console.log('?????????????????? ??????');
                        $active
                        .css({
                            'transform': 'translate3d(0, 0, 0)',
                            'opacity' : 1
                        });
                        setTimeout(function(){
                            $active.removeClass('tyle-transitionable');
                        }, jQuery.tylePlayer.transitionTime);    
                    }
                }
            },

            replay : function($player){
                $player.removeClass('tyle-last');
                $player.find('.tyle-active').removeClass('tyle-active');
                $player.find('.tyle-prepare').removeClass('tyle-prepare');

                var $active = $player
                .find('.tyle-card')
                .first()
                .addClass('tyle-active')
                .css({
                    'transform' : 'translate3d(0, 0, 0)',
                    'opacity' : 1
                });

                $active
                .next()
                .addClass('tyle-prepare')
                .css({
                    'transform' : 'translate3d(0, 0, -100px)',
                    'opacity' : 1
                });

                $player.data('onReplay')();
                jQuery.tylePlayer.move($active, '');
            },

            link : function($player){
                var url = $player.data('lastSlideLink');
                var win = window.open(url, '_blank');
                 win.focus();
            }

        },

        move : function($active, direction, gapY){
            if(typeof gapY=='undefined')
                gapY = 0;

            if(direction=='prev'){
                // back
                var $current = $active.prev();
                if($current.length==0){
                    return false;
                }else{
                    $current
                    .css({
                        'transform': 'translate3d(0, 0, 0)',
                        'opacity' : 1
                    })
                    .addClass('tyle-active');

                    $current
                    .next() // ?????? ???????????? ?????????
                    .removeClass('tyle-active')
                    .addClass('tyle-transitionable')
                    .css({ // ????????? ???, tap??? ???????????? ??????????????? ????????? ??? ????????? ?????? ?????? ?????????.
                        'transform' : 'translate3d(0, 0, -100px)'
                    });
                    setTimeout(function(){
                        $current
                        .removeClass('tyle-transitionable')
                        .next()
                        .removeClass('tyle-transitionable')
                        .addClass('tyle-prepare')
                    }, jQuery.tylePlayer.transitionTime);    
                }
                var $player = $current.parents('.tyle-card-wrapper');

            }else if(direction=='next'){
                // forword
                $active
                .css({
                    'transform': 'translate3d('+($active.outerWidth()*-1)+'px, '+(gapY*2*-1)+'px, 0)',
                    'opacity' : 0
                })
                .removeClass('tyle-active');

                var $current = $active
                    .next(); // ???????????? ??? ??????
                if($current.length==0){
                    // ?????? ?????? ?????????..
                    setTimeout(function(){
                        $active // ???????????? ??? ?????? ??????
                        .addClass('tyle-active')
                        .css({
                            'transform': 'translate3d(0, 0, 0)',
                            'opacity' : 1
                        });
                        setTimeout(function(){
                            $active // ???????????? ??? ?????? ??????
                            .removeClass('tyle-transitionable');
                        }, jQuery.tylePlayer.transitionTime);
                    }, 20);
                    return false;
                }else{
                    // ??????????????? ??????
                    $current.addClass('tyle-active')
                    .addClass('tyle-transitionable')
                    .css({
                        'transform' : 'translate3d(0, 0, 0)'
                    })
                    .removeClass('tyle-prepare');
                    
                    $preload = $current // ?????? ????????? ??? ????????? ????????? ?????? ??????
                    .next()
                    .css({ // ????????? ???, tap??? ???????????? ??????????????? ????????? ??? ????????? ?????? ?????? ?????????.
                        'transform' : 'translate3d(0, 0, -100px)',
                        'opacity' : 1
                    });

                    var $player = $current.parents('.tyle-card-wrapper');

                    setTimeout(function(){
                        $active
                        .removeClass('tyle-transitionable')
                        .next()
                        .removeClass('tyle-transitionable')
                        .next()
                        .addClass('tyle-prepare');
                    }, jQuery.tylePlayer.transitionTime);
                }

            }else{
                var $current = $active;
                var $player = $current.parents('.tyle-card-wrapper');
            }

            var index = $current.index();

            this.replaceClass($player, 'now-index-', (index+1));

            // ?????? ?????? ????????? ??????
            var $progressBar = $player.find('.tyle-progress-bar');
            var rows = $progressBar.data('rows');
            var nowIndex = index+1;
            $progressBar.html(nowIndex+'/'+rows);       
            if(nowIndex >= rows+1){
                $player.addClass('tyle-last');
                $player.data('onEnd')();
            }else{
                $player.removeClass('tyle-last');
                $player.data(direction==='next' ? 'onNext' : 'onPrev')(nowIndex);
            }

        },

        replaceClass : function($player, str, value){
            var classList = $player.attr('class').split(/\s+/);
            $.each( classList, function(index, item){
                if (item.indexOf(str)>-1) {
                   $player.removeClass(item);
                }
            });
            $player.addClass(str+value);
        },

        eventJudge : function(e){
            //?????? ???????????? mouse event????????? ????????? ??????????????? ????????? ?????????
            if(this.isTouchable){
                var xPosition = e.originalEvent.touches[0].pageX, yPosition = e.originalEvent.touches[0].pageY;
            }else {
                var xPosition = e.pageX, yPosition = e.pageY;
            };
            return {
                xPosition : xPosition, 
                yPosition : yPosition
            };
        }




    }
})(jQuery);