window.show_alert = function (type, title, text) {
    var body = '';
    if (typeof text === 'object' && text != null && Array.isArray(text)) {
        var html_body = [];
        for (var k = 0; k < text.length; k++) {
            if (text[k][1]) {
                html_body.push('<b>' + text[k][0] + '</b>: ' + text[k][1]);
            }
            else {
                html_body.push(text[k][0]);
            }
        }
        body = html_body.join('<br/>');
    }
    else {
        body = text;
    }
    return window.swal(title, body, type);
}
