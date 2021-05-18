var getNoti = function (noti, ApiQuery, id_user) {
    // ApiQuery.post('/NOTIFICATION', {ID_USER: id_user}).then(function (res) {
    //     noti = res.data.GT_NOTI;
    // });
};

function chart1(ApiQuery, $rootScope, $scope) {
    // ApiQuery.post("/dashboard_1", {id_user: $rootScope.userData.id_user}).then(function (res) {
    //     $scope.visitors = [];
    //
    //     res.data.GT_CHART01.forEach(function (value) {
    //         $scope.visitors_point = [value.ZDATE, parseInt(value.QUANTITY)];
    //         $scope.visitors.push($scope.visitors_point);
    //
    //
    //         // $scope.visitors_point = [value.DATE, parseInt(value.QUANTITY)];
    //         // $scope.visitors.push($scope.visitors_point);
    //     });
    //     ChartsFlotcharts.initBarCharts();
    //
    //
    //     function showChartTooltip(x, y, xValue, yValue) {
    //         $('<div id="tooltip" class="chart-tooltip">' + yValue + '<\/div>').css({
    //             position: 'absolute',
    //             display: 'none',
    //             top: y - 40,
    //             left: x - 40,
    //             border: '0px solid #ccc',
    //             padding: '2px 6px',
    //             'background-color': '#fff'
    //         }).appendTo("body").fadeIn(200);
    //     }
    //
    //     $("#site_statistics").bind("plothover", function (event, pos, item) {
    //         $("#x").text(pos.x.toFixed(2));
    //         $("#y").text(pos.y.toFixed(2));
    //         if (item) {
    //             if (previousPoint != item.dataIndex) {
    //                 previousPoint = item.dataIndex;
    //
    //                 $("#tooltip").remove();
    //                 var x = item.datapoint[0].toFixed(2),
    //                     y = item.datapoint[1].toFixed(2);
    //                 showChartTooltip(item.pageX, item.pageY, item.datapoint[0], item.datapoint[1].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + ' VND');
    //             }
    //         } else {
    //             $("#tooltip").remove();
    //             previousPoint = null;
    //         }
    //     });
    //     $.plot($("#site_statistics"), [{
    //             data: $scope.visitors,
    //         },
    //             {
    //                 data: $scope.visitors,
    //                 points: {
    //                     show: true,
    //                     fill: true,
    //                     radius: 7,
    //                     fillColor: "#0f5b33",
    //                     lineWidth: 3
    //                 },
    //                 color: '#fff',
    //                 shadowSize: 0
    //             }],
    //
    //         {
    //             xaxis: {
    //                 tickLength: 0,
    //                 tickDecimals: 0,
    //                 mode: "categories",
    //                 min: 0,
    //                 font: {
    //                     lineHeight: 14,
    //                     style: "normal",
    //                     variant: "small-caps",
    //                     color: "#6F7B8A"
    //                 }
    //             },
    //             yaxis: {
    //                 ticks: 5,
    //                 tickDecimals: 0,
    //                 tickFormatter: function (v, axis) {
    //                     return v.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    //                 },
    //                 tickColor: "#eee",
    //                 font: {
    //                     lineHeight: 14,
    //                     style: "normal",
    //                     variant: "small-caps",
    //                     color: "#6F7B8A"
    //                 }
    //             },
    //             grid: {
    //                 hoverable: true,
    //                 clickable: true,
    //                 tickColor: "#eee",
    //                 borderColor: "#eee",
    //                 borderWidth: 2
    //             }
    //         });
    // });
}


angular.module('MetronicApp').controller('DashboardController', function ($rootScope, $scope, ApiQuery, $timeout, $state) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageContentWhite = true;
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;
    $rootScope.noti = [];
    chart1(ApiQuery, $rootScope, $scope);
    // ApiQuery.post('/NOTIFICATION', {ID_USER: $rootScope.userData.id_user}).then(function (res) {
    //     res.data.GT_NOTI.forEach(function (val) {
    //         $rootScope.noti.push(val);
    //     });
    // });
    if ($rootScope.userData.us_type === 'P') {
        // ApiQuery.post('/NOTIFICATION', {ID_USER: $rootScope.userData.id_peer}).then(function (res) {
        //     res.data.GT_NOTI.forEach(function (val) {
        //         $rootScope.noti.push(val);
        //     });
        // });
    }
    ;


    $scope.notificatons = function (index) {
        $rootScope.noti.splice(index, 1);
        $state.go('User.list')
    };

    $rootScope.listOrder = [];
    $scope.orderNumber = 0;
    $scope.pendingNumer = 0;
    $scope.successNumber = 0;
    ApiQuery.post("/get_order", {id_user: $rootScope.userData.id_user}).then(function (res) {
        $scope.orderNumber += res.data.RES.length;
        res.data.RES.forEach(function (value) {
            if (value.ITEMS.length !== 0) {
                value.itemText = "";
                value.ITEMS.forEach(function (val) {
                    // val.QUANTITY = val.QUANTITY.replace(/^0*/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                    // value.QUANTITY = formatNumber(value.QUANTITY);
                    value.itemText += val.NAME
                })
            }
            $rootScope.listOrder.push(value);
            if (value.STATUS === 'P') {
                $scope.pendingNumer++;
            }
            if (value.STATUS === 'S') {
                $scope.successNumber++;
            }
        });
        $timeout(function () {
        }, 500);
    });
    $scope.approve = function (id_order) {
        ApiQuery.post("/APPROVE_ORDER", {
            ID_USER: $rootScope.userData.id_user,
            ID_ORDER: id_order
        }).then(function (res) {
            if (res.data.ZRETURN.length !== 0) {
                $scope.text = '';
                res.data.ZRETURN.forEach(function (value) {
                    if (value.TYPE === 'E') {
                        $scope.text += value.MESSAGE_V1 = '\n';
                    }
                });
                bootbox.alert({
                    message: '<p>' + res.data.ZRETURN[3].MESSAGE + '</p>',
                    callback: function () {
                        $state.reload();
                    }
                })
            }

        })
    };
    $scope.listRejectReason = [
        {text: 'Không đạt điều kiện tín dụng'},
        {text: 'Vượt kế hoạch'},
        {text: 'Sản phẩm không thuộc danh mục được vận chuyển'}
    ];

    $scope.id_order = "";
    $scope.reason = "";
    $scope.rejectReason = function (id_order) {
        $scope.id_order = id_order;
        // $('#myModal').modal('show');
    };
    $scope.reject = function (reason) {
        $('#myModal2').modal('hide');
        if (reason === '') {
            bootbox.alert({
                message: "Chưa có lý do từ chối đơn hàng!!!",
                callback: function () {
                }
            })
        } else {
            $scope.rejectReason = "Lý do từ chối: " + reason;
            ApiQuery.post("/REJECT_ORDER", {
                ID_USER: $rootScope.userData.id_user,
                ID_ORDER: $scope.id_order,
                REJECT_REASON: $scope.rejectReason
            }).then(function (res) {
                if (res.data.RETURN.TYPE === 'S') {
                    // ApiQuery.post('/NOTIFICATION', {ID_USER: $rootScope.userData.id_user}).then(function (res) {
                    //     $rootScope.noti = res.data.GT_NOTI;
                    // });
                    if ($rootScope.userData.us_type === 'P') {
                        // ApiQuery.post('/NOTIFICATION', {ID_USER: $rootScope.userData.id_peer}).then(function (res) {
                        //     res.data.GT_NOTI.forEach(function (val) {
                        //         $rootScope.noti.push(val);
                        //     });
                        //
                        // });
                    }
                    bootbox.alert({
                        message: "Đơn hàng bị từ chối!!!",
                        callback: function () {
                            $state.reload();
                            $('#myModal').modal('hide');
                        }
                    })

                }
            });
        }

    };
    if ($rootScope.userData.us_type === 'P') {
        ApiQuery.post("/get_order", {id_user: $rootScope.userData.id_peer}).then(function (res) {
            $scope.orderNumber += res.data.RES.length;
            res.data.RES.forEach(function (value) {
                if (value.ITEMS.length !== 0) {
                    value.ITEMS.forEach(function (val) {
                        val.QUANTITY = val.QUANTITY.replace(/^0*/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                    })
                }
                $rootScope.listOrder.push(value);
                if (value.STATUS === 'P') {
                    $scope.pendingNumer++;
                }
                if (value.STATUS === 'S') {
                    $scope.successNumber++;
                }
            });
            $timeout(function () {
            }, 500);
        });
    }


});