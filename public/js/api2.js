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
    selectLocation(){
        $.ajax({
            url: this.apiUri + '/timeslots?institution='+$("#institutions").val(),
            type: 'get',
            success: function(data) {

                $("#data").val(JSON.stringify(data,null,10));

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

                //$("#open").html(output);

                $("#cb_sunday").prop("checked", false);
                $("#cb_monday").prop("checked", false);
                $("#cb_tuesday").prop("checked", false);
                $("#cb_wednesday").prop("checked", false);
                $("#cb_thursday").prop("checked", false);
                $("#cb_friday").prop("checked", false);
                $("#cb_saturday").prop("checked", false);

                var recclosredays = data.recclosuredays;
                if(recclosredays!=null)
                recclosredays.split(",").forEach(function (e){
                    if(e==1) $("#cb_sunday").prop("checked", true);
                    if(e==2) $("#cb_monday").prop("checked", true);
                    if(e==3) $("#cb_tuesday").prop("checked", true);
                    if(e==4) $("#cb_wednesday").prop("checked", true);
                    if(e==5) $("#cb_thursday").prop("checked", true);
                    if(e==6) $("#cb_friday").prop("checked", true);
                    if(e==7) $("#cb_saturday").prop("checked", true);
                });

                var specclosuredays = data.specclosuredays;
                $("#data_scd").val(specclosuredays);
                //$("#from_time").attr({"min": data.from, "max": data.until, "value": data.from});
                //$("#until_time").attr({"min": data.from, "max": data.until, "value": data.from});
                //$("#open").text(data.from+" Uhr -"+data.until+" Uhr");
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
    loadexistingrules(){
        $.ajax({
           url: this.apiUri + '/rulesets',
           type: 'post',
           data: '{}',
            success: function (data) {

               data.SpecialRulesets.forEach(function (e){
                   $("#existingRules").append("<b>Name: </b>"+e+" <a href='#'>Bearbeiten</a> <a href='#'>Löschen</a><br>");
               });


            }
        });
    }
    createnewrule(){

    }
    _apiUri() {
        return this.proto + '://' + this.url
    }
}

// let api2 = new Api2 ("seats.ub.uni-leipzig.de/api/booking");
 let api2 = new Api2 ("localhost:12105/booking");
//let api2 = new Api2 ("172.18.85.108:12105/booking");

function checkreservation() {
    $("#startdiv").load("check.html");
}

function selectbookingplan() {
    $("#startdiv").load("bookingplan.html");
}

function selectclosure() {
    if(api2.username=="freitag") $("#startdiv").load("closure.html");
    else alert("Sub-System leider nicht verfügbar.");
}

function mabooking() {
    $("#startdiv").load("mabooking.html");
}

function backtomain() {
    $("#startdiv").load("main.html");
}

function specialruleset() {
    $("#startdiv").load("rulesets.html");
}

function newruleset() {
    $("#newruleset_btn").prop("disabled", true);
    $("#newRuleset").load("newruleset.html");
}
