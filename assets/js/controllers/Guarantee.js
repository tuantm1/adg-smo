MetronicApp.controller('GuaranteeCtrl',
    ['$scope', 'ApiQuery', '$rootScope',
        function ($scope, ApiQuery, $rootScope) {
            $scope.lstRequestType = REQUEST_TYPE;
            $scope.lstGuarantee = [];
            $scope.customerName = '';

            ApiQuery.post('/GET_DETAIL_CUSTOMER', {
                KUNNR: $rootScope.userData.kunnr //'1000000673'
            }).then(function (res) {
                var data = res.data.CUSTOMER;
                if (Object.keys(data).length !== 0) {
                    $scope.customerName = data.CUSTOMER_NAME;
                }
            });

            ApiQuery.get("/list_bhsc", {
                IV_CUSTOMER: $rootScope.userData.kunnr, //'1000000673',
                IV_TYPE: 'N3'
            }).then(function (res) {
                var datas = res.data.ET_DATA;
                if (typeof datas !== 'undefined' && datas.length > 0) {
                    datas.forEach(function (item) {
                        $scope.lstGuarantee.push(item);
                    });
                }
            });

            $scope.downloadAttackFile = function(QMNUM) {
                // vì QMNUM nhận được từ trang danh sách đang là 001300001805 
                // nên phải bỏ 2 số 0 ở đầu đi mới tìm kiếm được: 001300001805 => 1300001805
                QMNUM = QMNUM.slice(2, QMNUM.length);
                ApiQuery.post('/download_bhsc', {
                    IV_QMNUM: QMNUM // 1300001805
                }).then(function (res) {
                    var resType = res.data.ES_RETURN;
                    if (resType.TYPE === "S") {
                        var blob = b64toBlob(res.data.EV_BASE64, res.data.EV_TYPE);
                        saveAs(blob, res.data.EV_NAME);
                    }
                    else{
                        bootbox.alert({
                            message: "Không có file attack!!!",
                            callback: function () {
                            }
                        });
    
                        return;
                    }
                });
            };

            $scope.getRequestTypeName = function(codeType){
                var type = REQUEST_TYPE.find(x => x.code == codeType);
                return type ? (type.groupCode + " - " + type.name) : "";
            };
        }]);


MetronicApp.controller('GuaranteeSearchInformationCtrl',
    ['$scope', '$state',
        function ($scope, $state) {
            $scope.guaranteeSearch = {
                serialFrom: '',
                serialTo: '',
                orderNumber: '',
            };

            $scope.submitSearchGuarantee = function () {
                if ($scope.guaranteeSearch.serialFrom === '' && $scope.guaranteeSearch.serialTo === '' && $scope.guaranteeSearch.orderNumber === '') {
                    bootbox.alert({
                        message: "Bạn chưa nhập thông tin tìm kiếm. Vui lòng nhập lại!!!",
                        callback: function () {
                        }
                    });

                    return;
                }

                var objParam = {
                    I_SERIAL_LOW: $scope.guaranteeSearch.serialFrom,
                    I_SERIAL_HIGH: $scope.guaranteeSearch.serialTo,
                    I_VBELN_LOW: $scope.guaranteeSearch.orderNumber,
                    I_VBELN_HIGH: '',
                };

                $state.go('Guarantee.listInformation', { searchGuarantee: objParam });
            };
        }]);


MetronicApp.controller('GuaranteeInformationsCtrl',
    ['$rootScope', '$scope', '$state', '$stateParams', 'ApiQuery',
        function ($rootScope, $scope, $state, $stateParams, ApiQuery) {
            $scope.guaranteeModel = {};
            $scope.lstGuaranteeInformation = [];
            $scope.customerName = '';

            ApiQuery.post('/GET_DETAIL_CUSTOMER', {
                KUNNR: $rootScope.userData.kunnr //'1000000673'
            }).then(function (res) {
                var data = res.data.CUSTOMER;
                if (Object.keys(data).length !== 0) {
                    $scope.customerName = data.CUSTOMER_NAME;
                }
            });

            ApiQuery.get("/get_bhsc", {
                I_SERIAL_LOW: ($stateParams.searchGuarantee) ? $stateParams.searchGuarantee.I_SERIAL_LOW : '',
                I_SERIAL_HIGH: ($stateParams.searchGuarantee) ? $stateParams.searchGuarantee.I_SERIAL_HIGH : '',
                I_VBELN_LOW: ($stateParams.searchGuarantee) ? $stateParams.searchGuarantee.I_VBELN_LOW : '',
                I_VBELN_HIGH: ($stateParams.searchGuarantee) ? $stateParams.searchGuarantee.I_VBELN_HIGH : '',
                I_DATE: moment().format('YYYYMMDD')
            }).then(function (res) {
                var datas = res.data.ET_BHSC;
                if (typeof datas !== 'undefined' && datas.length > 0) {
                    datas.forEach(function (item) {
                        $scope.lstGuaranteeInformation.push(item);
                        // console.log($scope.lstGuaranteeInformation);
                    });
                }
            });


            $scope.setGuarantee = function (item) {
                $scope.guaranteeModel = item;
                // console.log('$scope.guaranteeModel', $scope.guaranteeModel);
            };

            $scope.createGuarantee = function () {
                if (Object.keys($scope.guaranteeModel).length === 0 && $scope.guaranteeModel.constructor === Object) {
                    bootbox.alert({
                        message: "Không có thông tin BHSC nào được chọn để tạo yêu cầu BHSC. Vui lòng kiểm tra lại!!!",
                        callback: function () {

                        }
                    });

                    return;
                }

                $state.go('Guarantee.create', { guaranteeInfo: $scope.guaranteeModel });
            };
        }]);


MetronicApp.controller('CreateGuaranteeCtrl',
    ['$scope', '$state', '$stateParams', 'ApiQuery', 'ApiUrl', 
        function ($scope, $state, $stateParams, ApiQuery, ApiUrl) {
            $scope.requestTypes = REQUEST_TYPE;

            var maxFileSize = 131072;
            $scope.requestType = {};
            $scope.createGuarantee = ($stateParams.guaranteeInfo !== null) ? $stateParams.guaranteeInfo : {};

            $scope.submitCreateGuarantee = async function () {
                if (Object.keys($scope.createGuarantee).length === 0 && $scope.createGuarantee.constructor === Object) {
                    bootbox.alert({
                        message: "Không có thông tin BHSC nào để tạo yêu cầu BHSC!!!",
                        callback: function () {
                        }
                    });

                    return;
                }

                var file = $scope.getFile();
                if (file) {
                    if (file.size > maxFileSize) {
                        bootbox.alert({
                            message: "File đính kèm có kích thước tối đa là 128kB. Vui lòng kiểm tra lại!!!",
                            callback: function () {
                            }
                        });
    
                        return;
                    }
                    
                    var base64 = await toBase64(file).catch(e => Error(e));
                    if(base64 instanceof Error) {
                        bootbox.alert({
                            message: "Có lỗi xảy ra ở file đính kèm. Vui lòng kiểm tra lại!!!",
                            callback: function () {
                            }
                        });
                        return;
                    }
                }

                $scope.createGuarantee.MAKTX = $('#result-product-search').attr('data-MAKTX');
                $scope.createGuarantee.MATNR = $('#result-product-search').attr('data-MATNR');

                if ($scope.createGuarantee.MATNR == ''){
                    bootbox.alert({
                        message: "Vui lòng chọn sản phẩm cần bảo hành!!!",
                        callback: function () {
                        }
                    });

                    return;
                }

                var objParam = [
                    {
                        MANDT: ($scope.createGuarantee && $scope.createGuarantee.MANDT !== undefined) ? $scope.createGuarantee.MANDT : "",
                        WERKS: ($scope.createGuarantee && $scope.createGuarantee.WERKS !== undefined) ? $scope.createGuarantee.WERKS : "",
                        ZYCSX: ($scope.createGuarantee && $scope.createGuarantee.ZYCSX !== undefined) ? $scope.createGuarantee.ZYCSX : "",
                        VBELN: ($scope.createGuarantee && $scope.createGuarantee.VBELN !== undefined) ? $scope.createGuarantee.VBELN : "",
                        POSNR_VE: ($scope.createGuarantee && $scope.createGuarantee.POSNR_VE !== undefined) ? $scope.createGuarantee.POSNR_VE : "",
                        AUFNR: ($scope.createGuarantee && $scope.createGuarantee.AUFNR !== undefined) ? $scope.createGuarantee.AUFNR : "",
                        AUGRU: ($scope.createGuarantee && $scope.createGuarantee.AUGRU !== undefined) ? $scope.createGuarantee.AUGRU : "",
                        MATNR: ($scope.createGuarantee && $scope.createGuarantee.MATNR !== undefined) ? $scope.createGuarantee.MATNR : "",
                        LGORT: ($scope.createGuarantee && $scope.createGuarantee.LGORT !== undefined) ? $scope.createGuarantee.LGORT : "",
                        MATNR_SMS: ($scope.createGuarantee && $scope.createGuarantee.MATNR_SMS !== undefined) ? $scope.createGuarantee.MATNR_SMS : "",
                        SERNR: ($scope.createGuarantee && $scope.createGuarantee.SERNR !== undefined) ? $scope.createGuarantee.SERNR : "",
                        SERNR_OLD: ($scope.createGuarantee && $scope.createGuarantee.SERNR_OLD !== undefined) ? $scope.createGuarantee.SERNR_OLD : "",
                        B_LAGER: ($scope.createGuarantee && $scope.createGuarantee.B_LAGER !== undefined) ? $scope.createGuarantee.B_LAGER : "",
                        CHARGE: ($scope.createGuarantee && $scope.createGuarantee.CHARGE !== undefined) ? $scope.createGuarantee.CHARGE : "",
                        MBLNR: ($scope.createGuarantee && $scope.createGuarantee.MBLNR !== undefined) ? $scope.createGuarantee.MBLNR : "",
                        MBLNR2: ($scope.createGuarantee && $scope.createGuarantee.MBLNR2 !== undefined) ? $scope.createGuarantee.MBLNR2 : "",
                        ZEILE: ($scope.createGuarantee && $scope.createGuarantee.ZEILE !== undefined) ? $scope.createGuarantee.ZEILE : "",
                        MJAHR: ($scope.createGuarantee && $scope.createGuarantee.MJAHR !== undefined) ? $scope.createGuarantee.MJAHR : "",
                        SMBLN: ($scope.createGuarantee && $scope.createGuarantee.SMBLN !== undefined) ? $scope.createGuarantee.SMBLN : "",
                        SMBLP: ($scope.createGuarantee && $scope.createGuarantee.SMBLP !== undefined) ? $scope.createGuarantee.SMBLP : "",
                        SJAHR: ($scope.createGuarantee && $scope.createGuarantee.SJAHR !== undefined) ? $scope.createGuarantee.SJAHR : "",
                        LOAI_VT_DAN_TEM: ($scope.createGuarantee && $scope.createGuarantee.LOAI_VT_DAN_TEM !== undefined) ? $scope.createGuarantee.LOAI_VT_DAN_TEM : "",
                        ERDAT: ($scope.createGuarantee && $scope.createGuarantee.ERDAT !== undefined) ? $scope.createGuarantee.ERDAT : "",
                        ERNAM: ($scope.createGuarantee && $scope.createGuarantee.ERNAM !== undefined) ? $scope.createGuarantee.ERNAM : "",
                        NAME_NBH: ($scope.createGuarantee && $scope.createGuarantee.NAME_NBH !== undefined) ? $scope.createGuarantee.NAME_NBH : "",
                        ADDR_NBH: ($scope.createGuarantee && $scope.createGuarantee.ADDR_NBH !== undefined) ? $scope.createGuarantee.ADDR_NBH : "",
                        STATUS_CNTC: ($scope.createGuarantee && $scope.createGuarantee.STATUS_CNTC !== undefined) ? $scope.createGuarantee.STATUS_CNTC : "",
                        STATUS_NBH: ($scope.createGuarantee && $scope.createGuarantee.STATUS_NBH !== undefined) ? $scope.createGuarantee.STATUS_NBH : "",
                        PHONE_NBH: ($scope.createGuarantee && $scope.createGuarantee.PHONE_NBH !== undefined) ? $scope.createGuarantee.PHONE_NBH : "",
                        DATE_KH: ($scope.createGuarantee && $scope.createGuarantee.DATE_KH !== undefined) ? $scope.createGuarantee.DATE_KH : "",
                        TIME_KH: ($scope.createGuarantee && $scope.createGuarantee.TIME_KH !== undefined) ? $scope.createGuarantee.TIME_KH : "",
                        ZID: ($scope.createGuarantee && $scope.createGuarantee.ZID !== undefined) ? $scope.createGuarantee.ZID : "",
                        MAKTX: ($scope.createGuarantee && $scope.createGuarantee.MAKTX !== undefined) ? $scope.createGuarantee.MAKTX : "",
                        KUNNR: ($scope.createGuarantee && $scope.createGuarantee.KUNNR !== undefined) ? $scope.createGuarantee.KUNNR : "",
                        KUNNR_N: ($scope.createGuarantee && $scope.createGuarantee.KUNNR_N !== undefined) ? $scope.createGuarantee.KUNNR_N : "",
                        GUAR_FDATE: ($scope.createGuarantee && $scope.createGuarantee.GUAR_FDATE !== undefined) ? $scope.createGuarantee.GUAR_FDATE : "",
                        GUAR_TDATE: ($scope.createGuarantee && $scope.createGuarantee.GUAR_TDATE !== undefined) ? $scope.createGuarantee.GUAR_TDATE : "",
                        GUAR_DATE: ($scope.createGuarantee && $scope.createGuarantee.GUAR_DATE !== undefined) ? $scope.createGuarantee.GUAR_DATE : 0,
                        GUAR_USE: ($scope.createGuarantee && $scope.createGuarantee.GUAR_USE !== undefined) ? $scope.createGuarantee.GUAR_USE : 0,
                        STATUS: ($scope.createGuarantee && $scope.createGuarantee.STATUS !== undefined) ? $scope.createGuarantee.STATUS : "",
                        I_DESCRIPTION: $scope.createGuarantee.I_DESCRIPTION, // get from $scope
                        I_SL: $scope.createGuarantee.I_SL, // get from $scope
                        I_NGUYENNHAN: ($scope.createGuarantee && $scope.createGuarantee.I_NGUYENNHAN !== undefined) ? $scope.createGuarantee.I_NGUYENNHAN : "",
                        I_FEGRP: $scope.requestType.groupCode,
                        I_FECOD: $scope.requestType.code,
                        E_QMNUM: ($scope.createGuarantee && $scope.createGuarantee.E_QMNUM !== undefined) ? $scope.createGuarantee.E_QMNUM : "",
                    }
                ];

                $scope.createGuarantee.MAKTX = "";
                $scope.createGuarantee.MATNR = "";

                ApiQuery.post("/create_bhsc", { IT_BHSC: objParam }).then(function (res) {
                    var datas = res.data.IT_BHSC;

                    if (typeof datas !== 'undefined' && datas.length > 0) {
                        if (datas[0].E_QMNUM) {
                            if (file) {
                                ApiQuery.post("/attach_bhsc", { 
                                    IV_QMNUM: datas[0].E_QMNUM,
                                    IV_NAME: file.name,
                                    IV_TYPE: file.type,
                                    IV_BASE64: base64
                                }).then(function (res1) {
                                    bootbox.alert({
                                        message: "Tạo thành công yêu cầu bảo hành sửa chữa có mã " + datas[0].E_QMNUM + " có file đính kèm!!!",
                                        callback: function () {
                                            $state.go('Guarantee.list');
                                        }
                                    });
        
                                    return;
                                });
                            }else{
                                bootbox.alert({
                                    message: "Tạo thành công yêu cầu bảo hành sửa chữa có mã " + datas[0].E_QMNUM + " !!!",
                                    callback: function () {
                                        $state.go('Guarantee.list');
                                    }
                                });
    
                                return;
                            }
                        }
                    }else{
                        bootbox.alert({
                            message: "Tạo yêu cầu bảo hành sửa chữa không thành công. Vui lòng kiểm tra lại!!!",
                            callback: function () {
                            }
                        });
                    }
                });
            };

            $scope.getFile = function () {
                var items = $("[name='attach_file_guarantee']");
                if (items.length === 0)
                    return null;
                if (items[0].files.length === 0)
                    return null;

                return items[0].files[0];
            };
        }]);
    