// Sleep function
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//①ガイド表示
//ガイド適用
const scanCameraFlowInit = (productType) => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    const canSize = params.size ? params.size : "350";
    $('.scan_camera_flow_1 > .scan_camera_flow_guide > img.scan_camera_flow_guide_pic').attr('src', `/scan_assets/images/camera_flow1_guide_${canSize}.png`);
    $('.scan_camera_flow_1 > .scan_camera_flow_guide > img.scan_camera_flow_guide_move').attr('src', `/scan_assets/images/camera_flow1_guide_${canSize}_mark.png`);
    $('.scan_camera_flow_1 > .scan_camera_flow_guide > img.scan_camera_flow_guide_move_sun').attr('src', `/scan_assets/images/camera_flow1_guide_${canSize}_${productType}.png`);
    $('.scan_camera_flow_2').addClass(`scan_camera_mask_${canSize}`);
}

const scanCameraButtonToggle = (isShow) => {
    if (isShow) {
        // $('#scan_camera_btn').show();
        document.getElementById("scan_camera_btn").innerHTML = `<div class="scan_camera_flow_btn"><button id="take-button" class="_on" onclick="takePictureButton()"></button></div>`;
    } else {
        document.getElementById("scan_camera_btn").innerHTML = `<div class="scan_camera_flow_btn"><button></button></div>`;
    }
    // const takeButton = $('#take-button');

    // takeButton.toggleClass('_on', isShow);
    // if (isShow) {
    //     takeButton.trigger('focus').css('outline', 'none');
    // }

}

//②カウントダウン〜撮影
//場面切り替え
const scanCameraFlow_CountDown = async () => {
    $('#scan_camera_btn').hide()
    // $('.scan_camera_flow_2').removeClass('hidden').addClass('show');
    // $('.scan_camera_flow_2_move').removeClass('hidden').addClass('show');
    $('.scan_camera_flow_2').show();
    $('.scan_camera_flow_2_move').show();
    $('.scan_camera_flow_guide_move').addClass('_stop');
    $('.scan_camera_flow_guide_move_sun').addClass('_stop');
    $('.scan_camera_flow_btn button').addClass('_done');
    // $('.scan_camera_flow_2').show();
    // $('.scan_camera_flow_2_move').show();

    // $('#countdown').addClass('countdown__reveal');
    // $('#countdown_number').html("<img class='countdown-img' src='scan_assets/images/camera_btn_coutdown.gif'/>");
    await sleep(3000);
    $('#countdown').addClass('hidden');
    // $('.scan_camera_flow_guide_move').removeClass('_stop');
    // $('.scan_camera_flow_guide_move_sun').removeClass('_stop');
    $('.scan_camera_flow_btn').hide();
    // $('.scan_camera_flow_2').removeClass('show').addClass('hidden');
    // $('.scan_camera_flow_2_move').removeClass('show').addClass('hidden');
    $('.scan_camera_flow_2').hide();
    $('.scan_camera_flow_2_move').hide();
}

//③動画再生・アップロード〜ページ遷移
const scanCameraFlow_Animation = async () => {
    $('.scan_camera_flow_1').hide();
    $('.scan_camera_flow_2').hide();
    $('.scan_camera_flow_3').removeClass('hidden').css('display', 'block');

    let scanMovie = document.getElementById('scan_get_movie');
    const videoLength = scanMovie.duration;
    console.log("Video Length:", videoLength);
    scanMovie.play();
    await sleep(3.537 * 1000);
    console.log("ANIMATION DONE")
}