class Api {

    constructor(uri, protocoll = "http") {
        this.url = uri;
        this.proto = protocoll;
        this.apiUri = this._apiUri();
        this.readernumber = "";
        this.token ="";
        this.booked_workspace = "";
        this.bookingCode = "";
        this.email = "";
    }
    getLocations() {


        $.ajax({
            url: this.apiUri + '/institutions',
            type: 'get',
            success: function (data) {
                data.split("#").forEach(function (e) {
                    $("#institution").append("<option value=\"" + e + "\">" + e + "</option>");
                });
            }
        });
    }
    check_date() {
        var date = $("#from_date").val();
        var institution = $("#institution").val();

        $.ajax({
            url: this.apiUri + '/checkdate',
            type: 'post',
            data: '{"date": "'+date+'", "institution": "'+institution+'"}',
            success: function (data) {
                if(data=="false")
                {
                    alert("Das ist ein Datum außerhalb der Öffnungszeiten!");
                    $("#from_date").val("");
                }
            }

        });
    }

    selectLocation() {
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

                var output = "";

                data.interval.forEach(function(e){
                   if(e.day=="2") output+= "Montag: "+e.from+" Uhr -"+e.until+" Uhr <br>";
                   if(e.day=="3") output+= "Dienstag: "+e.from+" Uhr -"+e.until+" Uhr <br>";
                   if(e.day=="4") output+= "Mittwoch: "+e.from+" Uhr -"+e.until+" Uhr <br>";
                   if(e.day=="5") output+= "Donnerstag: "+e.from+" Uhr -"+e.until+" Uhr <br>";
                   if(e.day=="6") output+= "Freitag: "+e.from+" Uhr -"+e.until+" Uhr <br>";
                   if(e.day=="7") output+= "Samstag: "+e.from+" Uhr -"+e.until+" Uhr <br>";
                   if(e.day=="1") output+= "Sonntag: "+e.from+" Uhr -"+e.until+" Uhr <br>";
                   if(e.day==null) output+= e.from+" Uhr -"+e.until+" Uhr<br>";
                });

                $("#open").html(output);

                //$("#from_time").attr({"min": data.from, "max": data.until, "value": data.from});
                //$("#until_time").attr({"min": data.from, "max": data.until, "value": data.from});
                //$("#open").text(data.from+" Uhr -"+data.until+" Uhr");
            }
        });

        $.ajax({
            url:this.apiUri + '/workload?institution='+$("#institution").val(),
            type:'get',
            success: function(data) {
                $("#workloaddata").html(data);
            }
        });

        $("#from_date").val("");
    }
    login() {
        $("#loginbtn").prop("disabled",true);
        $.ajax({
            url: this.apiUri + '/login',
            type: 'post',
            data: $('#loginform').serialize(),
            success: function (data) {
                if(data.token!="null") {
                    api.token = data.token;
                    $("#startdiv").removeClass("starter-template");
                    $("#startdiv").load("hygiene.html");
                }
                else
                {
                    alert(data.msg+"\nBitte warten Sie 10 Sekunden!");

                    setTimeout(function(){ $("#loginbtn").prop("disabled",false); }, 10000);


                }
            }
        });
        this.readernumber = $("#readernumber").val();
    }
    logout() {
        $.ajax({
            url: this.apiUri + '/logout',
            type: 'post',
            data: '{ "token": "' + api.token + '", "readernumber": "'+ api.readernumber + '" }',
            success: function (data) {
                api.token = null;
                document.location="index.html";
            }
        });
    }
    setReservation() {

        var d1 = $("#from_date").val();

        var t1 = $("#from_time").val();
        var v1 = $("#from_time").attr("min");
        var v2 = $("#from_time").attr("max");

        var t2 = $("#until_time").val();
        var w1 = $("#until_time").attr("min");
        var w2 = $("#until_time").attr("max");

        var tslot = $("#tslot").val();

        if((t1<v1||t1>v2||t2<w1||t2>w2||t2<t1||d1==""||t1==t2)&&tslot==0) {
            alert("Bitte überprüfen Sie die ausgewählten Zeiten!");
            return;
        }

        $("#workspacebtn").prop("disabled",true);
        $.ajax({
            url: this.apiUri + '/booking',
            type: 'post',
            data: $('#booking').serialize(),
            success: function(data) {

                var jsondata = $.parseJSON(data);
                api.booked_workspace = jsondata.workspaceId;
                api.bookingCode = jsondata.bookingCode;
                api.email = jsondata.email;

                var msg = jsondata.message;

                if(msg == "notbookable") {
                    alert("Die Plätze für diese Bibliothek sind erst ab 27.07.2020 buchbar.");
                    $("#workspacebtn").prop("disabled",false);
                    return;
                }

                if(msg == "notbookable2") {
                    alert("Die Bibliothek ist vom 03.08 bis 14.08. geschlossen!");
                    $("#workspacebtn").prop("disabled",false);
                    return;
                }

                if(msg == "notbookable3") {
                    alert("Die Bibliothek ist ab dem 03.08.2020 nur bis 16 Uhr geöffnet!");
                    $("#workspacebtn").prop("disabled",false);
                    return;
                }

                if(msg == "notbookable4") {
                    alert("Dieser Bereich der Bibliothek ist vom 24.08.2020 bis 4.9.2020 geschlossen!");
                    $("#workspacebtn").prop("disabled",false);
                    return;
                }

                if(msg == "outofdate"||msg == "outoftime") {
                    alert("Das ist außerhalb der Öffnungszeiten!");
                    $("#workspacebtn").prop("disabled",false);
                    return;
                }
                if(msg == "outofreach") {
                    alert("Sie können nur innerhalb der nächsten 7 Tage buchen!");
                    $("#workspacebtn").prop("disabled",false);
                    return;
                }
                if(msg == "concurrent_error") {
                    alert("Fehler bei der Buchung, bitte versuchen Sie es erneut!")
                    $("#workspacebtn").prop("disabled",false);
                    return;
                }
                if(msg == "concurrently_booking") {
                    alert("Sie haben zur gleichen Zeit bereits eine bestehende Buchung!");
                    $("#workspacebtn").prop("disabled",false);
                    return;
                }
                if(msg == "sessionerror") {
                    alert("Ihre Session ist abgelaufen!");
                    return;
                }
                if (api.booked_workspace== "") {

                    alert("Leider konnte kein freier Platz zu Ihren Konditionen gefunden werden!");
                    $("#workspacebtn").prop("disabled",false);
                } else {
                    $("#startdiv").addClass("starter-template");
                    $("#startdiv").load("result.html");
                }

            }
        });
    }

    setStorno() {
        $("#stornobtn").prop("disabled",true);
        $.ajax({
            url: this.apiUri + '/storno',
            type: 'post',
            data: $('#stornoform').serialize(),
            success: function(data) {
                alert(data.message);
                if(data.message=="Ihre Buchung wurde gelöscht."||data.message=="Die Restlaufzeit Ihrer Buchung wurde gelöscht.") {
                    document.location = "index.html";
                }else{
                    $("#stornobtn").prop("disabled",false);
                }
            }
        });
    }
    _apiUri() {
        return this.proto + '://' + this.url
    }
}

// let api = new Api ("seats.ub.uni-leipzig.de/api/booking");
 let api = new Api ("localhost:12105/booking");
//let api = new Api ("172.18.85.108:12105/booking");

function setDateInterval() {

    var mydate = new Date();
    var day1 = mydate.getDate();
    var month1 = mydate.getMonth()+1;
    var year1 = mydate.getFullYear();

    mydate.setDate(day1+7);
    var day2 = mydate.getDate()
    var month2 = mydate.getMonth()+1;
    var year2 = mydate.getFullYear();

    min = year1+"-"+("0"+month1).slice(-2)+"-"+("0"+day1).slice(-2);
    max = year2+"-"+("0"+month2).slice(-2)+"-"+("0"+day2).slice(-2);

    $("#from_date").attr({"min":min, "max":max});

}

function reservation() {
    $("#startdiv").load("login.html");
}
function storno() {
    $("#startdiv").load("storno.html");
}
function hygiene_readed() {
    $("#startdiv").load("booking.html");
}