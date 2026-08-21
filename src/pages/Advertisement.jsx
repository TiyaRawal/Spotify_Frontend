import { useNavigate } from "react-router-dom";
import "../styles/Advertisement.css";

function Advertisement({ ad, CloseAdvertisement }) {

    const navigate = useNavigate();
    return (

        <div className="ad-overlay">
            <div className="ad-popup">
                <button className="ad-close" onClick={CloseAdvertisement}> ✕ </button>
                <img src={ad.image} alt={ad.title} />
                <h2>{ad.title}</h2>
                <p>{ad.description}</p>
                <button className="ad-premium-btn" onClick={() => navigate("/premium")}> Get Premium </button>
            </div>
        </div>
    );

}

export default Advertisement;