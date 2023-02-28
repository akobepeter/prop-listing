import React, { useEffect } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  where,
  deleteDoc,
} from "firebase/firestore";
import ListItemComponent from "../components/ListItemComponent";
import { db } from "../firebase/firebase.config";
import { toast } from "react-toastify";
import ArrowRight from "../assets/svg/keyboardArrowRightIcon.svg";
import HomeIcon from "../assets/svg/homeIcon.svg";

const Profile = () => {
  const auth = getAuth();
  //console.log(auth);

  const [changeDetails, setChangeDetails] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: auth.currentUser?.displayName,
    email: auth.currentUser?.email,
    password: "",
  });

  const [loading, setLoading] = React.useState(true);
  const [listings, setListings] = React.useState(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut();
    navigate("/sign-in");
  };

  useEffect(() => {
    const fetchUserListing = async () => {
      const listingsRef = collection(db, "listings");
      const q = query(
        listingsRef,
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);
      let listings = [];

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      // console.log(listings);
      setListings(listings);
      setLoading(false);
    };

    fetchUserListing();
  }, [auth.currentUser.uid]);

  const handleChangeDetails = () => {
    if (changeDetails) {
      handleSubmit();
    }
    setChangeDetails(!changeDetails);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const onDelete = async (listingId) => {
    if (window.confirm("Are you sure you want to delete?")) {
      const docRef = doc(db, "listings", listingId);
      await deleteDoc(docRef);
      const updatedListings = listings.filter(function (listing) {
        return listing.id !== listingId;
      });

      setListings(updatedListings);
      toast.success("Successfully Deleted Listing");
    }
  };

  const onEdit = (listingId) => navigate(`/edit-listings/${listingId}`);

  const handleSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== formData.name) {
        //Update display name in fb
        await updateProfile(auth.currentUser, {
          displayName: formData.name,
        });

        // Update in firestore
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          name: formData.name,
        });
      }
    } catch (error) {
      toast.error("Could not update profile details");
    }
  };

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button type="button" className="logOut" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main>
        <div className="profileDetailsHeader">
          <p className="profleDetailsText">Personal Details</p>
          <p className="changePersonalDetails" onClick={handleChangeDetails}>
            {changeDetails ? "done" : "change"}
          </p>
        </div>

        <div className="profileCard">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              id="name"
              className={!changeDetails ? "profileName" : "profileNameActive"}
              disabled={!changeDetails}
              value={formData.name}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              id="email"
              className={!changeDetails ? "profileEmail" : "profileEmailActive"}
              disabled={!changeDetails}
              value={formData.email}
              onChange={handleChange}
            />
          </form>
        </div>

        <Link to="/create-listings" className="createListing">
          <img src={HomeIcon} alt="home" />
          <p>sell or rent your home</p>
          <img src={ArrowRight} alt="ArrowRight" />
        </Link>

        {!loading && listings?.length > 0 && (
          <>
            <p className="listingText">Your Listings</p>
            <ul className="listingsList">
              {listings?.map(function (listing) {
                //  console.log(listing);
                return (
                  <ListItemComponent
                    key={listing?.id}
                    listing={listing?.data}
                    id={listing?.id}
                    onDelete={() => onDelete(listing?.id)}
                    onEdit={() => onEdit(listing?.id)}
                  />
                );
              })}
            </ul>
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;
