MetronicApp.controller('OrderTypeListCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $http) {
            ApiQuery.post('/GET_ORDER_TYPE').then(function (res) {
                if (res.data.RETURN.TYPE === "S"){
                    $scope.orderTypes = res.data.GT_ORDER_TYPE;
                }
            })
        }]);