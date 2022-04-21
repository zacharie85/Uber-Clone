/* import * as Google from 'expo-google-app-auth'
import * as Facebook from 'expo-facebook';
import {Platform} from "react-native"
import axios from 'axios'
import PolyLine from '@mapbox/polyline';

import firebase from 'firebase' */
import {Platform} from "react-native"
export const prefix = Platform.OS === "ios" ? "ios" :"md";

export const API_KEY= 'AIzaSyCynyadVP6y0U3WS6-BTeJae2da6tDlMXE';
export const BASE_URL = "https://maps.googleapis.com/maps/api";

 //login Facebook


/* const config = {
    iosStandaloneAppClientId: `871532424535-0iu88dcukiuedke1l8u83dilaqjarh6q.apps.googleusercontent.com`,
    androidStandaloneAppClientId: `871532424535-h5bcf1mr0a3m6q15ua2ullb1oovr9ocu.apps.googleusercontent.com`,
    scopes: ["profile", "email"],
  };

  //login Google

  onSignIn = googleUser => {
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = firebase.auth().onAuthStateChanged(
      function(firebaseUser) {
        unsubscribe();
        // Check if we are already signed-in Firebase with the correct user.
      
          // Build Firebase credential with the Google ID token.
          var credential = firebase.auth.GoogleAuthProvider.credential(
            googleUser.idToken,
            googleUser.accessToken
          );
          // Sign in with credential from the Google user.
          firebase.auth().signInWithCredential(credential)
            .then(function(result) {

              if (result.additionalUserInfo.isNewUser){
                firebase.firestore().collection("users") // save les donnes de luilisateur dans une bd
                .doc(firebase.auth().currentUser.uid)
                .set({
                    name:result.additionalUserInfo.profile.given_name,
                    email:result.additionalUserInfo.profile.email,
                    adresse:"",
                    ville:"",
                    province:"",
                    phone:"",
                    avatar: null
                }) 
              }
           
            })
            .catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              // The email of the user's account used.
              var email = error.email;
              // The firebase.auth.AuthCredential type that was used.
              var credential = error.credential;
              // ...
            });
      }.bind(this)
    );
  };
  export const auth = async() => {

    try {
      const result = await Google.logInAsync(config);
        if(result.type === "success"){
            onSignIn(result);
        return result.accessToken;
        }else{
          return { cancelled: true };
        }
    } catch (e) {
       
        console.log("error auth",e);
    }

}


export async function signInWithFacebook() {
  const appId = '269849981504422';
  const permissions = ['public_profile', 'email'];  // Permissions required, consult Facebook docs
  
  await Facebook.initializeAsync({
    appId
  });

  const {
    type,
    token,
  } = await Facebook.logInWithReadPermissionsAsync(
    {permissions}
  );

  switch (type) {
    case 'success': {
    
      const credential = firebase.auth.FacebookAuthProvider.credential(token);
      await firebase.auth().signInWithCredential(credential)
      .then(function(result) {
        if (result.additionalUserInfo.isNewUser){
          firebase.firestore().collection("users") // save les donnes de luilisateur dans une bd
          .doc(firebase.auth().currentUser.uid)
          .set({
              name:result.additionalUserInfo.profile.first_name,
              email:"",
              adresse:"",
              ville:"",
              province:"",
              phone:"",
              avatar: result.additionalUserInfo.profile.picture.data.url
          }) 
        }
      })
     
     
      return Promise.resolve({type: 'success'});
    }
    case 'cancel': {
      return Promise.reject({type: 'cancel'});
    }
  }
}
//Avoir la route indiquee
export const getRoute = async url =>{
  try {
    const {
      data :{routes}
    } = await axios.get(url);
    const points = routes[0].overview_polyline.points;
    return points;
  } catch (error) {
    console.error('error route',e)
  }
}

//decoder le point
export const decodePoint = point =>{
  const fixPoints = PolyLine.decode(point);
  const route = fixPoints.map(fixPoint =>{
    return{
      latitude:fixPoint[0],
      longitude:fixPoint[1],
    }
  });
  console.log("route",route);
  return route;
} */