import React from 'react';
import { useLocation,useNavigate } from 'react-router-dom';
import { getAuth,signInWithPopup,GoogleAuthProvider } from 'firebase/auth';
import { doc,setDoc,getDoc,serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { toast } from 'react-toastify';
import { ReactComponent as GoogleIcon } from '../assets/svg/googleIcon.svg';


const OAuth = () => {
    const location = useLocation();
    const navigate = useNavigate();


    const handleGoogleClick = async() =>{
        try {
          const auth = getAuth();
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth,provider);
          const user = result.user;
          
          // Check for user
          const userRef = doc(db,'users',user.uid);
          const docSnap = await getDoc(userRef);

           // If user doesn't exist in the database,create one.
           if (!docSnap.exists()) {
             await setDoc(doc(db,'users',user.uid),{
                name:user.displayName,
                email:user.email,
                timestamp: serverTimestamp()
             })
           }
           navigate("/");
        } catch (error) {
            // console.log(error)
            toast.error("Could not authorize with Google");
        }
    }
  return (
    <div className='socialLogin'>
       <p className=''>
         Sign {location.pathname === "/sign-in" ? "up" : "in"} with
       </p>
        <button className='socialIconDiv' onClick={handleGoogleClick}>
            <GoogleIcon className='socialIconImg'/>
            
        </button>

    </div>
  )
}

export default OAuth