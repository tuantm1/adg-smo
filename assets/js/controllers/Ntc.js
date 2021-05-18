MetronicApp.controller('NtcCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {
            $scope.lstGuarantee = [];
            $scope.customerName = '';
            ApiQuery.post('/get_order_ntc', {
                ID_USER: $rootScope.userData.id_user
            }).then(function (res) {
                $scope.listOrder = res.data.RES;
            });

            $scope.approve = function (id_order) {
                ApiQuery.post("/approve_order", {
                    ID_USER: $rootScope.userData.id_user,
                    ID_ORDER: id_order
                }).then(function (res) {
                    $state.reload();
                })
            };
            
            $scope.rejectReason = function (id_order) {
                $scope.rejectReason = "Lý do từ chối: Hủy đơn hàng NTC";
                ApiQuery.post("/REJECT_ORDER", {
                    ID_USER: $rootScope.userData.id_user,
                    ID_ORDER: id_order,
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


        }]);
