MetronicApp.controller('InboxListCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {
            ApiQuery.post('/INBOX', {
                // ID_ORDER: val.ID_ORDER,
                ID_USER: $rootScope.userData.id_user
            }).then(function (res) {
                $scope.notis = res.data.GT_NOTI;
            });
        }]);