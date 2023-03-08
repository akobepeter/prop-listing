import React, { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase.config";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";

const EditListing = () => {
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [listing, setListing] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [geolocationEnabled, setGeoLocationEnabled] = useState(false);
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  });

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData;

  const auth = getAuth();
  const navigate = useNavigate();
  const params = useParams();
  const isMounted = useRef(true);

  // Redirect if listing is not user's
  useEffect(() => {
    if (listing && listing.useRef !== auth.currentUser.uid) {
      toast.error("You can not edit this listings");
      navigate("/");
    }
  });

  // fetch Listing to edit
  useEffect(() => {
    setLoading(true);
    const fetchListing = async () => {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setFormData({ ...docSnap.data(), address: docSnap.data()?.location });
        setLoading(false);
      } else {
        navigate("/");
        toast.error("Listing does not exist");
      }
    };

    fetchListing();
  }, [params.listingId, navigate]);

  // Set user Ref to logged in user
  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, useRef: user.uid }); //userRef
        } else {
          navigate("/sign-in");
        }
      });
    }

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    //  console.log(formData);
    setLoading(true);

    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error(" Discounted price needs to be less than regular price");
      return;
    }

    if (images.length > 6) {
      setLoading(false);
      toast.error("Max 6 images");
      return;
    }

    let geolocation = {};
    let location;

    if (geolocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyAj1lg0Thhg1wWSABx9pe61HJteo4ysLII`
      );
      const data = await response.json();
      console.log(data);

      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;
      location =
        data.status === "ZERO_RESULTS"
          ? undefined
          : data.results[0]?.formatted_address;

      if (location === undefined || location.includes("undefined")) {
        setLoading(true);
        toast.error("Please enter a valid address");
        return;
      } else {
        geolocation.lat = latitude;
        geolocation.lng = longitude;
        location = address;
        console.log(geolocation, location);
      }
    }

    // Store Images in firebase
    const storeImages = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

        const storageRef = ref(storage, `images/${fileName}`);

        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
              default:
                break;
            }
          },
          (error) => {
            // Handle unsuccessful uploads
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };

    const imgUrls = await Promise.all(
      [...images].map(function (image) {
        return storeImages(image);
      })
    ).catch(function () {
      setLoading(false);
      toast.error("Images not uploaded");
      return;
    });

    // console.log(imgUrls)
    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
    };

    formDataCopy.location = address;
    delete formDataCopy.images;
    delete formDataCopy.address;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    // Update listing
    const docRef = doc(db, "listings", params.listingId);
    await updateDoc(docRef, formDataCopy);
    setLoading(false);
    toast.success("listings saved successfully");
    navigate(`category/${formDataCopy.type}/${docRef.id}`);
  };

  const onMutate = (e) => {
    let boolean = null;

    if (e.target.value === "true") {
      boolean = true;
    }

    if (e.target.value === "false") {
      boolean = false;
    }

    // Files
    if (e.target.files) {
      setFormData({ ...formData, images: e.target.files });
    }

    // Text/Numbers/Boolean

    if (!e.target.files) {
      const { id, value } = e.target;
      setFormData({ ...formData, [id]: boolean ?? value });
    }
  };

  if (loading) {
    <Spinner />;
  }

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Edit Listing</p>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <label htmlFor="" className="formLabel">
            Sell /rent
          </label>
          <div className="formButton">
            <button
              type="button"
              className={type === "sell" ? "formButtonActive" : "formButton"}
              id="type"
              value="sell"
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type="button"
              className={type === "rent" ? "formButtonActive" : "formButton"}
              id="type"
              value="rent"
              onClick={onMutate}
            >
              Rent
            </button>
          </div>
          <label htmlFor="name" className="formLabel">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            className="formInputName"
            value={name}
            maxLength="32"
            minLength={10}
            onChange={onMutate}
            required
          />

          <div className="formRooms flex">
            <div>
              <label htmlFor="bedrooms" className="formLabel">
                Bedrooms
              </label>
              <input
                type="number"
                name="bedrooms"
                id="bedrooms"
                className="formInputSmall"
                value={bedrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>

            <div>
              <label htmlFor="bathrooms" className="formLabel">
                Bathrooms
              </label>
              <input
                type="number"
                name="bathrooms"
                id="bathrooms"
                className="formInputSmall"
                value={bathrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
          </div>

          <label htmlFor="parking" className="formLabel">
            Parking spot
          </label>
          <div className="formButtons">
            <button
              className={parking ? "formButtonActive" : "formButton"}
              type="button"
              id="parking"
              value={true}
              onClick={onMutate}
              min="1"
              max="50"
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="parking"
              value={false}
              onClick={onMutate}
              min="1"
              max="50"
            >
              No
            </button>
          </div>

          <label htmlFor="furnished" className="formLabel">
            Furnished
          </label>
          <div className="formButtons">
            <button
              className={furnished ? "formButtonActive" : "formButton"}
              type="button"
              id="furnished"
              value={true}
              onClick={onMutate}
              min="1"
              max="50"
            >
              Yes
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              type="button"
              id="furnished"
              value={false}
              onClick={onMutate}
              min="1"
              max="50"
            >
              No
            </button>
          </div>
          <label htmlFor="address" className="formLabel">
            Address
          </label>
          <textarea
            name="address"
            id="address"
            className="formInputAddress"
            value={address}
            onChange={onMutate}
            cols="30"
            rows="10"
            required
          />

          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label htmlFor="latitude" className="formLabel">
                  Latitude
                </label>
                <input
                  type="number"
                  name="latitude"
                  id="latitude"
                  value={latitude}
                  className="formInputSmall"
                  onChange={onMutate}
                  required
                />
              </div>

              <div>
                <label htmlFor="longitude" className="formLabel">
                  Longitude
                </label>
                <input
                  type="number"
                  name="longitude"
                  id="longitude"
                  value={longitude}
                  className="formInputSmall"
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label htmlFor="offer" className="formLabel">
            Offer
          </label>
          <div className="formButtons">
            <button
              className={offer ? "formButtonActive" : "formButton"}
              type="button"
              id="offer"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="offer"
              value={true}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label htmlFor="regularPrice" className="formLabel">
            regular Price
          </label>
          <div className="formPriceDiv">
            <input
              type="number"
              name="regularPrice"
              id="regularPrice"
              className="formInputSmall"
              onChange={onMutate}
              value={regularPrice}
              min="50"
              max="75000000"
              required
            />
            {type === "rent" && <p className="formPriceText">$ / Month</p>}
          </div>

          {offer && (
            <>
              <label htmlFor="discountedPrice" className="formLabel">
                {" "}
                Discounted Price
              </label>
              <input
                type="number"
                name="discountedPrice"
                id="discountedPrice"
                className="formInputSmall"
                onChange={onMutate}
                value={discountedPrice}
                min="50"
                max="750000"
                required={offer}
              />
            </>
          )}

          <label htmlFor="images" className="formLabel">
            Images
          </label>
          <p className="imagesInfo">
            {" "}
            The first image will be the cover <b>max 6</b>.
          </p>
          <input
            type="file"
            name="images"
            id="images"
            className="formInputFile"
            onChange={onMutate}
            // value={images}
            max="6"
            accept=".jpg,.png,.jpeg"
            multiple
            required
          />

          <button className="primaryButton createListingsButton" type="submit">
            Edit Listing
          </button>
        </form>
      </main>
    </div>
  );
};

export default EditListing;
