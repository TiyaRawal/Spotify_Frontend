import cookie from 'js-cookie'

function CheckToken() {
   let token=null

    try {
        let token = cookie.get("token")        
        return token
    }
    catch (e) {
        return token
    }
}

export default CheckToken
