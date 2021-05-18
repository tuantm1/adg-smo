let range = {
    'Today': [moment() + 1, moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
};


function regex_number(value) {
    if (value !== 0) {
        return value.toString().replace(/^0*/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    }
    return value;
};

function unRegex_number(value) {
    if (value !== 0) {
        return parseInt(value.split('.').join(''));
    }
    return value;
}

function check_data(value) {
    if (value === 0 || value === '' || value === undefined || value.length === 0) {
        return false;
    }
    return true;
}

let character_group = [
    {
        value: '01',
        description: 'Quy Cách'
    },
    {
        value: '02',
        description: 'Kích Thước'
    },
    {
        value: '03',
        description: 'Độ cao lắp PC'
    }, {
        value: '04',
        description: 'Chiều dài Khung/Trục'
    }, {
        value: '05',
        description: 'Chiều dài Khung HKT'
    },
    {
        value: '06',
        description: 'Trục cửa'
    },
    {
        value: '07',
        description: 'Bộ tời'
    },
    {
        value: '08',
        description: 'Ray'
    },
    {
        value: '09',
        description: 'Giá đỡ'
    },
    {
        value: '10',
        description: 'Khóa'
    }


];
let checkItems = function (val) {
    if (val.ITEMS.length !== 0) {
        val.itemText = "";
        val.ITEMS.forEach(function (value) {
            // value.QUANTITY = value.QUANTITY.replace(/^0*/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
            val.itemText += value.NAME
        });
    }
};

let get_order = function (ApiQuery, id_user, start, end, current, orderNumber, totalItems, listOrder, pendingNumer, successNumber, ID_ORDER, NAME_SHIPTO, ADDRESS, TODAY, Z_DATE, itemText, CREATE_BY_NAME, NAME_APPROVE, STATUS) {
    ApiQuery.post("/ZFM_GET_ORDER", {
        id_user: id_user,
        zstart: start,
        zend: end,
        _page_number: current
    }).then(function (res) {
        orderNumber += parseInt(res.data.TOTAL_ITEMS);
        totalItems += parseInt(res.data.TOTAL_ITEMS);
        console.log(totalItems);
        res.data.RES1.forEach(function (val) {
            checkItems(val);
            listOrder.push(val);
            if (val.STATUS === 'P') {
                pendingNumer++;
            }
            if (val.STATUS === 'S') {
                successNumber++;
            }
        });
    });
    return totalItems;
};

function delTem(theOrder, temID) {
    theOrder.ITEMS.splice(temID, 1);
}

function addNew(theOrder, userData) {
    theOrder.ITEMS.push({
        ID: theOrder.ITEMS.length + 1,
        id_user: userData.id_user,
        MATNR: 0,
        NAME: '',
        QUANTITY: 0,
        SALE_UNIT: "",
        TYPE: "ORDER",
        Z_RETURN: false
    })
}


function getMaraByDivision(ApiQuery, idUser, division) {
    return new Promise(resolve => {
        ApiQuery.post('/GET_MARA', {
            ID_USER: idUser,
            division: division
        }).then(function (res) {
            resolve(res.data.MARAS);
        });
    });
}

function getMaraByItems(ApiQuery, idUser, division, items) {
    return new Promise(resolve => {

        ApiQuery.post('/GET_MARA', {
            ID_USER: idUser,
            division: division,
            IT_MARAS: items
        }).then(function (res) {
            resolve(res.data.MARAS);

        });
    });
}

function getTimeNow() {
    var d = new Date();
    return (d.getHours() + ':' + d.getMinutes());
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.replace(/^data:.+;base64,/, ''));
    reader.onerror = error => reject(error);
});

const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
}

const REQUEST_TYPE = [
    {code: 'NBH', name: 'Nhập bảo hành', groupCode: 'VP', groupName: 'Văn phòng'},
    {code: 'NND', name: 'Nhập nhập đổi', groupCode: 'VP', groupName: 'Văn phòng'},
    {code: 'NSC', name: 'Nhập sửa chữa', groupCode: 'VP', groupName: 'Văn phòng'},
    {code: 'KT', name: 'Kiểm tra', groupCode: 'VP', groupName: 'Văn phòng'},
    {code: 'KP', name: 'Khắc phục', groupCode: 'VP', groupName: 'Văn phòng'},
    {code: 'NNDKK', name: 'Nhập nhập đổi kim khí', groupCode: 'VP', groupName: 'Văn phòng'},

    {code: 'HTTP', name: 'Hỗ trợ tính phí', groupCode: 'CT', groupName: 'Công trình'},
    {code: 'HTBH', name: 'Hỗ trợ bảo hành', groupCode: 'CT', groupName: 'Công trình'},
    {code: 'TV', name: 'Tư vấn', groupCode: 'CT', groupName: 'Công trình'},
    {code: 'TVKT', name: 'Tư vấn kĩ thuật', groupCode: 'CT', groupName: 'Công trình'},
    {code: 'HTBHKK', name: 'Hỗ trợ bảo hành kim khí', groupCode: 'CT', groupName: 'Công trình'},

    {code: 'BLCC', name: 'Bán lẻ cửa cuốn', groupCode: 'KHAC', groupName: 'Khác'},
    {code: 'KSCC', name: 'Khảo sát cửa cuốn', groupCode: 'KHAC', groupName: 'Khác'},
    {code: 'NTCC', name: 'Nghiệm thu cửa cuốn', groupCode: 'KHAC', groupName: 'Khác'},
    {code: 'LDCC', name: 'Lắp đặt cửa cuốn', groupCode: 'KHAC', groupName: 'Khác'},
    {code: 'DVK', name: 'Dịch vụ khác', groupCode: 'KHAC', groupName: 'Khác'},
];

const ztypes_nh = [
    {
        name: 'Việt Pháp',
        value: 'VIETPHAP'
    },
    {
        name: 'XINGFA AD',
        value: 'XFAD'
    },
    {
        name: 'XINGFA EC',
        value: 'XFEC'
    },
    {
        name: 'Slima',
        value: 'SLIMA'
    },
    {
        name: 'Prima',
        value: 'PRIMA'
    },
    {
        name: '55 AD',
        value: '55AD'
    },
    {
        name: 'Thủy lực',
        value: 'THUYLUC'
    },
    {
        name: 'Mặt dựng',
        value: 'MATDUNG'
    },
    {
        name: 'Hệ phổ thông',
        value: 'HPT'
    }

];

const status = [
    {
        name: ' ',
        value: ''
    },
    {
        name: 'Đã lưu',
        value: 'P'
    },
    {
        name: 'Đã hủy',
        value: 'R'
    },
    {
        name: 'Không thành công',
        value: 'F'
    },
    {
        name: 'Vượt hạn mức tín dụng',
        value: 'C'
    },
    {
        name: 'Chờ xử lý',
        value: 'T'
    },
    {
        name: 'Chờ bảo lãnh',
        value: 'B'
    },
    {
        name: 'Đặt thành công',
        value: 'S'
    },
    {
        name: 'Đã duyệt',
        value: 'A'
    },
    {
        name: 'Bị từ chối',
        value: 'D'
    },

];