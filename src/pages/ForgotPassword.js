import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";

const ForgotPassword = () => {

  const [email, setEmail] = useState("");

  const handleSubmit = async(e) =>{
    
    e.preventDefault();
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth,email);
      toast.success("Email was sent successfully");
    } catch (error) {
      toast.error("Could not reset email");
      // console.log(error);
    }
  }

  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader">Forgot Password</p>
      </header>

      <main>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            id="email"
            className="emailInput"
            placeholder="Enter your email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Link className="forgotPasswordLink" to="/sign-in">Sign In</Link>

          <div className="signInBar">
              <div className="signInText">Send Reset Link</div>
              <button className="signInButton">
                <ArrowRightIcon fill="#fff" width="34px" height="34px"/>
              </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ForgotPassword;
