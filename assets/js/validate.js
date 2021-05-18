var validation_init = function (_rule, _msg) {

    jQuery(".js-validation-material").validate({
        errorElement: "span",
        errorClass: "help-block help-block-error",
        rules: _rule,
        messages: _msg,
        errorPlacement: function (e, r) {
            if (r.is(":checkbox")) {
                e.insertAfter(r.closest(".md-checkbox-list, .md-checkbox-inline, .checkbox-list, .checkbox-inline"))
            } else if (r.is(":radio")) {
                e.insertAfter(r.closest(".md-radio-list, .md-radio-inline, .radio-list,.radio-inline"))
            } else if (r.is("select") && r.hasClass('select2-hidden-accessible')) {
                e.insertAfter(r.next("span.select2-container"));
            } else {
                e.insertAfter(r)
            }
        },
        highlight: function (e) {
            $(e).closest(".form-group").addClass("has-error");
        },
        unhighlight: function (e) {
            $(e).closest(".form-group").removeClass("has-error");
        },
        success: function (e) {
            e.closest(".form-group").removeClass("has-error");
        }
    });
    jQuery.validator.addMethod('selectcheck', function (value) {
        return (value !== '?');
    }, "Yêu cầu nhập đủ thông tin");
};

var checkUser = function (userName, userNameCreate) {
    if (userName.split( "." )[ 0 ] === userNameCreate.split( "." )[ 0 ] && userNameCreate.split( "." )[ 1 ] !== '' || userName === 'ADMIN') {
        return true;
    }
    return false;
};