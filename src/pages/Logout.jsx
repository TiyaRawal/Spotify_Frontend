import Cookies from "js-cookie";

function Logout() {
    try {
        Cookies.remove("token");
        alert("Logout Successful");
        window.location.href = "/";
    } catch (e) {
        window.location.href = "/";
    }
}

export default Logout;