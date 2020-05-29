class Api {
    constructor(uri, protocoll = "http") {
        this.url = uri;
        this.proto = protocoll;
        this.apiUri = this._apiUri();
        this.readernumber = "";
        this.token ="";
    }
    getLocations() {
        $.ajax({
            url: this.apiUri + '/areas?institution='+$("#institution").val(),
            type: 'get',
            success: function(data) {
                $("#area option").remove();
                $("#area").append("<option value=\"no selection\">Keine Auswahl</option>");
                data.split("#").forEach(function(e){
                    $("#area").append("<option value=\""+e+"\">"+e+"</option>");
                });
            }
        });

        $.ajax({
            url: this.apiUri + '/timeslots?institution='+$("#institution").val(),
            type: 'get',
            success: function(data) {
                $("#from_time").attr({"min": data.from, "max": data.until, "value": data.from});
                $("#until_time").attr({"min": data.from, "max": data.until, "value": data.from});
            }
        });
    }
    login() {
        $.ajax({
            url: this.apiUri + '/login',
            type: 'post',
            data: $('#loginform').serialize(),
            success: function (data) {
                if(data.token!="null") {
                    this.token = data.token;
                    $("#startdiv").removeClass("starter-template");
                    //$("#startdiv").load("booking.html");
                    $("#startdiv").load("hygiene.html");
                }
                else
                    alert(data.msg);
            }
        });
        this.readernumber = $("#readernumber").val();
    }
    logout() {
        $.ajax({
            url: this.apiUri + '/logout',
            type: 'post',
            data: '{ "token": "' + this.token + '", "readernumber": "'+ this.readernumber + '" }',
            success: function (data) {
                this.token = null;
                document.location="index.html";
            }
        });
    }
    setReservation() {
        var booked_workspace = 0;
        var bookingCode = 0;
        var email = "";

        var d1 = $("#from_date").val();

        var t1 = $("#from_time").val();
        var v1 = $("#from_time").attr("min");
        var v2 = $("#from_time").attr("max");

        var t2 = $("#until_time").val();
        var w1 = $("#until_time").attr("min");
        var w2 = $("#until_time").attr("max");

        if(t1<v1||t1>v2||t2<w1||t2>w2||t2<t1||d1==""||t1==t2) {
            alert("Bitte überprüfen Sie die ausgewählten Zeiten!");
            return;
        }

        $.ajax({
            url: this.apiUri + '/booking',
            type: 'post',
            data: $('#booking').serialize(),
            success: function(data) {

                var jsondata = $.parseJSON(data);
                booked_workspace = jsondata.workspaceId;
                bookingCode = jsondata.bookingCode;
                email = jsondata.email;
                msg = jsondata.message;

                if(msg == "concurrently_booking") {
                    alert("Sie haben zur gleichen Zeit bereits eine bestehende Buchung!");
                    return;
                }
                if (booked_workspace== "") {
                    alert("Leider konnte kein freier Platz zu Ihren Konditionen gefunden werden!");
                } else {
                    $("#startdiv").addClass("starter-template");
                    $("#startdiv").load("result.html");
                }

            }
        });
    }
    setStorno() {
        $.ajax({
            url: this.apiUri + '/storno',
            type: 'post',
            data: $('#stornoform').serialize(),
            success: function(data) {
                alert(data.message);
                if(data.message=="Ihre Buchung wurde gelöscht.") {
                    document.location = "index.html";
                }
            }
        });
    }
    _apiUri() {
        return this.proto + '://' + this.url
    }
}

// let api = new Api ("seats.ub.uni-leipzig.de/api/booking");
// let api = new Api ("localhost:12105/booking");
let api = new Api ("172.18.85.108:12105/booking");


function reservation() {
    $("#startdiv").load("login.html");
}
function storno() {
    $("#startdiv").load("storno.html");
}
function hygiene_readed() {
    $("#startdiv").load("booking.html");
}
