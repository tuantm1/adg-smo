MetronicApp.controller('PriceCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope','$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http ) {
            $scope.prices = [];
            $scope.users = [];
            $scope.npp = [];
            $scope.id_npp = '';
             ApiQuery.post('/GET_USER',{ID_USER: $rootScope.userData.id_user}).then(function (res) {
                $scope.users = res.data.GT_USER;
                $scope.users.forEach(function (user) {
                    if (user.US_TYPE === 'S'){
                        $scope.npp.push(user);
                    }
                });
            });
            $scope.load = function (id_npp) {
                $scope.prices = [];
                 ApiQuery.post("/GET_PRICE_LIST",{ID_NPP: id_npp, EFFECTIVE_DATE: $scope.theDate}).then(function (res) {
                    if (res.data.RETURN.TYPE === "S"){
                        $scope.prices = res.data.GT_PRICE;
                    }
                    else {
                         ApiQuery.post('/GET_MARA',{ID_USER: $rootScope.userData.id_user}).then(function (res) {
                            $scope.prices = [];
                            res.data.MARAS.forEach(function (mara) {
                                $scope.mara = {
                                    ID_USER: id_npp,
                                    ID_ITEM: mara.MATNR,
                                    NAME_ITEM: mara.MAKTG,
                                    UNIT: mara.MEINS,
                                    EFFECTIVE_DATE: $scope.theDate,
                                    PRICE: 0
                                };
                                $scope.prices.push($scope.mara);
                            })
                        });
                    }
                });
            };
            $scope.save = function () {

                bootbox.confirm({
                    title: "Cập nhật bảng giá",
                    message: "Bảng giá sẽ được cập nhật từ ngày "  + $scope.theDate,
                    buttons: {
                        confirm: {
                            label: 'Yes',
                            className: 'btn-success'
                        },
                        cancel: {
                            label: 'No',
                            className: 'btn-danger'
                        }
                    },
                    callback: function (result) {
                        if (result === true){
                            $scope.prices.forEach(function (value) {
                                value.EFFECTIVE_DATE = $scope.theDate
                            });
                            ApiQuery.post("/CREATE_PRICE",{PRICES: $scope.prices}).then(function (res) {
                                if (res.data.RETURN.TYPE === 'S') {
                                    $state.reload();
                                }
                            });
                        }
                    }
                });

            }

        }]);