MetronicApp.controller('ChangePasswordCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$http', '$rootScope',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $http, $rootScope) {
            $scope.theUser = {
                id_user: $scope.userData.id_user,
                username: $scope.userData.username,
                password: "",
                newPassword: "",
                reNewPassword: ""
            };
            $scope.Update = function () {
                if ($scope.theUser.newPassword !== $scope.theUser.reNewPassword) {
                    bootbox.alert({
                        message: "Mật khẩu nhập lại không khớp!!!",
                        callback: function () {
                        }
                    })
                } else {
                    ApiQuery.post("/CHANGEPASSWORD", {THEUSER: $scope.theUser}).then(function (res) {
                        if (res.data.RETURN.TYPE === 'S') {
                            bootbox.alert({
                                message: "Đổi mật khẩu thành công!!!",
                                callback: function () {
                                    $state.go('dashboard');
                                }
                            })
                        } else {
                            bootbox.alert({
                                message: "Mật khẩu cũ không đúng!!!",
                                callback: function () {
                                }
                            })
                        }

                    })
                }
            }
        }]);

MetronicApp.controller('UserListCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$http', '$rootScope',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $http, $rootScope) {
            ApiQuery.post("/GET_USER", {ID_USER: $rootScope.userData.id_user}).then(function (res) {
                $scope.users = res.data.GT_USER;
                if (res.data.GT_USER.length === 0) {
                    $rootScope.userData = {};
                    window.localStorage.removeItem('__the_token');
                    window.localStorage.removeItem('__menus');
                    $state.go('loginPage');
                }
                $scope.users.forEach(function (value) {
                    ApiQuery.post('/DETAIL_USER',{ID_USER: value.PARENT_ID}).then(function (res) {
                        value.NAME_PARENT = res.data.USER.USERNAME;
                    })
                    ApiQuery.post('/DETAIL_USER',{ID_USER: value.PARENT_ID_2}).then(function (res) {
                        value.NAME_PARENT_2 = res.data.USER.USERNAME;
                    })
                })
            });

            $scope.del = function (id, username) {
                bootbox.confirm({
                    title: "<strong>Xóa tài khoản<strong>",
                    message: "<i class='text-danger'> Xóa tài khoản " + username + " ?</i> ",
                    buttons: {
                        confirm: {
                            label: 'Xác nhận',
                            className: 'btn-success'
                        },
                        cancel: {
                            label: 'Hủy',
                            className: 'btn-danger'
                        }
                    },
                    callback: function (result) {
                        if (result === true) {
                            ApiQuery.post('/DELETE_USER', {ID_USER: id}).then(function (res) {
                                if (res.data.RETURN.TYPE === 'S') {
                                    $state.reload();
                                }
                            })
                        }
                    }
                });
            };
        }]);

MetronicApp.controller('UserCreateCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {
            $scope.check_user_no_parent = async function (us_type) {
                $scope.listUser_K = [];
                $scope.listUser_U = [];
                if (us_type !== 'S') {
                    if (us_type === 'K') {
                        ApiQuery.post("/GET_USER_NO_PARENT", {ZTYPE: us_type}).then(function (res) {
                            $scope.listUser_K = res.data.GT_USER;
                            if ($rootScope.userData.username !== 'ADMIN') {
                                for (let i = 0; i < listUser.length; i++) {
                                    if ($scope.listUser_K[i].USERNAME.split('.')[0] !== $rootScope.userData.username.split(".")[0]) {
                                        $scope.listUser_K.splice(i, 1);
                                        i--;
                                    }
                                }
                            }
                            $scope.listUser_K.forEach(function (value) {
                                if (value.US_TYPE === "S") {
                                    value.des_us_type = "Tài khoản Thường";
                                } else if (value.US_TYPE === "K") {
                                    value.des_us_type = "Tài khoản QLĐH";
                                } else if (value.US_TYPE === "U") {
                                    value.des_us_type = "Tài khoản Kinh doanh";
                                }
                            });
                        });

                    } else {
                        ApiQuery.post("/GET_USER_NO_PARENT", {ZTYPE: us_type}).then(function (res) {
                            $scope.listUser_U = res.data.GT_USER;
                            if ($rootScope.userData.username !== 'ADMIN') {
                                for (let i = 0; i < listUser.length; i++) {
                                    if ($scope.listUser_U[i].USERNAME.split('.')[0] !== $rootScope.userData.username.split(".")[0]) {
                                        $scope.listUser_U.splice(i, 1);
                                        i--;
                                    }
                                }
                            }
                            $scope.listUser_U.forEach(function (value) {
                                if (value.US_TYPE === "S") {
                                    value.des_us_type = "Tài khoản Thường";
                                } else if (value.US_TYPE === "K") {
                                    value.des_us_type = "Tài khoản QLĐH";
                                } else if (value.US_TYPE === "U") {
                                    value.des_us_type = "Tài khoản Kinh doanh";
                                }
                            });
                        });
                    }
                }

            };
            ApiQuery.post('/GET_USGR').then(function (res) {
                $scope.userGroup = res.data.GT_USGR;
            });
            $rootScope.userType = [
                {
                    shortDes: "S",
                    longDes: "Tài khoản Thường"
                },
                {
                    shortDes: "U",
                    longDes: "Tài khoản Kinh doanh"
                },
                {
                    shortDes: "K",
                    longDes: "Tài khoản QLĐH"
                }
            ];


            $scope.theUser = {
                username: "",
                password: "",
                ID_GR: "",
                KUNNR: "",
                description: "",
                us_type: "",

                shipTos: [],
                users: []
            };
            $scope.del = function (index) {
                $scope.listShipTo.splice(index, 1);
            };


            //rule validate
            $scope._rule = {
                username: "required",
                password: {
                    required: true,
                    minlength: 1
                    // pattern: '/^[A-Za-z]\\w{7,14}$/'
                },
                customer: {required: true},
                description: "required",
                us_gr: "required",
                us_type: "required"

            };
            $scope._msg = {
                username: "Yêu cầu Nhập Tên tài khoản.",
                password: {
                    required: "Yêu cầu nhập Mật khẩu.",
                    minlength: "Mật khẩu dài hơn 8 kí tự"
                },
                // customer:  "You can't leave this empty.",
                description: "Yêu cầu Nhập mô tả.",
                us_gr: "You can't leave this empty.",
                us_type: "You can't leave this empty.",
                customer: {
                    required: "Chưa chọn khách hàng",
                },
            };
            $scope._rule["customer"] = {
                required: true,
            };


            $scope.submitUserForm = function () {
                validation_init($scope._rule, $scope._msg);
                if (jQuery(".js-validation-material").valid()) {
                    if (checkUser($rootScope.userData.username, $scope.theUser.username)) {
                        $scope.users_k = [];
                        $scope.users_u = [];
                        $scope.listUser_K.forEach(function (value) {
                            if (value.choose === true) {
                                $scope.users_k.push(value);
                            }
                        });
                        $scope.listUser_U.forEach(function (value) {
                            if (value.choose === true) {
                                $scope.users_u.push(value);
                            }
                        });
                        ApiQuery.post('/CREATE_USER', {
                            request: $scope.theUser,
                            users_k: $scope.users_k,
                            users_u: $scope.users_u
                        }).then(function (res) {
                            if (res.data.RETURN.TYPE === 'S') {
                                bootbox.alert({
                                    message: "Tạo tài khoản thành công",
                                    callback: function () {
                                        $state.go('User.list');
                                    }
                                })

                            }
                            if (res.data.RETURN.TYPE === 'E') {
                                bootbox.alert({
                                    message: "Tên tài khoản đã được sử dụng",
                                    callback: function () {
                                    }
                                })
                            }
                        });
                    } else {
                        bootbox.alert({
                            title: "<h4><span><strong>THÔNG BÁO</strong></span></h4>",
                            message: "<div><span><em>Không có quyền tạo tài khoản!!!</em></span></div>",
                            callback: function () {
                            }
                        })
                    }

                }

            }
        }]);

MetronicApp.controller('UserDetailCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {

            $rootScope.userType = [
                {
                    shortDes: "S",
                    longDes: "Tài khoản thường"
                },
                {
                    shortDes: "K",
                    longDes: "Tài khoản QLĐH"
                },
                {
                    shortDes: "U",
                    longDes: "Tài khoản Kinh doanh"
                }];
            ApiQuery.post('/GET_DETAIL_USER', {ID_USER: $stateParams.userID}).then(function (res) {
                $scope.theUser = res.data.USER;
                $scope.listShipTo = res.data.GT_SHIPTO;
                $scope.listUser_k = res.data.USERS_K;
                $scope.listUser_u = res.data.USERS_U;
                $scope.listUser_k.forEach(function (value) {
                    if (value.US_TYPE === "S") {
                        value.US_TYPE = "Tài khoản Thường";
                    } else if (value.US_TYPE === "K") {
                        value.US_TYPE = "Tài khoản QLĐH";
                    } else if (value.US_TYPE === "U") {
                        value.US_TYPE = "Tài khoản Kinh doanh";
                    }
                });
                $scope.listUser_u.forEach(function (value) {
                    if (value.US_TYPE === "S") {
                        value.US_TYPE = "Tài khoản Thường";
                    } else if (value.US_TYPE === "K") {
                        value.US_TYPE = "Tài khoản QLĐH";
                    } else if (value.US_TYPE === "U") {
                        value.US_TYPE = "Tài khoản Kinh doanh";
                    }
                });
            });
            ApiQuery.post("/GET_USGR").then(function (res) {
                $scope.userGroup = res.data.GT_USGR;
            });
        }]);

MetronicApp.controller('UserEditCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {
            $scope.isEditting = false;
            if ($stateParams.action === 'edit') {
                $scope.isEditting = true;
            }
            $rootScope.userType = [
                {
                    shortDes: "S",
                    longDes: "Tài khoản thường"
                },
                {
                    shortDes: "K",
                    longDes: "Tài khoản QLĐH"
                },
                {
                    shortDes: "U",
                    longDes: "Tài khoản Kinh doanh"
                }];
            ApiQuery.post('/GET_DETAIL_USER', {ID_USER: $stateParams.userID}).then(function (res) {

                $scope.theUser = res.data.USER;
                $scope.listShipTo = res.data.GT_SHIPTO;
                $scope.listUser_k = res.data.USERS_K;
                $scope.listUser_k.forEach(function (value) {
                    value.choose = true;
                });
                $scope.listUser_u = res.data.USERS_U;
                $scope.listUser_u.forEach(function (value) {
                    value.choose = true;
                });

                if ($scope.theUser.US_TYPE === 'U') {
                    ApiQuery.post('/GET_USER_NO_PARENT', {ZTYPE: $scope.theUser.US_TYPE}).then(function (res) {
                        res.data.GT_USER.forEach(function (value) {
                            $scope.listUser_u.push(value);

                        });
                        $scope.listUser_u.forEach(function (value) {
                            if (value.US_TYPE === "S") {
                                value.des_us_type = "Tài khoản Thường";
                            } else if (value.US_TYPE === "K") {
                                value.des_us_type = "Tài khoản QLĐH";
                            } else if (value.US_TYPE === "U") {
                                value.des_us_type = "Tài khoản Kinh doanh";
                            }
                        });

                    });
                }
                if ($scope.theUser.US_TYPE === 'K') {
                    ApiQuery.post('/GET_USER_NO_PARENT', {ZTYPE: $scope.theUser.US_TYPE}).then(function (res) {
                        res.data.GT_USER.forEach(function (value) {
                            $scope.listUser_k.push(value);
                        });
                        $scope.listUser_k.forEach(function (value) {
                            if (value.US_TYPE === "S") {
                                value.des_us_type = "Tài khoản Thường";
                            } else if (value.US_TYPE === "K") {
                                value.des_us_type = "Tài khoản QLĐH";
                            } else if (value.US_TYPE === "U") {
                                value.des_us_type = "Tài khoản Kinh doanh";
                            }
                        });
                    });
                }
            });


            ApiQuery.post("/GET_USGR").then(function (res) {
                $scope.userGroup = res.data.GT_USGR;
            });

            $scope.submitUserForm = function () {
                $scope.users_k = [];
                $scope.users_u = [];
                $scope.listUser_u.forEach(function (value) {
                    if (value.choose === true) {
                        value.choose = 'X';
                        $scope.users_u.push(value);
                    }
                });
                $scope.listUser_k.forEach(function (value) {
                    if (value.choose === true) {
                        value.choose = 'X';
                        $scope.users_k.push(value);
                    }
                });
                ApiQuery.post('/UPDATE_USER', {
                    request: $scope.theUser,
                    users_k: $scope.users_k,
                    users_u: $scope.users_u
                }).then(function (res) {
                    if (res.data.RETURN.TYPE === 'S') {
                        bootbox.alert({
                            message: "Sửa thông tin tài khoản thành công",
                            callback: function () {
                                $state.go('User.list');
                            }
                        })
                    }
                });
            }

        }]);
