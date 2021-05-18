MetronicApp.controller('ApproveOrderCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http', '$timeout',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http, $timeout) {
            $scope.listRejectReason = [
                {text: 'Không đạt điều kiện tín dụng'},
                {text: 'Vượt kế hoạch'},
                {text: 'Sản phẩm không thuộc danh mục được vận chuyển'}
            ];
            $rootScope.listOrder = [];
            ApiQuery.post("/get_order", {id_user: $rootScope.userData.id_user}).then(function (res) {
                res.data.RES.forEach(function (val) {
                    if (val.STATUS === 'P'){
                        if (val.ITEMS.length !== 0) {
                            val.itemText = "";
                            val.ITEMS.forEach(function (value) {
                                // value.QUANTITY = value.QUANTITY.replace(/^0*/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                                val.itemText += value.NAME
                            });

                        }
                        $rootScope.listOrder.push(val);
                    }


                });
            });
            if ($rootScope.userData.us_type === 'P') {
                ApiQuery.post("/get_order", {id_user: $rootScope.userData.id_peer}).then(function (res) {
                    res.data.RES.forEach(function (val) {
                        $rootScope.listOrder.push(val);
                    });
                });
            }
            $scope.approve = function (id_order) {
                ApiQuery.post("/approve_order", {
                    ID_USER: $rootScope.userData.id_user,
                    ID_ORDER: id_order
                }).then(function (res) {
                    $state.reload();
                })
            };
            $scope.id_order = "";
            $scope.reason = "";
            $scope.rejectReason = function (id_order) {
                $scope.id_order = id_order;
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
                            // });
                            if ($rootScope.userData.us_type === 'P') {
                            }
                            bootbox.alert({
                                message: "Đơn hàng bị từ chối!!!",
                                callback: function () {
                                    $state.reload();
                                    $('#myModal2').modal('hide');
                                }
                            })

                        }
                    });
                }
            };
            $scope.reasonReject = function (idOrder) {
                ApiQuery.post("/GET_DETAIL_ORDER", {ID_ORDER: idOrder}).then(function (res) {
                    bootbox.alert({
                        message: res.data.RESPONSE.NOTE,
                        callback: function () {
                            $state.reload();
                            $('#myModal2').modal('hide');
                        }
                    })
                });
            }

        }]);