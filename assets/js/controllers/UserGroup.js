MetronicApp.controller('UserGroupListCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $http) {
            $scope.userGroup = [];
            ApiQuery.post('/GET_USGR').then(function (res) {
                $scope.userGroup = res.data.GT_USGR;
                $scope.userGroup.forEach(function (value) {
                    value.NUMBER_OF_USER = value.NUMBER_OF_USER.replace(/^0*/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                })
            });
            $scope.del = function (id_usgr, name) {
                bootbox.confirm({
                    title: "Xóa nhóm tài khoản",
                    message: "Xóa nhóm tài khoản " + name + "?",
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
                            ApiQuery.post('/DELETE_USGR', {ID_USGR: id_usgr}).then(function (res) {
                                $state.reload();
                            })
                        }
                    }
                });

            };
        }]);

MetronicApp.controller('UserGroupUpdateCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $http) {
            $scope.menus = [];
            $scope.userGroup = {};
            ApiQuery.post("/GET_MENU").then(function (res) {
                $scope.menus = res.data.GT_MENU;
                $scope.menuViews = [];
                res.data.GT_MENU.forEach(function (value) {
                    $scope.menuView = {};
                    // $scope.menuView.text = value.NAME;
                    $scope.menuView.text = value.DESCRIPTION;
                    $scope.menuView.value = value.NAME;
                    $scope.childrens = [];
                    value.ACTION.forEach(function (val) {
                        $scope.child = {};
                        $scope.child.text = val.DESCRIPTION;
                        $scope.child.FUNCTIONMODULE = val.FUNCTIONMODULE;
                        $scope.childrens.push($scope.child);
                    });
                    $scope.menuView.children = $scope.childrens;
                    $scope.menuViews.push($scope.menuView);
                });
                $scope.list = [];
                ApiQuery.post("/GET_DETAIL_USGR", {ID_USGR: $stateParams.usgrId}).then(function (res) {
                    $scope.userGroup = res.data.GS_US_GR;
                    $scope.name = res.data.GS_US_GR.NAME;
                    for (let i = 0; i < res.data.GT_MENU.length; i++) {
                        $scope.list.push({
                            text: res.data.GT_MENU[i].DESCRIPTION,
                            value: res.data.GT_MENU[i].NAME
                        });
                        for (let j = 0; j < res.data.GT_MENU[i].ACTION.length; j++) {
                            $scope.list.push({
                                text: res.data.GT_MENU[i].ACTION[j].DESCRIPTION,
                                FUCTIONMODULE: res.data.GT_MENU[i].ACTION[j].FUCTIONMODULE,
                            })
                        }
                    }
                    for (let i = 0; i < $scope.menuViews.length; i++) {
                        for (let j = 0; j < $scope.list.length; j++) {
                            if ($scope.menuViews[i].text === $scope.list[j].text) {
                                $scope.menuViews[i].state = {
                                    checked: true,
                                    opened: true
                                };
                            }
                        }
                    }
                    for (let i = 0; i < $scope.menuViews.length; i++) {
                        for (let j = 0; j < $scope.menuViews[i].children.length; j++) {
                            for (let k = 0; k < $scope.list.length; k++) {
                                if ($scope.menuViews[i].children[j].text === $scope.list[k].text) {
                                    $scope.menuViews[i].children[j].state = {
                                        checked: true,
                                        opened: true
                                    };
                                }
                            }
                        }
                    }
                    $('#tree').jstree({
                        core: {
                            data: $scope.menuViews,
                            check_callback: false
                        },
                        checkbox: {
                            three_state: false, // to avoid that fact that checking a node also check others
                            whole_node: false,  // to avoid checking the box just clicking the node
                            tie_selection: false // for checking without selecting and selecting without checking
                        },
                        plugins: ['checkbox']
                    })
                });
                $scope.submitUserGroupForm = function () {
                    $scope.GT_ACTION = [];
                    let tree = $("#tree").jstree("get_checked", null, true);
                    $.each(tree, function (i, nodeId) {
                        let node = $("#tree").jstree("get_node", nodeId);
                        $scope.GT_ACTION.push(node.original); // Add text to array
                    });
                    $scope.listMenu = [];

                    for (let i = 0; i < $scope.menus.length; i++) {
                        for (let j = 0; j < $scope.GT_ACTION.length; j++) {
                            if ($scope.menus[i].NAME === $scope.GT_ACTION[j].value) {
                                $scope.listMenu.push($scope.menus[i]);
                            }
                        }
                    }

                    for (let i = 0; i < $scope.listMenu.length; i++) {
                        for (let k = 0; k < $scope.listMenu[i].ACTION.length; k++) {
                            let flag = false;
                            for (let j = 0; j < $scope.GT_ACTION.length; j++) {
                                if ($scope.listMenu[i].ACTION[k].FUNCTIONMODULE === $scope.GT_ACTION[j].FUNCTIONMODULE) {
                                    flag = true;
                                }
                            }
                            if (flag === false) {
                                $scope.listMenu[i].ACTION.splice(k, 1);
                                k--;
                            }
                        }
                    }
                    $scope.userGroup.NAME = $scope.name;
                    ApiQuery.post('/UPDATE_USGR', {
                        request: $scope.userGroup,
                        menus: $scope.listMenu
                    }).then(function (res) {
                        if (res.data.RETURN.TYPE === 'S') {
                            bootbox.alert({
                                message: "Sửa nhóm tài khoản thành công",
                                callback: function () {
                                    $state.go('UserGroup.list');
                                }
                            });

                        }
                    });
                }

            });

            $scope.cancel = function () {
                $state.go('UserGroup.list');
            }
        }]);

MetronicApp.controller('UserGroupCreateCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {
            $scope.menus = [];
            ApiQuery.post("/GET_MENU").then(function (res) {

                $scope.menus = res.data.GT_MENU;
                $scope.menuViews = [];
                res.data.GT_MENU.forEach(function (value) {
                    $scope.menuView = {};
                    // $scope.menuView.text = value.NAME;
                    $scope.menuView.text = value.DESCRIPTION;
                    $scope.menuView.state = {
                        opened: true,
                    };
                    $scope.menuView.value = value.NAME;
                    $scope.childrens = [];
                    value.ACTION.forEach(function (val) {
                        $scope.child = {};
                        $scope.child.text = val.DESCRIPTION;
                        $scope.child.FUNCTIONMODULE = val.FUNCTIONMODULE;
                        $scope.childrens.push($scope.child);
                    });
                    $scope.menuView.children = $scope.childrens;
                    $scope.menuViews.push($scope.menuView);
                });

                $scope.GT_ACTION = [];
                $('#tree').jstree({
                    core: {
                        data: $scope.menuViews,
                        check_callback: false
                    },
                    checkbox: {
                        three_state: false, // to avoid that fact that checking a node also check others
                        whole_node: false,  // to avoid checking the box just clicking the node
                        tie_selection: false // for checking without selecting and selecting without checking
                    },
                    plugins: ['checkbox']
                })
            });

            $scope.userGroup = {
                name: "",
                type: "",
                zzstatus: ""
            };

            $scope.submitUserForm = function () {
                $scope.GT_ACTION = [];
                let tree = $("#tree").jstree("get_checked", null, true);
                $.each(tree, function (i, nodeId) {
                    let node = $("#tree").jstree("get_node", nodeId);
                    $scope.GT_ACTION.push(node.original); // Add text to array
                });
                $scope.listMenu = [];
                for (let i = 0; i < $scope.menus.length; i++) {
                    for (let j = 0; j < $scope.GT_ACTION.length; j++) {
                        if ($scope.menus[i].NAME === $scope.GT_ACTION[j].value) {
                            $scope.listMenu.push($scope.menus[i]);
                        }
                    }
                }

                for (let i = 0; i < $scope.listMenu.length; i++) {
                    for (let k = 0; k < $scope.listMenu[i].ACTION.length; k++) {
                        let flag = false;
                        for (let j = 0; j < $scope.GT_ACTION.length; j++) {
                            if ($scope.listMenu[i].ACTION[k].FUNCTIONMODULE === $scope.GT_ACTION[j].FUNCTIONMODULE) {
                                flag = true;
                            }
                        }
                        if (flag === false) {
                            $scope.listMenu[i].ACTION.splice(k, 1);
                            k--;
                        }
                    }
                }

                ApiQuery.post('/CREATE_USGR', {
                    request: $scope.userGroup,
                    menus: $scope.listMenu
                }).then(function (res) {
                    if (res.data.RETURN.TYPE === 'S') {
                        bootbox.alert({
                            message: "Thêm nhóm tài khoản thành công",
                            callback: function () {
                                $state.go('UserGroup.list');
                            }
                        });

                    }
                });
            }

            $scope.cancel = function () {
                $state.go('UserGroup.list');
            }
        }]);

MetronicApp.controller('UserGroupDetailCtrl',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {
            $scope.menus = [];
            ApiQuery.post("/GET_DETAIL_USGR", {ID_USGR: $stateParams.usgrId}).then(function (res) {
                $scope.menus = res.data.GT_MENU;
                $scope.name = res.data.GS_US_GR.NAME;
                $scope.menuViews = [];
                res.data.GT_MENU.forEach(function (value) {
                    $scope.menuView = {};
                    $scope.menuView.text = value.DESCRIPTION;
                    $scope.menuView.state = {
                        checked: true,
                        opened: true
                    };
                    $scope.childrens = [];
                    value.ACTION.forEach(function (val) {
                        $scope.child = {};
                        $scope.child.text = val.DESCRIPTION;
                        $scope.child.FUNCTIONMODULE = val.FUNCTIONMODULE;
                        $scope.childrens.push($scope.child);
                    });
                    $scope.menuView.children = $scope.childrens;
                    $scope.menuViews.push($scope.menuView);
                });
                $scope.GT_ACTION = [];
                $('#tree').jstree({
                    core: {
                        data: $scope.menuViews,
                        check_callback: false
                    },
                    checkbox: {
                        three_state: true, // to avoid that fact that checking a node also check others
                        whole_node: false,  // to avoid checking the box just clicking the node
                        tie_selection: false // for checking without selecting and selecting without checking
                    },
                    plugins: ['']
                })
                    .on("check_node.jstree uncheck_node.jstree", function (e, data) {
                        if (data.node.state.checked) {
                            $scope.GT_ACTION.push(data.node.original);
                        } else {
                            for (let i = 0; i < $scope.GT_ACTION.length; i++) {
                                if (data.node.original.text === $scope.GT_ACTION[i].text) {
                                    $scope.GT_ACTION.splice(i, 1);
                                    i--;
                                }

                            }
                        }
                    })
            });
        }]);

