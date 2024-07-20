function makeParam(targetStr, param_more) {
    let target = document.querySelector(targetStr);
    let que = {};
    if (param_more) Object.assign(que, param_more);
    //선택 되어야 할 자식 노드들, 추가가 필요한 Node의 selector 추가 사용
    let childrenEls = target.querySelectorAll("input[type=text], select, input[type=hidden], textarea");
    //각 노드를 돌면서 name이 있는 경우에만 que에 push
    childrenEls.forEach(function (item, currentIndex, listObj) {
        if (item.name == '') {
            return;
        }
        if (item.value == '') {
            return;
        }
        if (item.name == 'startDate') {
            que[item.name] = item.value + " 00:00:00";
        } else if (item.name == 'endDate') {
            que[item.name] = item.value + " 23:59:59";
        } else {
            que[item.name] = item.value;
        }
    });
    //parameter string 변환 $(form).serialize()
    // var param = que.join('&'); 
    let param = JSON.stringify(que);
    return param;
}
function modalRequestForm(target, success, fail, param_more) {
    let el = $(target);
    let param = makeParam(target, param_more);
    let url = el.data("url");
    let method = el.data("method");
    let type = el.data("type");
    ajax(url, method, type, param, success, fail);
}

function initModalForm(targetStr) { // 등록 수정 창 초기화
    let target = document.querySelector(targetStr);
    let childrenEls = target.querySelectorAll("input[type=text], select, input[type=hidden]");
    childrenEls.forEach(function (item, currentIndex, listObj) {
        if (item.name == '') {
            return;
        }
        if (item.disabled) {
            return;
        }

        if (item.tagName == 'SELECT') {
            var item_name = item.name;
            $(targetStr + ' [name=' + item_name + ']').val("").select2({
                width: 200,
                minimumResultsForSearch: Infinity
            });

            $(item).next('.select2-container').find('.select2-selection').removeClass('miss_required');
        } else {
            item.value = '';

            $(item).removeClass('miss_required');
        }
    });
}

function fillEditForm(target) { //수정 팝업에 데이터 채우기
    let el = $(target);
    let json = el.data("json");
    for (let key in json) {
        let value = json[key];
        let formEl = el.find("." + key);
        let elType = formEl.prop('tagName');
        if (elType == "INPUT") {
            formEl.val(value);
        } else if (elType == "SELECT") {
            formEl.val(value).prop("selected", true);
        }
    }
}
function ajax(url, method, type, data, success, fail) {
    if (!url) return;
    $.ajax({
        url: url,
        type: (method ? method : "POST"),
        dataType: type ? type : "json",
        data: (data ? data : ""),
        contentType: 'application/json',
        success: function (data) {
            if (typeof success == "function") {
                success(data);
            }
        },
        error: function (data) {
            //에러 처리
            //log(data);
            if (typeof fail == "function") {
                fail(data);
            }
        }
    });
}

function initDateFilter(startDateEl, endDateEl) {
    var today = new Date();
    var endDate = formatLongToDateString(today, "yyyy-mm-dd");
    $((startDateEl ? startDateEl : ".start_date")).val(formatLongToDateString(today.setDate(today.getDate() - 6), "yyyy-mm-dd"));
    $((endDateEl ? endDateEl : ".end_date")).val(endDate);
}

function checkRequired(targetStr) { // 등록, 수정 시 필수 항목 체크
    let noticeStr = "";
    let target = document.querySelector(targetStr);
    let que = [];
    let childrenEls = target.querySelectorAll("input[type=text], select, input[type=hidden], textarea");

    childrenEls.forEach(function (item, currentIndex, listObj) {
        if (item.required && !item.value) {
            if (item.tagName == 'SELECT') {
                que.push($(item).find('option:first').text());

                $(item).next('.select2-container').find('.select2-selection').addClass('miss_required');
            } else {
                que.push(item.placeholder);

                $(item).addClass('miss_required');
            }
        }
    });
    if (que.length) {
        noticeStr = '<span class="warn">' + que.join(', ') + '</span>이(가) 누락되었습니다.<br>해당 항목을 입력하세요.';
    }
    return noticeStr;
}