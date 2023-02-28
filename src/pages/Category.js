import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../firebase/firebase.config";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import ListItemComponent from "../components/ListItemComponent";

const Category = () => {
  const [listings, setListings] = useState(null);
  const [loadings, setLoadings] = useState(true);

  // Pagination State
  const [lastFetchedListing,setLastFetchedListing] = useState(null);

  const params = useParams();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        //get Reference from firestore
        const listingRef = collection(db, "listings");
        //create a query
        const q = query(
          listingRef,
          where("type", "==", params.categoryName),
          orderBy("timestamp", "desc"),
          limit(2)
        );

        //execute query
        const querySnap = await getDocs(q);

        const lastVisible = querySnap.docs[querySnap?.docs?.length - 1];
        setLastFetchedListing(lastVisible);

        let listings = [];

        querySnap.forEach((doc) => {
          // console.log(doc.data())
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        // console.log(listings);
        setListings(listings);
        setLoadings(false);
      } catch (error) {
        // console.log(error);
        toast.error("Could not fetch Listings");
      }
    };

    fetchListings();
  }, [params.categoryName]);


   //Pagination
  const OnFetchMoreListings = async () => {
    try {
      //get Reference from firestore
      const listingRef = collection(db, "listings");
      //create a query
      const q = query(
        listingRef,
        where("type", "==", params.categoryName),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchedListing),
        limit(10)
      );

      //execute query
      const querySnap = await getDocs(q);

      const lastVisible = querySnap.docs[querySnap?.docs?.length - 1];
      setLastFetchedListing(lastVisible);

      let listings = [];

      querySnap.forEach((doc) => {
        // console.log(doc.data())
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      // console.log(listings);
      setListings((prevState)=>[...prevState,...listings]);
      setLoadings(false);
    } catch (error) {
      // console.log(error);
      toast.error("Could not fetch Listings");
    }
  };

  return (
    <div className="category">
      <header>
        <p className="pageHeader">
          {params?.categoryName === "rent"
            ? "Places for rent"
            : "Places for sale"}
        </p>
      </header>
      {loadings ? (
        <Spinner />
      ) : listings && listings?.length > 0 ? (
        <>
        <main>
            <ul className="categoryListings" style={{listStyle:"none",}}>
                {listings?.map(function(listing){
                   console.log(listing);
                 return <ListItemComponent listing={listing?.data} id={listing?.id} key={listing?.id}/>
                    
                })}

               
            </ul>
        </main>
        <br />
        <br />
        {lastFetchedListing && (
          <p className="loadMore" onClick={OnFetchMoreListings}>Load More</p>
        )}
        </>
      ) :(
        <p>No listings for {params.categoryName}</p>
      )}
    </div>
  );
};

export default Category;
