import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase.config";
import { toast } from "react-toastify";

const Contact = () => {
  const [message, setMessage] = useState("");
  const [landlord, setLandLord] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useParams();

  useEffect(() => {
    const getLandLord = async () => {
      const docRef = doc(db, "users", params.landlordId);
      const docSnap = await getDoc(docRef);
      console.log(docSnap.data());

      if (docSnap.exists()) {
        console.log(docSnap.data());
        setLandLord(docSnap.data());
      } else {
        toast.error("Could not get landlord data");
      }
    };

    getLandLord();
  }, [params.landlordId]);

  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader">Contact LandLord</p>
      </header>

      {landlord !== null && (
        <main>
          <div className="contactLandlord">
            <p className="contactlordName"> Contact {landlord?.name}</p>
          </div>
          <form className="messageForm">
            <div className="messageDiv">
              <label htmlFor="message" className="messageLabel">
                Message
              </label>
              <textarea
                name="message"
                id="message"
                className="textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <a
              href={`mailto:${landlord?.email}?Subject=${searchParams.get(
                "listingName"
              )}&body=${message}`}
            >
              <button type="button" className="primaryButton">
                Send Message
              </button>
            </a>
          </form>
        </main>
      )}
    </div>
  );
};

export default Contact;
