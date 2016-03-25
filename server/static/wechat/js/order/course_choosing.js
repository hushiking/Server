/**
 * Created by liumengjun on 3/5/16.
 */
$(function(){
    //alert("course choosing");
    var teacherId = $('#teacherId').val();
    var chosen_grade_id = '';
    var chosen_price = 0;
    var chosen_school_id = '';
    var weekly_time_slot_ids = [];
    var chosen_coupon_id = '';
    var chosen_coupon_amount = 0;
    var chosen_coupon_min_count = 0;
    var MAX_PREVIEW_HOURS = 100;

    var $payArea = $('#payArea');
    var $alertDialog = $('#alertDialog');
    var $alertDialogBody = $("#alertDialogBody");
    var showAlertDialog = function(msg) {
        $alertDialogBody.html(msg);
        $payArea.hide();
        $alertDialog.show();
        $alertDialog.one('click', function () {
            $alertDialog.hide();
            $payArea.show();
        });
    };

    var _contains = function(list, v) {
        for (var i in list) {
            if (list[i]==v) return true;
        }
        return false;
    };

    var hideOtherSchools = function($school) {
        var $schools = $('.school');
        if ($schools.length==1) {
            return;
        }
        $schools.each(function(){
            var $this = $(this);
            if (this != $school[0]) {
                $this.hide();
            }
        });
        $schools.last().removeClass('last');
        $('#showMoreSchoolsBtn').show();
    };

    var sortSchools = function(list) {
        var far_map = {};
        for (var i in list) {
            var o = list[i];
            far_map[o.id] = o.far;
        }
        var $schools = $('.school');
        var new_list = [];
        var $chosenone = null;
        $schools.each(function(){
            var $this = $(this), scid = $this.attr('scid');
            if (scid==chosen_school_id) {
                $chosenone = $this;
            }
            var far = far_map[scid];
            if (far=='') {
                $this.find('.distance').html('...');
            } else {
                var ifar = parseInt(far);
                if (ifar < 1000) {
                    $this.find('.distance').html("<span>&lt;</span>"+ifar+"m");
                } else {
                    $this.find('.distance').html("<span>&lt;</span>"+parseInt(ifar/100)/10+"km");
                }
            }
            new_list.push({'far': far, 'sc': $this});
        });
        new_list.sort(function(a,b) {
            if (a.far=='') return 1;
            if (b.far=='') return -1;
            return a.far - b.far;
        });
        if ($chosenone == null) {
            $chosenone = new_list[0].sc;
        }
        var scs = [];
        for (var i in new_list) {
            scs.push(new_list[i].sc[0]);
        }
        var $schoolsCon = $('#schoolsContainer');
        $schools.remove();
        $schoolsCon.prepend(scs);
        $chosenone.show();
        hideOtherSchools($chosenone);
    };

    //$(document).on('ajaxError', function(e, xhr, options){
    //    showAlertDialog('请求失败, 请重试');
    //});
    wx.ready(function(res){
        wx.getLocation({
            type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
            success: function(res){
                var reqparams = {'action': 'schools_dist', 'lat': res.latitude, 'lng': res.longitude};
                $.post(location.href, reqparams, function(result){
                    if (result && result.ok) {
                        sortSchools(result.list);
                    }
                }, 'json')
            },
            fail: function(res){
            }
        });
    });

    $('.grade-box > .grade').click(function(e){
        var ele = e.target, $ele = $(ele);
        var val = $ele.data('gradeid');
        $(".grade-box > .grade").each(function(){
          var $this = $(this), v = $this.data('gradeid');
          if (v===val) {
            $this.addClass('chosen');
          } else {
            $this.removeClass('chosen');
          }
        });
        chosen_grade_id = val;
        chosen_price = parseInt($(ele).find('input').val());
        sessionStorage.chosen_grade_id = chosen_grade_id;
        updateCost();
        e.stopPropagation();
    });

    $('#showMoreSchoolsBtn').click(function(e){
        $(this).hide();
        var $schools = $('.school');
        $schools.show();
        $schools.last().addClass('last');
    });

    var previewCourseTimeUrl = '/api/v1/concrete/timeslots';
    var $courseTimePreviewPanel = $('#courseTimePreviewPanel');
    var $courseTimePreview = $("#courseTimePreview");
    var __showCourseTime = function(courseTimes){
        for (var i in courseTimes) {
            var obj = courseTimes[i], start = new Date(obj[0]*1000), end = new Date(obj[1]*1000);
            var m = start.getMonth()+ 1, d = start.getDate(),
                sh = start.getHours(), sm = start.getMinutes(), eh = end.getHours(), em = end.getMinutes();
            $courseTimePreview.append('<div>'
                +start.getFullYear()+'/'+(m<10?('0'+m):m)+'/'+(d<10?('0'+d):d)
                +' ('+(sh<10?('0'+sh):sh)+':'+(sm<10?('0'+sm):sm)+'-'+(eh<10?('0'+eh):eh)+':'+(em<10?('0'+em):em)+')'
                +'</div>'
            );
        }
    };
    var _updateCourseTimePreview = function(hours) {
        if (hours==0 || weekly_time_slot_ids.length==0) {
            return $("#courseTimePreview").html('');
        }
        if ($courseTimePreviewPanel.hasClass('closed')) {
            return;
        }
        $courseTimePreview.html('');
        var preview_hours = hours > 100 ? MAX_PREVIEW_HOURS : hours;
        $.getJSON(previewCourseTimeUrl, {'hours':preview_hours, 'weekly_time_slots':weekly_time_slot_ids.join(' '), 'teacher': teacherId}, function(json){
            if (json && json.data) {
                __showCourseTime(json.data);
            }
        });
    };

    var updateCourseTimePreview = function() {
        var $chosenTimeSlot = $('#weeklyTable > tbody > tr > td.available.chosen');
        weekly_time_slot_ids.length=0;
        $chosenTimeSlot.each(function(i, ele){
            var $td = $(ele), tsid = $td.attr('tsid');
            weekly_time_slot_ids.push(tsid);
        });
        var hours = parseInt($('#courseHours').text());
        if (weekly_time_slot_ids.length==0) {
            hours = 0;
        } else {
            hours = Math.max(weekly_time_slot_ids.length * 2, hours);
        }
        $('#courseHours').html(hours);
        sessionStorage.weekly_time_slot_ids = weekly_time_slot_ids.join('+');
        sessionStorage.hours = hours;
        _updateCourseTimePreview(hours);
        updateCost();
    };

    var _makeWeeklyTimeSlotToMap = function(json) {
        var _map = {};
        for (var d in json) {
            var timeslots = json[d];
            for (var i in timeslots) {
                var timeslot = timeslots[i];
                var key = timeslot.start+'_'+timeslot.end+'_'+d;
                _map[key]= timeslot;
            }
        }
        return _map;
    };

    var $weeklyTable = $('#weeklyTable');
    var renderWeeklyTableBySchool = function(school_id, chosen_time_slot_ids) {
        $weeklyTable.find('tbody > tr').each(function(){
            $(this).find('td').each(function(i) {
                if (i == 0) return;
                $(this).removeClass('available').addClass('unavailable');
            });
        });
        var params = {'school_id': school_id};
        $.getJSON('/api/v1/teachers/'+teacherId+'/weeklytimeslots', params, function(json){
            var _map = _makeWeeklyTimeSlotToMap(json);
            $weeklyTable.find('tbody > tr').each(function(r){
                var $row = $(this);
                var timespan = $row.attr('start')+'_'+$row.attr('end');
                $row.find('td').each(function(i, ele){
                    if (i==0) {
                        return;
                    }
                    var key = timespan+'_'+ i, ts = _map[key];
                    var $td = $(ele);
                    if (ts && ts.available) {
                        $td.attr('tsid', ts.id);
                        $td.removeClass('unavailable').addClass('available');
                        if (chosen_time_slot_ids && _contains(chosen_time_slot_ids, ts.id)) {
                            $td.addClass('chosen');
                        }
                    } else {
                        $td.removeClass('available').addClass('unavailable');
                    }
                });
            });
            updateCourseTimePreview();
        });
    };

    $(".school").click(function(e){
        if (!chosen_grade_id) {
            showAlertDialog('请先选择授课年级');
            return;
        }
        var ele = e.target, $school = $(ele).closest('.school');
        var val = $school.attr('scid');
        $(".school").each(function(){
          var $this = $(this), v = $this.attr('scid');
          if (v===val) {
            $this.addClass('chosen');
          } else {
            $this.removeClass('chosen');
          }
        });
        chosen_school_id = val;
        sessionStorage.chosen_school_id = chosen_school_id;
        renderWeeklyTableBySchool(val);
        hideOtherSchools($school);
        e.stopPropagation();
    });

    var _format_money = function(num, isYuan) {
        if (isYuan) {
            num = num * 100;
        }
        // 直接抹零, 但是toFixed 默认是四舍五入
        return (parseInt(num)/100).toFixed(2);
    };

    var updateCost = function() {
        var hours = parseInt($('#courseHours').text());
        var origTotalCost = hours * chosen_price; // 单位是分
        // 检查奖学金
        if (hours==0) {
            $('#discountCost').html('0');
        } else {
            var $coupon = null;
            if (chosen_coupon_id) {
                var min_count = parseInt(chosen_coupon_min_count);
                if (hours < min_count) {
                    chosen_coupon_id = '';
                    sessionStorage.chosen_coupon_id = chosen_coupon_id;
                    $('#discountCost').html('0');
                }
            }
            if (chosen_coupon_id) { // get discount
                $('#discountCost').html(chosen_coupon_amount);
            } else {
                $('#discountCost').html('0');
            }
        }
        var discount = parseFloat($('#discountCost').text()); // 单位是元
        var realCost = origTotalCost - discount * 100;
        if (origTotalCost>0) {
            realCost = Math.max(realCost, 1); // 暂时不支持免费订单, 最少1分
        }
        $("#origTotalCost").text(_format_money(origTotalCost));
        $("#realCost").text(_format_money(realCost));
    };

    $weeklyTable.find('tbody > tr > td').click(function(e) {
        if (!chosen_grade_id || !chosen_school_id) {
            showAlertDialog('请先选择授课年级和上课地点');
            return;
        }
        var $this = $(this);
        if ($this.hasClass('available')) {
            $this.toggleClass('chosen');
            updateCourseTimePreview();
        }
    });

    $courseTimePreviewPanel.click(function(){
        var $panel = $(this);
        $panel.toggleClass('closed');
        if ($panel.hasClass('closed')) {
            $('#courseTimePreview').hide();
        } else {
            $('#courseTimePreview').show();
            _updateCourseTimePreview(parseInt($('#courseHours').text()));
        }
    });

    $('#decHoursBtn').click(function(e){
        var hours = parseInt($('#courseHours').text());
        if (hours <= weekly_time_slot_ids.length * 2) {
            return;
        }
        hours -= 2;
        $('#courseHours').html(hours);
        sessionStorage.hours = hours;
        _updateCourseTimePreview(hours);
        updateCost();
    });
    $('#incHoursBtn').click(function(e){
        if (weekly_time_slot_ids.length==0) {
            showAlertDialog('请先选择上课时间');
            return;
        }
        var hours = parseInt($('#courseHours').text());
        hours += 2;
        $('#courseHours').html(hours);
        sessionStorage.hours = hours;
        _updateCourseTimePreview(hours);
        updateCost();
    });

    // 去奖学金页面
    $('#couponRow').click(function(){
        location.href = coupon_list_page;
    });

    // 去测评建档服务页面
    $('#evaluateRow').click(function(e){
        location.href = evaluate_list_page;
    });

    $('#confirmBtn').click(function(e){
        var hours = parseInt($('#courseHours').text());
        if (hours <= 0) {
            showAlertDialog('请先选择上课时间');
            return;
        }
        var params = {
            'action': 'confirm',
            'teacher': teacherId,
            'school': chosen_school_id,
            'grade': chosen_grade_id,
            'coupon': chosen_coupon_id,
            'hours': hours,
            'weekly_time_slots': weekly_time_slot_ids.join('+')
        };
        var defaultErrMsg = '请求失败, 请稍后重试或联系客户人员!';
        $.post(location.pathname, params, function (result) {
            if (result) {
                if (result.ok) {
                    var data = result.data, prepay_id = data.prepay_id, order_id = data.order_id;
                    wx.chooseWXPay({
                        timestamp: data.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                        nonceStr: data.nonceStr, // 支付签名随机串，不长于 32 位
                        package: data.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                        signType: data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                        paySign: data.paySign, // 支付签名
                        success: function (res) {
                            var verify_params = {
                                'action': 'verify',
                                'prepay_id': prepay_id,
                                'order_id': order_id
                            };
                            $.post(location.pathname, verify_params, function(verify_ret){
                                if (verify_ret) {
                                    if (verify_ret.ok) {
                                        //showAlertDialog('支付成功');
                                        wx.closeWindow();
                                        return;
                                    } else {
                                        showAlertDialog(result.msg);
                                    }
                                } else {
                                    showAlertDialog(defaultErrMsg);
                                }
                            });
                        },
                        fail: function(res){
                        }
                    });
                } else {
                    showAlertDialog(result.msg);
                }
            } else {
                showAlertDialog(defaultErrMsg);
            }
        }, 'json');
    });

    // 从sessionStorage恢复数据
    (function(){
        if (sessionStorage.hours) {
            $('#courseHours').html(sessionStorage.hours);
        }
        if (sessionStorage.chosen_coupon_id) {
            chosen_coupon_id = sessionStorage.chosen_coupon_id;
            chosen_coupon_min_count = sessionStorage.chosen_coupon_min_count;
            chosen_coupon_amount = sessionStorage.chosen_coupon_amount;
        }
        if (sessionStorage.weekly_time_slot_ids) {
            weekly_time_slot_ids = sessionStorage.weekly_time_slot_ids.split('+');
        }
        if (sessionStorage.chosen_grade_id) {
            chosen_grade_id = sessionStorage.chosen_grade_id;
            $('.grade').each(function(){
                var $this = $(this), v = $this.data('gradeid');
                if (v==chosen_grade_id) {
                    chosen_price = parseInt($this.find('input').val());
                    $this.addClass('chosen');
                    return false;
                }
            });
        }
        if (sessionStorage.chosen_school_id) {
            chosen_school_id = sessionStorage.chosen_school_id;
            var $chosenone = null;
            $('.school').each(function(){
                var $this = $(this), scid = $this.attr('scid');
                if (scid==chosen_school_id) {
                    $chosenone = $this;
                    return false;
                }
            });
            if ($chosenone) {
                $chosenone.addClass('chosen');
                $chosenone.show();
                hideOtherSchools($chosenone);
                renderWeeklyTableBySchool(chosen_school_id, weekly_time_slot_ids);
            }
        }
        updateCost();
    })();
});
