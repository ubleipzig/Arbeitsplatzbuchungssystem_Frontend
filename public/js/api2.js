class Api2 {

    constructor(uri, protocoll = "http") {
        this.url = uri;
        this.proto = protocoll;
        this.apiUri = this._apiUri();
        this.username = "";
        this.token ="";


    }
    login() {
        $("#maloginbtn").prop("disabled",true);
        $.ajax({
            url: this.apiUri + '/malogin',
            type: 'post',
            data: $('#maloginform').serialize(),
            success: function (data) {
                if(data.token!="null") {
                    api2.token = data.token;
                    $("#startdiv").removeClass("starter-template");
                    $("#startdiv").load("main.html");
                }
                else
                {
                    alert(data.msg);
                    $("#maloginbtn").prop("disabled",false);

                }
            }
        });
        this.username = $("#username").val();
    }
    logout() {
        $.ajax({
            url: this.apiUri + '/malogout',
            type: 'post',
            data: '{ "token": "' + api2.token + '", "username": "'+ api2.username + '" }',
            success: function (data) {
                api2.token = null;
                document.location="index.html";
            }
        });
    }
    check() {
        $("#checkbtn").prop("disabled",true);
        $.ajax({
            url: this.apiUri + '/check',
            type: 'post',
            data: $('#check').serialize(),
            success: function (data) {
                for(var i in data.result) {
                    $("#checkinfo").empty();

                    var entry = "<div class=\"row\"><div class=\"col-sm\">Platznummer</div><div class=\"col-sm\">Standort</div><div class=\"col-sm\">Von</div><div class=\"col-sm\">Bis</div></div>";

                    $("#checkinfo").append(entry);

                    for(var i in data.result) {

                        entry = "<div class=\"row look\"><div class=\"col-sm\">"+data.result[i].workspaceId+"</div><div class=\"col-sm\">"+data.result[i].institution+
                            "</div><div class=\"col-sm\">"+data.result[i].start.slice(0,16)+"</div><div class=\"col-sm\">"+data.result[i].end.slice(0, 16)+"</div>"+
                            "</div>";

                        $("#checkinfo").append(entry);
                    }
                }

                $("#checkbtn").prop("disabled",false);
            }
        });
    }
    getLocation(){
        $.ajax({
            url: this.apiUri + '/institutions',
            type: 'get',
            success: function (data) {
                data.split("#").forEach(function (e) {
                    $("#institutions").append("<option value=\"" + e + "\">" + e + "</option>");
                });
            }
        });
    }
    getPlan() {
        $("#bookingplanok").prop("disabled", true);
        $.ajax({
            url: this.apiUri + '/plan',
            type: 'post',
            data: $('#bookingplan').serialize(),
            success: function (data) {

                $("#plandiv").empty();

                var entry = "<div class=\"row\"><div class=\"col-sm\">Platznummer</div><div class=\"col-sm\">Bibliotheksnummer</div><div class=\"col-sm\">Von</div><div class=\"col-sm\">Bis</div><div class=\"col-sm\"></div></div>";

                $("#plandiv").append(entry);

                for(var i in data.result) {

                    entry = "<div class=\"row look\"><div class=\"col-sm\">"+data.result[i].workspaceId+"</div><div class=\"col-sm\">"+data.result[i].readernumber+
                        "</div><div class=\"col-sm\">"+data.result[i].start.slice(0,16)+"</div><div class=\"col-sm\">"+data.result[i].end.slice(0, 16)+"</div>"+
                        "<div class=\"col-sm\"><button id=\"remove-"+data.result[i].bookingCode+"\" onclick=\"javascript:api2.remove('"+data.result[i].readernumber+"','"+data.result[i].bookingCode+"')\">Stornieren</button></div>"+
                        "</div>";

                    $("#plandiv").append(entry);
                }
                $("#bookingplanok").prop("disabled", false);
            }


        });
    }
    remove(readernumber, bookingCode) {
        $("#remove-"+bookingCode).prop("disabled", true);
        $.ajax({
            url: this.apiUri + '/mastorno',
            type: 'post',
            data: '{ "token": "' + api2.token + '", "readernumber": "'+ readernumber + '", "bookingCode": "' +bookingCode+'" }',
            success: function (data) {
                alert(data.message);
            }
        });
    }
    _apiUri() {
        return this.proto + '://' + this.url
    }
}

// let api = new Api2 ("seats.ub.uni-leipzig.de/api/booking");
 let api2 = new Api2 ("localhost:12105/booking");
//let api = new Api2 ("172.18.85.108:12105/booking");

function checkreservation() {
    $("#startdiv").load("check.html");
}

function selectbookingplan() {
    $("#startdiv").load("bookingplan.html");
}

function backtomain() {
    $("#startdiv").load("main.html");
}
