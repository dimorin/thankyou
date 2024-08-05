/* 날짜 포맷 */
Date.prototype.format = function (f) {
    if (!this.valueOf()) return " ";
    var weekKorName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var weekKorShortName = ["일", "월", "화", "수", "목", "금", "토"];
    var weekEngName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var weekEngShortName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var d = this;

    return f.replace(/(yyyy|yy|MM|dd|KS|KL|ES|EL|HH|hh|mm|ss|a\/p)/gi, function ($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear(); 						// 년 (4자리)
            case "yy": return (d.getFullYear() % 1000).zf(2); 			// 년 (2자리)
            case "MM": return (d.getMonth() + 1).zf(2); 				// 월 (2자리)
            case "dd": return d.getDate().zf(2); 						// 일 (2자리)
            case "KS": return weekKorShortName[d.getDay()]; 			// 요일 (짧은 한글)
            case "KL": return weekKorName[d.getDay()]; 					// 요일 (긴 한글)
            case "ES": return weekEngShortName[d.getDay()]; 			// 요일 (짧은 영어)
            case "EL": return weekEngName[d.getDay()]; 					// 요일 (긴 영어)
            case "HH": return d.getHours().zf(2); 						// 시간 (24시간 기준, 2자리)
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2); // 시간 (12시간 기준, 2자리)
            case "mm": return d.getMinutes().zf(2); 					// 분 (2자리)
            case "ss": return d.getSeconds().zf(2); 					// 초 (2자리)
            case "a/p": return d.getHours() < 12 ? "오전" : "오후"; 		// 오전/오후 구분
            default: return $1;
        }
    });
};
String.prototype.string = function (len) { var s = '', i = 0; while (i++ < len) { s += this; } return s; };
String.prototype.zf = function (len) { return "0".string(len - this.length) + this; };
Number.prototype.zf = function (len) { return this.toString().zf(len); };
/* 사용예
var today = new Date();
console.log(today.format('yyyy-MM-dd HH:mm:ss')); */

/* 비밀번호 유효성 검사(영문, 숫자, 특수문자를 조합하여 최소 8자 이상) */
function validatePassword(password) {
    // 영문, 숫자, 특수문자를 조합하여 최소 8자 이상인지를 체크하는 정규식
    const regex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    // 정규식과 비밀번호 매칭 결과 반환
    return regex.test(password);
}
/* 사용예
const passwords = ["Abcdef1!", "12345678", "abcdefg!", "ABCDEFGH1!", "Abc1!abcdef"];
passwords.forEach(pw => {
    console.log(`Password: ${pw}, Valid: ${validatePassword(pw)}`);
}); */

/* 아이디 입력시 숫자만 입력되고 핸드폰 형식으로 나오게 하기 */
function formatPhoneNumber(event) {
    let input = event.target.value;

    // 숫자만 남기기
    input = input.replace(/\D/g, '');
    //console.log(input);
    // 원하는 형식으로 변환
    let formattedNumber = '';
    if (input.length > 3) {
        formattedNumber += input.substring(0, 3) + '-';
        if (input.length > 7) {
            formattedNumber += input.substring(3, 7) + '-';
            formattedNumber += input.substring(7, 11);
        } else {
            formattedNumber += input.substring(3);
        }
    } else {
        formattedNumber = input;
    }

    // 변환된 값을 입력 필드에 설정
    event.target.value = formattedNumber;
}
/* 사용예
$('#account_id').on('input', formatPhoneNumber); */

function DoubleCheck(option) {	// 중복확인 검사
    this.valid = true;
    this.option = option;
    this.target_name = option.target_name;
    this.target = $(option.target);
    this.btn_check = $(option.btn_check);
    this.init_value = option.init_value;
    this.check_url = option.check_url;
    this.param_arr = option.param_arr;
    this.parentOfTarget = this.target.parent();
    this.paramKey = this.target.attr('name');
    this.addEventListeners();
}
DoubleCheck.prototype.addEventListeners = function () {
    var _this_doubleCheck = this;
    _this_doubleCheck.init = function () { // 처음일 때 입력창 아이콘, 버튼 상태, 입력창 값 세팅
        $(_this_doubleCheck.parentOfTarget).removeClass('valid');
        $(_this_doubleCheck.parentOfTarget).removeClass('unvalid');
        $(_this_doubleCheck.btn_check).attr('disabled', true);
        $(_this_doubleCheck.target).val(_this_doubleCheck.init_value);
        _this_doubleCheck.valid = true;
    };

    // 이벤트 바인딩
    _this_doubleCheck.target.on('keyup', function (event) { // 입력창 값이 바뀔 때 입력창과 버튼 상태 세팅
        var target_value = $(event.currentTarget).val();
        if (target_value == _this_doubleCheck.init_value) { // 내용이 변경되어 처음과 같으면            
            $(_this_doubleCheck.parentOfTarget).removeClass('valid');
            $(_this_doubleCheck.parentOfTarget).removeClass('unvalid');
            $(_this_doubleCheck.btn_check).attr('disabled', true);
            _this_doubleCheck.valid = true;
        } else { // 내용이 변경되면
            $(_this_doubleCheck.parentOfTarget).removeClass('valid');
            $(_this_doubleCheck.parentOfTarget).addClass('unvalid');
            $(_this_doubleCheck.btn_check).attr('disabled', false);
            _this_doubleCheck.valid = false;
        };
    });
    _this_doubleCheck.btn_check.on('click', function (event) { // 버튼 클릭시 결과에 따라 입력창 아이콘, 버튼 상태 세팅
        if ($(_this_doubleCheck.target).val() == '') {
            alert(`중복체크할 ${_this_doubleCheck.target_name}을(를) 입력하세요.`);
            return;
        }
        var url = _this_doubleCheck.check_url;
        var param = {};
        /* $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(param),
            contentType: 'application/json',
            success: function (data) {
                if (data.result == false && data.msg == 'ALREADY EXISTS') { // 중복된게 있다면	   					
                    alert(`이미 사용중인 ${_this_doubleCheck.target_name}입니다.<br>다른 ${_this_doubleCheck.target_name}을(를) 입력하세요.`);
                 
                    $(_this_doubleCheck.parentOfTarget).removeClass('valid');
                    $(_this_doubleCheck.parentOfTarget).addClass('unvalid');
                    $(_this_doubleCheck.btn_check).attr('disabled', false);
                    _this_doubleCheck.valid = false;
                } else if (data.result) {
                    alert(`사용할 수 있는 ${_this_doubleCheck.target_name}입니다.`);
                  
                    $(_this_doubleCheck.parentOfTarget).removeClass('unvalid');
                    $(_this_doubleCheck.parentOfTarget).addClass('valid');
                    $(_this_doubleCheck.btn_check).attr('disabled', true);
                    _this_doubleCheck.valid = true;
                }
            },
            error: function (data) {
                //alert("중복체크실패");
                alert('중복체크에 실패했습니다.<br>다시 시도해보시고 관리자에게 문의하세요.');
                
                $(_this_doubleCheck.parentOfTarget).removeClass('valid');
                $(_this_doubleCheck.parentOfTarget).addClass('unvalid');
                $(_this_doubleCheck.btn_check).attr('disabled', false);
                _this_doubleCheck.valid = false;
            }
        }); */
        alert(`사용할 수 있는 ${_this_doubleCheck.target_name}입니다.`);

        $(_this_doubleCheck.parentOfTarget).removeClass('unvalid');
        $(_this_doubleCheck.parentOfTarget).addClass('valid');
        $(_this_doubleCheck.btn_check).attr('disabled', true);
        _this_doubleCheck.valid = true;
    });

    return this;
}

/* 사용 예
var doubleCheck_id = new DoubleCheck({
    target_name: '아이디',
    target: 'input[name=account_id]',
    btn_check: '.btn_check_duplicate',
    init_value: '',
    check_url: '',
    param_arr: [],
});
doubleCheck_id.init(); */


// 입력창에 텍스트가 들어가면 초기화 버튼이 생기고, 초기화 버튼을 누르면 초기화 되는 기능
function InputWithReset(inputId) {
    this.inputElement = document.querySelector(inputId);
    this.resetButton = document.createElement('button');
    this.resetButton.classList.add('btn_input_reset');
    this.resetButton.innerHTML = '<span class="material-symbols-outlined">close</span>';
    this.resetButton.style.display = 'none'; // 초기에는 버튼을 숨김
    //this.inputElement.parentNode.insertBefore(this.resetButton, this.inputElement.nextSibling);
    this.inputElement.nextElementSibling.insertAdjacentElement('afterbegin', this.resetButton);

    this.addEventListeners();
}
InputWithReset.prototype.addEventListeners = function () {
    var _this = this;

    if (_this.inputElement.value) {
        _this.resetButton.style.display = 'inline-flex'; // 텍스트 입력 시 버튼 표시
    } else {
        _this.resetButton.style.display = 'none'; // 텍스트 없을 시 버튼 숨김
    }

    _this.inputElement.addEventListener('input', function (e) {
        //console.dir(e.type);
        if (_this.inputElement.value) {
            _this.resetButton.style.display = 'inline-flex'; // 텍스트 입력 시 버튼 표시
        } else {
            _this.resetButton.style.display = 'none'; // 텍스트 없을 시 버튼 숨김
        }
    });

    _this.resetButton.addEventListener('click', function () {
        _this.inputElement.value = ''; // 버튼 클릭 시 입력창 초기화
        _this.resetButton.style.display = 'none'; // 버튼 숨김
    });
};
// 사용 예:
//var inputWithReset = new InputWithReset('#login_id');

// 입력창에 텍스트가 들어가면 눈 버튼이 생기고, 눈을 클릭할 때 마다 텍스트가 토글되는 기능
function InputWithToggle(inputId) {
    this.inputElement = document.querySelector(inputId);
    this.visibilityButton = document.createElement('button');
    this.visibilityButton.classList.add('btn_input_visibility');
    this.visibilityButton.innerHTML = '<span class="material-symbols-outlined">visibility</span>';
    this.visibilityButton.style.display = 'none'; // 초기에는 버튼을 숨김
    this.inputElement.parentNode.insertBefore(this.visibilityButton, this.inputElement.nextSibling);
    this.addEventListeners();
}
InputWithToggle.prototype.addEventListeners = function () {
    var _this = this;

    if (_this.inputElement.value) {
        _this.visibilityButton.style.display = 'inline-flex'; // 텍스트 입력 시 버튼 표시
    } else {
        _this.visibilityButton.style.display = 'none'; // 텍스트 없을 시 버튼 숨김
    }

    _this.inputElement.addEventListener('input', function () {
        if (_this.inputElement.value) {
            _this.visibilityButton.style.display = 'inline-flex'; // 텍스트 입력 시 버튼 표시
        } else {
            _this.visibilityButton.style.display = 'none'; // 텍스트 없을 시 버튼 숨김
        }
    });

    _this.visibilityButton.addEventListener('click', function () {
        //_this.inputElement.value = ''; // 버튼 클릭 시 입력창 초기화
        if (_this.inputElement.type === "password") {
            _this.inputElement.type = "text";
            _this.visibilityButton.innerHTML = '<span class="material-symbols-outlined">visibility_off</span>';
        } else {
            _this.inputElement.type = "password";
            _this.visibilityButton.innerHTML = '<span class="material-symbols-outlined">visibility</span>';
        }
    });
};
// 사용 예:
//var inputWithToggle = new InputWithToggle('#login_pw');

/* sheet-topsheet,bottomsheet,fullsheet */
$.fn.sheet = function (showhide) {
    var target_element = this;
    var target_id = target_element.attr('id');
    var target_type = target_element.data('type');
    var hammer_element = undefined;
    var hammer_time = undefined;
    var backdrop_length = 0;
    if (showhide === 'show') {
        $('body').css('overflow', 'hidden');
        $('body').append(`<div class="backdrop ${target_id}"></div>`);
        backdrop_length = $('body').children('.backdrop').length;
        $(`.backdrop.${target_id}`).css('z-index', (backdrop_length - 1) * 2 + 1000);
        setTimeout(() => {
            $(`.backdrop.${target_id}`).addClass('show');
        }, 10);
        target_element.css('z-index', (backdrop_length - 1) * 2 + 1000 + 1);
        target_element.addClass('show');
        $(`.backdrop.${target_id}`).on('click', hide_sheet);
        if (target_type === 'bottom') {
            hammer_element = document.querySelector(`#${target_id}`);
            hammer_time = new Hammer(hammer_element);
            hammer_time.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
            hammer_time.on("swipedown", function (event) {
                //alert(event.type);
                hide_sheet();
            });
        }
        if (target_type === 'top') {
            hammer_element = document.querySelector(`#${target_id}`);
            hammer_time = new Hammer(hammer_element);
            hammer_time.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
            hammer_time.on("swipeup", function (event) {
                //alert(event.type);
                hide_sheet();
            });
        }
    } else {
        hide_sheet();
    }

    function hide_sheet() {
        if ($('body .backdrop').length <= 1) {
            /* backdrop이 두 개 이상 이라는 것은 이미 다른 팝업이 열려 있다는 것이기 때문에 해당 팝업을 닫아도 overflow는 hidden으로 유지 하기 위해 
            backdrop이 하나일 때만 body의 overflow를 auto로 되돌림 */
            $('body').css('overflow', 'auto');
        }
        target_element.removeClass('show');
        $(`.backdrop.${target_id}.show`).removeClass('show');
        $(`.backdrop.${target_id}`).off('click', hide_sheet);
        $(`.backdrop.${target_id}`).remove();
        if (hammer_element) {
            hammer_element = undefined;
        }
        if (hammer_time) {
            hammer_time = undefined;
        }
    }

    /* var hammer_element = document.querySelector(`#${target_id}`); 
    
        var hammer_time = new Hammer(hammer_element);
        hammer_time.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
        hammer_time.on("swipedown swipeup", function (event) { 
            alert(event.type);
        }); */



    return this;
};
/* 사용 예 */
//$('#find_equipment').sheet('show');
//$('#add_media').sheet('hide');

/* 확인팝업 */
$.modal = function (showhide, option) {
    var option = option || undefined;
    var message = undefined;
    var onebutton = undefined;
    var twobutton = undefined;
    var target_html = '';
    var target_element = $('.modalContainer');
    var backdrop_length = 0;
    if (option) {
        message = option.message || "";
        onebutton = option.onebutton || "<div></div>";
        twobutton = option.twobutton || "<div></div>";
        target_html = `
            <div class="modalContainer">
                <div class="modal">
                    <div class="modal_body">
                        ${message}
                    </div>
                    <div class="pt-10 mt-10"></div>
                    <div class="modal_control_wrap">
                        ${onebutton}
                        ${twobutton}
                    </div>
                </div>
            </div>
        `;
        target_element = $(target_html);
    }

    if (showhide === 'show') {
        $('body').css('overflow', 'hidden');
        $('body').append(`<div class="backdrop modal"></div>`);
        backdrop_length = $('body').children('.backdrop').length;
        $(`.backdrop.modal`).css('z-index', (backdrop_length - 1) * 2 + 1000);
        setTimeout(() => {
            $(`.backdrop.modal`).addClass('show');
        }, 10);
        target_element.css('z-index', (backdrop_length - 1) * 2 + 1000 + 1);
        $('body').append(target_element);
        $(`.backdrop.modal`).on('click', hide_modal);
    } else {
        hide_modal();
    }

    function hide_modal() {
        //$.modal('hide');
        if ($('body .backdrop').length <= 1) {
            /* backdrop이 두 개 이상 이라는 것은 이미 다른 팝업이 열려 있다는 것이기 때문에 해당 팝업을 닫아도 overflow는 hidden으로 유지 하기 위해 
            backdrop이 하나일 때만 body의 overflow를 auto로 되돌림 */
            $('body').css('overflow', 'auto');
        }
        target_element.remove();
        $(`.backdrop.modal.show`).removeClass('show');
        $(`.backdrop.modal`).off('click', hide_modal);
        $(`.backdrop.modal`).remove();
    }
};
/* 사용 예 */
/* $('.btn_open_two').on('click',function(){
    $.modal('show', {
        message:`해당 템플릿을 삭제하시겠습니까?`,
        onebutton:`<button class="btn btn_txt" onclick="$.modal('hide');">취소</button>`,
        twobutton:`<button class="btn btn_fill" onclick="twobutton_callback();">삭제</button>`,
        
    });
});
function twobutton_callback(){
    alert("삭제 기능 수행~");
    $.modal('hide');
}

$('.btn_open_one').on('click',function(){
    $.modal('show', {
        message:`템플릿 삭제에 실패했습니다.<br>다시 시도해보시고 관리자에게 문의하세요.`,
        onebutton:`<button class="btn btn_fill" onclick="$.modal('hide')">확인</button>`,
    });
}); */

/* 알림 배너 (점주 메인화면에서 쓰임) */
$.banner_notice = function (showhide, option) {
    var option = option || undefined;
    var message = undefined;
    var link = undefined;
    var target_element = $('.banner_notice');
    var target_html = '';
    if (option) {
        message = option.message || "";
        link = option.link || "#";
        target_html = `
            <div class="banner_notice">
                <a href="${link}" class="btn txt">
                    ${message}
                </a>
                <button class="btn btn_close" onclick="$.banner_notice('hide');">
                    <span class="material-symbols-outlined icon">close</span>
                </button>
            </div>
        `;
        target_element = $(target_html);
    }
    if (showhide === 'show') {
        $('.container.home').prepend(target_element);
    } else {
        target_element.remove();
    }
}
/* 사용 예
$.banner_notice('show',{
    message:`
        사업자등록증이 없는 매장이 있습니다.<br>
        확인 후 사업자등록증을 등록해주세요.`,
    link:`https://www.naver.com`
}); */

/* 회사 자동완성 */
$.fn.autoComplete_company = function (multi) {
    var multi = multi || undefined;
    var target_element = this;
    var target_parent = this.parent();
    var target_id = target_element.prop('id');
    var autoList_wrap = $(`.autoList_wrap[data-autolist="${target_id}"]`);
    target_element.on('keyup click', function (e) {
        var target_find = target_element.val();
        /* var url = "/fms/board/getUserAutoComplete";
        var param = {};
        param.target_find = target_find;
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(param),
            contentType: 'application/json',
            success: function (data) {
                //console.log(JSON.stringify(data));
                makeAutoList(data);
            },
            error: function (data) {
                alert("Fail!!!!");
            }
        }); */
        var data = dummy;
        makeAutoList(data);
    });
    function makeAutoList(data) {
        var list = data.companyList;
        var listTemplate = "";
        list.forEach(function (item) {
            var company = item.company || '';
            var template = `
                            <li>
                                <button type="button" class="btn" data-company="${item.company}">
                                    <span class="d-inline-block ">${company}</span>
                                </button>
                            </li>`;
            listTemplate += template;
        });
        autoList_wrap.find('.autoList').html(listTemplate);
        autoList_wrap.find('.autoList button').on('click', function (e) {
            var value = $(e.currentTarget).data('company');
            target_element.val(value);

            if (target_parent.find('.btn_input_reset')) {
                target_parent.find('.btn_input_reset').show();
            }

            if (multi) {
                var chip_html = `
                        <li>
                            <div class="option_chip">
                                <span class="txt">${value}</span>
                                <button class="btn btn_chip ml-5">
                                    <span class="material-symbols-outlined">close_small</span>
                                </button>
                            </div>
                        </li>
                `;
                $(`.select_add_list[data-result=${target_id}]`).append(chip_html);
            }

            autoList_wrap.hide();
            $(document).off('click', hideifother);
        });

        autoList_wrap.show();
        $(document).on('click', hideifother);
    }
    function hideifother(e) {
        if (!target_parent.find($(e.target)).length) {//.input_box_search 내에 있는 요소를 클릭하면 닫히지 않게 하기 위함        
            autoList_wrap.hide();
            $(document).off('click', hideifother);
        }
    }
    var dummy = {
        companyList: [
            { company: '더본코리아' },
            { company: '삼성' },
            { company: '엘지' },
            { company: '현대' },
            { company: 'SK' },
            { company: '카카오' },
            { company: '네이버' },
            { company: '셀트리온' }
        ]
    }
};
/* 사용 예 */
//$('#find_partner_company').autoComplete_company();

/* 브랜드 자동완성 */
$.fn.autoComplete_brand = function (multi) {
    var multi = multi || undefined;
    var target_element = this;
    var target_parent = this.parent();
    var target_id = target_element.prop('id');
    var autoList_wrap = $(`.autoList_wrap[data-autolist="${target_id}"]`);
    target_element.on('keyup click', function (e) {
        var target_find = target_element.val();
        /* var url = "/fms/board/getUserAutoComplete";
        var param = {};
        param.target_find = target_find;
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(param),
            contentType: 'application/json',
            success: function (data) {
                //console.log(JSON.stringify(data));
                makeAutoList(data);
            },
            error: function (data) {
                alert("Fail!!!!");
            }
        }); */
        var data = dummy;
        makeAutoList(data);
    });
    function makeAutoList(data) {
        var list = data.brandList;
        var listTemplate = "";
        list.forEach(function (item) {
            var brand = item.brand || '';
            var template = `
                                <li>
                                    <button type="button" class="btn" data-brand="${item.brand}">
                                        <span class="d-inline-block ">${brand}</span>
                                    </button>
                                </li>`;
            listTemplate += template;
        });
        autoList_wrap.find('.autoList').html(listTemplate);
        autoList_wrap.find('.autoList button').on('click', function (e) {
            var value = $(e.currentTarget).data('brand');
            target_element.val(value);

            if (target_parent.find('.btn_input_reset')) {
                target_parent.find('.btn_input_reset').show();
            }

            if (multi) {
                var chip_html = `
                        <li>
                            <div class="option_chip">
                                <span class="txt">${value}</span>
                                <button class="btn btn_chip ml-5">
                                    <span class="material-symbols-outlined">close_small</span>
                                </button>
                            </div>
                        </li>
                `;
                $(`.select_add_list[data-result=${target_id}]`).append(chip_html);
            }

            autoList_wrap.hide();
            $(document).off('click', hideifother);
        });

        autoList_wrap.show();
        $(document).on('click', hideifother);
    }
    function hideifother(e) {
        if (!target_parent.find($(e.target)).length) {//.input_box_search 내에 있는 요소를 클릭하면 닫히지 않게 하기 위함        
            autoList_wrap.hide();
            $(document).off('click', hideifother);
        }
    }
    var dummy = {
        brandList: [
            { brand: '빽다방' },
            { brand: '빽보이' },
            { brand: '홍콩반점' }
        ]
    }
};
/* 사용 예 */
//$('#find_partner_brand').autoComplete_brand();

/* 매장 자동완성 */
$.fn.autoComplete_store = function (multi) {
    var multi = multi || undefined;
    var target_element = this;
    var target_parent = this.parent();
    var target_id = target_element.prop('id');
    var autoList_wrap = $(`.autoList_wrap[data-autolist="${target_id}"]`);
    target_element.on('keyup click', function (e) {
        var target_find = target_element.val();
        /* var url = "/fms/board/getUserAutoComplete";
        var param = {};
        param.target_find = target_find;
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(param),
            contentType: 'application/json',
            success: function (data) {
                //console.log(JSON.stringify(data));
                makeAutoList(data);
            },
            error: function (data) {
                alert("Fail!!!!");
            }
        }); */
        var data = dummy;
        makeAutoList(data);
    });
    function makeAutoList(data) {
        var list = data.storeList;
        var listTemplate = "";
        list.forEach(function (item) {
            var store = item.store || '';
            var brand = item.brand || '';
            var template = `
                                <li>
                                    <button type="button" class="btn" data-store="${item.store}">
                                        <span class="d-inline-block ">[${brand}] ${store}</span>
                                    </button>
                                </li>`;
            listTemplate += template;
        });
        autoList_wrap.find('.autoList').html(listTemplate);
        autoList_wrap.find('.autoList button').on('click', function (e) {
            var value = $(e.currentTarget).data('store');
            target_element.val(value);

            if (target_parent.find('.btn_input_reset')) {
                target_parent.find('.btn_input_reset').show();
            }

            if (multi) {
                var chip_html = `
                        <li>
                            <div class="option_chip">
                                <span class="txt">${value}</span>
                                <button class="btn btn_chip ml-5">
                                    <span class="material-symbols-outlined">close_small</span>
                                </button>
                            </div>
                        </li>
                `;
                $(`.select_add_list[data-result=${target_id}]`).append(chip_html);
            }

            autoList_wrap.hide();
            $(document).off('click', hideifother);
        });

        autoList_wrap.show();
        $(document).on('click', hideifother);
    }
    function hideifother(e) {
        if (!target_parent.find($(e.target)).length) {//.input_box_search 내에 있는 요소를 클릭하면 닫히지 않게 하기 위함        
            autoList_wrap.hide();
            $(document).off('click', hideifother);
        }
    }
    var dummy = {
        storeList: [
            { brand: '빽다방', store: '안산점' },
            { brand: '빽다방', store: '본오점' },
            { brand: '빽다방', store: '동대문역사점' },
            { brand: '빽보이', store: '신도림점' },
            { brand: '빽보이', store: '서울대입구점' },
            { brand: '빽보이', store: '한양대입구점' },
            { brand: '컴포즈', store: '광화문점' },
            { brand: '컴포즈', store: '뱅뱅사거리점' }
        ]
    }
};
/* 사용 예 */
//$('#equipment_store').autoComplete_store();

/* 계정 자동완성 */
$.fn.autoComplete_account = function (multi) {
    var multi = multi || undefined;
    var target_element = this;
    var target_parent = this.parent();
    var target_id = target_element.prop('id');
    var autoList_wrap = $(`.autoList_wrap[data-autolist="${target_id}"]`);
    target_element.on('keyup click', function (e) {
        var target_find = target_element.val();
        /* var url = "/fms/board/getUserAutoComplete";
        var param = {};
        param.target_find = target_find;
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(param),
            contentType: 'application/json',
            success: function (data) {
                //console.log(JSON.stringify(data));
                makeAutoList(data);
            },
            error: function (data) {
                alert("Fail!!!!");
            }
        }); */
        var data = dummy;
        makeAutoList(data);
    });
    function makeAutoList(data) {
        var list = data.accountList;
        var listTemplate = "";
        list.forEach(function (item) {
            var account = item.account || '';
            var id = item.id || '';
            var template = `
                                <li>
                                    <button type="button" class="btn" data-account="${item.account}">
                                        <span class="d-inline-block ">${account} (${id})</span>
                                    </button>
                                </li>`;
            listTemplate += template;
        });
        autoList_wrap.find('.autoList').html(listTemplate);
        autoList_wrap.find('.autoList button').on('click', function (e) {
            var value = $(e.currentTarget).data('account');
            target_element.val(value);

            if (target_parent.find('.btn_input_reset')) {
                target_parent.find('.btn_input_reset').show();
            }

            if (multi) {
                var chip_html = `
                        <li>
                            <div class="option_chip">
                                <span class="txt">${value}</span>
                                <button class="btn btn_chip ml-5">
                                    <span class="material-symbols-outlined">close_small</span>
                                </button>
                            </div>
                        </li>
                `;
                $(`.select_add_list[data-result=${target_id}]`).append(chip_html);
            }

            autoList_wrap.hide();
            $(document).off('click', hideifother);
        });

        autoList_wrap.show();
        $(document).on('click', hideifother);
    }
    function hideifother(e) {
        if (!target_parent.find($(e.target)).length) {//.input_box_search 내에 있는 요소를 클릭하면 닫히지 않게 하기 위함        
            autoList_wrap.hide();
            $(document).off('click', hideifother);
        }
    }
    var dummy = {
        accountList: [
            { id: '01024245566', account: '김유신' },
            { id: '01024245566', account: '강감찬' },
            { id: '01024245566', account: '이순신' },
            { id: '01033339999', account: '최재필' },
            { id: '01033339999', account: '이성계' },
            { id: '01033339999', account: '정도전' },
            { id: '01077778888', account: '이방원' },
            { id: '01077778888', account: '김구' }
        ]
    }
};
/* 사용 예 */
//$('#account_name').autoComplete_account();  

/* 이미지동영상 파일선택 */
$.fn.file = function (option) {
    var _this = this;
    var option = option || undefined;
    var container = undefined;
    var target_container = undefined;
    var file = undefined;
    var reader = undefined;
    var btn_init_file = undefined;
    var file_type = 'image';
    var the_url = undefined;

    if (option) {
        container = option.container;
        target_container = $(`${container}`);
    } else {
        return;
    }

    _this.change(function () {
        file = this.files[0];
        reader = new FileReader();
        btn_init_file = `
            <button class="btn btn_init_file">
                <span class="material-symbols-outlined">close</span>
            </button>
        `;

        reader.onload = function (event) {
            the_url = event.target.result;
            file_type = file.type.split('/')[0];
            if (file_type === 'video') {
                target_container.append(`
                    <video class="video" preload="metadata" src="${the_url}#t=0.1"></video>
                    `);
            } else {
                target_container.append(`<img class='img' alt='' src='${the_url}' />`);
            }

            target_container.append(btn_init_file);
            //console.log(file.name);
            //console.log(file.size);

            /* 이미지동영상 파일취소 */
            target_container.find('.btn_init_file').on('click', function (event) {
                $(event.currentTarget).remove();
                if (file_type === 'video') {
                    target_container.find('.video').remove();
                } else {
                    target_container.find('.img').remove();
                }

                _this.val("");
            });
        }
        //when the file is read it triggers the onload event above.
        reader.readAsDataURL(file);
    });
}
/* 사용 예
$("#playlist_file").file({container:'.thumbnail_add_playlist'}); */

/* 파일 여러개 선택 */
$.fn.multi_file = function (option) {
    var _this = this;
    var option = option || undefined;
    var container = undefined;
    var file = undefined;
    var reader = undefined;
    var the_url = undefined;



    if (option) {
        container = $(`${option.container}`);
    } else {
        return;
    }

    _this.change(function () {
        file = this.files[0];
        console.log("---change");
        console.log(this.files);
        reader = new FileReader();
        reader.onload = function (event) {
            the_url = event.target.result;
            container.append(`
                <div class="thumbnail_multi_file">
                    <img class='img' alt='' src='${the_url}' />
                    <button class="btn btn_init_file">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                `);

            //console.log(file.name);
            //console.log(file.size);

            /* 이미지 파일취소 */
            container.find('.btn_init_file').on('click', function (event) {
                $(event.currentTarget).parent().remove();
                console.log(_this.val());
                //_this.val("");
            });
            _this.val("");
        }
        //when the file is read it triggers the onload event above.
        reader.readAsDataURL(file);
    });
}
/* 사용 예
$("#playlist_file").file({container:'.thumbnail_add_playlist'}); */


/* 이미지확대팝업 */
$.img_modal = function (showhide, element) {
    var src = undefined;
    var target_html = '';
    var target_element = $('.imgModalContainer');
    var backdrop_length = 0;
    if (element) {
        src = $(element).prev().attr('src');
        target_html = `
            <div class="imgModalContainer">
                <div class="imgModal">                    
                    <div class="img_wrap">
                        <img src="${src}" alt="" class="img">
                    </div>
                    <button class="btn btn_close_imgModal" onclick="$.img_modal('hide');">
                        <span class="material-symbols-outlined">
                            close
                        </span>
                    </button>
                </div>
            </div>
        `;
        target_element = $(target_html);
    }

    if (showhide === 'show') {
        $('body').css('overflow', 'hidden');
        $('body').append(`<div class="backdrop img_modal"></div>`);
        backdrop_length = $('body').children('.backdrop').length;
        $(`.backdrop.img_modal`).css('z-index', (backdrop_length - 1) * 2 + 1000);
        setTimeout(() => {
            $(`.backdrop.img_modal`).addClass('show');
        }, 10);
        target_element.css('z-index', (backdrop_length - 1) * 2 + 1000 + 1);
        target_element.addClass('show');
        $('body').append(target_element);
        $(`.backdrop.img_modal`).on('click', hide_modal);
    } else {
        hide_modal();
    }

    function hide_modal() {
        //$.modal('hide');
        if ($('body .backdrop').length <= 1) {
            /* backdrop이 두 개 이상 이라는 것은 이미 다른 팝업이 열려 있다는 것이기 때문에 해당 팝업을 닫아도 overflow는 hidden으로 유지 하기 위해 
            backdrop이 하나일 때만 body의 overflow를 auto로 되돌림 */
            $('body').css('overflow', 'auto');
        }
        target_element.remove();
        $(`.backdrop.img_modal.show`).removeClass('show');
        $(`.backdrop.img_modal`).off('click', hide_modal);
        $(`.backdrop.img_modal`).remove();
    }
};
/* 사용 예 */
/* 
<button class="btn btn_expand" onclick="$.img_modal('show', this);">
    <span class="material-symbols-outlined">fullscreen</span>
</button>
*/