// html엘리먼트 ie7,8인식;
 document.createElement('header');
 document.createElement('nav');
 document.createElement('article');
 document.createElement('section');
 document.createElement('aside');
 document.createElement('footer');

// ie css-hack
var ua = navigator.userAgent,
  doc = document.documentElement;
if ((ua.match(/MSIE 10.0/i))) {
	doc.className = doc.className + " ie10";
} else if((ua.match(/MSIE 9.0/i))) {
	doc.className = doc.className + " ie9";
} else if((ua.match(/MSIE 8.0/i))) {
	doc.className = doc.className + " ie8";
} else if((ua.match(/MSIE 7.0/i))) {
	doc.className = doc.className + " ie7";
} else if((ua.match(/rv:11.0/i))){
	doc.className = doc.className + " ie11";
}

//Tab
$.fn.uxeTabs = function (options) {
	var settings = $.extend({
		'selector' : 'js-tabs',
		'menuSelector': '.list-item-tab',
		'menuBtnSelector' : '.list-item-btn',
		'mainTargetAttribute' : 'name',
		'activeTabMenuClass': 'is-selected',
		'tabsContentSlector' : '.list-item-btn',
		'activeTabContentClass' : 'active',
		'speed': 0,
		'autoFirstActivate': false,
		'firstActiveIndex':0,
		'useSubTarget' : false,
		'useSubTargetAttribute' : 'data-subtarget',
		'subtargetClass' : 'is-selected',
		'navClickScrollToTabsTop' :false
	}, options);
	return this.each(function(){
		var $this = $(this);
		var $navs = $this.find(settings.menuSelector);
		$this.addClass(settings.selector);
		if(settings.autoFirstActivate === true){
			var fisrtMenuElement = $this.find(settings.menuSelector).eq(settings.firstActiveIndex);
			var fisrtHash = fisrtMenuElement.find('.list-item-btn').attr(settings.mainTargetAttribute);
			fisrtMenuElement.addClass(settings.activeTabMenuClass).siblings().removeClass(settings.activeTabMenuClass);
			$this.find(fisrtHash).addClass(settings.activeTabContentClass);
			if(settings.useSubTarget===true){
				var $firstsubTarget = $(fisrtMenuElement.find('.list-item-btn').attr(settings.useSubTargetAttribute));
				$firstsubTarget.addClass(settings.subtargetClass);
			}
		};
		$navs.find(settings.menuBtnSelector).click(function(e){
			e.preventDefault();
			var hash = $(this).attr(settings.mainTargetAttribute);
			var $tabContent = $this.find(settings.tabsContentSlector);

			$navs.removeClass(settings.activeTabMenuClass);
			$tabContent.removeClass(settings.activeTabContentClass);
			$(this).parents(settings.menuSelector).addClass(settings.activeTabMenuClass);
			$(hash).addClass(settings.activeTabContentClass);

			if(settings.useSubTarget===true){
				var $subTarget = $($(this).attr(settings.useSubTargetAttribute));
				$this.find($subTarget).addClass(settings.subtargetClass);
			}
		});
	});
};
var APTNL = (function() {
		var callLayer = function() {
			var btnLayer = document.querySelectorAll('[data-layer]');
			for (var i = 0; i < btnLayer.length; i++) {
				btnLayer[i].addEventListener('click', function(e) {
					var targetId = this.dataset.layer;
					var targetLayer = document.querySelector('#' + targetId);
					targetLayer.classList.add('showing');
					console.log($(targetLayer));
					if ($(targetLayer).is('.layer-area, #cartLayer')) {
						$('html, body').addClass('scroll-off');
					}
				});
			}
			var btnLayerClose = document.querySelectorAll('.layer_section .btn_layer-close');
			for (var i = 0; i < btnLayerClose.length; i++) {
				btnLayerClose[i].addEventListener('click', function(e) {
					var targetElem = e.target;
					while (!targetElem.classList.contains('layer_section')) {
						targetElem = targetElem.parentNode;
						if (targetElem.nodeName == 'BODY') {
							targetElem = null;
							return;
						}
					}
					targetElem.classList.remove('showing');
				})
			}
		};
		return {
			callLayer: callLayer,
		}
	}
)();

// tollTipLayer
var tollTipLayer = function() {
	var btnTooltip = document.querySelectorAll('[data-tooltip]');
	var targetLayer = null;
	for (var i = 0; i < btnTooltip.length; i++) {
		btnTooltip[i].addEventListener('click', function(e) {
			e.stopPropagation();
			var targetId = this.dataset.tooltip;
			targetLayer = document.querySelector('#' + targetId);
			targetLayer.classList.toggle('is-showing');
		});
	}
	document.body.addEventListener('click', function(evt) {
		var noRedirect = '.tooltip-layer, .tooltip-cont, .tooltip-txt';
		if (!evt.target.matches(noRedirect)) {
			if (targetLayer == null)
				return;
			targetLayer.classList.remove('is-showing');
		}
	})
};

$(document).ready(function(){
	$('.box-tab').uxeTabs({
		'tabsContentSlector':'.tab-contents',
		'useSubTarget': true,
		'autoFirstActivate': true,
		'navClickScrollToTabsTop':true
	});

	//detail open
	$('.btn-detail').on('click', function (e) {
		$('.base-wrap').addClass('open');
	});
	$('.base-wrap .btn-close').on('click', function (e) {
		$('.base-wrap').removeClass('open');
	});

	$('.btn-tutorial-hide').on('click', function (e) {
		$('.tutorial-popup').addClass('hide');
	});
	
	// 레이어
	$('.btn-tooltip').on('click', function (e) {
		$(this).toggleClass('active');
	});

	// filter open
	$('.btn-filter').on('click', function (e) {
		$(this).addClass('active');
		$('.filter-option').addClass('is-open');
	});
	$('.btn-close-a').on('click', function (e) {
		$('.btn-filter').removeClass('active');
		$('.filter-option').removeClass('is-open');
	});

	// summary open
	$('.summary-open').on('click', function (e) {
		$('.apt-summary').addClass('is-open');
	});
	$('.apt-summary .btn-close-a').on('click', function (e) {
		$('.apt-summary').removeClass('is-open');
	});

	// 모바일 셀렉트 형태
	var $tabs =  $('.box-choice .choice-item');
	$('.m-select .option-open').click(function(){
		//$tabs.toggleClass('m_view');
		$(this).parent().parent().toggleClass('option-open');
	});
	$tabs.click(function(){
		//$tabs.removeClass('m_view');
		$('.m-select').removeClass('option-open');
	});

	$(".box-choice .choice-item .form_element-radio").on("click", function(e){
		$(this).parent().parent().parent().parent().parent().parent().find( '.m-select .option-open' ).text( $(this).text() );
	});

	//  회사소개 메뉴
	$('.btn-nav-open').on('click', function (e) {
		$(this).toggleClass('close');
		$('.company-header').toggleClass('nav-m-view');
	});

	/*window.onscroll = function() {myFunction()};
	var header = document.getElementById("companyHeader");
	var sticky = header.offsetTop;
	function myFunction() {
		if (window.pageYOffset > sticky) {
			header.classList.add("sticky");
		} else {
			header.classList.remove("sticky");
		}
	}*/

	// 슬라이더
	$( "#slider-a" ).slider({
		range: "min",
		value: 400,
		min: 1,
		max: 700,
		slide: function( event, ui ) {
			$( "#slider-value-a" ).val( "일자 : " + ui.value );
		}
	});
	$( "#slider-value-a" ).val( "일자 : " + $( "#slider-a" ).slider( "value" ) );

	$( "#slider-b" ).slider({
		range: "min",
		value: 9,
		min: 1,
		max: 24,
		slide: function( event, ui ) {
			$( "#slider-value-b" ).val( "시간 : " + ui.value );
		}
	});
	$( "#slider-value-b" ).val( "시간 : " + $( "#slider-b" ).slider( "value" ) );
})