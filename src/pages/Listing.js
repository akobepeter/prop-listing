import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase/firebase.config";
import { getDoc, doc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Spinner from "../components/Spinner";
import shareIcon from "../assets/svg/shareIcon.svg";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

// import Swiper core and required modules
import { Navigation, Pagination, Scrollbar, A11y } from "swiper";

import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/a11y";

const Listing = () => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const navigate = useNavigate();
  const params = useParams();

  const auth = getAuth();

  useEffect(() => {
    const fetchSingleListing = async () => {
      const docRef = doc(db, "listings", params.listingId);

      const docSnap = await getDoc(docRef);
      //   console.log(docSnap.data());

      //check if doc exist
      if (docSnap.exists()) {
        console.log(docSnap.data());
        setListing(docSnap.data());
        setLoading(false);
      }
    };

    fetchSingleListing();
  }, [navigate, params.listingId]);

  if (loading) {
    <Spinner />;
  }
  return (
    <main>
      {/* slide show */}

      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        scrollbar={{ draggable: true }}
      >
        {listing?.imgUrls?.map(function (url, index) {
           console.log(url);
          return (
            <SwiperSlide key={index}>
              <div
                className="swiperSlideDiv"
                style={{
                  // background: `url(${url})`,
                  background: `url(${listing?.imgUrls[index]}) center no-repeat`,
                  backgroundSize: "cover",
                }}
              ></div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div
        className="shareIconDiv"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 3000);
        }}
      >
        <img src={shareIcon} alt="" />
      </div>

      {shareLinkCopied && <p className="linkCopied">Link Copied</p>}

      <div className="listingDetails">
        <p className="listingName">
          {listing?.name} - $
          {listing?.offer
            ? listing?.discountedPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            : listing?.regularPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </p>
        <p className="listingLocation">{listing?.location}</p>
        <p className="listingType">
          For {listing?.type === "rent" ? "Rent" : "Sale"}
        </p>
        {listing?.offer && (
          <p className="discountPrice">
            {" "}
            ${listing?.regularPrice - listing?.discountedPrice} discount
          </p>
        )}

        <ul className="listingDetailsList">
          <li>
            {listing?.bedrooms > 1
              ? `${listing?.bedrooms} Bedrooms`
              : "1 Bedroom"}
          </li>
          <li>
            {listing?.bathrooms > 1
              ? `${listing?.bathrooms} Bathrooms`
              : "1 Bathroom"}
          </li>
          <li>{listing?.parking ? "Parking Spot" : "No Parking Spot"}</li>
          <li>{listing?.furnished && "furnished"}</li>
        </ul>

        <p className="listingLocation">Location</p>
        {/* MAP */}

        <div className="leafletContainer">
          <MapContainer
            style={{ height: "100%", width: "100%" }}
            // center={[listing.geolocation.lat, listing.geolocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
            />
            <Marker>
              {/* position={[listing.geolocation.lat, listing.geolocation.lng]} */}
              <Popup>{listing?.location}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {auth?.currentUser?.uid !== listing?.useRef && (
          <Link
            to={`/contact/${listing?.useRef}?listingName=${listing?.name}`}
            className="primaryButton"
          >
            Contact Landlord
          </Link>
        )}
      </div>
    </main>
  );
};

export default Listing;
