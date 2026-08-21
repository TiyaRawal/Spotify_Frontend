import api from "../../utils/AxiosConfig";
import "../styles/Premium.css";
import { DashboardNav, DashboardSidebar, DashboardMusicPlayer } from "./Dashboard";

function Premium() {
    return (
        <>
            <div className="dashboard-page">
                <DashboardNav />
                <div className="dash-main">
                    <div className="dash-main-left">
                        <DashboardSidebar />
                    </div>
                    <div className="dash-main-right">
                        <PremiumContent />
                    </div>
                </div>
                <DashboardMusicPlayer />
            </div>
        </>
    );
}

function PremiumContent() {
    async function BuyPremium() {
    try {
        let orderResponse = await api.post("/premiumorder", {amount: 119 });
        const { order, key } = orderResponse.data;

        const options = {
            key: key,
            amount: order.amount,
            currency: order.currency,
            name: "Spotify Premium",
            description: "Premium Subscription",
            order_id: order.id,
            handler: async (paymentResponse) => {
                try {
                    let verifyResponse = await api.post("/premiumverify", {
                        razorpay_order_id: paymentResponse.razorpay_order_id,
                        razorpay_payment_id: paymentResponse.razorpay_payment_id,
                        razorpay_signature: paymentResponse.razorpay_signature,
                        plan: "Premium"
                    });
                    alert(verifyResponse.data.message);
                } catch (e) {
                    console.log(e);
                    alert(e.response?.data?.message || e.message);
                }
            },
            theme: {color: "#1DB954"}
        };
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    } catch (e) {
        console.log(e);
        alert(e.response?.data?.message || e.message);
    }
}

    return (
        <div className="premium-page">
            <h1>Spotify Premium</h1>
            <p className="premium-subtitle"> Enjoy uninterrupted music with Premium.</p>
            <div className="premium-card">
                <div className="premium-offer">
                    ₹119/month
                </div>
                <div className="premium-logo">
                    <i className="fa-brands fa-spotify"></i>
                    <span>Premium</span>
                </div>
                <h2>Standard</h2>
                <h3>₹119/month</h3>
                <p className="premium-price"> Unlimited Premium access </p>
                <hr />
                <ul>
                    <li>Ad-free music listening</li>
                    <li>Download to listen offline</li>
                    <li>Unlimited skips</li>
                    <li>High quality audio</li>
                    <li>Cancel anytime</li>
                </ul>
                <button onClick={BuyPremium}> Get Premium </button>

                <p className="premium-note"> ₹119/month. Premium subscription can be cancelled anytime. </p>
            </div>
        </div>
    );

}

export default Premium;