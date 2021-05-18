MetronicApp.controller('InProcessingOrderCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http', '$timeout',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http, $timeout) {
            $rootScope.start = moment().subtract(6, 'days');
            $rootScope.end = moment();
            $scope.listRejectReason = [
                {text: 'Không đạt điều kiện tín dụng'},
                {text: 'Vượt kế hoạch'},
                {text: 'Sản phẩm không thuộc danh mục được vận chuyển'}
            ];

            function cb(start, end) {
                $rootScope.totalItems = 0;
                $('#reportrange span').html(start.format('DD/MM/YYYY') + ' - ' + end.format('DD/MM/YYYY'));
                $rootScope.listOrder = [];

                ApiQuery.post("/get_order", {
                    id_user: $rootScope.userData.id_user,
                    zstart: start,
                    zend: end,
                    // _page_number: $rootScope.pagination.current,
                    // zsearch: $scope.search
                }).then(function (res) {
                    res.data.RES.forEach(function (val) {
                        if (val.ZNGAYGH !== '0000-00-00') {
                            val.ZNGAYGH = val.ZNGAYGH.split('-')[2] + '/' + val.ZNGAYGH.split('-')[1] + '/' + val.ZNGAYGH.split('-')[0];
                        } else {
                            val.ZNGAYGH = '';
                        }

                        if (val.ITEMS.length !== 0) {
                            val.itemText = "";
                            val.ITEMS.forEach(function (value) {
                                // value.QUANTITY = value.QUANTITY.replace(/^0*/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                                val.itemText += value.NAME
                            });
                        }
                        $rootScope.listOrder.push(val);

                    });
                });
                if ($rootScope.userData.us_type === 'P') {
                    ApiQuery.post("/get_order", {id_user: $rootScope.userData.id_peer}).then(function (res) {
                        res.data.RES.forEach(function (val) {
                            $rootScope.listOrder.push(val);
                        });
                    });
                }
            }

            $('#reportrange').daterangepicker({
                startDate: moment().subtract(6, 'days'),
                endDate: $rootScope.end,
                ranges: range
            }, cb);

            $scope.$watchGroup(['pagination.current', 'search'], function (val, val1) {
                timeoutCode = setTimeout(function () {   //Set timeout
                    $rootScope.start = $('#reportrange').data('daterangepicker').startDate;
                    $rootScope.end = $('#reportrange').data('daterangepicker').endDate;
                    // $rootScope.pagination.current = val;
                    // $scope.search = val1;
                    cb($rootScope.start, $rootScope.end);
                }, 500);
            });

            $scope.message = '';
            $rootScope.listOrder = [];
            ApiQuery.post("/get_order", {id_user: $rootScope.userData.id_user}).then(function (res) {
                res.data.RES.forEach(function (val) {
                    if (val.ZNGAYGH !== '0000-00-00') {
                        val.ZNGAYGH = val.ZNGAYGH.split('-')[2] + '/' + val.ZNGAYGH.split('-')[1] + '/' + val.ZNGAYGH.split('-')[0];
                    } else {
                        val.ZNGAYGH = '';
                    }

                    if (val.ITEMS.length !== 0) {
                        val.itemText = "";
                        val.ITEMS.forEach(function (value) {
                            // value.QUANTITY = value.QUANTITY.replace(/^0*/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                            val.itemText += value.NAME
                        });
                    }
                    // ApiQuery.post('/GET_NOTI_MESSAGE', {
                    //     ID_ORDER: val.ID_ORDER,
                    //     ID_USER: $rootScope.userData.id_user
                    // }).then(function (res) {
                    //     if (res.data.RETURN.TYPE === "S") {
                    //         $scope.check = res.data.ZCHECK;
                    //         // $scope.check = parseInt($scope.check, 10);
                    //         val.check = parseInt($scope.check, 10);
                    //     }
                    // });
                    $rootScope.listOrder.push(val);

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
                $(':button').prop('disabled', true);
                ApiQuery.post("/approve_order", {
                    ID_USER: $rootScope.userData.id_user,
                    ID_ORDER: id_order,
                    CHECK_CREDIT: 'X'
                }).then(function (res) {
                    $state.reload();
                })
            };
            $scope.id_order = "";
            $scope.reason = "";
            $scope.deleteOrder = function (id_order) {
                bootbox.confirm({
                    title: "Xóa đơn hàng?",
                    message: ' ',
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
                            ApiQuery.post("/DELETE_ORDER", {
                                ID_ORDER: id_order
                            }).then(function (res) {
                                if (res.data.RETURN.TYPE === 'S') {
                                    bootbox.alert({
                                        message: "Đơn hàng đã xóa!!!",
                                        callback: function () {
                                            $state.reload();
                                        }
                                    })

                                }
                            });
                        }
                    }
                });
            };

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
MetronicApp.controller('CopyOrderCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http', '$timeout',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http, $timeout) {
            $scope.listRejectReason = [
                {text: 'Không đạt điều kiện tín dụng'},
                {text: 'Vượt kế hoạch'},
                {text: 'Sản phẩm không thuộc danh mục được vận chuyển'}
            ];

            $scope.message = '';
            $rootScope.listOrder = [];
            ApiQuery.post("/get_order", {id_user: $rootScope.userData.id_user}).then(function (res) {
                res.data.RES.forEach(function (val) {
                    if (val.ITEMS.length !== 0) {
                        val.itemText = "";
                        val.ITEMS.forEach(function (value) {
                            // value.QUANTITY = value.QUANTITY.replace(/^0*/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                            val.itemText += value.NAME
                        });
                    }
                    // ApiQuery.post('/GET_NOTI_MESSAGE', {
                    //     ID_ORDER: val.ID_ORDER,
                    //     ID_USER: $rootScope.userData.id_user
                    // }).then(function (res) {
                    //     if (res.data.RETURN.TYPE === "S") {
                    //         $scope.check = res.data.ZCHECK;
                    //         // $scope.check = parseInt($scope.check, 10);
                    //         val.check = parseInt($scope.check, 10);
                    //     }
                    // });
                    $rootScope.listOrder.push(val);

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
                    ID_ORDER: id_order,
                    CHECK_CREDIT: 'X'
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

            $scope.copy = function (id_order, quantity) {
                $(".copy").prop('disabled', true);
                // document.getElementsByClassName("copy").disabled = true;
                ApiQuery.post('/copy_order', {ID_ORDER: id_order, QUANTITY: quantity}).then(function (res) {
                    if (res.data.RETURN.TYPE === 'S') {
                        $state.go('Order.list');
                    }
                })
            }


        }]);


MetronicApp.controller('DetailOrderCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http', '$filter',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http, $filter) {
            $scope.data = {
                matnr_tr: '',
                matnr_bt: '',
                matnr_khoa: '',
            };
            $scope.character_group = character_group;
            $scope.imageStrings = [];
            $scope.message = '';
            let current_datetime = new Date();
            $scope.today = String(current_datetime.getDate()).padStart(2, '0') + "/" + String(current_datetime.getMonth() + 1).padStart(2, '0') + "/" + current_datetime.getFullYear();
            ApiQuery.post('/GET_ROUTE', {}).then(function (res) {
                $scope.gt_t173t = res.data.GT_T173T;
                $scope.gt_route = res.data.GT_ROUTE;
            });

            $scope.back = function () {
                window.history.back();
            };

            $scope.loadRoute = function (VSART) {
                $scope.gt_route = [];
                ApiQuery.post('/GET_ROUTE', {}).then(function (res) {
                    res.data.GT_ROUTE.forEach(function (value) {
                        if (value.VSART === VSART) {
                            $scope.gt_route.push(value);
                        }
                    })
                });
                ApiQuery.post('/check_price', {
                    request: $scope.theOrder,
                    ID_USER: $rootScope.userData.id_user
                }).then(function (res) {
                    $scope.ET_KONV = res.data.ET_KONV;
                    $scope.ck = res.data.CK;
                    $scope.tax = res.data.TAX;
                    $scope.total_price = res.data.TGTDH;
                    $scope.price_after_ck = $scope.total_price - $scope.ck;
                    $scope.price = $scope.total_price - $scope.ck + $scope.tax;

                });
            };

            ApiQuery.post('/GET_PAYMENT_TERMS').then(function (res) {
                $scope.paymentTerms = [];
                if (res.data.RETURN.TYPE === "S") {
                    $scope.paymentTerms = res.data.GT_PAYMENT_TERM;
                }
            });

            $scope.addNew = function () {

                ApiQuery.post('/GET_MARA', {
                    ID_USER: $rootScope.userData.id_user,
                    // division: res.data.RESPONSE.DIVISION,
                    IT_MARAS: [{MATNR: $scope.theOrder.ITEMS[0].MATNR}],
                    VKORG: $rootScope.sale_org
                }).then(function (res_mapping) {
                    $scope.theOrder.ITEMS[0].EXTWG = res_mapping.data.MARAS[0].EXTWG;
                    if ($scope.theOrder.ITEMS[0] !== undefined && ($scope.theOrder.ITEMS[0].EXTWG === 'PKAD' || $scope.theOrder.ITEMS[0].EXTWG === 'PKDT')) {
                        ApiQuery.post('/GET_MARA', {
                            ID_USER: $rootScope.userData.id_user,
                            ZTYPE: $scope.theOrder.ITEMS[0].EXTWG,
                            VKORG: $rootScope.sale_org
                        }).then(function (res) {
                            $scope.maras = res.data.MARAS;
                            $rootScope.maras_Global = res.data.MARAS;
                        });
                        $scope.theOrder.ITEMS.push({
                            ID: $scope.theOrder.ITEMS.length + 1,
                            id_user: $rootScope.userData.id_user,
                            MATNR: 0,
                            NAME: '',
                            ZTERM: '',
                            QUANTITY: 0,
                            price: 0,
                            SALE_UNIT: "",
                            Z_RETURN: false
                        })
                    } else {
                        ApiQuery.post('/GET_MARA', {
                            ID_USER: $rootScope.userData.id_user,
                            ZTYPE: 'CCBH',
                            VKORG: $rootScope.sale_org
                        }).then(function (res) {
                            $scope.maras = res.data.MARAS;
                            $rootScope.maras_Global = res.data.MARAS;
                        });
                        // }

                        $scope.theOrder.ITEMS.push({
                            ID: $scope.theOrder.ITEMS.length + 1,
                            id_user: $rootScope.userData.id_user,
                            MATNR: 0,
                            NAME: '',
                            ZTERM: '',
                            QUANTITY: 0,
                            price: 0,
                            SALE_UNIT: "",
                            Z_RETURN: false
                        })
                    }
                });


            };
            $scope.loadUnit = function (index, matnr) {
                $scope.maras.forEach(function (value) {
                    if (value.MATNR === matnr) {
                        $scope.theOrder.ITEMS[index].NAME = value.MAKTG;
                        $scope.theOrder.ITEMS[index].price = value.ZPRICE;
                        $scope.theOrder.ITEMS[index].SALE_UNIT = value.MEINS;
                        if (value.LABOR === '002') {
                            $scope.theOrder.ITEMS[index].Z_RETURN = true;
                        } else {
                            $scope.theOrder.ITEMS[index].Z_RETURN = false;
                        }
                    }
                })
            };
            $scope.delTem = function (temID) {
                $scope.theOrder.ITEMS.splice(temID, 1);
            };

            ApiQuery.post('/GET_DIVISION', {}).then(function (res) {
                $scope.division = res.data.GT_DIVISION;
            });
            ApiQuery.post('/GET_DC', {}).then(function (res) {
                $scope.dc = res.data.GT_DC;
            });

            ApiQuery.post('/GET_ORDER_TYPE').then(function (res) {
                if (res.data.RETURN.TYPE === "S") {
                    $scope.orderTypes = res.data.GT_ORDER_TYPE;
                }
            });

            ApiQuery.post("/GET_DETAIL_ORDER", {ID_ORDER: $stateParams.idOrder}).then(async function (res) {
                $scope.theDate = res.data.RESPONSE.Z_DATE;
                $scope.theOrder = res.data.RESPONSE;
                $rootScope.item_global = '00000000' + res.data.RESPONSE.ID_ITEM_MASTER;
                $rootScope.material = '00000000' + res.data.RESPONSE.ID_ITEM_MASTER;
                $scope.theOrder.ZNGAYGH = res.data.RESPONSE.ZNGAYGH.split('-')[2] + '/' + res.data.RESPONSE.ZNGAYGH.split('-')[1] + '/' + res.data.RESPONSE.ZNGAYGH.split('-')[0];
                // $rootScope.maras = await getMaraByDivision(ApiQuery, $rootScope.userData.id_user, res.data.RESPONSE.DIVISION);
                $rootScope.maras = await getMaraByItems(ApiQuery, $rootScope.userData.id_user, res.data.RESPONSE.DIVISION, res.data.RESPONSE.ITEMS);
                res.data.RESPONSE.ITEMS.forEach(function (value) {
                    if (value.Z_RETURN === "1") {
                        value.Z_RETURN = true;
                    }
                    if (value.Z_RETURN === "2") {
                        value.Z_RETURN = false;
                    }
                    if (res.data.RESPONSE.DIVISION === '02' && res.data.RESPONSE.ZPK !== 'Y') {
                        if (value.kg_thanh === undefined) {
                            value.kg_thanh = parseFloat(value.CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE) / parseFloat(value.CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE);
                        }
                        $rootScope.maras.forEach(function (value2) {
                            if (value.MATNR === value2.MATNR) {
                                value.price = value2.ZPRICE;
                                if (value.CHARACTERISTICS.findIndex(o => o.ATNAM === 'Z_KL_TONG') !== -1) {
                                    if (value.SALE_UNIT === 'KG') {
                                        value.total_price = value.price * value.CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE;
                                        value.total_price = Math.round(value.total_price);
                                    } else if (value.SALE_UNIT === 'M') {
                                        value.total_price = value.price * value.CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_LUONG').VALUE;
                                        value.total_price = Math.round(value.total_price);
                                    }
                                }
                            }
                        });
                    }
                    if (res.data.RESPONSE.DIVISION === '02' && res.data.RESPONSE.ZPK === 'Y') {
                        $rootScope.maras.forEach(function (value2) {
                            if (value.MATNR === value2.MATNR) {
                                value.price = value2.ZPRICE;
                                value.total_price = value.price * value.QUANTITY;
                            }
                        });
                    }
                });
                ApiQuery.post('/GET_MAPPING_BOTOI', {ID_ITEM_MASTER: $rootScope.item_global}).then(function (res1) {
                    $rootScope.gt_botoi = res1.data.GT_BOTOI;
                });
                ApiQuery.post('/GET_MAPPING_THANHRAY', {}).then(function (res1) {
                    $rootScope.gt_thanhray = res1.data.GT_THANHRAY;
                });
                ApiQuery.post('/GET_MAPPING_KHOA', {}).then(function (res1) {
                    $rootScope.gt_khoa = res1.data.GT_KHOA;
                });
                $scope.theOrder = res.data.RESPONSE;
                if (res.data.RESPONSE.DIVISION === '02') {
                    // $scope.theOrder.ITEMS.forEach(function (value) {
                    //     value.MATNR = value.MATNR.split('0000000000')[1];
                    // });
                }

                $scope.name = res.data.RESPONSE.ITEMS[0].NAME;
                $scope.theOrder.STBL = Math.round($scope.theOrder.STBL);
                $scope.theOrder.ZIMAGE = res.data.RESPONSE.ZIMAGE;
                if (res.data.RESPONSE.DIVISION === '01') {
                    if ($scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_WIDTH') !== -1
                        && $scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_HEIGHT') !== -1) {
                        $scope.theOrder.ITEMS[0].WIDTH = $scope.theOrder.ITEMS[0].CHARACTERISTICS[$scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE;
                        $scope.theOrder.ITEMS[0].HEIGHT = $scope.theOrder.ITEMS[0].CHARACTERISTICS[$scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_HEIGHT')].VALUE;

                    }

                    $scope.theOrder.ITEMS.forEach(function (value1) {
                        $scope.maras.forEach(function (value2) {
                            if (value1.MATNR === value2.MATNR) {
                                value1.price = value2.ZPRICE;
                                if (value2.ZDKGH !== '0000') {
                                    let current_datetime = moment($scope.theOrder.TODAY, "DD/MM/YYYY");
                                    let newDate = current_datetime.add(parseInt(value2.ZDKGH), 'days');
                                    $scope.end_date = newDate.format('DD/MM/YYYY');
                                }
                            }
                        });
                    });
                }
                $scope.items = res.data.RESPONSE.ITEMS;
                ApiQuery.post('/GET_DETAIL_USER', {ID_USER: $scope.theOrder.ID_USER}).then(function (res1) {
                    ApiQuery.post('/GET_DETAIL_CUSTOMER', {
                        KUNNR: res1.data.USER.KUNNR,
                        BUKRS: $scope.theOrder.VKORG
                    }).then(function (res2) {
                        res2.data.CUSTOMER.CZREDIT.forEach(function (value) {
                            if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                                let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                                if (index !== -1) {
                                    $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                    $scope.theOrder.credit_value = Math.round(value.VALUE);
                                }
                            }
                        });
                        res2.data.CUSTOMER.ZCREDIT_CUS.forEach(function (value) {
                            if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                                let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                                if (index !== -1) {
                                    $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                    $scope.theOrder.credit_value_cus = Math.round(value.Z_AMOUNT_L);
                                }
                            }
                        })
                    });
                });

                ApiQuery.post('/check_price', {
                    request: $scope.theOrder,
                    ID_USER: $rootScope.userData.id_user
                }).then(function (res) {
                    $scope.ET_KONV = res.data.ET_KONV;
                    $scope.tax = Math.round(res.data.TAX);
                    $scope.stdbl = Math.round(res.data.STDBL);
                    $scope.total_price = (Math.round(res.data.TGTDH));
                    if (res.data.CK !== 0) {
                        $scope.ck = (Math.round(res.data.CK));
                        $scope.price_after_ck = $scope.total_price - $scope.ck;
                        $scope.price = $scope.total_price - $scope.ck + $scope.tax;

                    } else {
                        $scope.ck = res.data.CK;
                        $scope.price_after_ck = (($scope.total_price) - $scope.ck);
                        $scope.price = (($scope.total_price) - $scope.ck + ($scope.tax));

                    }
                    $scope.total_inquiry = res.data.TOTAL_INQUIRY;


                });

                $scope.check_price = function () {
                    // $scope.theOrder.credit_value_cus = unRegex_number($scope.theOrder.credit_value_cus);
                    ApiQuery.post('/check_price', {
                        request: $scope.theOrder,
                        ID_USER: $rootScope.userData.id_user
                    }).then(function (res) {
                        $scope.ET_KONV = res.data.ET_KONV;
                        // $scope.price = res.data.NET_VALUE;
                        $scope.ck = Math.round(res.data.CK);
                        $scope.tax = Math.round(res.data.TAX);
                        $scope.stdbl = (Math.round(res.data.STDBL));

                        $scope.total_price = (Math.round(res.data.TGTDH));

                        $scope.price_after_ck = (($scope.total_price) - ($scope.ck));
                        $scope.price = (($scope.total_price) - ($scope.ck) + ($scope.tax));
                        $scope.total_inquiry = res.data.TOTAL_INQUIRY;
                        // $scope.total_price = $scope.price + $scope.ck;


                        $scope.theOrder.ITEMS.forEach(function (value) {
                            // value.QUANTITY = value.QUANTITY.toString();
                        });
                        // $scope.theOrder.credit_value_cus = regex_number($scope.theOrder.credit_value_cus);
                    });
                }

            });
            $scope.dkgh = function (maras, matnr) {
                let index = maras.findIndex(item => item.MATNR === matnr);
                if (index !== -1) {
                    let value = maras[index];
                    let newDate = moment().add(parseInt(value.ZDKGH), 'days');
                    $scope.theOrder.ZDKGH = newDate;
                    $scope.zend_date = newDate.format('DD/MM/YYYY');
                    $scope.theDate = $scope.zend_date;
                }
            };
            $scope.thanh_le = 0;
            $scope.loadValue = function (matnr) {
                let index = $scope.theOrder.ITEMS.findIndex(item => item.MATNR === matnr);
                if (index !== -1) {
                    if ($scope.theOrder.ITEMS[index].THANH_LE === undefined) {
                        $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE = $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_BOS').VALUE * parseInt($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_HS_BO').VALUE);
                    } else {
                        $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE = $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_BOS').VALUE * parseInt($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_HS_BO').VALUE) + parseInt($scope.theOrder.ITEMS[index].THANH_LE);
                    }
                    $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_LUONG').VALUE = Math.round($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE * parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KT_THANH').VALUE));
                    $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE = $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE * parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_TY_TRONG').VALUE.replace(/,/, '.')) * parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KT_THANH').VALUE);
                    $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE = $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE.toFixed(3);

                    if ($scope.theOrder.ITEMS[index].SALE_UNIT === 'KG') {
                        $scope.theOrder.ITEMS[index].total_price = ($scope.theOrder.ITEMS[index].price) * $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE;
                        $scope.theOrder.ITEMS[index].total_price = (Math.round($scope.theOrder.ITEMS[index].total_price));
                    } else if ($scope.theOrder.ITEMS[index].SALE_UNIT === 'M') {
                        $scope.theOrder.ITEMS[index].total_price = ($scope.theOrder.ITEMS[index].price) * $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_LUONG').VALUE;
                        $scope.theOrder.ITEMS[index].total_price = (Math.round($scope.theOrder.ITEMS[index].total_price));

                    }

                    $scope.theOrder.ITEMS[index].kg_thanh = parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_TY_TRONG').VALUE.replace(/,/, '.')) * parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KT_THANH').VALUE);
                    $scope.theOrder.ITEMS[index].kg_thanh = $scope.theOrder.ITEMS[index].kg_thanh.toFixed(3);
                    $scope.check_price();
                }
                ;

            };

            $scope.closePopup = function () {
                $('#myModal').modal('hide');
            };

            $scope.edit = function (matnr, index) {
                $('#myModal').modal('show');
                $scope.zindex = index;
                if ($scope.zindex === 0 && $scope.theOrder.ID_ITEM_MASTER !== '0000000000' && $scope.theOrder.ID_ITEM_MASTER !== 0) {
                    matnr = '00000000' + $scope.theOrder.ID_ITEM_MASTER;
                }
                ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: matnr}).then(function (res) {
                    $rootScope.characters = [];
                    $scope.items.forEach(function (value, index1) {
                        value.CHARACTERISTICS.forEach(function (value2) {
                            res.data.DATA.forEach(function (value3) {
                                if (value3.ATNAM === value2.ATNAM) {
                                    value2.value_default = value3.VALUE2;
                                }
                            })
                        });

                        // if (value.MATNR === matnr) {
                        if (index1 === 0) {
                            $rootScope.characters = value.CHARACTERISTICS;
                        } else if (value.MATNR === matnr) {
                            $rootScope.characters = value.CHARACTERISTICS;
                        }
                        $scope.checkGroup = function (value) {
                            let index = $rootScope.characters.findIndex(item => item.ZGROUP === value);
                            if (index !== -1) {
                                return true;
                            }
                            return false;
                        }
                    });
                });
            };
            $scope.loadBoToi_ThanhRay = function (group, value2, atnam) {
                $scope.maras_unremove = [];
                console.log($rootScope.gt_botoi);
                if (group === '01' && (atnam === 'Z_MODEL_CUA')) {
                    $scope.default_maras.forEach(function (value) {
                        if (value.ZMBEZ === 'Z_MODEL_CUA' && value.VALUE === value2) {
                            let index = $scope.default_maras.findIndex(item => item.ID_MATNR_REFER === value.ID_MATNR_REFER && item.ZMBEZ === 'Z_MAU_SAC');

                            if (index !== -1) {
                                $scope.maras_unremove.push($scope.default_maras[index]);
                            }
                        }
                    });
                }


                if (group === '07' && atnam === 'Z_MODEL_BT') {
                    $scope.botois = [];
                    $rootScope.gt_botoi.forEach(function (value) {
                        if (value.VALUE === value2) {
                            $scope.botois.push(value);
                        }
                    });
                    if ($scope.botois.length > 0) {
                        $scope.data.matnr_bt = $scope.botois[0].MATNR;

                    }

                }
                if (group === '08' && (atnam === 'Z_RAY_TL0' || atnam === 'Z_RAY_KT15'
                    || atnam === 'Z_RAY_GR' || atnam === 'Z_RAY_KT_SD' || atnam === 'Z_RAY_KT17'
                    || atnam === 'Z_RAY_KT19' || atnam === 'Z_RAY_KT24' || atnam === 'Z_RAY_TL_SD'
                    || atnam === 'Z_RAY_KHAC')) {
                    $scope.thanhrays = [];
                    $rootScope.gt_thanhray.forEach(function (value) {
                        if (value.VALUE === value2 && value.MATNR === $scope.item_global) {
                            $scope.thanhrays.push(value);
                        }
                    });
                    if ($scope.thanhrays.length > 0) {
                        $scope.data.matnr_tr = $scope.thanhrays[0].MATNR_REFER;
                    }
                }
                if (group === '10' && atnam === 'Z_KHOA') {
                    $scope.khoas = [];
                    $rootScope.gt_khoa.forEach(function (value) {
                        if (value.VALUE === value2 && value.MATNR === $scope.item_global) {
                            $scope.khoas.push(value);
                        }
                    });
                    if ($scope.khoas.length > 0) {
                        $scope.data.matnr_khoa = $scope.khoas[0].MATNR_REFER;
                    }
                }
            };

            $scope.addItemBT = async function (value, characters) {
                ApiQuery.post('/GET_MARA', {
                    ID_USER: $rootScope.userData.id_user,
                    IT_MARAS: [{
                        MATNR: value
                    }],
                    VKORG: $rootScope.sale_org
                }).then(function (res_bt) {
                    let item_bt = {
                        ID: $scope.theOrder.ITEMS.length + 1,
                        id_user: $rootScope.userData.id_user,
                        CHARACTERISTICS: [],
                        MATNR: value,
                        NAME: res_bt.data.MARAS[0].MAKTX,
                        ZTERM: '',
                        QUANTITY: 1,
                        SALE_UNIT: res_bt.data.MARAS[0].MEINS,
                        ZPRICE: res_bt.data.MARAS[0].ZPRICE,
                        price: res_bt.data.MARAS[0].ZPRICE,
                        Z_RETURN: false,
                        check: 'bt'
                    };
                    if ($scope.theOrder.ITEMS.findIndex(item => item.check === 'bt') !== -1) {
                        item_bt.ID -= 1;
                        $scope.theOrder.ITEMS.splice($scope.theOrder.ITEMS.findIndex(item => item.check === 'bt'), 1, item_bt);
                        ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: value}).then(function (res) {
                            $scope.get_characteristic = res.data.DATA;
                            ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: value}).then(function (res2) {
                                res.data.DATA.forEach(function (value) {
                                    res2.data.GT_CHARACTER.forEach(function (value2) {
                                        if (value2.ATNAM === value.ATNAM && value2.ZDEFAULT === 'X') {
                                            if (value.VALUE2.length !== 0) {
                                                switch (value.ATNAM) {
                                                    case 'Z_WIDTH':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_HEIGHT':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_HEIGHT')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;

                                                    case 'Z_LOAI_CUA':
                                                        if (characters.findIndex(item => item.ATNAM === 'Z_LOAI_CUA') !== -1) {
                                                            item_bt.CHARACTERISTICS.push({
                                                                ATNAM: value.ATNAM,
                                                                SMBEZ: value.SMBEZ,
                                                                VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_LOAI_CUA')].VALUE,
                                                                ZGROUP: value2.ZGROUP,
                                                                value_default: value.VALUE2
                                                            });
                                                        } else {
                                                            item_bt.CHARACTERISTICS.push({
                                                                ATNAM: value.ATNAM,
                                                                SMBEZ: value.SMBEZ,
                                                                VALUE: '',
                                                                ZGROUP: value2.ZGROUP,
                                                                value_default: value.VALUE2
                                                            });
                                                        }
                                                        break;
                                                    case 'Z_SO_LUONG':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: 1,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_KO_DAU_TRUC':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KO_DAU_TRUC')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    default:
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                }


                                            } else {
                                                switch (value.ATNAM) {
                                                    case 'Z_WIDTH':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    case 'Z_HEIGHT':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_HEIGHT')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    case 'Z_LOAI_CUA':
                                                        if (characters.findIndex(item => item.ATNAM === 'Z_LOAI_CUA') !== -1) {
                                                            item_bt.CHARACTERISTICS.push({
                                                                ATNAM: value.ATNAM,
                                                                SMBEZ: value.SMBEZ,
                                                                VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_LOAI_CUA')].VALUE,
                                                                ZGROUP: value2.ZGROUP,
                                                                value_default: value.VALUE2
                                                            });
                                                        } else {
                                                            item_bt.CHARACTERISTICS.push({
                                                                ATNAM: value.ATNAM,
                                                                SMBEZ: value.SMBEZ,
                                                                VALUE: '',
                                                                ZGROUP: value2.ZGROUP,
                                                                value_default: value.VALUE2
                                                            });
                                                        }
                                                        break;
                                                    case 'Z_SO_LUONG':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: 1,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_KO_DAU_TRUC':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KO_DAU_TRUC')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    default:
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                }
                                            }
                                        }
                                    })
                                })
                            });
                        });
                    } else {
                        ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: value}).then(function (res) {
                            $scope.get_characteristic = res.data.DATA;
                            ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: value}).then(function (res2) {
                                res.data.DATA.forEach(function (value) {
                                    res2.data.GT_CHARACTER.forEach(function (value2) {
                                        if (value2.ATNAM === value.ATNAM && value2.ZDEFAULT === 'X') {
                                            if (value.VALUE2.length !== 0) {
                                                switch (value.ATNAM) {
                                                    case 'Z_WIDTH':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_HEIGHT':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_HEIGHT')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;

                                                    case 'Z_LOAI_CUA':
                                                        if (characters.findIndex(item => item.ATNAM === 'Z_LOAI_CUA') !== -1) {
                                                            item_bt.CHARACTERISTICS.push({
                                                                ATNAM: value.ATNAM,
                                                                SMBEZ: value.SMBEZ,
                                                                VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_LOAI_CUA')].VALUE,
                                                                ZGROUP: value2.ZGROUP,
                                                                value_default: value.VALUE2
                                                            });
                                                        } else {
                                                            item_bt.CHARACTERISTICS.push({
                                                                ATNAM: value.ATNAM,
                                                                SMBEZ: value.SMBEZ,
                                                                VALUE: '',
                                                                ZGROUP: value2.ZGROUP,
                                                                value_default: value.VALUE2
                                                            });
                                                        }
                                                        ;
                                                        break;
                                                    case 'Z_SO_LUONG':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: 1,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_KO_DAU_TRUC':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KO_DAU_TRUC')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    default:
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                }


                                            } else {
                                                switch (value.ATNAM) {
                                                    case 'Z_WIDTH':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    case 'Z_HEIGHT':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_HEIGHT')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    case 'Z_LOAI_CUA':
                                                        if (characters.findIndex(item => item.ATNAM === 'Z_LOAI_CUA') !== -1) {
                                                            item_bt.CHARACTERISTICS.push({
                                                                ATNAM: value.ATNAM,
                                                                SMBEZ: value.SMBEZ,
                                                                VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_LOAI_CUA')].VALUE,
                                                                ZGROUP: value2.ZGROUP,
                                                                value_default: value.VALUE2
                                                            });
                                                        } else {
                                                            item_bt.CHARACTERISTICS.push({
                                                                ATNAM: value.ATNAM,
                                                                SMBEZ: value.SMBEZ,
                                                                VALUE: '',
                                                                ZGROUP: value2.ZGROUP,
                                                                value_default: value.VALUE2
                                                            });
                                                        }
                                                        ;
                                                        break;
                                                    case 'Z_SO_LUONG':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: 1,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_KO_DAU_TRUC':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KO_DAU_TRUC')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    default:
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                }
                                            }
                                        }
                                    })
                                })
                            });
                        });
                        $scope.theOrder.ITEMS.push(item_bt);
                        $scope.items = $scope.theOrder.ITEMS;
                    }
                });


                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve();
                    }, 100);
                });
            };

            $scope.addItemTR = function (value, characters) {
                ApiQuery.post('/GET_MARA', {
                    ID_USER: $rootScope.userData.id_user,
                    IT_MARAS: [{
                        MATNR: value
                    }],
                    VKORG: $rootScope.sale_org
                }).then(function (res_tr) {
                    let item_tr = {
                        ID: $scope.theOrder.ITEMS.length + 1,
                        id_user: $rootScope.userData.id_user,
                        CHARACTERISTICS: [],
                        MATNR: value,
                        NAME: res_tr.data.MARAS[0].MAKTX,
                        ZTERM: '',
                        QUANTITY: parseInt($rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_THANH_RAY')].VALUE) * parseInt($rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_KT_RAY0')].VALUE) / 1000,
                        SALE_UNIT: res_tr.data.MARAS[0].MEINS,
                        Z_RETURN: false,
                        ZPRICE: res_tr.data.MARAS[0].ZPRICE,
                        price: res_tr.data.MARAS[0].ZPRICE,
                        check: 'tr'
                    };
                    if ($scope.theOrder.ITEMS.findIndex(item => item.check === 'tr') !== -1) {
                        item_tr.ID -= 1;
                        $scope.theOrder.ITEMS.splice($scope.theOrder.ITEMS.findIndex(item => item.check === 'tr'), 1, item_tr);
                        ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: value}).then(function (res) {
                            $scope.get_characteristic = res.data.DATA;
                            ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: value}).then(function (res2) {
                                res.data.DATA.forEach(function (value) {
                                    res2.data.GT_CHARACTER.forEach(function (value2) {
                                        if (value2.ATNAM === value.ATNAM && value2.ZDEFAULT === 'X') {
                                            if (value.VALUE2.length !== 0) {
                                                switch (value.ATNAM) {
                                                    case 'Z_KT_THANH':
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KT_RAY0')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_SO_THANH':
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_THANH_RAY')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    default:
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                }


                                            } else {
                                                switch (value.ATNAM) {
                                                    case 'Z_KT_THANH':
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KT_RAY0')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    case 'Z_SO_THANH':
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_THANH_RAY')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    default:
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                }
                                            }
                                        }
                                    })
                                });
                                item_tr.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_LUONG')].VALUE = item_tr.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_KT_THANH')].VALUE * parseInt(item_tr.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_THANH')].VALUE) / 1000;

                            });

                        });
                    } else {
                        ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: value}).then(function (res) {
                            $scope.get_characteristic = res.data.DATA;
                            ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: value}).then(function (res2) {
                                res.data.DATA.forEach(function (value) {
                                    res2.data.GT_CHARACTER.forEach(function (value2) {
                                        if (value2.ATNAM === value.ATNAM && value2.ZDEFAULT === 'X') {
                                            if (value.VALUE2.length !== 0) {
                                                switch (value.ATNAM) {
                                                    case 'Z_KT_THANH':
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KT_RAY0')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_SO_THANH':
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_THANH_RAY')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    default:
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                }


                                            } else {
                                                switch (value.ATNAM) {
                                                    case 'Z_KT_THANH':
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KT_RAY0')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    case 'Z_SO_THANH':
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_THANH_RAY')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    default:
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                }
                                            }
                                        }
                                    })
                                });
                                item_tr.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_LUONG')].VALUE = item_tr.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_KT_THANH')].VALUE * parseInt(item_tr.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_THANH')].VALUE) / 1000;

                            });

                        });
                        $scope.theOrder.ITEMS.push(item_tr);
                        $scope.items = $scope.theOrder.ITEMS;
                    }
                });


                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve();
                    }, 100);
                });
            };
            $scope.addItemKhoa = function (value, characters) {
                ApiQuery.post('/GET_MARA', {
                    ID_USER: $rootScope.userData.id_user,
                    IT_MARAS: [{
                        MATNR: value
                    }],
                    VKORG: $rootScope.sale_org
                }).then(function (res_khoa) {
                    let item_khoa = {
                        ID: $scope.theOrder.ITEMS.length + 1,
                        id_user: $rootScope.userData.id_user,
                        CHARACTERISTICS: [],
                        MATNR: value,
                        NAME: res_khoa.data.MARAS[0].MAKTX,
                        ZTERM: '',
                        QUANTITY: 1,
                        SALE_UNIT: res_khoa.data.MARAS[0].MEINS,
                        Z_RETURN: false,
                        ZPRICE: res_khoa.data.MARAS[0].ZPRICE,
                        price: res_khoa.data.MARAS[0].ZPRICE,
                        check: 'kh'
                    };
                    if ($scope.theOrder.ITEMS.findIndex(item => item.check === 'kh') !== -1) {
                        item_khoa.ID -= 1;
                        $scope.theOrder.ITEMS.splice($scope.theOrder.ITEMS.findIndex(item => item.check === 'kh'), 1, item_khoa);
                        ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: value}).then(function (res) {
                            $scope.get_characteristic = res.data.DATA;
                            ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: value}).then(function (res2) {
                                res.data.DATA.forEach(function (value) {
                                    res2.data.GT_CHARACTER.forEach(function (value2) {
                                        if (value2.ATNAM === value.ATNAM && value2.ZDEFAULT === 'X') {
                                            if (value.VALUE2.length !== 0) {
                                                switch (value.ATNAM) {
                                                    case 'Z_KHOA':
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KHOA')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_WIDTH':
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    default:
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                }


                                            } else {
                                                switch (value.ATNAM) {
                                                    case 'Z_KHOA':
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KHOA')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_WIDTH':
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    default:
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                }
                                            }
                                        }
                                    })
                                });
                                // item_khoa.CHARACTERISTICS[item_khoa.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_LUONG')].VALUE = item_khoa.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_KT_THANH')].VALUE * parseInt(item_khoa.CHARACTERISTICS[item_khoa.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_THANH')].VALUE) / 1000;

                            });

                        });
                    } else {
                        ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: value}).then(function (res) {
                            $scope.get_characteristic = res.data.DATA;
                            ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: value}).then(function (res2) {
                                res.data.DATA.forEach(function (value) {
                                    res2.data.GT_CHARACTER.forEach(function (value2) {
                                        if (value2.ATNAM === value.ATNAM && value2.ZDEFAULT === 'X') {
                                            if (value.VALUE2.length !== 0) {
                                                switch (value.ATNAM) {
                                                    case 'Z_KHOA':
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KHOA')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_WIDTH':
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    default:
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                }


                                            } else {
                                                switch (value.ATNAM) {
                                                    case 'Z_KHOA':
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KHOA')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_WIDTH':
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    default:
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                }
                                            }
                                        }
                                    })
                                });
                                // item_khoa.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_LUONG')].VALUE = item_tr.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_KT_THANH')].VALUE * parseInt(item_tr.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_THANH')].VALUE) / 1000;
                            });

                        });

                        $scope.theOrder.ITEMS.push(item_khoa);
                        $scope.items = $scope.theOrder.ITEMS;
                    }
                });


                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve();
                    }, 100);
                });
            };


            $scope.submitPopup = async function (material, index) {
                // if ($scope.theOrder.ID_ITEM_MASTER === material || material === undefined) {
                await $scope.addItemBT($scope.data.matnr_bt, $rootScope.characters);
                // }

                // // if ($scope.theOrder.ITEMS[0].MATNR === material || material === undefined) {
                await $scope.addItemTR($scope.data.matnr_tr, $rootScope.characters);
                // // }
                // // if ($scope.theOrder.ITEMS[0].MATNR === material || material === undefined) {
                await $scope.addItemKhoa($scope.data.matnr_khoa, $rootScope.characters);
                // // }
                $scope.theOrder.VKORG = $rootScope.sale_org;
                if ($scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_DIEN_TICH') !== -1
                    && $scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_WIDTH') !== -1
                    && $scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_HEIGHT') !== -1) {
                    $scope.theOrder.ITEMS[0].QUANTITY = $scope.theOrder.ITEMS[0].CHARACTERISTICS[$scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_DIEN_TICH')].VALUE;
                    $scope.theOrder.ITEMS[0].WIDTH = $scope.theOrder.ITEMS[0].CHARACTERISTICS[$scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE;
                    $scope.theOrder.ITEMS[0].HEIGHT = $scope.theOrder.ITEMS[0].CHARACTERISTICS[$scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_HEIGHT')].VALUE;
                }
                if ($scope.theOrder.ITEMS[index] !== undefined && $scope.theOrder.ITEMS[index].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_KT_THANH') !== -1 && $scope.theOrder.ITEMS[index].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_THANH') !== -1) {
                    $scope.theOrder.ITEMS[index].QUANTITY = $scope.theOrder.ITEMS[index].CHARACTERISTICS[$scope.theOrder.ITEMS[index].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_KT_THANH')].VALUE * $scope.theOrder.ITEMS[index].CHARACTERISTICS[$scope.theOrder.ITEMS[index].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_THANH')].VALUE / 1000;
                }

                if ($scope.maras.findIndex(item => item.MATNR === $scope.theOrder.ITEMS[0].MATNR) !== -1) {
                    $scope.theOrder.ITEMS[0].ZPRICE = $scope.maras[$scope.maras.findIndex(item => item.MATNR === $scope.theOrder.ITEMS[0].MATNR)].ZPRICE;
                }
                $scope.theOrder.ITEMS.forEach(async function (value, index_item) {
                    if (value === $scope.theOrder.ITEMS[0]) {
                        if ($rootScope.item_global !== '0') {
                            value.MATNR = $rootScope.item_global;
                        }
                    }
                    if (value.MATNR === material && index_item === index) {
                        value.CHARACTERISTICS = $rootScope.characters;
                    }
                    ApiQuery.post('/mapping_mara', {
                        MATNR: value.MATNR,
                        GT_CHARACTER: value.CHARACTERISTICS
                    }).then(function (res) {
                        if (res.data.E_MESSAGE !== '') {
                            bootbox.confirm({
                                title: "Đơn hàng ngoài tiêu chuẩn",
                                message: res.data.E_MESSAGE,
                                buttons: {
                                    confirm: {
                                        label: 'Xác nhận',
                                        className: 'btn-success'
                                    },
                                    cancel: {
                                        label: 'Chọn lại',
                                        className: 'btn-danger'
                                    }
                                },
                                callback: function (result) {
                                    if (result === true) {
                                        $('#myModal').modal('hide');
                                        if (res.data.MATNR_REFER !== '') {
                                            value.MATNR = res.data.MATNR_REFER;
                                            $scope.dkgh($rootScope.marasX, res.data.MATNR_REFER);

                                            ApiQuery.post('/GET_MARA', {
                                                ID_USER: $rootScope.userData.id_user,
                                                // division: res.data.RESPONSE.DIVISION,
                                                IT_MARAS: [{MATNR: res.data.MATNR_REFER}],
                                                VKORG: $rootScope.sale_org
                                            }).then(function (res_mapping) {
                                                value.EXTWG = res_mapping.data.MARAS[0].EXTWG;
                                                value.NAME = res_mapping.data.MARAS[0].MAKTX;
                                                value.ZPRICE = res_mapping.data.MARAS[0].ZPRICE;
                                            });


                                            let index_bt = $scope.theOrder.ITEMS.findIndex(item => item.check === 'bt');
                                            if (index_bt !== -1) {
                                                ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: res.data.MATNR_REFER}).then(function (response) {
                                                    $scope.theOrder.ITEMS[index_bt].CHARACTERISTICS[$scope.theOrder.ITEMS[index_bt].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_LOAI_CUA')].VALUE = response.data.GT_CHARACTER[response.data.GT_CHARACTER.findIndex(item => item.ATNAM === 'Z_LOAI_CUA')].ZVALUE;
                                                })
                                            }

                                            if (res.data.E_FLAG === '1') {
                                                $scope.theOrder.ztc = '1';
                                            } else {
                                                $scope.theOrder.ztc = '0';
                                            }
                                            ApiQuery.post('/GET_MARA', {
                                                ID_USER: $rootScope.userData.id_user,
                                                // division: res.data.RESPONSE.DIVISION,
                                                IT_MARAS: $scope.items,
                                                VKORG: $rootScope.sale_org
                                            }).then(function (res_get_mara) {
                                                $scope.maras = res_get_mara.data.MARAS;
                                            });
                                        }
                                        $scope.check_price();
                                    }
                                }
                            });
                        } else {
                            $('#myModal').modal('hide');
                            if (res.data.MATNR_REFER !== '') {
                                value.MATNR = res.data.MATNR_REFER;
                                // $scope.dkgh($rootScope.marasX, res.data.MATNR_REFER);

                                ApiQuery.post('/GET_MARA', {
                                    ID_USER: $rootScope.userData.id_user,
                                    // division: res.data.RESPONSE.DIVISION,
                                    IT_MARAS: [{MATNR: res.data.MATNR_REFER}],
                                    VKORG: $rootScope.sale_org
                                }).then(function (res_mapping) {
                                    value.EXTWG = res_mapping.data.MARAS[0].EXTWG;
                                    value.NAME = res_mapping.data.MARAS[0].MAKTX;
                                    value.ZPRICE = res_mapping.data.MARAS[0].ZPRICE;
                                });
                                let index_bt = $scope.theOrder.ITEMS.findIndex(item => item.check === 'bt');
                                if (index_bt !== -1) {
                                    ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: res.data.MATNR_REFER}).then(function (response) {
                                        $scope.theOrder.ITEMS[index_bt].CHARACTERISTICS[$scope.theOrder.ITEMS[index_bt].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_LOAI_CUA')].VALUE = response.data.GT_CHARACTER[response.data.GT_CHARACTER.findIndex(item => item.ATNAM === 'Z_LOAI_CUA')].ZVALUE;
                                    })
                                }
                                let index_kttyc = $scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_KT_TRUC0');
                                if (res.data.E_FLAG === '1' || $scope.theOrder.ITEMS[0].CHARACTERISTICS[index_kttyc].VALUE !== '') {
                                    $scope.theOrder.ztc = '1';
                                } else {
                                    $scope.theOrder.ztc = '0';
                                }
                                ApiQuery.post('/GET_MARA', {
                                    ID_USER: $rootScope.userData.id_user,
                                    // division: res.data.RESPONSE.DIVISION,
                                    IT_MARAS: $scope.items,
                                    VKORG: $rootScope.sale_org
                                }).then(function (res_get_mara) {
                                    $scope.maras = res_get_mara.data.MARAS;
                                });
                            }
                            $scope.check_price();
                        }
                    })
                });


                // $('#myModal').modal('hide');
                // if ($scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_DIEN_TICH') !== -1
                //     && $scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_WIDTH') !== -1
                //     && $scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_HEIGHT') !== -1) {
                //     $scope.theOrder.ITEMS[0].QUANTITY = $scope.theOrder.ITEMS[0].CHARACTERISTICS[$scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_DIEN_TICH')].VALUE;
                //     $scope.theOrder.ITEMS[0].WIDTH = $scope.theOrder.ITEMS[0].CHARACTERISTICS[$scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE;
                //     $scope.theOrder.ITEMS[0].HEIGHT = $scope.theOrder.ITEMS[0].CHARACTERISTICS[$scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_HEIGHT')].VALUE;
                // }
                // if ($scope.theOrder.ITEMS[index] !== undefined && $scope.theOrder.ITEMS[index].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_KT_THANH') !== -1 && $scope.theOrder.ITEMS[index].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_THANH') !== -1) {
                //     $scope.theOrder.ITEMS[index].QUANTITY = $scope.theOrder.ITEMS[index].CHARACTERISTICS[$scope.theOrder.ITEMS[index].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_KT_THANH')].VALUE * $scope.theOrder.ITEMS[index].CHARACTERISTICS[$scope.theOrder.ITEMS[index].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_THANH')].VALUE / 1000;
                // }
                // $scope.theOrder.ITEMS.forEach(function (value) {
                //     if (value.MATNR === $rootScope.material) {
                //         value.CHARACTERISTICS = $rootScope.characters;
                //     }
                // });
                // $scope.check_price();
            };

            $scope.update = function (status) {
                $scope.theOrder.ITEMS.forEach(function (value) {
                    value.TYPE = 'ORDER';
                    if (value.Z_RETURN === true) {
                        value.Z_RETURN = 1;
                        $scope.theOrder.ZTYPE = 1;
                    }
                    if (value.Z_RETURN === false) {
                        value.Z_RETURN = 2;
                    }
                });
                $scope.theOrder.Z_DATE = $scope.theDate;
                $scope.theOrder.STATUS = "P";
                $scope.theOrder.ZPRICE = ($scope.price);
                $scope.theOrder.TOTAL_PRICE = ($scope.total_price);
                $scope.theOrder.CK = ($scope.ck);
                $scope.theOrder.TAX = ($scope.tax);
                ApiQuery.post("/UPDATE_ORDER", {request: $scope.theOrder}).then(function (res) {
                    if (status !== "") {
                        $state.go('Order.confirm', {idOrder: $stateParams.idOrder});
                    } else {
                        $state.go('Order.list');

                    }
                })
            };


            //chats
            $scope.chats = function (id_order) {
                $scope.cbValue = true;
                let zmessage = {
                    id_order: id_order,
                    id_user: $rootScope.userData.id_user,
                    ZMESSAGE: "",
                    Z_TIME: ""
                };
                ApiQuery.post("/MESSAGE", {ZMESSAGE: zmessage}).then(function (res) {
                    $scope.messengers = res.data.MESSAGES;
                    $scope.messengers.forEach(function (value) {
                        if (value.ID_USER === $rootScope.userData.id_user) {
                            value.type = 'in';
                        } else {
                            value.type = 'out'
                        }
                    });
                })
            };

            $scope.loadDientichThanCua = function () {
                $rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_DIEN_TICH')].VALUE = parseInt($rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE) * parseInt($rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_HEIGHT')].VALUE);
                $rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_DIEN_TICH')].VALUE = parseFloat($rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_DIEN_TICH')].VALUE / 1000000);
                // $rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_KT_RAY0')].VALUE = parseInt($rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_HEIGHT')].VALUE) - 200;
            };

            $scope.getKeys = function ($event, id_order, message) {
                if ($event.keyCode === 13) {
                    $scope.sendMessage(id_order, message);
                }
            };

            $scope.sendMessage = function (id_order, message) {
                let date = new Date();
                let zmessage = {
                    id_order: id_order,
                    id_user: $rootScope.userData.id_user,
                    ZMESSAGE: message,
                    Z_TIME: ("0" + date.getHours()).slice(-2) + "" + ("0" + date.getMinutes()).slice(-2) + "" + ("0" + date.getSeconds()).slice(-2) + ""
                };
                $scope.message = '';
                ApiQuery.post("/MESSAGE", {ZMESSAGE: zmessage}).then(function (res) {
                    $scope.messengers = res.data.MESSAGES;
                    $scope.messengers.forEach(function (value) {
                        if (value.ID_USER === $rootScope.userData.id_user) {
                            value.type = 'in';
                        } else {
                            value.type = 'out'
                        }
                    });
                })
            };
            $scope.closeModal = function (value) {
                $scope.cbValue = false;
            }

        }]);

MetronicApp.controller('ListTemplateOrderCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {
            $rootScope.excel = {
                value: ''
            };
            $rootScope.cua_cuon = {
                value: ''
            };
            $rootScope.listConfigTem2 = [];
            ApiQuery.post('/GET_DIVISION', {}).then(function (res) {
                $scope.divisions = res.data.GT_DIVISION;
            });
            ApiQuery.post('/GET_SALE_ORG', {KUNNR: $rootScope.userData.kunnr}).then(function (res) {
                $scope.sale_orgs = res.data.GT_SALEORG;
                $scope.sale_org = $scope.sale_orgs[0].VKORG;
            });
            ApiQuery.post('/GET_DC', {KUNNR: $rootScope.userData.kunnr}).then(function (res) {
                $scope.distribution_channels = res.data.GT_DC;
                $scope.dc = $scope.distribution_channels[0].VTWEG;
            });
            $scope.loadOrder = function (division, dc) {
                ApiQuery.post("/GET_TEMP", {id_user: $rootScope.userData.id_user}).then(function (res) {
                    $scope.templates = [];
                    res.data.RES.forEach(function (value) {
                        if ((value.DIVISION === division && $scope.sale_org === '1000' && value.ORDER_TYPE === "ZI01") || (value.DIVISION === division && $scope.sale_org === '3000' && value.ORDER_TYPE === "ZI11")) {
                            $scope.templates.push(value);
                        }
                    })
                });
            };
            $rootScope.chooseTemplate = '';
            $scope.createByExcel = function (templateId, dc, sale_org) {
                $rootScope.sale_org = sale_org;
                ApiQuery.post('/UPDATE_DC_TEMP', {DC: dc, ID_TEMP: templateId}).then(function (res) {
                    if ($rootScope.excel.value === 'DHPK') {
                        $state.go('Order.createByExcelPK', {temID: templateId});
                    } else {
                        $state.go('Order.createByExcel', {temID: templateId});
                    }
                });
            };
            // $scope.createByExcelPK = function (templateId, dc, sale_org) {
            //     $rootScope.sale_org = sale_org;
            //     ApiQuery.post('/UPDATE_DC_TEMP', {DC: dc, ID_TEMP: templateId}).then(function (res) {
            //         $state.go('Order.createByExcelPK', {temID: templateId});
            //     });
            // };

            $scope.createManual = function (templateId, dc, sale_org) {
                $rootScope.sale_org = sale_org;
                let tem_index = $scope.templates.findIndex(o => o.ID_TEMPLATE === templateId);
                if (tem_index !== -1) {
                    if ((sale_org === '1000' && $scope.templates[tem_index].ORDER_TYPE === "ZI01") || (sale_org === '3000' && $scope.templates[tem_index].ORDER_TYPE === "ZI11")) {
                        ApiQuery.post('/UPDATE_DC_TEMP', {DC: dc, ID_TEMP: templateId}).then(function (res) {
                            if ($rootScope.cua_cuon.value === 'DHPK') {
                                $state.go('Order.createByExcelPK', {temID: templateId});
                            } else {
                                $state.go('Order.create', {temID: templateId});
                            }
                        });
                    } else {
                        bootbox.alert({
                            message: "Chọn lại đơn hàng mẫu",
                            callback: function () {
                                $state.reload();
                            }
                        })
                    }
                }

            }
        }]);
MetronicApp.controller('ConfirmOrderCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {
            $scope.character_group = character_group;
            let current_datetime = new Date();
            $scope.today = current_datetime.getDate() + "/" + (current_datetime.getMonth() + 1) + "/" + current_datetime.getFullYear();
            ApiQuery.post("/GET_DETAIL_ORDER", {ID_ORDER: $stateParams.idOrder}).then(async function (res) {
                $scope.theOrder = res.data.RESPONSE;
                $scope.theOrder.ITEMS.forEach(function (value) {
                    value.MATNR_DIS = value.MATNR.split('0000000000')[1];
                })
                $scope.items = res.data.RESPONSE.ITEMS;
                // $rootScope.maras = await getMaraByDivision(ApiQuery, $rootScope.userData.id_user, res.data.RESPONSE.DIVISION);
                $rootScope.maras = await getMaraByItems(ApiQuery, $rootScope.userData.id_user, res.data.RESPONSE.DIVISION, res.data.RESPONSE.ITEMS);
                let matnr = res.data.RESPONSE.ITEMS[0].MATNR;
                if (res.data.RESPONSE.DIVISION === '02') {
                    $scope.theOrder.ITEMS.forEach(function (value) {
                        if (value.kg_thanh === undefined) {
                            value.kg_thanh = parseFloat(value.CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE) / parseFloat(value.CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE);
                        }
                        $rootScope.maras.forEach(function (value2) {
                            if (value.MATNR === value2.MATNR) {
                                value.price = value2.ZPRICE;
                                if (value.CHARACTERISTICS.findIndex(o => o.ATNAM === 'Z_KL_TONG') !== -1) {
                                    if (value.SALE_UNIT === 'KG') {
                                        value.total_price = value.price * value.CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE;
                                        value.total_price = Math.round(value.total_price);
                                    } else if (value.SALE_UNIT === 'M') {
                                        value.total_price = value.price * value.CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_LUONG').VALUE;
                                        value.total_price = Math.round(value.total_price);
                                    }
                                }
                            }
                        });

                    });
                }

                ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: matnr}).then(function (res) {
                    $rootScope.characters = [];
                    $scope.items.forEach(function (value) {
                        value.CHARACTERISTICS.forEach(function (value2) {
                            res.data.DATA.forEach(function (value3) {
                                if (value3.ATNAM === value2.ATNAM) {
                                    value2.value_default = value3.VALUE2;
                                }
                            })
                        });
                        if (value.MATNR === matnr) {
                            $rootScope.characters = value.CHARACTERISTICS;
                        }
                    });
                    $scope.checkGroup = function (value) {
                        let index = $rootScope.characters.findIndex(item => item.ZGROUP === value);
                        if (index !== -1) {
                            return true;
                        }
                        return false;
                    };
                });


                ApiQuery.post('/GET_DETAIL_CUSTOMER', {KUNNR: $rootScope.userData.kunnr}).then(function (res) {
                    $scope.theOrder.name_shipto = res.data.CUSTOMER.CUSTOMER_NAME;
                    // $scope.theOrder.phone_number = res.data.CUSTOMER.SDT;
                    ApiQuery.post('/GET_DIVISION', {}).then(function (res1) {
                        $scope.division = res1.data.GT_DIVISION;

                        res.data.CUSTOMER.CZREDIT.forEach(function (value) {
                            if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                                let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                                if (index !== -1) {
                                    $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                    $scope.theOrder.credit_value = value.VALUE;
                                }
                            }
                        })
                    });
                });

                ApiQuery.post('/GET_ROUTE', {}).then(function (res) {
                    $scope.gt_t173t = res.data.GT_T173T;
                    $scope.gt_route = res.data.GT_ROUTE;
                });
            });
            $scope.approve = function () {
                document.getElementById("submit").disabled = true;
                if ($scope.theOrder.STATUS === 'L') {
                    $state.go('Order.list');
                } else {
                    ApiQuery.post("/approve_order", {
                        ID_USER: $rootScope.userData.id_user,
                        ID_ORDER: $stateParams.idOrder,
                        CHECK_CREDIT: 'X'
                    }).then(function (res) {
                        $state.go('Order.list');
                    })
                }

            };
            $scope.editOrder = function () {
                $state.go('Order.detail', {idOrder: $stateParams.idOrder});
            }

        }]);
MetronicApp.controller('CreateOrderByExcelPKCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {
            $rootScope.maras_Global = [];
            $scope.tg_dh = getTimeNow();
            if ($stateParams.temID === 0 || $stateParams.temID === '') {
                bootbox.alert({
                    message: "Mời chọn Đơn hàng mẫu!!!",
                    callback: function () {
                        $state.go('Order.list_template');
                    }
                })
            }
            $rootScope.readExcel = [];
            $scope.order = {
                DIVISION: '02',
                ITEMS: []
            };
            $scope.theOrder = {
                DIVISION: '02',
                ITEMS: []
            };


            $("#input1").on("change", function (e) {
                var file = e.target.files[0];
                $scope.filename = file.name;
                // input canceled, return
                if (!file) return;

                var FR = new FileReader();
                FR.onload = function (e) {
                    var data = new Uint8Array(e.target.result);
                    var workbook = XLSX.read(data, {type: 'array'});
                    var firstSheet = workbook.Sheets[workbook.SheetNames[0]];

                    // header: 1 instructs xlsx to create an 'array of arrays'
                    var result = XLSX.utils.sheet_to_json(firstSheet, {header: 1});

                    // data preview
                    var output = document.getElementById('input1');
                    $rootScope.readExcel = result;
                    $scope.CHARACTERISTIC = [];
                    $scope.theOrder.ITEMS = [];
                    for (let i = 0; i < $rootScope.readExcel.length; i++) {
                        if (!isNaN(parseInt($rootScope.readExcel[i][0]))) {
                            if ($rootScope.readExcel[i][8] === 0 || $rootScope.readExcel[i][8] === '' || $rootScope.readExcel[i][8] === undefined) {
                                $rootScope.readExcel.splice(i, 1);
                                i--;
                            } else {
                                if ($rootScope.readExcel[i][1].toString().length < 18) {
                                    $rootScope.readExcel[i][1] = '0000000000' + $rootScope.readExcel[i][1];
                                }
                                $scope.theOrder.ITEMS.push(
                                    {
                                        STT: $rootScope.readExcel[i][0],
                                        MATNR: $rootScope.readExcel[i][1],
                                        MATNR_DIS: $rootScope.readExcel[i][1].split('0000000000')[1],
                                        MA_GIAO_DICH: $rootScope.readExcel[i][2],
                                        NAME: $rootScope.readExcel[i][3],
                                        sale_unit: $rootScope.readExcel[i][4],
                                        MAUSAC: $rootScope.readExcel[i][5],
                                        quy_cach: $rootScope.readExcel[i][6],
                                        quy_cach_dg: $rootScope.readExcel[i][7],
                                        quantity: $rootScope.readExcel[i][8],
                                        cb_qc: $rootScope.readExcel[i][9],
                                        price: $rootScope.readExcel[i][10],
                                        total_price: $rootScope.readExcel[i][11],
                                    }
                                );
                                $scope.theOrder.ITEMS.sort((a, b) => a.STT - b.STT);
                            }

                        }
                    }
                };
                FR.readAsArrayBuffer(file);
            });

            $scope.submitUpload = function () {
                $scope.theOrder.ITEMS.sort((a, b) => a.STT - b.STT);
                $scope.order = $scope.theOrder;
                $scope.check_price();
            };


            $('.select-yourself').selectize({
                valueField: 'MATNR',
                labelField: 'MAKTX',
                searchField: 'MAKTX',
                preload: true,
                options: [],
                create: false,
                load: function (query, callback) {
                    // if (!query.length) return callback();
                    ApiQuery.post('/GET_MARA', {
                        ID_USER: $rootScope.userData.id_user
                    }).then(function (res) {
                        callback(res.data.MARAS);
                    });
                }
            });

            $scope.disable = false;
            $scope.myConfig2 = {
                maxItems: 1,
                valueField: 'MATNR',
                labelField: 'MAKTX',
                searchField: 'MAKTX',
                preload: true,
                options: [],
                dropdownParent: 'body',
                create: false,
                load: function (query, callback) {
                    // if (!query.length) return callback();
                    ApiQuery.post('/GET_MARA', {
                        ID_USER: $rootScope.userData.id_user
                    }).then(function (res) {
                        $scope.maras = res.data.MARAS;
                        callback(res.data.MARAS);
                    });
                }

            };


            $scope.addressOption = '';
            $scope.character_group = character_group;
            let current_datetime = moment();
            $scope.today = current_datetime.format('DD/MM/YYYY');
            $scope.gt_route = [];
            ApiQuery.post('/GET_ROUTE', {}).then(function (res) {
                $scope.gt_t173t = res.data.GT_T173T;
            });
            $scope.loadRoute = function (VSART) {
                $scope.gt_route = [];
                ApiQuery.post('/GET_ROUTE', {}).then(function (res) {
                    res.data.GT_ROUTE.forEach(function (value) {
                        if (value.VSART === VSART) {
                            $scope.gt_route.push(value);
                        }
                    })
                });
            };

            $scope.check_price = function () {
                $scope.theOrder.ITEMS.forEach(function (value) {
                    value.TYPE = 'ORDER';
                    value.MATNR = value.MATNR.toString();
                    if (value.MATNR.length < 18) {
                        value.MATNR = '0000000000' + value.MATNR.toString();
                    }
                });
                ApiQuery.post('/check_price', {
                    request: $scope.theOrder,
                    ID_USER: $rootScope.userData.id_user
                }).then(function (res) {
                    $scope.ET_KONV = res.data.ET_KONV;
                    // $scope.price = res.data.NET_VALUE;
                    $scope.ck = Math.round(res.data.CK);
                    $scope.tax = Math.round(res.data.TAX);
                    $scope.stdbl = Math.round(res.data.STDBL);

                    $scope.total_price = Math.round(res.data.TGTDH);

                    $scope.price_after_ck = $scope.total_price - $scope.ck;
                    $scope.price = $scope.total_price - $scope.ck + $scope.tax;
                    $scope.total_inquiry = res.data.TOTAL_INQUIRY;
                    $scope.theOrder.ITEMS.forEach(function (value) {
                        // value.QUANTITY = value.QUANTITY.toString();
                    });
                });
            };

            ApiQuery.post('/GET_PAYMENT_TERMS').then(function (res) {
                $scope.paymentTerms = [];
                if (res.data.RETURN.TYPE === "S") {
                    $scope.paymentTerms = res.data.GT_PAYMENT_TERM;
                }
            });


            ApiQuery.post('/GET_DIVISION', {}).then(function (res) {
                $scope.division = res.data.GT_DIVISION;
            });
            ApiQuery.post('/GET_DC', {}).then(function (res) {
                $scope.dc = res.data.GT_DC;
            });

            ApiQuery.post('/GET_ORDER_TYPE').then(function (res) {
                if (res.data.RETURN.TYPE === "S") {
                    $scope.orderTypes = res.data.GT_ORDER_TYPE;
                }
            });


            ApiQuery.post('/GET_DETAIL_TEMP', {ID_TEMP: $stateParams.temID}).then(function (res) {
                res.data.RESPONSE.ITEMS.forEach(function (value) {
                    // value.QUANTITY = value.QUANTITY.replace(/^0*/g, '');
                    value.thanh_le = 0;
                    if (value.Z_RETURN === "1") {
                        value.Z_RETURN = true;
                    }
                    if (value.Z_RETURN === "2") {
                        value.Z_RETURN = false;
                    }
                    if (value.CHARACTERISTICS.length > 0) {
                        value.CHARACTERISTICS.forEach(function (val) {
                            if (val.ATNAM === 'Z_KT_THANH') {
                                val.VALUE = 6;
                                value.kg_thanh = parseFloat(value.CHARACTERISTICS.find(o => o.ATNAM === 'Z_TY_TRONG').VALUE.replace(/,/, '.')) * val.VALUE;
                                value.kg_thanh = value.kg_thanh.toFixed(3);
                            }
                        })
                    }
                });
                res.data.RESPONSE.ITEMS = [];
                $scope.theOrder = res.data.RESPONSE;
                // $scope.theOrder.ITEMS = [];
                ApiQuery.post('/GET_DETAIL_CUSTOMER', {KUNNR: $rootScope.userData.kunnr}).then(function (res) {
                    $scope.theOrder.name_shipto = res.data.CUSTOMER.KUNNR + ' - ' + res.data.CUSTOMER.CUSTOMER_NAME + ' - ' + res.data.CUSTOMER.CITY;
                    // $scope.theOrder.phone_number = res.data.CUSTOMER.SDT;
                    $scope.address = res.data.CUSTOMER.ADDRESS;
                    $scope.route = res.data.CUSTOMER.ROUTE;
                    $scope.vsart = res.data.CUSTOMER.VSART;
                    $scope.gt_route = [];
                    ApiQuery.post('/GET_ROUTE', {}).then(function (res) {
                        res.data.GT_ROUTE.forEach(function (value) {
                            if (value.VSART === $scope.vsart) {
                                $scope.gt_route.push(value);
                            }
                        })
                    });
                    res.data.CUSTOMER.CZREDIT.forEach(function (value) {
                        if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                            let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                            if (index !== -1) {
                                $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                $scope.theOrder.credit_value = Math.round(value.VALUE);
                            }
                        }
                    });
                    res.data.CUSTOMER.ZCREDIT_CUS.forEach(function (value) {
                        if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                            let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                            if (index !== -1) {
                                $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                $scope.theOrder.credit_value_cus = Math.round(value.Z_AMOUNT_L);
                            }
                        }
                    })
                });

                $scope.items = res.data.RESPONSE.ITEMS;
                if ($scope.theOrder.DIVISION !== '02') {
                    $('#myModal').modal('show');
                }
                ApiQuery.post('/GET_MARA', {
                    ID_USER: $rootScope.userData.id_user,
                    division: res.data.RESPONSE.DIVISION,
                    VKORG: $rootScope.sale_org
                }).then(function (res) {
                    $scope.maras = res.data.MARAS;
                    $scope.items.forEach(function (value1) {
                        $scope.maras.forEach(function (value2) {
                            if (value1.MATNR === value2.MATNR) {
                                value1.price = value2.ZPRICE;
                            }
                        })
                    })
                });
            });


            $scope.edit = function (matnr) {
                $('#myModal').modal('show');
                ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: matnr}).then(function (res) {
                    $rootScope.characters = [];
                    $scope.items.forEach(function (value) {
                        value.CHARACTERISTICS.forEach(function (value2) {
                            res.data.DATA.forEach(function (value3) {
                                if (value3.ATNAM === value2.ATNAM) {
                                    value2.value_default = value3.VALUE2;
                                }
                            })
                        });
                        if (value.MATNR === matnr) {
                            $rootScope.characters = value.CHARACTERISTICS;
                        }
                    });
                    $scope.checkGroup = function (value) {
                        let index = $rootScope.characters.findIndex(item => item.ZGROUP === value);
                        if (index !== -1) {
                            return true;
                        }
                        return false;
                    }
                });
            };

            $scope.loadAddress = function (value) {
                switch (value) {
                    case "1":
                        $scope.address = "";
                        $scope.vsart = '';
                        $scope.route = '';
                        break;
                    case "":
                        ApiQuery.post('/GET_DETAIL_CUSTOMER', {KUNNR: $rootScope.userData.kunnr}).then(function (res) {
                            $scope.theOrder.name_shipto = res.data.CUSTOMER.KUNNR + ' - ' + res.data.CUSTOMER.CUSTOMER_NAME + ' - ' + res.data.CUSTOMER.CITY;
                            // $scope.theOrder.phone_number = res.data.CUSTOMER.SDT;
                            $scope.address = res.data.CUSTOMER.ADDRESS;
                            $scope.route = res.data.CUSTOMER.ROUTE;
                            $scope.vsart = res.data.CUSTOMER.VSART;
                            // $scope.gt_route = [];
                            ApiQuery.post('/GET_ROUTE', {}).then(function (res) {
                                res.data.GT_ROUTE.forEach(function (value) {
                                    if (value.VSART === $scope.vsart) {
                                        $scope.gt_route.push(value);
                                    }
                                })
                            });
                            res.data.CUSTOMER.CZREDIT.forEach(function (value) {
                                if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                                    let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                                    if (index !== -1) {
                                        $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                        $scope.theOrder.credit_value = Math.round(value.VALUE);
                                    }
                                }
                            });
                            res.data.CUSTOMER.ZCREDIT_CUS.forEach(function (value) {
                                if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                                    let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                                    if (index !== -1) {
                                        $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                        $scope.theOrder.credit_value_cus = Math.round(value.Z_AMOUNT_L);
                                    }
                                }
                            })
                        });
                        break;
                }
            };

            $scope.submitFile = function (character) {
                ApiQuery.post("/GET_EXPORT_EXCEL", {
                    CHARACTERISTIC: character,
                    ID_USER: $rootScope.userData.id_user
                }).then(function (res) {
                    $scope.urlHref = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + res.data.ZRAWDATA;
                    window.open($scope.urlHref, "_blank");
                    $scope.urlHref = '';
                });

            };

            $scope.submitPopup = function () {
                $('#myModal').modal('hide');
                $scope.theOrder.ITEMS.forEach(function (value) {
                    if (value.MATNR === $rootScope.material) {
                        value.CHARACTERISTICS = $rootScope.characters;

                    }
                    ApiQuery.post('/mapping_mara', {
                        MATNR: value.MATNR,
                        GT_CHARACTER: value.CHARACTERISTICS
                    }).then(function (res) {
                        if (res.data.MATNR_REFER !== '') {
                            value.MATNR = res.data.MATNR_REFER;
                            let index = $scope.maras.findIndex(item => item.MATNR === value.MATNR);
                            if (index !== -1) {
                                value.NAME = $scope.maras[index].MAKTX;
                            }
                        }
                        $scope.check_price();
                    })
                });

            };

            ApiQuery.post('/GET_ORDER_TYPE').then(function (res) {
                if (res.data.RETURN.TYPE === "S") {
                    $scope.orderTypes = res.data.GT_ORDER_TYPE;
                }
            });

            $scope.addNew = function () {
                $scope.theOrder.ITEMS.push({
                    ID: $scope.theOrder.ITEMS.length + 1,
                    id_user: $rootScope.userData.id_user,
                    MATNR: 0,
                    NAME: '',
                    MATNR: 0,
                    ZTERM: '',
                    QUANTITY: 0,
                    SALE_UNIT: "",
                    Z_RETURN: false
                })
            };

            $scope.loadUnit = function (index, matnr) {
                $scope.maras.forEach(function (value) {
                    if (value.MATNR === matnr) {
                        $scope.theOrder.ITEMS[index].NAME = value.MAKTG;
                        $scope.theOrder.ITEMS[index].SALE_UNIT = value.MEINS;
                        if (value.LABOR === '002') {
                            $scope.theOrder.ITEMS[index].Z_RETURN = true;
                        } else {
                            $scope.theOrder.ITEMS[index].Z_RETURN = false;
                        }
                    }
                })
            };

            $scope.cancel = function () {

                $state.go('Order.list');
            };
            $scope.open = function () {
                $scope.IsVisible = true;
            };

            $scope.save = function () {
                console.log($scope.listTems);
            };

            $scope.delTem = function (temID) {
                $scope.theOrder.ITEMS.splice(temID, 1);
            };
            $scope.theDate = '';

            $scope._rule = {
                date: "required"

            };
            $scope._msg = {
                date: "Choose Date"
            };
            $scope.thanh_le = 0;
            $scope.loadValue = function (matnr) {

                let index = $scope.theOrder.ITEMS.findIndex(item => item.MATNR === matnr);
                if (index !== -1) {
                    if ($scope.theOrder.ITEMS[index].thanh_le === undefined) {
                        $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE = $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_BOS').VALUE * parseInt($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_HS_BO').VALUE);
                    } else {
                        $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE = $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_BOS').VALUE * parseInt($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_HS_BO').VALUE) + parseInt($scope.theOrder.ITEMS[index].thanh_le);
                    }
                    $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_LUONG').VALUE = Math.round($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE * parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KT_THANH').VALUE));
                    $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE = $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE * parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_TY_TRONG').VALUE.replace(/,/, '.')) * parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KT_THANH').VALUE);
                    $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE = $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE.toFixed(3);
                    if ($scope.theOrder.ITEMS[index].SALE_UNIT === 'KG') {
                        $scope.theOrder.ITEMS[index].total_price = $scope.theOrder.ITEMS[index].price * $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE;
                        $scope.theOrder.ITEMS[index].total_price = Math.round($scope.theOrder.ITEMS[index].total_price);
                    } else if ($scope.theOrder.ITEMS[index].SALE_UNIT === 'M') {
                        $scope.theOrder.ITEMS[index].total_price = $scope.theOrder.ITEMS[index].price * $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_LUONG').VALUE;
                        $scope.theOrder.ITEMS[index].total_price = Math.round($scope.theOrder.ITEMS[index].total_price);

                    }
                    $scope.theOrder.ITEMS[index].kg_thanh = parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_TY_TRONG').VALUE.replace(/,/, '.')) * parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KT_THANH').VALUE);
                    $scope.theOrder.ITEMS[index].kg_thanh = $scope.theOrder.ITEMS[index].kg_thanh.toFixed(3);
                    $scope.check_price();
                }
                ;

            };


            $scope.submit = function (status) {
                if ($scope.vsart === undefined || $scope.vsart === '' || $scope.route === undefined || $scope.route === '') {
                    bootbox.alert({
                        message: "Chọn địa điểm giao hàng",
                    })
                } else {
                    if ($scope.theDate !== '') {
                        for (let i = 0; i < $scope.theOrder.ITEMS.length; i++) {
                            if ($scope.theOrder.ITEMS[i].quantity === undefined || $scope.theOrder.ITEMS[i].quantity === 0) {
                                $scope.theOrder.ITEMS.splice(i, 1);
                                i--;
                            }
                        }
                        $scope.theOrder.ITEMS.forEach(function (value) {
                            value.TYPE = 'ORDER';
                            if (value.Z_RETURN === true) {
                                value.Z_RETURN = 1;
                            }
                            if (value.Z_RETURN === false) {
                                value.Z_RETURN = 2;
                            }
                        });
                        $scope.theOrder.STATUS = "P";
                        $scope.theOrder.Z_DATE = $scope.theDate;
                        $scope.theOrder.ZPRICE = $scope.price;
                        $scope.theOrder.TOTAL_PRICE = $scope.total_price;
                        $scope.theOrder.CK = $scope.ck;
                        $scope.theOrder.TAX = $scope.tax;
                        $scope.theOrder.TODAY = $scope.today;
                        $scope.theOrder.TOTAL_INQUIRY = $scope.total_inquiry;
                        $scope.theOrder.address = $scope.address;
                        $scope.theOrder.vsart = $scope.vsart;
                        $scope.theOrder.route = $scope.route;
                        $scope.theOrder.ZPK = 'Y';

                        ApiQuery.post('/CREATE_ORDER', {
                            request: $scope.theOrder,
                            CHECK_ROUTE: $scope.addressOption
                        }).then(function (res) {
                            if (res.data.RETURN.TYPE === 'S') {
                                if (status !== '') {
                                    $state.go('Order.confirm', {idOrder: res.data.ID_ORDER});
                                } else {
                                    $state.go('Order.list');
                                }
                            }
                        });
                    } else {
                        bootbox.alert({
                            message: "Chưa chọn ngày yêu cầu giao hàng!!!",
                            callback: function () {
                            }
                        })
                    }
                }

            }

        }]).directive('dateFormatter', [
    function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function postLink(scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (data) {
                    var out = moment(data).format('YYYYMMDD');
                    return out;
                });

                ngModel.$formatters.push(function (data) {
                    var out = moment(data, 'YYYYMMDD').toDate();
                    return out;
                });
            }
        };
    }
]);
MetronicApp.controller('CreateOrderByExcelCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {
            $rootScope.maras_Global = [];
            $scope.tg_dh = getTimeNow();
            if ($stateParams.temID === 0 || $stateParams.temID === '') {
                bootbox.alert({
                    message: "Mời chọn Đơn hàng mẫu!!!",
                    callback: function () {
                        $state.go('Order.list_template');
                    }
                })
            }
            $rootScope.readExcel = [];
            $scope.order = {
                DIVISION: '02',
                ITEMS: []
            };
            $scope.theOrder = {
                DIVISION: '02',
                ITEMS: []
            };


            $("#input1").on("change", function (e) {
                var file = e.target.files[0];
                // input canceled, return
                $scope.filename = file.name;
                if (!file) return;

                var FR = new FileReader();
                FR.onload = function (e) {
                    var data = new Uint8Array(e.target.result);
                    var workbook = XLSX.read(data, {type: 'array'});
                    var firstSheet = workbook.Sheets[workbook.SheetNames[0]];

                    // header: 1 instructs xlsx to create an 'array of arrays'
                    var result = XLSX.utils.sheet_to_json(firstSheet, {header: 1});

                    // data preview
                    var output = document.getElementById('input1');
                    $rootScope.readExcel = result;
                    $scope.CHARACTERISTIC = [];
                    $scope.theOrder.ITEMS = [];
                    for (let i = 0; i < $rootScope.readExcel.length; i++) {
                        if (!isNaN(parseInt($rootScope.readExcel[i][0]))) {
                            if ($rootScope.readExcel[i][10] === 0) {
                                $rootScope.readExcel.splice(i, 1);
                                i--;
                            } else {
                                if ($rootScope.readExcel[i][1].toString().length < 18) {
                                    $rootScope.readExcel[i][1] = '0000000000' + $rootScope.readExcel[i][1];
                                }
                                ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: $rootScope.readExcel[i][1]}).then(function (res) {
                                    res.data.DATA.forEach(function (value) {
                                        switch (value.ATNAM) {
                                            case "Z_KT_THANH":

                                                $scope.CHARACTERISTIC.push(
                                                    {
                                                        ATNAM: 'Z_KT_THANH',
                                                        VALUE: $rootScope.readExcel[i][5],
                                                        ZGROUP: "01"
                                                    });
                                                break;
                                            case "Z_HS_BO":

                                                $scope.CHARACTERISTIC.push(
                                                    {
                                                        ATNAM: 'Z_HS_BO',
                                                        VALUE: $rootScope.readExcel[i][7],
                                                        ZGROUP: "01"
                                                    });
                                                break;
                                            case "Z_BOS":
                                                $scope.CHARACTERISTIC.push(
                                                    {
                                                        ATNAM: 'Z_BOS',
                                                        VALUE: $rootScope.readExcel[i][8],
                                                        ZGROUP: "01"
                                                    })
                                                break;

                                            case "Z_SO_THANH":
                                                $scope.CHARACTERISTIC.push(
                                                    {
                                                        ATNAM: 'Z_SO_THANH',
                                                        VALUE: $rootScope.readExcel[i][10],
                                                        ZGROUP: "01"
                                                    })
                                                break;
                                            case "Z_SO_LUONG":
                                                $scope.CHARACTERISTIC.push(
                                                    {
                                                        ATNAM: 'Z_SO_LUONG',
                                                        VALUE: $rootScope.readExcel[i][11],
                                                        ZGROUP: "01"
                                                    })
                                                break;
                                            case "Z_KL_TONG":
                                                $scope.CHARACTERISTIC.push(
                                                    {
                                                        ATNAM: 'Z_KL_TONG',
                                                        VALUE: $rootScope.readExcel[i][12],
                                                        ZGROUP: "01"
                                                    });
                                                break;
                                            default:
                                                $scope.CHARACTERISTIC.push(
                                                    {
                                                        ATNAM: value.ATNAM,
                                                        VALUE: "",
                                                        ZGROUP: "01"
                                                    }
                                                )

                                        }
                                    });
                                    $scope.theOrder.ITEMS.push(
                                        {
                                            STT: $rootScope.readExcel[i][0],
                                            MATNR: $rootScope.readExcel[i][1],
                                            MATNR_DIS: $rootScope.readExcel[i][1].split('0000000000')[1],
                                            MA_GIAO_DICH: $rootScope.readExcel[i][2],
                                            MAUSAC: $rootScope.readExcel[i][3],
                                            NAME: $rootScope.readExcel[i][4],
                                            CHARACTERISTICS: $scope.CHARACTERISTIC,
                                            kg_thanh: $rootScope.readExcel[i][6],
                                            thanh_le: $rootScope.readExcel[i][9],
                                            price: $rootScope.readExcel[i][13],
                                            sale_unit: $rootScope.readExcel[i][14],
                                            total_price: $rootScope.readExcel[i][15],
                                        }
                                    );
                                    $scope.CHARACTERISTIC = [];
                                    $scope.theOrder.ITEMS.sort((a, b) => a.STT - b.STT);
                                }, 1000);
                            }
                        }
                    }
                };
                FR.readAsArrayBuffer(file);
            });

            $scope.submitUpload = function () {
                $scope.theOrder.ITEMS.sort((a, b) => a.STT - b.STT);
                $scope.order = $scope.theOrder;
                $scope.check_price();
            };


            $('.select-yourself').selectize({
                valueField: 'MATNR',
                labelField: 'MAKTX',
                searchField: 'MAKTX',
                preload: true,
                options: [],
                create: false,
                load: function (query, callback) {
                    // if (!query.length) return callback();
                    ApiQuery.post('/GET_MARA', {
                        ID_USER: $rootScope.userData.id_user
                    }).then(function (res) {
                        callback(res.data.MARAS);
                    });
                }
            });

            $scope.disable = false;
            $scope.myConfig2 = {
                maxItems: 1,
                valueField: 'MATNR',
                labelField: 'MAKTX',
                searchField: 'MAKTX',
                preload: true,
                options: [],
                dropdownParent: 'body',
                create: false,
                load: function (query, callback) {
                    // if (!query.length) return callback();
                    ApiQuery.post('/GET_MARA', {
                        ID_USER: $rootScope.userData.id_user
                    }).then(function (res) {
                        $scope.maras = res.data.MARAS;
                        callback(res.data.MARAS);
                    });
                }

            };


            $scope.addressOption = '';
            $scope.character_group = character_group;
            let current_datetime = moment();
            $scope.today = current_datetime.format('DD/MM/YYYY');
            // let current_datetime = new Date();
            // $scope.today = current_datetime.getDate() + "/" + (current_datetime.getMonth() + 1) + "/" + current_datetime.getFullYear();
            $scope.gt_route = [];
            ApiQuery.post('/GET_ROUTE', {}).then(function (res) {
                $scope.gt_t173t = res.data.GT_T173T;
            });
            $scope.loadRoute = function (VSART) {
                $scope.gt_route = [];
                ApiQuery.post('/GET_ROUTE', {}).then(function (res) {
                    res.data.GT_ROUTE.forEach(function (value) {
                        if (value.VSART === VSART) {
                            $scope.gt_route.push(value);
                        }
                    })
                });
            };

            $scope.check_price = function () {
                $scope.theOrder.ITEMS.forEach(function (value) {
                    value.TYPE = 'ORDER';
                    value.MATNR = value.MATNR.toString();
                    if (value.MATNR.length < 18) {
                        value.MATNR = '0000000000' + value.MATNR.toString();
                    }
                });
                ApiQuery.post('/check_price', {
                    request: $scope.theOrder,
                    ID_USER: $rootScope.userData.id_user
                }).then(function (res) {
                    $scope.ET_KONV = res.data.ET_KONV;
                    // $scope.price = res.data.NET_VALUE;
                    $scope.ck = Math.round(res.data.CK);
                    $scope.tax = Math.round(res.data.TAX);
                    $scope.stdbl = Math.round(res.data.STDBL);

                    $scope.total_price = Math.round(res.data.TGTDH);

                    $scope.price_after_ck = $scope.total_price - $scope.ck;
                    $scope.price = $scope.total_price - $scope.ck + $scope.tax;
                    $scope.total_inquiry = res.data.TOTAL_INQUIRY;
                    $scope.theOrder.ITEMS.forEach(function (value) {
                        // value.QUANTITY = value.QUANTITY.toString();
                    });
                });
            };

            ApiQuery.post('/GET_PAYMENT_TERMS').then(function (res) {
                $scope.paymentTerms = [];
                if (res.data.RETURN.TYPE === "S") {
                    $scope.paymentTerms = res.data.GT_PAYMENT_TERM;
                }
            });


            ApiQuery.post('/GET_DIVISION', {}).then(function (res) {
                $scope.division = res.data.GT_DIVISION;
            });
            ApiQuery.post('/GET_DC', {}).then(function (res) {
                $scope.dc = res.data.GT_DC;
            });

            ApiQuery.post('/GET_ORDER_TYPE').then(function (res) {
                if (res.data.RETURN.TYPE === "S") {
                    $scope.orderTypes = res.data.GT_ORDER_TYPE;
                }
            });


            ApiQuery.post('/GET_DETAIL_TEMP', {ID_TEMP: $stateParams.temID}).then(function (res) {
                res.data.RESPONSE.ITEMS.forEach(function (value) {
                    // value.QUANTITY = value.QUANTITY.replace(/^0*/g, '');
                    value.thanh_le = 0;
                    if (value.Z_RETURN === "1") {
                        value.Z_RETURN = true;
                    }
                    if (value.Z_RETURN === "2") {
                        value.Z_RETURN = false;
                    }
                    if (value.CHARACTERISTICS.length > 0) {
                        value.CHARACTERISTICS.forEach(function (val) {
                            if (val.ATNAM === 'Z_KT_THANH') {
                                val.VALUE = 6;
                                value.kg_thanh = parseFloat(value.CHARACTERISTICS.find(o => o.ATNAM === 'Z_TY_TRONG').VALUE.replace(/,/, '.')) * val.VALUE;
                                value.kg_thanh = value.kg_thanh.toFixed(3);
                            }
                        })
                    }
                });
                res.data.RESPONSE.ITEMS = [];
                $scope.theOrder = res.data.RESPONSE;
                // $scope.theOrder.ITEMS = [];
                ApiQuery.post('/GET_DETAIL_CUSTOMER', {KUNNR: $rootScope.userData.kunnr}).then(function (res) {
                    $scope.theOrder.name_shipto = res.data.CUSTOMER.KUNNR + ' - ' + res.data.CUSTOMER.CUSTOMER_NAME + ' - ' + res.data.CUSTOMER.CITY;
                    // $scope.theOrder.phone_number = res.data.CUSTOMER.SDT;
                    $scope.address = res.data.CUSTOMER.ADDRESS;
                    $scope.route = res.data.CUSTOMER.ROUTE;
                    $scope.vsart = res.data.CUSTOMER.VSART;
                    $scope.gt_route = [];
                    ApiQuery.post('/GET_ROUTE', {}).then(function (res) {
                        res.data.GT_ROUTE.forEach(function (value) {
                            if (value.VSART === $scope.vsart) {
                                $scope.gt_route.push(value);
                            }
                        })
                    });
                    res.data.CUSTOMER.CZREDIT.forEach(function (value) {
                        if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                            let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                            if (index !== -1) {
                                $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                $scope.theOrder.credit_value = Math.round(value.VALUE);
                            }
                        }
                    });
                    res.data.CUSTOMER.ZCREDIT_CUS.forEach(function (value) {
                        if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                            let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                            if (index !== -1) {
                                $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                $scope.theOrder.credit_value_cus = Math.round(value.Z_AMOUNT_L);
                            }
                        }
                    })
                });

                $scope.items = res.data.RESPONSE.ITEMS;
                if ($scope.theOrder.DIVISION !== '02') {
                    $('#myModal').modal('show');
                }
                ApiQuery.post('/GET_MARA', {
                    ID_USER: $rootScope.userData.id_user,
                    division: res.data.RESPONSE.DIVISION,
                    VKORG: $rootScope.sale_org
                }).then(function (res) {
                    $scope.maras = res.data.MARAS;
                    $scope.items.forEach(function (value1) {
                        $scope.maras.forEach(function (value2) {
                            if (value1.MATNR === value2.MATNR) {
                                value1.price = value2.ZPRICE;
                            }
                        })
                    })
                });
            });


            $scope.edit = function (matnr) {
                $('#myModal').modal('show');
                ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: matnr}).then(function (res) {
                    $rootScope.characters = [];
                    $scope.items.forEach(function (value) {
                        value.CHARACTERISTICS.forEach(function (value2) {
                            res.data.DATA.forEach(function (value3) {
                                if (value3.ATNAM === value2.ATNAM) {
                                    value2.value_default = value3.VALUE2;
                                }
                            })
                        });
                        if (value.MATNR === matnr) {
                            $rootScope.characters = value.CHARACTERISTICS;
                        }
                    });
                    $scope.checkGroup = function (value) {
                        let index = $rootScope.characters.findIndex(item => item.ZGROUP === value);
                        if (index !== -1) {
                            return true;
                        }
                        return false;
                    }
                });
            };

            $scope.loadAddress = function (value) {
                switch (value) {
                    case "1":
                        $scope.address = "";
                        $scope.vsart = '';
                        $scope.route = '';
                        break;
                    case "":
                        ApiQuery.post('/GET_DETAIL_CUSTOMER', {KUNNR: $rootScope.userData.kunnr}).then(function (res) {
                            $scope.theOrder.name_shipto = res.data.CUSTOMER.KUNNR + ' - ' + res.data.CUSTOMER.CUSTOMER_NAME + ' - ' + res.data.CUSTOMER.CITY;
                            // $scope.theOrder.phone_number = res.data.CUSTOMER.SDT;
                            $scope.address = res.data.CUSTOMER.ADDRESS;
                            $scope.route = res.data.CUSTOMER.ROUTE;
                            $scope.vsart = res.data.CUSTOMER.VSART;
                            // $scope.gt_route = [];
                            ApiQuery.post('/GET_ROUTE', {}).then(function (res) {
                                res.data.GT_ROUTE.forEach(function (value) {
                                    if (value.VSART === $scope.vsart) {
                                        $scope.gt_route.push(value);
                                    }
                                })
                            });
                            res.data.CUSTOMER.CZREDIT.forEach(function (value) {
                                if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                                    let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                                    if (index !== -1) {
                                        $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                        $scope.theOrder.credit_value = Math.round(value.VALUE);
                                    }
                                }
                            });
                            res.data.CUSTOMER.ZCREDIT_CUS.forEach(function (value) {
                                if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                                    let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                                    if (index !== -1) {
                                        $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                        $scope.theOrder.credit_value_cus = Math.round(value.Z_AMOUNT_L);
                                    }
                                }
                            })
                        });
                        break;
                }
            };

            $scope.submitFile = function (character) {
                ApiQuery.post("/GET_EXPORT_EXCEL", {
                    CHARACTERISTIC: character,
                    ID_USER: $rootScope.userData.id_user,
                    KUNNR: $rootScope.userData.kunnr,
                    VKORG: $rootScope.sale_org
                }).then(function (res) {
                    let current_datetime = moment();
                    $scope.today = current_datetime.format('YYYYMMDD');
                    saveAs("data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + res.data.ZRAWDATA, "ADG_Maunhomhe_" + character + "_" + $scope.today + ".xlsx");
                    // $scope.urlHref = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + res.data.ZRAWDATA;
                    // window.open($scope.urlHref, "_blank", "ADG_Maunhomhe_XINGFA_yyyymmdd");
                    // $scope.urlHref = '';
                });

            };

            $scope.submitPopup = function () {
                $('#myModal').modal('hide');
                $scope.theOrder.ITEMS.forEach(function (value) {
                    if (value.MATNR === $rootScope.material) {
                        value.CHARACTERISTICS = $rootScope.characters;

                    }
                    ApiQuery.post('/mapping_mara', {
                        MATNR: value.MATNR,
                        GT_CHARACTER: value.CHARACTERISTICS
                    }).then(function (res) {
                        if (res.data.MATNR_REFER !== '') {
                            value.MATNR = res.data.MATNR_REFER;
                            let index = $scope.maras.findIndex(item => item.MATNR === value.MATNR);
                            if (index !== -1) {
                                value.NAME = $scope.maras[index].MAKTX;
                            }
                        }
                        $scope.check_price();
                    })
                });

            };

            ApiQuery.post('/GET_ORDER_TYPE').then(function (res) {
                if (res.data.RETURN.TYPE === "S") {
                    $scope.orderTypes = res.data.GT_ORDER_TYPE;
                }
            });

            $scope.addNew = function () {
                $scope.theOrder.ITEMS.push({
                    ID: $scope.theOrder.ITEMS.length + 1,
                    id_user: $rootScope.userData.id_user,
                    MATNR: 0,
                    NAME: '',
                    MATNR: 0,
                    ZTERM: '',
                    QUANTITY: 0,
                    SALE_UNIT: "",
                    Z_RETURN: false
                })
            };

            $scope.loadUnit = function (index, matnr) {
                $scope.maras.forEach(function (value) {
                    if (value.MATNR === matnr) {
                        $scope.theOrder.ITEMS[index].NAME = value.MAKTG;
                        $scope.theOrder.ITEMS[index].SALE_UNIT = value.MEINS;
                        if (value.LABOR === '002') {
                            $scope.theOrder.ITEMS[index].Z_RETURN = true;
                        } else {
                            $scope.theOrder.ITEMS[index].Z_RETURN = false;
                        }
                    }
                })
            };

            $scope.cancel = function () {

                $state.go('Order.list');
            };
            $scope.open = function () {
                $scope.IsVisible = true;
            };

            $scope.save = function () {
                console.log($scope.listTems);
            };

            $scope.delTem = function (temID) {
                $scope.theOrder.ITEMS.splice(temID, 1);
            };
            $scope.theDate = '';

            $scope._rule = {
                date: "required"

            };
            $scope._msg = {
                date: "Choose Date"
            };
            $scope.thanh_le = 0;
            $scope.loadValue = function (matnr) {

                let index = $scope.theOrder.ITEMS.findIndex(item => item.MATNR === matnr);
                if (index !== -1) {
                    if ($scope.theOrder.ITEMS[index].thanh_le === undefined) {
                        $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE = $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_BOS').VALUE * parseInt($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_HS_BO').VALUE);
                    } else {
                        $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE = $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_BOS').VALUE * parseInt($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_HS_BO').VALUE) + parseInt($scope.theOrder.ITEMS[index].thanh_le);
                    }
                    $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_LUONG').VALUE = Math.round($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE * parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KT_THANH').VALUE));
                    $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE = $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE * parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_TY_TRONG').VALUE.replace(/,/, '.')) * parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KT_THANH').VALUE);
                    $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE = $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE.toFixed(3);
                    if ($scope.theOrder.ITEMS[index].SALE_UNIT === 'KG') {
                        $scope.theOrder.ITEMS[index].total_price = $scope.theOrder.ITEMS[index].price * $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE;
                        $scope.theOrder.ITEMS[index].total_price = Math.round($scope.theOrder.ITEMS[index].total_price);
                    } else if ($scope.theOrder.ITEMS[index].SALE_UNIT === 'M') {
                        $scope.theOrder.ITEMS[index].total_price = $scope.theOrder.ITEMS[index].price * $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_LUONG').VALUE;
                        $scope.theOrder.ITEMS[index].total_price = Math.round($scope.theOrder.ITEMS[index].total_price);

                    }
                    $scope.theOrder.ITEMS[index].kg_thanh = parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_TY_TRONG').VALUE.replace(/,/, '.')) * parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KT_THANH').VALUE);
                    $scope.theOrder.ITEMS[index].kg_thanh = $scope.theOrder.ITEMS[index].kg_thanh.toFixed(3);
                    $scope.check_price();
                }
                ;

            };


            $scope.submit = function (status) {
                if ($scope.vsart === undefined || $scope.vsart === '' || $scope.route === undefined || $scope.route === '') {
                    bootbox.alert({
                        message: "Chọn địa điểm giao hàng",
                    })
                } else {
                    $scope.theOrder.ITEMS.forEach(function (value) {
                        value.TYPE = 'ORDER';
                        if (value.Z_RETURN === true) {
                            value.Z_RETURN = 1;
                        }
                        if (value.Z_RETURN === false) {
                            value.Z_RETURN = 2;
                        }
                    });
                    $scope.theOrder.STATUS = "P";
                    $scope.theOrder.Z_DATE = $scope.theDate;
                    $scope.theOrder.ZPRICE = $scope.price;
                    $scope.theOrder.TOTAL_PRICE = $scope.total_price;
                    $scope.theOrder.CK = $scope.ck;
                    $scope.theOrder.TAX = $scope.tax;
                    $scope.theOrder.TODAY = $scope.today;
                    $scope.theOrder.TOTAL_INQUIRY = $scope.total_inquiry;
                    $scope.theOrder.address = $scope.address;
                    $scope.theOrder.vsart = $scope.vsart;
                    $scope.theOrder.route = $scope.route;
                    if ($scope.theOrder.DIVISION === '02') {
                        $scope.theOrder.ITEMS.forEach(function (value) {
                            if (value.CHARACTERISTICS.find(o => o.ATNAM === 'Z_BOS').VALUE === '0' || value.CHARACTERISTICS.find(o => o.ATNAM === 'Z_BOS').VALUE === '' || value.CHARACTERISTICS.find(o => o.ATNAM === 'Z_BOS').VALUE === undefined) {
                                $scope.theOrder.ITEMS = $scope.theOrder.ITEMS.filter(item => item !== value);
                            }
                            ;
                        })
                    }
                    ApiQuery.post('/CREATE_ORDER', {
                        request: $scope.theOrder,
                        CHECK_ROUTE: $scope.addressOption
                    }).then(function (res) {
                        if (res.data.RETURN.TYPE === 'S') {
                            if (status !== '') {
                                $state.go('Order.confirm', {idOrder: res.data.ID_ORDER});
                            } else {
                                $state.go('Order.list');
                            }
                        }
                    });
                }

            }

        }]).directive('dateFormatter', [
    function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function postLink(scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (data) {
                    var out = moment(data).format('YYYYMMDD');
                    return out;
                });

                ngModel.$formatters.push(function (data) {
                    var out = moment(data, 'YYYYMMDD').toDate();
                    return out;
                });
            }
        };
    }
]);
MetronicApp.controller('CreateOrderCtr',
    ['$scope', '$state', '$resource', '$stateParams', 'NgTableParams', 'ApiQuery', '$rootScope', '$http',
        function ($scope, $state, $resource, $stateParams, NgTableParams, ApiQuery, $rootScope, $http) {
            $scope.tg_dh = getTimeNow();
            $scope.ztypes_nh = ztypes_nh;
            $rootScope.ztype_nh_value = {};
            $rootScope.bt = '';
            $scope.maras = [];
            $scope.data = {
                matnr_tr: '',
                matnr_bt: '',
                matnr_khoa: '',
            };
            if ($stateParams.temID === 0 || $stateParams.temID === '') {
                bootbox.alert({
                    message: "Mời chọn Đơn hàng mẫu!!!",
                    callback: function () {
                        $state.go('Order.list_template');
                    }
                })
            }
            $('.select-yourself').selectize({
                valueField: 'MATNR',
                labelField: 'MAKTX',
                searchField: 'MAKTX',
                preload: true,
                options: $rootScope.gt_mara,
                create: false,
                load: function (query, callback) {
                    if (!query.length) return callback();
                    callback($rootScope.gt_mara);
                }
            });

            $scope.disable = false;
            $scope.myConfig2 = {
                maxItems: 1,
                valueField: 'MATNR',
                labelField: 'MAKTX',
                searchField: 'MAKTX',
                preload: true,
                options: $rootScope.gt_mara,
                dropdownParent: 'body',
                create: false,
                load: function (query, callback) {
                    if (!query.length) return callback();
                    callback($rootScope.gt_mara);
                }
            };
            $scope.addressOption = '';
            $scope.character_group = character_group;
            let current_datetime = moment();
            $scope.today = current_datetime.format('DD/MM/YYYY');
            $scope.gt_route = [];
            ApiQuery.post('/GET_ROUTE', {}).then(function (res) {
                $scope.gt_t173t = res.data.GT_T173T;
            });
            $scope.loadRoute = function (VSART) {
                $scope.gt_route = [];
                ApiQuery.post('/GET_ROUTE', {}).then(function (res) {
                    res.data.GT_ROUTE.forEach(function (value) {
                        if (value.VSART === VSART) {
                            $scope.gt_route.push(value);
                        }
                    })
                });
            };

            $scope.check_price = function () {
                ApiQuery.post('/check_price', {
                    request: $scope.theOrder,
                    ID_USER: $rootScope.userData.id_user
                }).then(function (res) {
                    $scope.ET_KONV = res.data.ET_KONV;
                    // $scope.price = res.data.NET_VALUE;
                    $scope.ck = Math.round(res.data.CK);
                    $scope.tax = Math.round(res.data.TAX);
                    $scope.stdbl = Math.round(res.data.STDBL);

                    $scope.total_price = Math.round(res.data.TGTDH);

                    $scope.price_after_ck = $scope.total_price - $scope.ck;
                    $scope.price = $scope.total_price - $scope.ck + $scope.tax;
                    $scope.total_inquiry = res.data.TOTAL_INQUIRY;
                });
            };

            ApiQuery.post('/GET_PAYMENT_TERMS').then(function (res) {
                $scope.paymentTerms = [];
                if (res.data.RETURN.TYPE === "S") {
                    $scope.paymentTerms = res.data.GT_PAYMENT_TERM;
                }
            });


            ApiQuery.post('/GET_DIVISION', {}).then(function (res) {
                $scope.division = res.data.GT_DIVISION;
            });
            ApiQuery.post('/GET_DC', {}).then(function (res) {
                $scope.dc = res.data.GT_DC;
            });

            ApiQuery.post('/GET_ORDER_TYPE').then(function (res) {
                if (res.data.RETURN.TYPE === "S") {
                    $scope.orderTypes = res.data.GT_ORDER_TYPE;
                }
            });


            ApiQuery.post('/GET_DETAIL_TEMP', {ID_TEMP: $stateParams.temID}).then(function (res) {
                $rootScope.item_global = res.data.RESPONSE.ITEMS[0].MATNR;
                // $scope.theOrder.id_item_master = res.data.RESPONSE.ITEMS[0].MATNR;
                res.data.RESPONSE.ITEMS.forEach(function (value) {
                    value.thanh_le = 0;
                    if (value.Z_RETURN === "1") {
                        value.Z_RETURN = true;
                    }
                    if (value.Z_RETURN === "2") {
                        value.Z_RETURN = false;
                    }
                    if (value.CHARACTERISTICS.length > 0 && res.data.DIVISION === '02') {
                        value.CHARACTERISTICS.forEach(function (val) {
                            if (val.ATNAM === 'Z_KT_THANH') {
                                val.VALUE = 6;
                                value.kg_thanh = parseFloat(value.CHARACTERISTICS.find(o => o.ATNAM === 'Z_TY_TRONG').VALUE.replace(/,/, '.')) * val.VALUE;
                                value.kg_thanh = value.kg_thanh.toFixed(3);
                            }
                        })
                    }
                });
                $scope.theOrder = res.data.RESPONSE;
                ApiQuery.post('/GET_DETAIL_CUSTOMER', {
                    KUNNR: $rootScope.userData.kunnr,
                    BUKRS: $rootScope.sale_org
                }).then(function (res) {
                    $scope.theOrder.name_shipto = res.data.CUSTOMER.KUNNR + ' - ' + res.data.CUSTOMER.CUSTOMER_NAME + ' - ' + res.data.CUSTOMER.CITY;
                    // $scope.theOrder.phone_number = res.data.CUSTOMER.SDT;
                    $scope.address = res.data.CUSTOMER.ADDRESS;
                    $scope.route = res.data.CUSTOMER.ROUTE;
                    $scope.vsart = res.data.CUSTOMER.VSART;
                    $scope.gt_route = [];
                    ApiQuery.post('/GET_ROUTE', {}).then(function (res) {
                        res.data.GT_ROUTE.forEach(function (value) {
                            if (value.VSART === $scope.vsart) {
                                $scope.gt_route.push(value);
                            }
                        })
                    });
                    res.data.CUSTOMER.CZREDIT.forEach(function (value) {
                        if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                            let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                            if (index !== -1) {
                                $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                $scope.theOrder.credit_value = Math.round(value.VALUE);
                            }
                        }
                    });
                    res.data.CUSTOMER.ZCREDIT_CUS.forEach(function (value) {
                        if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                            let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                            if (index !== -1) {
                                $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                $scope.theOrder.credit_value_cus = Math.round(value.Z_AMOUNT_L);
                            }
                        }
                    })
                });
                $scope.items = res.data.RESPONSE.ITEMS;
                if ($scope.theOrder.DIVISION !== '02' && $rootScope.cua_cuon.value === '') {
                    $('#myModal').modal('show');
                }
                ApiQuery.post('/GET_MARA', {
                    ID_USER: $rootScope.userData.id_user,
                    division: res.data.RESPONSE.DIVISION,
                    IT_MARAS: $scope.items,
                    VKORG: $rootScope.sale_org,
                    DC: $scope.theOrder.DC
                }).then(function (res) {
                    $scope.maras = res.data.MARAS;
                    $rootScope.marasX = res.data.MARAS;
                    $scope.dkgh($scope.maras, $scope.items[0].MATNR);
                    $scope.items.forEach(function (value1) {
                        $scope.maras.forEach(function (value2) {
                            if (value1.MATNR === value2.MATNR) {
                                value1.price = value2.ZPRICE;
                            }
                        })
                    })
                });
                $scope.name = res.data.RESPONSE.ITEMS[0].NAME;
                ApiQuery.post('/GET_MAPPING_BOTOI', {ID_ITEM_MASTER: $rootScope.item_global}).then(function (res1) {
                    $rootScope.gt_botoi = res1.data.GT_BOTOI;
                });
                ApiQuery.post('/GET_MAPPING_THANHRAY', {}).then(function (res1) {
                    $rootScope.gt_thanhray = res1.data.GT_THANHRAY;
                });
                ApiQuery.post('/GET_MAPPING_KHOA', {}).then(function (res1) {
                    $rootScope.gt_khoa = res1.data.GT_KHOA;
                });
                ApiQuery.post('/GET_MAT_REFER', {MATNR: res.data.RESPONSE.ITEMS[0].MATNR}).then(function (res2) {
                    $scope.default_maras = res2.data.GT_DATA;
                    $scope.items.forEach(function (value) {
                        value.CHARACTERISTICS.forEach(function (value2) {
                            value2.value_default = [];
                            $scope.default_maras.forEach(function (value3) {
                                if (value3.ZMBEZ === value2.ATNAM) {
                                    if (value2.value_default.findIndex(item => item.VALDESCR === value3.VALUE) === -1) {
                                        value2.value_default.push({
                                            ATNAM: value3.ZMBEZ,
                                            VALDESCR: value3.VALUE
                                        });
                                    }
                                }
                            })
                        });
                        if (value.MATNR === res.data.RESPONSE.ITEMS[0].MATNR) {
                            $rootScope.characters = value.CHARACTERISTICS;
                        }
                        $scope.checkGroup = function (value) {
                            let index = $rootScope.characters.findIndex(item => item.ZGROUP === value);
                            return index !== -1;

                        }
                    });
                });
                ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: res.data.RESPONSE.ITEMS[0].MATNR}).then(function (res2) {
                    $rootScope.characters = [];
                    $scope.items.forEach(function (value) {
                        value.CHARACTERISTICS.forEach(function (value2) {
                            res2.data.DATA.forEach(function (value3) {
                                if (value3.ATNAM === value2.ATNAM && value3.ATNAM !== 'Z_MODEL_BT') {
                                    if (value2.value_default.length === 0) {
                                        value2.value_default = value3.VALUE2;
                                    }
                                }
                                if (value3.ATNAM === value2.ATNAM && value3.ATNAM === 'Z_MODEL_BT') {
                                    $rootScope.gt_botoi.forEach(function (value4) {
                                        if (value4.ATNAM === 'Z_MODEL_BT') {
                                            value2.value_default.push({
                                                VALUE: value4.VALUE,
                                                VALDESCR: value4.VALUE
                                            })
                                        }

                                    });
                                    // value2.value_default = []
                                }
                            })
                        });
                        if (value.MATNR === res.data.RESPONSE.ITEMS[0].MATNR) {
                            $rootScope.characters = value.CHARACTERISTICS;
                        }
                        $scope.checkGroup = function (value) {
                            let index = $rootScope.characters.findIndex(item => item.ZGROUP === value);
                            if (index !== -1) {
                                return true;
                            }
                            return false;
                        }
                    });
                });


                if ($scope.theOrder.ITEMS[0].MATNR === '0') {
                    $scope.theOrder.ITEMS.splice(0, 1);
                }

            });


            $scope.dkgh = function (maras, matnr) {
                let index = maras.findIndex(item => item.MATNR === matnr);
                if (index !== -1) {
                    let value = maras[index];
                    let newDate = moment().add(parseInt(value.ZDKGH), 'days');
                    $scope.theOrder.ZDKGH = newDate;
                    $scope.zend_date = newDate.format('DD/MM/YYYY');
                    $scope.theDate = $scope.zend_date;
                }
            };


            $scope.edit = function (matnr, index) {
                $rootScope.characters = [];
                $scope.zindex = index;

                $rootScope.characters = $scope.items[index].CHARACTERISTICS;
                $scope.material = matnr;
                $('#myModal').modal('show');
                // if (index === 0){
                //     matnr = $rootScope.item_global;
                // }
                if ($scope.items[index].CHARACTERISTICS.length === 0) {
                    ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: matnr}).then(function (res) {
                        $scope.get_characteristic = res.data.DATA;
                        ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: matnr}).then(function (res2) {
                            res.data.DATA.forEach(function (value) {
                                res2.data.GT_CHARACTER.forEach(function (value2) {
                                    if (value2.ATNAM === value.ATNAM && value2.ZDEFAULT === 'X') {
                                        if (value.VALUE2.length !== 0) {
                                            $scope.items[index].CHARACTERISTICS.push({
                                                ATNAM: value.ATNAM,
                                                SMBEZ: value.SMBEZ,
                                                value: value2.ZVALUE,
                                                ZGROUP: value2.ZGROUP,
                                                ZSORT: value2.ZSORT,
                                                value_default: value.VALUE2
                                            });
                                        } else {
                                            $scope.items[index].CHARACTERISTICS.push({
                                                ATNAM: value.ATNAM,
                                                SMBEZ: value.SMBEZ,
                                                value: value2.ZVALUE,
                                                ZGROUP: value2.ZGROUP,
                                                ZSORT: value2.ZSORT,
                                                value_default: []
                                            });
                                        }
                                    }
                                })
                            })
                        });
                    });

                    ApiQuery.post('/GET_MAT_REFER', {MATNR: res.data.RESPONSE.ITEMS[0].MATNR}).then(function (res2) {
                        $scope.default_maras = res2.data.GT_DATA;
                        $scope.items.forEach(function (value) {
                            value.CHARACTERISTICS.forEach(function (value2) {
                                value2.value_default = [];
                                $scope.default_maras.forEach(function (value3) {
                                    if (value3.ZMBEZ === value2.ATNAM) {
                                        if (value2.value_default.findIndex(item => item.VALDESCR === value3.VALUE) === -1) {
                                            value2.value_default.push({
                                                ATNAM: value3.ZMBEZ,
                                                VALDESCR: value3.VALUE
                                            });
                                        }
                                    }
                                })
                            });
                            if (value.MATNR === res.data.RESPONSE.ITEMS[0].MATNR) {
                                $rootScope.characters = value.CHARACTERISTICS;
                            }
                            $scope.checkGroup = function (value) {
                                let index = $rootScope.characters.findIndex(item => item.ZGROUP === value);
                                return index !== -1;

                            }
                        });
                    });
                }

                ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: matnr}).then(function (res) {
                    $scope.items.forEach(function (value, index1) {
                        value.CHARACTERISTICS.forEach(function (value2) {
                            res.data.DATA.forEach(function (value3) {
                                if (value3.ATNAM === value2.ATNAM && value3.ATNAM !== 'Z_MODEL_BT') {
                                    value2.value_default = value3.VALUE2;
                                }
                                if (value3.ATNAM === value2.ATNAM && value3.ATNAM === 'Z_MODEL_BT') {
                                    value2.value_default = [];
                                    $rootScope.gt_botoi.forEach(function (value4) {
                                        if (value4.ATNAM === 'Z_MODEL_BT') {
                                            value2.value_default.push({
                                                VALUE: value4.VALUE,
                                                VALDESCR: value4.VALUE
                                            })
                                        }

                                    });
                                }
                            })
                        });
                        if (value.MATNR === matnr && index === index1) {
                            $rootScope.characters = value.CHARACTERISTICS;
                        }
                    });
                    $scope.checkGroup = function (value) {
                        let index = $rootScope.characters.findIndex(item => item.ZGROUP === value);
                        if (index !== -1) {
                            return true;
                        }
                        return false;
                    };
                });
            };

            $scope.loadAddress = function (value) {
                switch (value) {
                    case "1":
                        $scope.address = "";
                        $scope.vsart = '';
                        $scope.route = '';
                        break;
                    case "":
                        ApiQuery.post('/GET_DETAIL_CUSTOMER', {KUNNR: $rootScope.userData.kunnr}).then(function (res) {
                            $scope.theOrder.name_shipto = res.data.CUSTOMER.KUNNR + ' - ' + res.data.CUSTOMER.CUSTOMER_NAME + ' - ' + res.data.CUSTOMER.CITY;
                            // $scope.theOrder.phone_number = res.data.CUSTOMER.SDT;
                            $scope.address = res.data.CUSTOMER.ADDRESS;
                            $scope.route = res.data.CUSTOMER.ROUTE;
                            $scope.vsart = res.data.CUSTOMER.VSART;
                            // $scope.gt_route = [];
                            ApiQuery.post('/GET_ROUTE', {}).then(function (res) {
                                res.data.GT_ROUTE.forEach(function (value) {
                                    if (value.VSART === $scope.vsart) {
                                        $scope.gt_route.push(value);
                                    }
                                })
                            });
                            res.data.CUSTOMER.CZREDIT.forEach(function (value) {
                                if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                                    let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                                    if (index !== -1) {
                                        $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                        $scope.theOrder.credit_value = Math.round(value.VALUE);
                                    }
                                }
                            });
                            res.data.CUSTOMER.ZCREDIT_CUS.forEach(function (value) {
                                if (value.CS === ('CS' + $scope.theOrder.DIVISION)) {
                                    let index = $scope.division.findIndex(item => item.SPART === $scope.theOrder.DIVISION);
                                    if (index !== -1) {
                                        $scope.theOrder.credit_name = $scope.division[index].VTEXT;
                                        $scope.theOrder.credit_value_cus = Math.round(value.Z_AMOUNT_L);
                                    }
                                }
                            })
                        });
                        break;
                }
            };

            $scope.loadDientichThanCua = function () {
                $rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_DIEN_TICH')].VALUE = parseInt($rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE) * parseInt($rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_HEIGHT')].VALUE);
                $rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_DIEN_TICH')].VALUE = parseFloat($rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_DIEN_TICH')].VALUE / 1000000);
                // $rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_KT_RAY0')].VALUE = parseInt($rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_HEIGHT')].VALUE) - 200;
            };

            $scope.addItemBT = async function (value, characters) {
                ApiQuery.post('/GET_MARA', {
                    ID_USER: $rootScope.userData.id_user,
                    IT_MARAS: [{
                        MATNR: value
                    }],
                    VKORG: $rootScope.sale_org
                }).then(function (res_bt) {
                    let item_bt = {
                        ID: $scope.theOrder.ITEMS.length + 1,
                        id_user: $rootScope.userData.id_user,
                        CHARACTERISTICS: [],
                        MATNR: value,
                        NAME: res_bt.data.MARAS[0].MAKTX,
                        ZTERM: '',
                        QUANTITY: 1,
                        SALE_UNIT: res_bt.data.MARAS[0].MEINS,
                        ZPRICE: res_bt.data.MARAS[0].ZPRICE,
                        Z_RETURN: false,
                        check: 'bt'
                    };
                    if ($scope.theOrder.ITEMS.findIndex(item => item.check === 'bt') !== -1) {
                        item_bt.ID -= 1;
                        $scope.theOrder.ITEMS.splice($scope.theOrder.ITEMS.findIndex(item => item.check === 'bt'), 1, item_bt);
                        ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: value}).then(function (res) {
                            $scope.get_characteristic = res.data.DATA;
                            ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: value}).then(function (res2) {
                                res.data.DATA.forEach(function (value) {
                                    res2.data.GT_CHARACTER.forEach(function (value2) {
                                        if (value2.ATNAM === value.ATNAM && value2.ZDEFAULT === 'X') {
                                            if (value.VALUE2.length !== 0) {
                                                switch (value.ATNAM) {
                                                    case 'Z_WIDTH':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_HEIGHT':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_HEIGHT')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;

                                                    case 'Z_LOAI_CUA':
                                                        if (characters.findIndex(item => item.ATNAM === 'Z_LOAI_CUA') !== -1) {
                                                            item_bt.CHARACTERISTICS.push({
                                                                ATNAM: value.ATNAM,
                                                                SMBEZ: value.SMBEZ,
                                                                VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_LOAI_CUA')].VALUE,
                                                                ZGROUP: value2.ZGROUP,
                                                                value_default: value.VALUE2
                                                            });
                                                        } else {
                                                            item_bt.CHARACTERISTICS.push({
                                                                ATNAM: value.ATNAM,
                                                                SMBEZ: value.SMBEZ,
                                                                VALUE: '',
                                                                ZGROUP: value2.ZGROUP,
                                                                value_default: value.VALUE2
                                                            });
                                                        }
                                                        break;
                                                    case 'Z_SO_LUONG':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: 1,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_KO_DAU_TRUC':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KO_DAU_TRUC')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    default:
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                }


                                            } else {
                                                switch (value.ATNAM) {
                                                    case 'Z_WIDTH':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    case 'Z_HEIGHT':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_HEIGHT')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    case 'Z_LOAI_CUA':
                                                        if (characters.findIndex(item => item.ATNAM === 'Z_LOAI_CUA') !== -1) {
                                                            item_bt.CHARACTERISTICS.push({
                                                                ATNAM: value.ATNAM,
                                                                SMBEZ: value.SMBEZ,
                                                                VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_LOAI_CUA')].VALUE,
                                                                ZGROUP: value2.ZGROUP,
                                                                value_default: value.VALUE2
                                                            });
                                                        } else {
                                                            item_bt.CHARACTERISTICS.push({
                                                                ATNAM: value.ATNAM,
                                                                SMBEZ: value.SMBEZ,
                                                                VALUE: '',
                                                                ZGROUP: value2.ZGROUP,
                                                                value_default: value.VALUE2
                                                            });
                                                        }
                                                        break;
                                                    case 'Z_SO_LUONG':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: 1,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_KO_DAU_TRUC':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KO_DAU_TRUC')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    default:
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                }
                                            }
                                        }
                                    })
                                })
                            });
                        });
                    } else {
                        ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: value}).then(function (res) {
                            $scope.get_characteristic = res.data.DATA;
                            ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: value}).then(function (res2) {
                                res.data.DATA.forEach(function (value) {
                                    res2.data.GT_CHARACTER.forEach(function (value2) {
                                        if (value2.ATNAM === value.ATNAM && value2.ZDEFAULT === 'X') {
                                            if (value.VALUE2.length !== 0) {
                                                switch (value.ATNAM) {
                                                    case 'Z_WIDTH':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_HEIGHT':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_HEIGHT')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;

                                                    case 'Z_LOAI_CUA':
                                                        if (characters.findIndex(item => item.ATNAM === 'Z_LOAI_CUA') !== -1) {
                                                            item_bt.CHARACTERISTICS.push({
                                                                ATNAM: value.ATNAM,
                                                                SMBEZ: value.SMBEZ,
                                                                VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_LOAI_CUA')].VALUE,
                                                                ZGROUP: value2.ZGROUP,
                                                                value_default: value.VALUE2
                                                            });
                                                        } else {
                                                            item_bt.CHARACTERISTICS.push({
                                                                ATNAM: value.ATNAM,
                                                                SMBEZ: value.SMBEZ,
                                                                VALUE: '',
                                                                ZGROUP: value2.ZGROUP,
                                                                value_default: value.VALUE2
                                                            });
                                                        }
                                                        ;
                                                        break;
                                                    case 'Z_SO_LUONG':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: 1,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_KO_DAU_TRUC':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KO_DAU_TRUC')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    default:
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                }


                                            } else {
                                                switch (value.ATNAM) {
                                                    case 'Z_WIDTH':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    case 'Z_HEIGHT':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_HEIGHT')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    case 'Z_LOAI_CUA':
                                                        if (characters.findIndex(item => item.ATNAM === 'Z_LOAI_CUA') !== -1) {
                                                            item_bt.CHARACTERISTICS.push({
                                                                ATNAM: value.ATNAM,
                                                                SMBEZ: value.SMBEZ,
                                                                VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_LOAI_CUA')].VALUE,
                                                                ZGROUP: value2.ZGROUP,
                                                                value_default: value.VALUE2
                                                            });
                                                        } else {
                                                            item_bt.CHARACTERISTICS.push({
                                                                ATNAM: value.ATNAM,
                                                                SMBEZ: value.SMBEZ,
                                                                VALUE: '',
                                                                ZGROUP: value2.ZGROUP,
                                                                value_default: value.VALUE2
                                                            });
                                                        }
                                                        ;
                                                        break;
                                                    case 'Z_SO_LUONG':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: 1,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_KO_DAU_TRUC':
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KO_DAU_TRUC')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    default:
                                                        item_bt.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                }
                                            }
                                        }
                                    })
                                })
                            });
                        });
                        $scope.theOrder.ITEMS.push(item_bt);
                        $scope.items = $scope.theOrder.ITEMS;
                    }
                });


                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve();
                    }, 100);
                });
            };

            $scope.addItemTR = function (value, characters) {
                ApiQuery.post('/GET_MARA', {
                    ID_USER: $rootScope.userData.id_user,
                    IT_MARAS: [{
                        MATNR: value
                    }],
                    VKORG: $rootScope.sale_org
                }).then(function (res_tr) {
                    let item_tr = {
                        ID: $scope.theOrder.ITEMS.length + 1,
                        id_user: $rootScope.userData.id_user,
                        CHARACTERISTICS: [],
                        MATNR: value,
                        NAME: res_tr.data.MARAS[0].MAKTX,
                        ZTERM: '',
                        QUANTITY: parseInt($rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_THANH_RAY')].VALUE) * parseInt($rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_KT_RAY0')].VALUE) / 1000,
                        SALE_UNIT: res_tr.data.MARAS[0].MEINS,
                        Z_RETURN: false,
                        ZPRICE: res_tr.data.MARAS[0].ZPRICE,
                        check: 'tr'
                    };
                    if ($scope.theOrder.ITEMS.findIndex(item => item.check === 'tr') !== -1) {
                        item_tr.ID -= 1;
                        $scope.theOrder.ITEMS.splice($scope.theOrder.ITEMS.findIndex(item => item.check === 'tr'), 1, item_tr);
                        ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: value}).then(function (res) {
                            $scope.get_characteristic = res.data.DATA;
                            ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: value}).then(function (res2) {
                                res.data.DATA.forEach(function (value) {
                                    res2.data.GT_CHARACTER.forEach(function (value2) {
                                        if (value2.ATNAM === value.ATNAM && value2.ZDEFAULT === 'X') {
                                            if (value.VALUE2.length !== 0) {
                                                switch (value.ATNAM) {
                                                    case 'Z_KT_THANH':
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KT_RAY0')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_SO_THANH':
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_THANH_RAY')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    default:
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                }


                                            } else {
                                                switch (value.ATNAM) {
                                                    case 'Z_KT_THANH':
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KT_RAY0')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    case 'Z_SO_THANH':
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_THANH_RAY')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    default:
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                }
                                            }
                                        }
                                    })
                                });
                                item_tr.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_LUONG')].VALUE = item_tr.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_KT_THANH')].VALUE * parseInt(item_tr.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_THANH')].VALUE) / 1000;

                            });

                        });
                    } else {
                        ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: value}).then(function (res) {
                            $scope.get_characteristic = res.data.DATA;
                            ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: value}).then(function (res2) {
                                res.data.DATA.forEach(function (value) {
                                    res2.data.GT_CHARACTER.forEach(function (value2) {
                                        if (value2.ATNAM === value.ATNAM && value2.ZDEFAULT === 'X') {
                                            if (value.VALUE2.length !== 0) {
                                                switch (value.ATNAM) {
                                                    case 'Z_KT_THANH':
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KT_RAY0')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_SO_THANH':
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_THANH_RAY')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    default:
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                }


                                            } else {
                                                switch (value.ATNAM) {
                                                    case 'Z_KT_THANH':
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KT_RAY0')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    case 'Z_SO_THANH':
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_THANH_RAY')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                    default:
                                                        item_tr.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: []
                                                        });
                                                        break;
                                                }
                                            }
                                        }
                                    })
                                });
                                item_tr.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_LUONG')].VALUE = item_tr.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_KT_THANH')].VALUE * parseInt(item_tr.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_THANH')].VALUE) / 1000;

                            });

                        });
                        $scope.theOrder.ITEMS.push(item_tr);
                        $scope.items = $scope.theOrder.ITEMS;
                    }
                });


                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve();
                    }, 100);
                });
            };
            $scope.addItemKhoa = function (value, characters) {
                ApiQuery.post('/GET_MARA', {
                    ID_USER: $rootScope.userData.id_user,
                    IT_MARAS: [{
                        MATNR: value
                    }],
                    VKORG: $rootScope.sale_org
                }).then(function (res_khoa) {
                    let item_khoa = {
                        ID: $scope.theOrder.ITEMS.length + 1,
                        id_user: $rootScope.userData.id_user,
                        CHARACTERISTICS: [],
                        MATNR: value,
                        NAME: res_khoa.data.MARAS[0].MAKTX,
                        ZTERM: '',
                        QUANTITY: 1,
                        SALE_UNIT: res_khoa.data.MARAS[0].MEINS,
                        Z_RETURN: false,
                        ZPRICE: res_khoa.data.MARAS[0].ZPRICE,
                        check: 'kh'
                    };
                    if ($scope.theOrder.ITEMS.findIndex(item => item.check === 'kh') !== -1) {
                        item_khoa.ID -= 1;
                        $scope.theOrder.ITEMS.splice($scope.theOrder.ITEMS.findIndex(item => item.check === 'kh'), 1, item_khoa);
                        ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: value}).then(function (res) {
                            $scope.get_characteristic = res.data.DATA;
                            ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: value}).then(function (res2) {
                                res.data.DATA.forEach(function (value) {
                                    res2.data.GT_CHARACTER.forEach(function (value2) {
                                        if (value2.ATNAM === value.ATNAM && value2.ZDEFAULT === 'X') {
                                            if (value.VALUE2.length !== 0) {
                                                switch (value.ATNAM) {
                                                    case 'Z_KHOA':
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KHOA')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_WIDTH':
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    default:
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                }


                                            } else {
                                                switch (value.ATNAM) {
                                                    case 'Z_KHOA':
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KHOA')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_WIDTH':
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    default:
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                }
                                            }
                                        }
                                    })
                                });
                                // item_khoa.CHARACTERISTICS[item_khoa.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_LUONG')].VALUE = item_khoa.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_KT_THANH')].VALUE * parseInt(item_khoa.CHARACTERISTICS[item_khoa.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_THANH')].VALUE) / 1000;

                            });

                        });
                    } else {
                        ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: value}).then(function (res) {
                            $scope.get_characteristic = res.data.DATA;
                            ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: value}).then(function (res2) {
                                res.data.DATA.forEach(function (value) {
                                    res2.data.GT_CHARACTER.forEach(function (value2) {
                                        if (value2.ATNAM === value.ATNAM && value2.ZDEFAULT === 'X') {
                                            if (value.VALUE2.length !== 0) {
                                                switch (value.ATNAM) {
                                                    case 'Z_KHOA':
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KHOA')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_WIDTH':
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    default:
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                }


                                            } else {
                                                switch (value.ATNAM) {
                                                    case 'Z_KHOA':
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_KHOA')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    case 'Z_WIDTH':
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: characters[characters.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                    default:
                                                        item_khoa.CHARACTERISTICS.push({
                                                            ATNAM: value.ATNAM,
                                                            SMBEZ: value.SMBEZ,
                                                            VALUE: value2.ZVALUE,
                                                            ZGROUP: value2.ZGROUP,
                                                            value_default: value.VALUE2
                                                        });
                                                        break;
                                                }
                                            }
                                        }
                                    })
                                });
                                // item_khoa.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_LUONG')].VALUE = item_tr.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_KT_THANH')].VALUE * parseInt(item_tr.CHARACTERISTICS[item_tr.CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_THANH')].VALUE) / 1000;
                            });

                        });

                        $scope.theOrder.ITEMS.push(item_khoa);
                        $scope.items = $scope.theOrder.ITEMS;
                    }
                });


                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve();
                    }, 100);
                });
            };

            $scope.submitPopup = async function (material, index) {
                if ($scope.theOrder.ITEMS[0].MATNR === material || material === undefined) {
                    await $scope.addItemBT($scope.data.matnr_bt, $rootScope.characters);
                }

                if ($scope.theOrder.ITEMS[0].MATNR === material || material === undefined) {
                    await $scope.addItemTR($scope.data.matnr_tr, $rootScope.characters);
                }
                if ($scope.theOrder.ITEMS[0].MATNR === material || material === undefined) {
                    await $scope.addItemKhoa($scope.data.matnr_khoa, $rootScope.characters);
                }
                $scope.theOrder.VKORG = $rootScope.sale_org;
                if ($scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_DIEN_TICH') !== -1
                    && $scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_WIDTH') !== -1
                    && $scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_HEIGHT') !== -1) {
                    $scope.theOrder.ITEMS[0].QUANTITY = $scope.theOrder.ITEMS[0].CHARACTERISTICS[$scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_DIEN_TICH')].VALUE;
                    $scope.theOrder.ITEMS[0].WIDTH = $scope.theOrder.ITEMS[0].CHARACTERISTICS[$scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_WIDTH')].VALUE;
                    $scope.theOrder.ITEMS[0].HEIGHT = $scope.theOrder.ITEMS[0].CHARACTERISTICS[$scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_HEIGHT')].VALUE;
                }
                if ($scope.theOrder.ITEMS[index] !== undefined && $scope.theOrder.ITEMS[index].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_KT_THANH') !== -1 && $scope.theOrder.ITEMS[index].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_THANH') !== -1) {
                    $scope.theOrder.ITEMS[index].QUANTITY = $scope.theOrder.ITEMS[index].CHARACTERISTICS[$scope.theOrder.ITEMS[index].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_KT_THANH')].VALUE * $scope.theOrder.ITEMS[index].CHARACTERISTICS[$scope.theOrder.ITEMS[index].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_SO_THANH')].VALUE / 1000;
                }

                if ($scope.maras.findIndex(item => item.MATNR === $scope.theOrder.ITEMS[0].MATNR) !== -1) {
                    $scope.theOrder.ITEMS[0].ZPRICE = $scope.maras[$scope.maras.findIndex(item => item.MATNR === $scope.theOrder.ITEMS[0].MATNR)].ZPRICE;
                }
                $scope.theOrder.ITEMS.forEach(async function (value, index_item) {
                    if (value === $scope.theOrder.ITEMS[0]) {
                        if ($rootScope.item_global !== '0') {
                            value.MATNR = $rootScope.item_global;
                        }
                    }
                    if (value.MATNR === material && index_item === index) {
                        value.CHARACTERISTICS = $rootScope.characters;
                    }
                    ApiQuery.post('/mapping_mara', {
                        MATNR: value.MATNR,
                        GT_CHARACTER: value.CHARACTERISTICS
                    }).then(function (res) {
                        if (res.data.E_MESSAGE !== '') {
                            bootbox.confirm({
                                title: "Đơn hàng ngoài tiêu chuẩn",
                                message: res.data.E_MESSAGE,
                                buttons: {
                                    confirm: {
                                        label: 'Xác nhận',
                                        className: 'btn-success'
                                    },
                                    cancel: {
                                        label: 'Chọn lại',
                                        className: 'btn-danger'
                                    }
                                },
                                callback: function (result) {
                                    if (result === true) {
                                        $('#myModal').modal('hide');
                                        if (res.data.MATNR_REFER !== '') {
                                            value.MATNR = res.data.MATNR_REFER;
                                            $scope.dkgh($rootScope.marasX, res.data.MATNR_REFER);

                                            ApiQuery.post('/GET_MARA', {
                                                ID_USER: $rootScope.userData.id_user,
                                                // division: res.data.RESPONSE.DIVISION,
                                                IT_MARAS: [{MATNR: res.data.MATNR_REFER}],
                                                VKORG: $rootScope.sale_org,
                                                DC: $scope.theOrder.DC
                                            }).then(function (res_mapping) {
                                                value.EXTWG = res_mapping.data.MARAS[0].EXTWG;
                                                value.NAME = res_mapping.data.MARAS[0].MAKTX;
                                                value.ZPRICE = res_mapping.data.MARAS[0].ZPRICE;
                                            });


                                            let index_bt = $scope.theOrder.ITEMS.findIndex(item => item.check === 'bt');
                                            if (index_bt !== -1) {
                                                ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: res.data.MATNR_REFER}).then(function (response) {
                                                    $scope.theOrder.ITEMS[index_bt].CHARACTERISTICS[$scope.theOrder.ITEMS[index_bt].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_LOAI_CUA')].VALUE = response.data.GT_CHARACTER[response.data.GT_CHARACTER.findIndex(item => item.ATNAM === 'Z_LOAI_CUA')].ZVALUE;
                                                })
                                            }

                                            if (res.data.E_FLAG === '1') {
                                                $scope.theOrder.ztc = '1';
                                            } else {
                                                $scope.theOrder.ztc = '0';
                                            }
                                            ApiQuery.post('/GET_MARA', {
                                                ID_USER: $rootScope.userData.id_user,
                                                // division: res.data.RESPONSE.DIVISION,
                                                IT_MARAS: $scope.items,
                                                VKORG: $rootScope.sale_org,
                                                DC: $scope.theOrder.DC
                                            }).then(function (res_get_mara) {
                                                $scope.maras = res_get_mara.data.MARAS;
                                            });
                                        }
                                        $scope.check_price();
                                    }
                                }
                            });
                        } else {
                            $('#myModal').modal('hide');
                            if (res.data.MATNR_REFER !== '') {
                                value.MATNR = res.data.MATNR_REFER;
                                $scope.dkgh($rootScope.marasX, res.data.MATNR_REFER);

                                ApiQuery.post('/GET_MARA', {
                                    ID_USER: $rootScope.userData.id_user,
                                    // division: res.data.RESPONSE.DIVISION,
                                    IT_MARAS: [{MATNR: res.data.MATNR_REFER}],
                                    VKORG: $rootScope.sale_org,
                                    DC: $scope.theOrder.DC
                                }).then(function (res_mapping) {
                                    value.EXTWG = res_mapping.data.MARAS[0].EXTWG;
                                    value.NAME = res_mapping.data.MARAS[0].MAKTX;
                                    value.ZPRICE = res_mapping.data.MARAS[0].ZPRICE;
                                });
                                let index_bt = $scope.theOrder.ITEMS.findIndex(item => item.check === 'bt');
                                if (index_bt !== -1) {
                                    ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: res.data.MATNR_REFER}).then(function (response) {
                                        $scope.theOrder.ITEMS[index_bt].CHARACTERISTICS[$scope.theOrder.ITEMS[index_bt].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_LOAI_CUA')].VALUE = response.data.GT_CHARACTER[response.data.GT_CHARACTER.findIndex(item => item.ATNAM === 'Z_LOAI_CUA')].ZVALUE;
                                    })
                                }
                                let index_kttyc = $scope.theOrder.ITEMS[0].CHARACTERISTICS.findIndex(item => item.ATNAM === 'Z_KT_TRUC0');
                                if (res.data.E_FLAG === '1' || $scope.theOrder.ITEMS[0].CHARACTERISTICS[index_kttyc].VALUE !== '') {
                                    $scope.theOrder.ztc = '1';
                                } else {
                                    $scope.theOrder.ztc = '0';
                                }
                                ApiQuery.post('/GET_MARA', {
                                    ID_USER: $rootScope.userData.id_user,
                                    // division: res.data.RESPONSE.DIVISION,
                                    IT_MARAS: $scope.items,
                                    VKORG: $rootScope.sale_org,
                                    DC: $scope.theOrder.DC
                                }).then(function (res_get_mara) {
                                    $scope.maras = res_get_mara.data.MARAS;
                                });
                            }
                            $scope.check_price();
                        }
                    })
                });
            };
            $scope.refresh = async function (characters) {
                $scope.data.matnr_bt = '';
                $scope.data.matnr_tr = '';
                characters.forEach(function (value) {
                    value.VALUE = '';
                })
            };

            ApiQuery.post('/GET_ORDER_TYPE').then(function (res) {
                if (res.data.RETURN.TYPE === "S") {
                    $scope.orderTypes = res.data.GT_ORDER_TYPE;
                }
            });

            $scope.addNew = function () {
                if ($scope.theOrder.ITEMS[0] !== undefined && ($scope.theOrder.ITEMS[0].EXTWG === 'PKAD' || $scope.theOrder.ITEMS[0].EXTWG === 'PKDT')) {
                    ApiQuery.post('/GET_MARA', {
                        ID_USER: $rootScope.userData.id_user,
                        ZTYPE: $scope.theOrder.ITEMS[0].EXTWG,
                        VKORG: $rootScope.sale_org
                    }).then(function (res) {
                        $rootScope.gt_mara = res.data.MARAS;
                        $scope.maras = res.data.MARAS;
                        $rootScope.maras_Global = res.data.MARAS;
                    });
                    $scope.theOrder.ITEMS.push({
                        ID: $scope.theOrder.ITEMS.length + 1,
                        id_user: $rootScope.userData.id_user,
                        MATNR: 0,
                        NAME: '',
                        ZTERM: '',
                        QUANTITY: 0,
                        SALE_UNIT: "",
                        Z_RETURN: false
                    })
                } else {
                    switch ($rootScope.cua_cuon.value) {
                        case "PKADC":
                            ApiQuery.post('/GET_MARA', {
                                ID_USER: $rootScope.userData.id_user,
                                ZTYPE: 'PKADC',
                                VKORG: $rootScope.sale_org
                            }).then(function (res) {
                                $rootScope.gt_mara = res.data.MARAS;
                                $scope.maras = res.data.MARAS;
                                $rootScope.maras_Global = res.data.MARAS;
                            });
                            break;
                        case "PKDTC":
                            ApiQuery.post('/GET_MARA', {
                                ID_USER: $rootScope.userData.id_user,
                                ZTYPE: 'PKDTC',
                                VKORG: $rootScope.sale_org
                            }).then(function (res) {
                                $rootScope.gt_mara = res.data.MARAS;
                                $scope.maras = res.data.MARAS;
                                $rootScope.maras_Global = res.data.MARAS;
                            });
                            break;
                        case "PKNL":
                            ApiQuery.post('/GET_MARA', {
                                ID_USER: $rootScope.userData.id_user,
                                ZTYPE: 'PKNL',
                                VKORG: $rootScope.sale_org
                            }).then(function (res) {
                                $rootScope.gt_mara = res.data.MARAS;
                                $scope.maras = res.data.MARAS;
                                $rootScope.maras_Global = res.data.MARAS;
                            });
                            break;
                        case "CCBH":
                            ApiQuery.post('/GET_MARA', {
                                ID_USER: $rootScope.userData.id_user,
                                ZTYPE: 'CCBH',
                                VKORG: $rootScope.sale_org
                            }).then(function (res) {
                                $rootScope.gt_mara = res.data.MARAS;
                                $scope.maras = res.data.MARAS;
                                $rootScope.maras_Global = res.data.MARAS;
                            });
                            break;
                        default:
                            ApiQuery.post('/GET_MARA', {
                                ID_USER: $rootScope.userData.id_user,
                                VKORG: $rootScope.sale_org,
                                DIVISION: $scope.theOrder.DIVISION
                            }).then(function (res) {
                                $rootScope.gt_mara = res.data.MARAS;
                                $scope.maras = res.data.MARAS;
                                $rootScope.maras_Global = res.data.MARAS;
                            });
                            break;
                    }

                    $scope.theOrder.ITEMS.push({
                        ID: $scope.theOrder.ITEMS.length + 1,
                        id_user: $rootScope.userData.id_user,
                        MATNR: 0,
                        NAME: '',
                        ZTERM: '',
                        QUANTITY: 0,
                        SALE_UNIT: "",
                        Z_RETURN: false
                    })
                }

            };

            $scope.addNewNH = function (ztype_nh) {
                ApiQuery.post('/GET_MARA', {
                    ID_USER: $rootScope.userData.id_user,
                    ZTYPE: ztype_nh,
                    VKORG: $rootScope.sale_org
                }).then(function (res) {
                    $rootScope.gt_mara = res.data.MARAS;
                    $scope.maras = res.data.MARAS;
                    $rootScope.maras_Global = res.data.MARAS;
                });
                $scope.theOrder.ITEMS.push({
                    ID: $scope.theOrder.ITEMS.length + 1,
                    id_user: $rootScope.userData.id_user,
                    MATNR: 0,
                    NAME: '',
                    ZTERM: '',
                    QUANTITY: 0,
                    SALE_UNIT: "",
                    Z_RETURN: false
                })

            };

            $scope.loadUnit = function (index, matnr) {
                $scope.maras.forEach(function (value) {
                    if (value.MATNR === matnr) {
                        $scope.theOrder.ITEMS[index].NAME = value.MAKTG;
                        $scope.theOrder.ITEMS[index].SALE_UNIT = value.MEINS;
                        $scope.theOrder.ITEMS[index].ZPRICE = value.ZPRICE;
                        $scope.theOrder.ITEMS[index].price = value.ZPRICE;
                        $scope.theOrder.ITEMS[index].CHARACTERISTICS = [];
                        ApiQuery.post("/GET_CHARACTERISTIC", {OBJEK: matnr}).then(function (res) {
                            $scope.get_characteristic = res.data.DATA;
                            ApiQuery.post("/GET_CHARACTERISTIC_DEFAULT", {MATNR: matnr}).then(function (res2) {
                                res.data.DATA.forEach(function (value) {
                                    res2.data.GT_CHARACTER.forEach(function (value2) {
                                        if (value2.ATNAM === value.ATNAM && value2.ZDEFAULT === 'X') {
                                            if (value.VALUE2.length !== 0) {
                                                $scope.theOrder.ITEMS[index].CHARACTERISTICS.push({
                                                    ATNAM: value.ATNAM,
                                                    SMBEZ: value.SMBEZ,
                                                    VALUE: value2.ZVALUE,
                                                    ZGROUP: value2.ZGROUP,
                                                    ZSORT: value2.ZSORT,
                                                    VALUE_DEFAULT: value.VALUE2
                                                });
                                            } else {
                                                $scope.theOrder.ITEMS[index].CHARACTERISTICS.push({
                                                    ATNAM: value.ATNAM,
                                                    SMBEZ: value.SMBEZ,
                                                    VALUE: value2.ZVALUE,
                                                    ZGROUP: value2.ZGROUP,
                                                    ZSORT: value2.ZSORT,
                                                    VALUE_DEFAULT: []
                                                });
                                            }
                                        }
                                    })
                                })
                            });
                        });
                        if (value.LABOR === '002') {
                            $scope.theOrder.ITEMS[index].Z_RETURN = true;
                        } else {
                            $scope.theOrder.ITEMS[index].Z_RETURN = false;
                        }
                        $scope.check_price();
                    }
                })
            };

            $scope.cancel = function () {

                $state.go('Order.list');
            };
            $scope.open = function () {
                $scope.IsVisible = true;
            };

            $scope.save = function () {
                console.log($scope.listTems);
            };

            $scope.delTem = function (temID) {
                $scope.theOrder.ITEMS.splice(temID, 1);
            };
            $scope.theDate = '';

            $scope._rule = {
                date: "required"

            };
            $scope._msg = {
                date: "Choose Date"
            };
            $scope.thanh_le = 0;
            $scope.loadValue = function (matnr) {
                let index = $scope.theOrder.ITEMS.findIndex(item => item.MATNR === matnr);
                if (index !== -1) {
                    if ($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KT_THANH').VALUE === '') {
                        $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KT_THANH').VALUE = 6;
                    }
                    if ($scope.theOrder.ITEMS[index].thanh_le === undefined) {
                        $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE = $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_BOS').VALUE * parseInt($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_HS_BO').VALUE);
                    } else {
                        $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE = $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_BOS').VALUE * parseInt($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_HS_BO').VALUE) + parseInt($scope.theOrder.ITEMS[index].thanh_le);
                    }
                    $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_LUONG').VALUE = Math.round($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE * parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KT_THANH').VALUE));
                    $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE = $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_THANH').VALUE * parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_TY_TRONG').VALUE.replace(/,/, '.')) * parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KT_THANH').VALUE);
                    $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE = $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE.toFixed(3);
                    if ($scope.theOrder.ITEMS[index].SALE_UNIT === 'KG') {
                        $scope.theOrder.ITEMS[index].total_price = $scope.theOrder.ITEMS[index].price * $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KL_TONG').VALUE;
                        $scope.theOrder.ITEMS[index].total_price = Math.round($scope.theOrder.ITEMS[index].total_price);
                    } else if ($scope.theOrder.ITEMS[index].SALE_UNIT === 'M') {
                        $scope.theOrder.ITEMS[index].total_price = $scope.theOrder.ITEMS[index].price * $scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_SO_LUONG').VALUE;
                        $scope.theOrder.ITEMS[index].total_price = Math.round($scope.theOrder.ITEMS[index].total_price);

                    }
                    $scope.theOrder.ITEMS[index].kg_thanh = parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_TY_TRONG').VALUE.replace(/,/, '.')) * parseFloat($scope.theOrder.ITEMS[index].CHARACTERISTICS.find(o => o.ATNAM === 'Z_KT_THANH').VALUE);
                    $scope.theOrder.ITEMS[index].kg_thanh = $scope.theOrder.ITEMS[index].kg_thanh.toFixed(3);
                    $scope.check_price();
                }
                ;

            };
            $scope.loadBoToi_ThanhRay = function (group, value2, atnam) {
                $scope.maras_unremove = [];
                if (group === '01' && (atnam === 'Z_MODEL_CUA')) {
                    $scope.default_maras.forEach(function (value) {
                        if (value.ZMBEZ === 'Z_MODEL_CUA' && value.VALUE === value2) {
                            let index = $scope.default_maras.findIndex(item => item.ID_MATNR_REFER === value.ID_MATNR_REFER && item.ZMBEZ === 'Z_MAU_SAC');
                            if (index !== -1) {
                                $scope.maras_unremove.push($scope.default_maras[index]);
                            }
                        }
                    });
                    $rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_MAU_SAC')].value_default = [];
                    $scope.maras_unremove.forEach(function (value) {
                        $rootScope.characters[$rootScope.characters.findIndex(item => item.ATNAM === 'Z_MAU_SAC')].value_default.push({
                            ATNAM: "Z_MAU_SAC",
                            VALDESCR: value.VALUE
                        })
                    })}


                if (group === '07' && atnam === 'Z_MODEL_BT') {
                    $scope.botois = [];
                    $rootScope.gt_botoi.forEach(function (value) {
                        if (value.VALUE === value2) {
                            $scope.botois.push(value);
                        }
                    });
                    $scope.data.matnr_bt = $scope.botois[0].MATNR;
                    // $scope.addItemBT($scope.matnr_bt, $rootScope.characters);

                }
                if (group === '08' && (atnam === 'Z_RAY_TL0' || atnam === 'Z_RAY_KT15'
                    || atnam === 'Z_RAY_GR' || atnam === 'Z_RAY_KT_SD' || atnam === 'Z_RAY_KT17'
                    || atnam === 'Z_RAY_KT19' || atnam === 'Z_RAY_KT24' || atnam === 'Z_RAY_TL_SD'
                    || atnam === 'Z_RAY_KHAC')) {
                    $scope.thanhrays = [];
                    $rootScope.gt_thanhray.forEach(function (value) {
                        if (value.VALUE === value2 && value.MATNR === $scope.item_global) {
                            $scope.thanhrays.push(value);
                        }
                    });
                    if ($scope.thanhrays.length > 0) {
                        $scope.data.matnr_tr = $scope.thanhrays[0].MATNR_REFER;
                    }
                }
                if (group === '10' && atnam === 'Z_KHOA') {
                    $scope.khoas = [];
                    $rootScope.gt_khoa.forEach(function (value) {
                        if (value.VALUE === value2 && value.MATNR === $scope.item_global) {
                            $scope.khoas.push(value);
                        }
                    });
                    if ($scope.khoas.length > 0) {
                        $scope.data.matnr_khoa = $scope.khoas[0].MATNR_REFER;
                    }

                }
            };

            $scope.submit = function (status) {
                if ($scope.vsart === undefined || $scope.vsart === '' || $scope.route === undefined || $scope.route === '') {
                    bootbox.alert({
                        message: "Chọn địa điểm giao hàng",
                    })
                } else {
                    if ($rootScope.cua_cuon.value === "PKADC" || $rootScope.cua_cuon.value === "PKDTC" || $rootScope.cua_cuon.value === "PKNL" || $rootScope.cua_cuon.value === 'CCBH') {
                        $scope.theOrder.ZPK = "X";
                    }
                    $scope.theOrder.ITEMS.forEach(function (value) {
                        value.TYPE = 'ORDER';
                        if (value.Z_RETURN === true) {
                            value.Z_RETURN = 1;
                        }
                        if (value.Z_RETURN === false) {
                            value.Z_RETURN = 2;
                        }
                    });
                    $scope.theOrder.TG_DH = $scope.tg_dh;
                    $scope.theOrder.VKORG = $rootScope.sale_org;
                    $scope.theOrder.STATUS = "P";
                    $scope.theOrder.Z_DATE = $scope.theDate;
                    $scope.theOrder.ZDKGH = $scope.zend_date;
                    $scope.theOrder.TODAY = $scope.today;
                    $scope.theOrder.ZPRICE = $scope.price;
                    $scope.theOrder.TOTAL_PRICE = $scope.total_price;
                    $scope.theOrder.CK = $scope.ck;
                    $scope.theOrder.TAX = $scope.tax;
                    $scope.theOrder.TOTAL_INQUIRY = $scope.total_inquiry;
                    $scope.theOrder.address = $scope.address;
                    $scope.theOrder.vsart = $scope.vsart;
                    $scope.theOrder.route = $scope.route;
                    $scope.theOrder.ID_ITEM_MASTER = $rootScope.item_global;
                    if ($scope.theOrder.ztc === "") {
                        $scope.theOrder.ztc = "0"
                    }
                    if ($scope.theOrder.DIVISION === '02' && $rootScope.excel.value !== 'NHCCBH' && $rootScope.excel.value !== 'PKNH') {
                        $scope.theOrder.ITEMS.forEach(function (value) {
                            if (value.CHARACTERISTICS.find(o => o.ATNAM === 'Z_BOS').VALUE === '0' || value.CHARACTERISTICS.find(o => o.ATNAM === 'Z_BOS').VALUE === '' || value.CHARACTERISTICS.find(o => o.ATNAM === 'Z_BOS').VALUE === undefined) {
                                $scope.theOrder.ITEMS = $scope.theOrder.ITEMS.filter(item => item !== value);
                            }
                            ;
                        })
                    }
                    if ($scope.theOrder.DIVISION === '02' && ($rootScope.excel.value === 'NHCCBH' || $rootScope.excel.value === 'PKNH')) {
                        $scope.theOrder.ZPK = 'C';
                    }
                    ApiQuery.post('/CREATE_ORDER', {
                        request: $scope.theOrder,
                        CHECK_ROUTE: $scope.addressOption
                    }).then(function (res) {
                        if (res.data.RETURN.TYPE === 'S') {
                            if (status !== '') {
                                $state.go('Order.confirm', {idOrder: res.data.ID_ORDER});
                            } else {
                                $state.go('Order.list');
                            }
                        }
                    });

                }
            }


        }]).directive('dateFormatter', [
    function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function postLink(scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (data) {
                    var out = moment(data).format('YYYYMMDD');
                    return out;
                });

                ngModel.$formatters.push(function (data) {
                    var out = moment(data, 'YYYYMMDD').toDate();
                    return out;
                });
            }
        };
    }
]);

