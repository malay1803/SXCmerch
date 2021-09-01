function showitem(){
    var val=document.getElementById("showfilter").value;
    
    var id='no'+val;
    var out=document.getElementsByClassName(id);

    if(val!="all"){
        var line = document.getElementsByClassName('hide');
        for (var i = 0; i < line.length; i ++) {
            line[i].style.display = 'none';
        }
        var lines = document.getElementsByClassName(val);
        for (var i = 0; i < lines.length; i ++) {
            lines[i].style.display = 'table-row';
            out[i].innerHTML=i+1;
        }
    }
    else{
        var line = document.getElementsByClassName('hide');
        for (var i = 0; i < line.length; i ++) {
            line[i].style.display = 'table-row';
        }
    }
}

function show(a1,a2,a3){
    document.getElementById("productid").value=a2;
    var rate_value;
    if(a3.includes("tshirt")||a3.includes("hoodie"))
{
    
    if (document.getElementById(a1+"s").checked) {
        rate_value = document.getElementById(a1+"s").value;
    }
    else if (document.getElementById(a1+"m").checked) {
        rate_value = document.getElementById(a1+"m").value;
    }

    else if (document.getElementById(a1+"l").checked) {
        rate_value = document.getElementById(a1+"l").value;
    }
    else if (document.getElementById(a1+"xl").checked) {
        rate_value = document.getElementById(a1+"xl").value;
    }
    
    else if (document.getElementById(a1+"xxl").checked) {
        rate_value = document.getElementById(a1+"xxl").value;
    }
    }
    else{
        rate_value="";
    }
       
    document.getElementById("productsize").value=rate_value;

}

function showproduct(pid,pname,pdes,pprice,pcategory){
    console.log(pid);
    document.getElementById("productid1").value=pid;
    document.getElementById("productname1").value=pname;
    document.getElementById("productDesc").value=pdes;
    document.getElementById("unitPrice").value=pprice;
    document.getElementById("pcategory1").value=pcategory;
}

function loginp(){
    var doc="Please Login first.";
      alert(doc);
}

function run2function(inp1,inp2){
    checkp(inp2);
    cpasscheck(inp1,inp2);
}

function checkp(inp){
    var textbox=document.getElementById(inp);
    var pass=document.getElementById(inp).value;
    if(pass.length<6){
        textbox.setCustomValidity("Password must be at least 6 characters long.");
    }
    else {
        textbox.setCustomValidity('');}
}

function cpasscheck(inp1,inp2){
    var textbox1=document.getElementById(inp1);
    var textbox2=document.getElementById(inp2);
    if(textbox1.value!=textbox2.value){
        textbox2.setCustomValidity("Confirm Password must be same as Password.");
    }
    else {
        textbox2.setCustomValidity('');}
    
}
function checkpin(inp){
    var textbox=document.getElementById(inp);
    var pass=document.getElementById(inp).value;
    if(pass.length!=6 || pass != parseInt(pass,10) ){//|| !Number.isInteger(pass)
        textbox.setCustomValidity("Enter valid Pincode.");
    }
    else {
        textbox.setCustomValidity('');}
}

function checkphone(inp){
    var textbox=document.getElementById(inp);
    var phone=document.getElementById(inp).value;
    if(phone[0]=='+'){

        if(phone.includes(" ")){
            textbox.setCustomValidity("Please Remove Spaces.");
        }
        else if(phone.length!=13 || phone != parseInt(phone,10)){
            textbox.setCustomValidity("Enter valid PhoneNumber.");
        }
        else {
            textbox.setCustomValidity('');
        }
    }else
        if((phone.length!=10 && phone.length!=11) || phone != parseInt(phone,10) ){
            textbox.setCustomValidity("Enter valid PhoneNumber.");
        }
        else {
            textbox.setCustomValidity('');
        }
}

function checknum(inp){
    var textbox=document.getElementById(inp);
    var num=document.getElementById(inp).value;
    
        if(num != parseInt(num,10) ){
            textbox.setCustomValidity("Enter integer value.");
        }
        else {
            textbox.setCustomValidity('');
        }
}
function checkimg(inp){
    var textbox=document.getElementById(inp);
    var num=document.getElementById(inp).value;
    
    var allowedExtensions = ['.jpg','.jpeg','.png','.svg'];
    if(!(num.includes(allowedExtensions[0]) || num.includes(allowedExtensions[1]) || num.includes(allowedExtensions[2]) || num.includes(allowedExtensions[3]))){
        alert('Please upload file having extensions .jpeg/.jpg/.png/.svg only.');
        textbox.value = '';
    }else{
        textbox.setCustomValidity('');
    }
}

function display_ct5() {
    // var x = new Date()
    // var ampm = x.getHours( ) >= 12 ? ' PM' : ' AM';
    var date = new Date();
    
    var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    var am_pm = date.getHours() >= 12 ? "PM" : "AM";
    
    var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    
    var time = hours + ":" + minutes + ":" + seconds + " " + am_pm;
    //var x1 =  (x.getHours()<10?'0'+x.getHours():x.getHours()) + ":" + (x.getMinutes()<10?'0'+x.getMinutes():x.getMinutes()) + ":" +  (x.getSeconds()<10?'0'+x.getSeconds():x.getSeconds()) + " " + ampm;
    
    document.getElementById('timeimp').innerHTML = time;
    display_c5();
}
function display_c5(){
    var refresh=1000; // Refresh rate in milli seconds
    mytime=setTimeout('display_ct5()',refresh)
}