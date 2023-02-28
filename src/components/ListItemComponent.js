import React from "react";
import { Link } from "react-router-dom";
import DeleteIcon from "../assets/svg/deleteIcon.svg";
import EditIcon from "../assets/svg/editIcon.svg";
import bedIcon from "../assets/svg/bedIcon.svg";
import bathtubIcon from "../assets/svg/bathtubIcon.svg";

const ListItemComponent = ({ listing, id, onEdit, onDelete }) => {
  console.log(listing);
  console.log(id);
  return (
    <li className="listing">
      <Link
        to={`/category/${listing?.type}/${id}`}
        className="categoryListingLink"
      >
        <img
          src={listing?.imgUrls?.[0]}
          alt="listing-img"
          className="categoryListingImg"
        />
        <div className="categoryListingDetails">
          <p className="categoryListingLocation">{listing?.location}</p>
          <p className="categoryListingName">{listing?.name}</p>
          <p className="categoryListingPrice">
            $
            {listing.offer
              ? listing?.discountedPrice
                  ?.toString()
                  ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : listing?.regularPrice
                  ?.toString()
                  ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            {listing?.type === "rent" && " / Month"}
          </p>
          <div className="categoryInfoListingDiv">
            <img src={bedIcon} alt="bed-icon" />
            <p className="categoryInfoListingText">
              {listing?.bedrooms > 1
                ? `${listing?.bedrooms} Bedrooms`
                : "1 Bedroom"}
            </p>

            <img src={bathtubIcon} alt="bathTub" />
            <p className="categoryInfoListingText">
              {listing?.bathrooms > 1
                ? `${listing?.bathrooms} Bathrooms`
                : "1 Bathroom"}
            </p>
          </div>
        </div>
      </Link>
      {onDelete && (
        <DeleteIcon
          className="removeIcon"
          fill="rgb(231,76,68)"
          onClick={() => onDelete(listing?.data?.id, listing?.data?.name)}
        />
      )}

      {onEdit && <EditIcon className="editIcon" onClick={() => onEdit(id)} />}
    </li>
  );
};

export default ListItemComponent;
