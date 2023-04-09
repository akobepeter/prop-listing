import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";
import visibilityIcon from "../assets/svg/visibilityIcon.svg";
import OAuth from "../components/OAuth";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const auth = getAuth();

  const [data, setData] = useState({
    name: auth?.currentUser?.displayName,
  });

  // console.log({ data });

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

    const email = formData.email;
    const password = formData.password;

    try {
      setLoading(true);
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredentials.user;

      updateProfile(auth.currentUser, {
        displayName: formData.name,
      });

      console.log({ user });

      // console.log(updateProfile());

      if (user) {
        navigate("/");
      }
    } catch (error) {
      // console.log(error.message);
      toast.error("Invalid Login Credentials");
    } finally {
      setLoading(false);
    }

    setFormData({ email: "", password: "" });
  };

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Welcome Back {data?.name?.toUpperCase()}</p>
        </header>
        <main>
          <form onSubmit={handleSubmit}>
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

            <div className="signInBar">
              <p className="signInText"> Sign In</p>
              <button className={loading ? "loadingSpinner" : "signUpButton"}>
                <ArrowRightIcon fill="#fff" width="34px" height="34px" />
              </button>
            </div>
          </form>

          <Link to="/sign-up" className="registerLink">
            Sign Up Instead
          </Link>

          <OAuth />
        </main>
      </div>
    </>
  );
};

export default SignIn;
