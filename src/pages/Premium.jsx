import React, { useEffect, useState } from "react";
import api from "../../utils/AxiosConfig";
import "../styles/Premium.css";
import {DashboardNav, DashboardSidebar, DashboardMusicPlayer} from "./Dashboard";

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
  let [premiumActive, setPremiumActive] = useState(false);
  let [premiumExpiry, setPremiumExpiry] = useState(null);
  let [timeLeft, setTimeLeft] = useState(null);
  let [loading, setLoading] = useState(true);

  async function GetPremiumStatus() {
    try {
      let response = await api.get("/premiumstatus");

      if (response.status === 200) {
        if (response.data.premium && response.data.premiumExpiryDate) {
          let expiryDate = new Date(response.data.premiumExpiryDate);

          if (expiryDate > new Date()) {
            setPremiumActive(true);
            setPremiumExpiry(expiryDate);
          } else {
            setPremiumActive(false);
            setPremiumExpiry(null);
          }
        } else {
          setPremiumActive(false);
          setPremiumExpiry(null);
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    GetPremiumStatus();
  }, []);

  useEffect(() => {
    if (!premiumExpiry) {
      return;
    }

    function UpdateCountdown() {
      let difference = premiumExpiry.getTime() - new Date().getTime();
      if (difference <= 0) {
        setPremiumActive(false);
        setPremiumExpiry(null);
        setTimeLeft(null);
        GetPremiumStatus();
        return;
      }
      let days = Math.floor(difference / (1000 * 60 * 60 * 24));
      let hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      let minutes = Math.floor((difference / (1000 * 60)) % 60);
      let seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft({days, hours, minutes, seconds});
    }

    UpdateCountdown();
    let timer = setInterval(UpdateCountdown, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [premiumExpiry]);

  async function BuyPremium() {
    try {
      let orderResponse = await api.post("/premiumorder", {amount: 119});

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
              plan: "Premium",
            });

            alert(verifyResponse.data.message);

            if (verifyResponse.status === 200) {
              let expiryDate = new Date(verifyResponse.data.premiumExpiryDate);
              setPremiumActive(true);
              setPremiumExpiry(expiryDate);
            }
          } catch (e) {
            console.log(e);
            alert(e.response?.data?.message || e.message);
          }
        },
        theme: {color: "#1DB954"},
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (e) {
      console.log(e);
      alert(e.response?.data?.message || e.message);
    }
  }

  function FormatNumber(number) {
    return String(number).padStart(2, "0");
  }

  function FormatDate(date) {
    if (!date) {
      return "";
    }
    return date.toLocaleDateString("en-IN", {day: "numeric", month: "long", year: "numeric"});
  }

  if (loading) {
    return (
      <div className="premium-page">
        <h1>Spotify Premium</h1>
        <p className="premium-subtitle">Checking your Premium status...</p>
      </div>
    );
  }

  return (
    <div className="premium-page">
      <h1>Spotify Premium</h1>
      <p className="premium-subtitle">Enjoy uninterrupted music with Premium.</p>

      {premiumActive ? (
        <div className="premium-active-card">
          <div className="premium-active-top">Premium Active <i className="fa-solid fa-check"></i></div>

          <div className="premium-active-main">
            <div className="premium-active-info">
              <div className="premium-logo active-logo">
                <i className="fa-brands fa-spotify"></i>
                <span>Premium</span>
              </div>

              <h2>Standard</h2>
              <h3>₹119/month</h3>
              <p>Your Premium plan is active.</p>
            </div>

            <div className="premium-countdown">
              <span>Time remaining</span>

              {timeLeft && (
                <div className="countdown">
                  <div>
                    <strong>{timeLeft.days}</strong>
                    <small>Days</small>
                  </div>

                  <div>
                    <strong>{FormatNumber(timeLeft.hours)}</strong>
                    <small>Hours</small>
                  </div>

                  <div>
                    <strong>{FormatNumber(timeLeft.minutes)}</strong>
                    <small>Min</small>
                  </div>

                  <div>
                    <strong>{FormatNumber(timeLeft.seconds)}</strong>
                    <small>Sec</small>
                  </div>
                </div>
              )}

              <p>Expires on <b>{FormatDate(premiumExpiry)}</b></p>
            </div>
          </div>

          <div className="premium-active-details">
            <div>
              <i className="fa-solid fa-check"></i>
              Ad-free music
            </div>

            <div>
              <i className="fa-solid fa-check"></i>
              Download offline
            </div>

            <div>
              <i className="fa-solid fa-check"></i>
              Unlimited skips
            </div>

            <div>
              <i className="fa-solid fa-check"></i>
              High quality audio
            </div>
          </div>
        </div>
      ) : (
        <div className="premium-card">
          <div className="premium-offer">₹119/month</div>

          <div className="premium-logo">
            <i className="fa-brands fa-spotify"></i>
            <span>Premium</span>
          </div>

          <h2>Standard</h2>
          <p className="premium-price">Unlimited Premium access</p>
          <hr/>

          <ul>
            <li>Ad-free music listening</li>
            <li>Download to listen offline</li>
            <li>Unlimited skips</li>
            <li>High quality audio</li>
          </ul>

          <button onClick={BuyPremium}>Get Premium</button>
          <p className="premium-note">₹119/month. Spotify Ad-free Premium subscription</p>
        </div>
      )}
    </div>
  );
}

export default Premium;
