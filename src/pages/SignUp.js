import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase.config";
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";
import visibilityIcon from "../assets/svg/visibilityIcon.svg";
import { toast } from "react-toastify";
import OAuth from "../components/OAuth";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // const {email,password} = formData;
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleClick = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const auth = getAuth();
    // const name = formData.name;
    const email = formData.email;
    const password = formData.password;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        // name,
        email,
        password
      );

      console.log({ userCredential });

      //getting the user from the user credential
      const user = userCredential.user;
      console.log({ user });

      // if(user != null){
      //   user.updateProfile(auth.currentUser,{
      //     displayName:user.currentUser
      //   })
      // }

      // console.log(updateProfile());
      updateProfile(auth.currentUser, {
        displayName: formData.name,
      });

      // store user to firestore
      const formDataCopy = { ...formData };
      delete formDataCopy.password;
      formDataCopy.timestamp = serverTimestamp();

      await setDoc(doc(db, "users", user.uid), formDataCopy);

      navigate("/");
    } catch (error) {
      // console.log(error)
      toast.error("Invalid Login Credentials");
    }

    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Register</p>
        </header>
        <main>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              id="name"
              name="name"
              // value={formData.name}
              onChange={handleChange}
              className="nameInput"
              placeholder="Please Enter Your Name"
            />
            <input
              type="email"
              id="email"
              name="email"
              // value={formData.email}
              onChange={handleChange}
              className="emailInput"
              placeholder="Please Enter Your Email Address"
            />
            <div className="passwordInputDiv">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                className="passwordInput"
                // value={formData.password}
                onChange={handleChange}
                placeholder="Please Enter Your Password"
              />
              <img
                src={visibilityIcon}
                alt="show Password"
                className="showPassword"
                onClick={handleClick}
              />
            </div>
            <Link to="/forgot-password" className="forgotPasswordLink">
              Forgot Password
            </Link>

            <div className="signUpBar">
              <p className="signUpText"> Sign Up</p>
              <button className="signUpButton">
                <ArrowRightIcon fill="#fff" width="34px" height="34px" />
              </button>
            </div>
          </form>

          <Link to="/sign-in" className="registerLink">
            Sign In Instead
          </Link>

          <OAuth />
        </main>
      </div>
    </>
  );
};

export default SignUp;
