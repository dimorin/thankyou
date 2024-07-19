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