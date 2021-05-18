MetronicApp.controller('CustomerCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {
            // ApiQuery.post('/GET_CUSTOMER', {id_user: $rootScope.userData.id_user, _SHOW_PAGING: $scope._show_paging , _PAGING_NUMBER:  $scope._page_number}).then(function (res) {
            //     $scope.listCustomer = res.data.CUSTOMERS;
            // });
            ApiQuery.post('/GET_CUSTOMER', {id_user: $rootScope.userData.id_user}).then(function (res) {
                $scope.listCustomer = res.data.CUSTOMERS;
            });
        }]);

MetronicApp.controller('CustomerDetailCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {
    $scope.submit = function(){
        var btn = $(this);
        btn.button('loading')

    };
    $scope.loading2 = false;
            $scope.Save2 = function () {
                console.log("1");
                $scope.loading2 = true;
                ApiQuery.post("/get_order", {id_user: '0000000031'}).then(function (res) {
                    $state.reload();
                });
                // setTimeout(function () {
                //     $scope.loading2 = false;
                // $state.reload();
                // }, 3000);

            };
            ApiQuery.post('/GET_DETAIL_CUSTOMER', {KUNNR: $stateParams.kunnr}).then(function (res) {
                res.data.CUSTOMER.CZREDIT.forEach(function (value) {
                    value.VALUE = Math.round(value.VALUE);
                    value.VALUE1 = Math.round(value.VALUE1);
                });
                $scope.customer = res.data.CUSTOMER;
            });
        }]);
MetronicApp.controller('CusDetailBillsCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery) {
            $scope.bills = '';
            ApiQuery.post('/bill/customer/' + $stateParams.idcus + '.json', []).then(function (res) {
                $scope.bills = res.data;
                $scope.totalPrices = 0;
                $scope.img = new Image();
                $scope.img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADIAQAAAACFI5MzAAABZ0lEQVR42u2XQYqFMBBES1xkmSN4E3Mx4QteTG+SI7jMQtLT3fkM/vkzyymZwYBC8lwU6aqkhfw0cJOb/AGSAfRSRn0BcdZZZBN9llySzEOocRGpdFLQ5jPKGJeM8RKic0yu7SoiwbcI1xCvT1jjMRh+qxyBmEezl0Zfb+4lkGcuO5O1fZPg3yfZ0xm2fUKoZpONTaRA5747surehM/6sEh2X5Rk2kTcJmTyHKrIHKIf1kgmmk4bIx6ii8dQOiETG8fgYZX1LSUUgm7vTeAEUY/iVB8Syc2jnWmrrx4lEU1Jy6lVyeozsklGMqydQ9Z9Um0rnWhEe9M4wy7vc4JZRNa2J0troU7nKIuYNj0fWliBktjEh17ee9/OKnRs0u7tYIeE9y4n1Swi0q7sxfIi+eRRFnFFSg60IuEaoosPx8NXbSyCpIeE315ySgmJtB62egPz2lexiHtUu/e5LSKxyf33fpP/Rj4AVGw6pEgqNzAAAAAASUVORK5CYII="
                document.getElementById("test").innerHTML = $scope.img.src
                $scope.bills.forEach(function (b) {
                    $scope.totalPrices += b.totalPrice;
                })
            })
        }]);