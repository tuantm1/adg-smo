MetronicApp.controller('SaleOutCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {
             ApiQuery.post("/GET_SHIPTO", {ID_USER: $rootScope.userData.id_user}).then(function (res) {
                $scope.shipTOs = res.data.GT_SHIPTO;
            });
            $scope.defaultDate = new Date();
            $scope.theDate = ($scope.defaultDate.getMonth() + 1) + '/' + $scope.defaultDate.getDate() + '/' + $scope.defaultDate.getFullYear();
             ApiQuery.post("/GET_PRICE_LIST", {
                ID_NPP: '0000000027',
                EFFECTIVE_DATE: $scope.theDate
            }).then(function (res) {
                if (res.data.RETURN.TYPE === "S") {
                    $scope.prices = res.data.GT_PRICE;
                }
            });
            $scope.saleout = {
                id_shipto: '',
                zdate: $scope.theDate,
                note: '',
                items: []
            };

            $scope.prices = [];
            $scope.users = [];
            $scope.npp = [];
            $scope.id_npp = '';
            $scope.items = [{
                id_mara: 0,
                quantity: 0,
                price: 0,
                amount: 0
            }];
            $scope.amount = function (index, quantity, price) {
                $scope.items[index].amount = quantity * price;
            };
            $scope.loadPrice = function (index, id_mara) {
                $scope.prices.forEach(function (value) {
                    if (value.ID_ITEM === id_mara) {
                        $scope.items[index].price = value.PRICE;
                    }
                });

            };
            $scope.add = function () {
                $scope.items.push({
                    id_mara: 0,
                    quantity: 0,
                    price: 10,
                    amount: 0
                })
            };


            $scope.save = function () {
                $scope.saleout.items = $scope.items;
                 ApiQuery.post("/CREATE_SALEOUT", {
                    SALEOUT: $scope.saleout,
                    ID_USER: $rootScope.userData.id_user
                }).then(function (res) {
                    if (res.data.RETURN.TYPE === "S") {
                    }
                })
            }

        }]);