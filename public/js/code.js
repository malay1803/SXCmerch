function show(a1,a2){
    document.getElementById("productid").value=a2;
    var rate_value;
    if(a1.includes("Tshirt")||a1.includes("Hoodie"))
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
function loginp(){
    var doc="Please Login first.";
      alert(doc);
}