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
        this.bookingtime = "";
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
    login(x) {
        $("#loginbtn").prop("disabled",true);
        $.ajax({
            url: this.apiUri + '/login',
            type: 'post',
            data: $('#loginform').serialize(),
            success: function (data) {
                if(data.token!="null") {
                    api.token = data.token;
                    $("#startdiv").removeClass("starter-template");
                    if(x==0) $("#startdiv").load("hygiene.html");
                    if(x==1) $("#startdiv").load("storno.html");
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
    getBookings() {
        $.ajax({
            url: this.apiUri + '/admin',
            type: 'post',
            data: '{ "token": "' + api.token + '", "readernumber": "'+ api.readernumber + '" }',
            success: function (data) {
                for(var x=0;x<data.bookings.length;x++) {

                    var start_hour = ("0"+new Date(data.bookings[x].start).getHours()).slice(-2);
                    var end_hour = ("0"+new Date(data.bookings[x].end).getHours()).slice(-2);
                    var start_minute = ("0"+new Date(data.bookings[x].start).getMinutes()).slice(-2);
                    var end_minute = ("0"+new Date(data.bookings[x].end).getMinutes()).slice(-2);

                    var rowcode = "<form id='"+data.bookings[x].bookingCode+"'>"+
                                  "<div class='form-group row' style='border-width:thin;border-style: solid; padding: 10px'>"+
                                  "<div class='col-sm-2'>Arbeitsplatz-Nr.:</div>"+
                                  "<div class='col-sm-2'>"+data.bookings[x].id+"</div>"+
                                  "<div class='col-sm-2'>"+data.bookings[x].institution+"</div>"+
                                  "<div class='col-sm-2'>"+new Date(data.bookings[x].start).toLocaleDateString()+"</div>"+
                                  "<div class='col-sm-2'>von <input type='time' id='from' name='from' value='"+start_hour+":"+start_minute+"'></div>"+
                                  "<div class='col-sm-2'>bis <input type='time' id='until' name='until' value='"+end_hour+":"+end_minute+"'></div>"+
                                  "<div class='col-sm-2'><button class='btn btn-primary' id='"+data.bookings[x].bookingCode+"_modifybtn' onclick=\"javascript:api.modify('"+data.bookings[x].bookingCode+"')\">Kürzen</button></div>" +
                                  "<div class='col-sm-2'><button class='btn btn-primary' id='"+data.bookings[x].bookingCode+"_stornobtn' onclick=\"javascript:api.storno('"+data.bookings[x].bookingCode+"')\">Stornieren</button></div>"+
                                  "<input type='hidden' id='readernumber' name='readernumber' value='"+api.readernumber+"'/>"+
                                  "<input type='hidden' id='token' name='token' value='"+api.token+"'/>"+
                                  "<input type='hidden' id='bookingCode' name='bookingCode' value='"+data.bookings[x].bookingCode+"'/>"+
                                  "<div></form>";
                    $("#result").append(rowcode);
                    $("#"+data.bookings[x].bookingCode).submit(function(event){
                        event.preventDefault();
                    })
                }
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

        if(tslot>0&&!d1) {
            alert("Bitte ein Datum auswählen!");
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

                var von = new Date(+jsondata.bookingtime.split(":")[0]);
                var bis = new Date(+jsondata.bookingtime.split(":")[1])

                api.bookingtime = "von "+("0"+von.getHours()).slice(-2)+":"+("0"+von.getMinutes()).slice(-2)+" bis "+("0"+bis.getHours()).slice(-2)+":"+("0"+bis.getMinutes()).slice(-2);

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
    storno(bc) {

        var really = window.confirm("Buchung wirklich stornieren?");

        if(!really) {
            return;
        }

        $("#"+bc+"_stornobtn").prop("disabled", true);

        $.ajax({
            url: this.apiUri + '/storno',
            type: 'post',
            data: $('#'+bc).serialize(),
            success: function(data) {
                alert(data.message);
                if(data.message=="Ihre Buchung wurde gelöscht."||data.message=="Die Restlaufzeit Ihrer Buchung wurde gelöscht.") {
                    //document.location = "index.html";
                    $("#startdiv").load("storno.html");
                }else{
                    $("#"+bc+"_stornobtn").prop("disabled",false);
                }
            }
        });
    }
    modify(bc) {

        var really = window.confirm("Buchung wirklich verkürzen?");

        if(!really) {
            return;
        }

        $("#"+bc+"_modifybtn").prop("disabled",true);
        $.ajax({
            url: this.apiUri + '/modify',
            type: 'post',
            data: $('#'+bc).serialize(),
            success: function(data) {
                alert(data.msg);
                if(data.msg=="Ihre Buchung wurde geändert.") {
                    //document.location = "index.html";
                    $("#startdiv").load("storno.html");
                }else{
                    $("#"+bc+"_modifybtn").prop("disabled",false);
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

function openstorno() {
    $("#startdiv").load("login_storno.html");
}

function hygiene_readed() {
    $("#startdiv").load("booking.html");
}

function changebookingmethod() {

    if($("#tslot").val()!=0) {
        $("#from_time").prop("disabled", true);
        $("#until_time").prop("disabled", true);
    }
    else {
        $("#from_time").prop("disabled", false);
        $("#until_time").prop("disabled", false);
    }
}