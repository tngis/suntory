import gsap from 'gsap';
//jQuery読み込み
import jQuery from 'jquery';
const $ = jQuery;
window.jQuery = jQuery;

//その他、プラグイン等結合したいjs
require('./jquery.easing.min');
require('./jquery.depend.min');


//contents.js本体

/////////////////////////////////////////////////
//IE判別
const whoAreYou = () => {
	let browserName = $.browser.original;
	let machineName = $.platform.type;
	let osName = $.platform.original;

	$('html').addClass('no-msie '+browserName+' '+machineName+' '+osName+'');
};

//////////////////////////////////////////////////
//スムーススクロール設定　
const smoothScroll = () => {
	$('a[href*="#"],area[href*="#"]').click(function() {
		if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'')
		&& location.hostname == this.hostname) {
			let $target = $(this.hash);
			$target = $target.length && $target
			|| $('[name=' + this.hash.slice(1) +']');
				if ($target.length) {
				let targetOffset = $target.offset().top - 0;
				let scrollSpeed = 320;//スクロール速度
				$('html,body').animate({scrollTop: targetOffset}, scrollSpeed);
				return false;
			}
		}
	});
};



//////////////////////////////////////////////////
//ノイズ
const scanCameraNoise =()=> {
	const noiseDom = document.querySelector('.scan_camera_flow_2::before');
	const turbulence = document.querySelector('#noise > feTurbulence');
	const displacementMap = document.querySelector('#noise > feDisplacementMap');
	
	let _scale = {
	  value: null
	};
	let _baseFrequency = {
	  value: null
	};
	
	let noiseTl = gsap.timeline().pause()
	  .add('scene1')
	  .fromTo(_scale, {
		value: 0
	  }, {
		value: 140,
		duration: .3,
		ease: 'Power4.easeOut',
		onUpdate: () => {
		  displacementMap.setAttribute('scale', _scale.value)
		}
	  },'scene1')
	
	  .fromTo(_baseFrequency, {
		value: 1
	  }, {
		value: 1.4,
		duration: .3,
		ease: 'Power4.easeIn',
		onUpdate: () => {
		  turbulence.setAttribute('baseFrequency', _baseFrequency.value)
		},
		onComplete: () => {
		  noiseTl2.play();
		}
	  },'scene1')
	
	let noiseTl2 = gsap.timeline().pause()
	  .add('scene1')
	  .to(_baseFrequency, {
		repeat: -1,
		duration: .3,
		ease: 'Power4.easeIn',
		onUpdate: function () {
		  turbulence.setAttribute('baseFrequency', gsap.utils.random(1.1,1.5).toFixed(1))
		}
	  },'scene1')
	
	
	noiseTl.play();
}

/////////カメラスキャン
//フロー1：カメラ起動〜ガイド表示


//フロー1-2：カメラボタン表示
window.scanCameraBtn =()=> {
	$('.scan_camera_flow_btn button').addClass('_on');
}


//フロー2：スキャン演出
window.scanDone =()=> {
	$('.scan_camera_flow_guide_move').addClass('_stop');
	$('.scan_camera_flow_guide_move_sun').addClass('_stop');
	$('.scan_camera_flow_btn button').addClass('_done');
	$('.scan_camera_flow_2').show();
	$('.scan_camera_flow_2_move').show();
}

//フロー2.5：缶サイズ確認
window.scanSizeCheck =(canSize)=> {
	$('.scan_modal_size .scan_modal_size_body p').text(''+ canSize +'mlでよろしいですか？');

	$('.scan_camera_flow_1').fadeOut(300);
	$('.scan_modal_size').fadeIn(300,function(){
		$(this).attr('tabindex','-1').trigger('focus');
	})
}


//フロー3：ポイント獲得動画
window.scanGetPoint =()=> {
	$('.scan_modal_size').fadeOut(300);
	$('.scan_camera_flow_3').fadeIn(300);

	let pointV = document.getElementById('scan_get_movie');
	//console.log(pointV);
	pointV.play();

	let canSizeTxt = $('.scan_modal_size .scan_modal_size_body p').text();
	let canSizeNum = canSizeTxt.substring(0,3);
	console.log(canSizeNum);

	if(canSizeNum == 500) {
		$('.scan_camera_flow_point img').attr({
			src: '/scan_assets/images/camera_point_500.png',
			alt: '2ポイント獲得！'
		});
	}
	
	pointV.addEventListener('ended', ()=> {
		//console.log('movie ended');
		$('.scan_camera_flow_point').css('opacity','1').attr('tabindex','-1').trigger('focus');
		$('.scan_camera_flow_mypage').css('opacity','1');
	}, false);
}




/////////////////////////////////////////////////
//トリガー
document.addEventListener('DOMContentLoaded', (event) => {
	whoAreYou();
	//smoothScroll();

	//camera
	if($('div').hasClass('scan_camera')) {
		scanCameraNoise();
	}
});
