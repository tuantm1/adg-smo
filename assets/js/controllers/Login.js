MetronicApp.controller('LoginCtrl', ['$scope', '$rootScope', 'TokenProvider', '$state', 'jwtHelper', '$http', 'ApiQuery',
    function ($scope, $rootScope, TokenProvider, $state, jwtHelper, $http, ApiQuery, ApiUrl) {
        $rootScope.role = [];
        $scope._rule = {
            username: "required",
            password: "required",

        };
        $scope._msg = {
            username: " ",
            password: " ",
        };

        $scope.loginError = false;
        $scope.getKeys = function ($event) {
            if ($event.keyCode === 13) {
                $scope.doTheLogin();
            }
        };
        $scope.doTheLogin = function () {
            validation_init($scope._rule, $scope._msg);
            if (jQuery(".js-validation-material").valid()) {
                ApiQuery.post('/login', $scope.loginInfo).then(function (res) {
                    if (res.data.RETURN.TYPE === 'S') {
                        $rootScope.userData = {
                            username: $scope.loginInfo.username,
                            id_user: res.data.GS_AUTHEN.ID_USER,
                            id_peer: res.data.GS_AUTHEN.ID_PEER,
                            us_type: res.data.GS_AUTHEN.US_TYPE,
                            name: encodeURIComponent(res.data.GS_AUTHEN.NAME),
                            kunnr: res.data.GS_AUTHEN.KUNNR
                        };
                        $rootScope.header = decodeURIComponent(res.data.GS_AUTHEN.NAME);
                        window.localStorage.setItem('__the_token', JSON.stringify($rootScope.userData));
                        $state.go('dashboard');
                        $rootScope.menu = res.data.GS_AUTHEN.MENU;
                        $rootScope.menu_group = [];
                        $rootScope.action = [];
                        $rootScope.menu.forEach(function (value) {
                            if (value.ACTION.length !== 0) {
                                $rootScope.menu_group.push(value);
                                value.ACTION.forEach(function (val) {
                                    $rootScope.action.push(val);
                                    $rootScope.role.push(val.FUNCTIONMODULE);
                                });
                            }
                        });
                        window.localStorage.setItem('__menus', JSON.stringify($rootScope.menu_group));

                    } else {
                        notify_custom('Login Fail', "danger");
                    }
                })
            }

        };
    }]);
