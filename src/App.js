//Imports
import React, { useRef, useState } from 'react';
import './App.css';

//Firebase Dependencies
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

//Hooks for Firebase
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

//Initializing Firebase
firebase.initializeApp({
    apiKey: "AIzaSyB8MKXLU3crclNVtXY8rhOQaGjTJkWK-RA",
    authDomain: "myreactchat-354a1.firebaseapp.com",
    projectId: "myreactchat-354a1",
    storageBucket: "myreactchat-354a1.appspot.com",
    messagingSenderId: "772811972151",
    appId: "1:772811972151:web:b5239cddb5b902234ea9b2",
    measurementId: "G-XW96YPGMEV"
})
//Firebase SDK's
const auth = firebase.auth();
const firestore = firebase.firestore();

//App Function
function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      {/*Header*/}
      <header>
        <h1>💬❤️😆</h1>
        {/*SignOut*/}
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

//Sign-In Function
function SignIn() {

  //Sign in with Google Function
  const signInWithGoogle = () => {
    //Triggering the pop-up to sign in with Google
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <div className="sign-in-msg">
        {/*Sign in Gif Image*/}
        <img className="gif_pic" src={'https://media.giphy.com/media/brsEO1JayBVja/giphy.gif'} alt="gif" />
        {/*Sign in paragraph*/}
        <p>Hello! Join our chat!!! 😋 </p>
      </div>
      {/*Button that listens to click event to sign in with Google*/}
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google 📲 </button>
    </>
  )

}

//Sign Out Function
function SignOut() {
  //Checking if we have a current user, if so, allow them to sign out.
  return auth.currentUser && (
    /*Button that listens to click event to sign out*/
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


//ChatRoom Function
function ChatRoom() {

  //Reference to element 'dummy' - Which allows the app to automatically scroll down after new msg is received
  const dummy = useRef();
  
  //Referencing Firestore Collection for "messages"
  const messagesRef = firestore.collection('messages');
  
  //Query for all documents in a collection based of created time with limit of 30.
  const query = messagesRef.orderBy('createdAt').limit(30);
  
  //Listens to data using the useCollectionData hook - Returns array of objects 
  const [messages] = useCollectionData(query, { idField: 'id' });

  //FormValue set to empty - User will update (type in msg) and 'setFormValue' will update
  const [formValue, setFormValue] = useState('');

  //Event Handler SendMessage
  const sendMessage = async (e) => {
    //Preventing the page from Refreshing every time user submits a msg
    e.preventDefault();

    //Collecting the user ID and pic of current user to be able to write onto Firestone
    const { uid, photoURL } = auth.currentUser;

    //Await will create a new document in Firestore
    //Takes a JavaScript object as its argument with the below values (text msg, created time, user ID, and pic)
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    //Using scrollIntoView to allow app to scroll down towards new msg
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {/*This will loop over each document - Passing the document data as the msg*/}
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      {/*Helps automatically scroll to the bottom*/}
      <span ref={dummy}></span>

    </main>

    {/*Form for User to Send Msg - This will write to Firestore*/}
    <form onSubmit={sendMessage}>

      {/*Binding State to Form Input - Whatever user inputs will update form*/}
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type a message..." />

      {/*Submitting Text Msg Icon Button - Binding to 'formValue'*/}
      <button type="submit" disabled={!formValue}>📩</button>

    </form>
  </>)
}

//ChatMessage Function
function ChatMessage(props) {
  const { text, uid, photoURL} = props.message;

  //Conditional CSS - Distinguish sent msgs to received msgs to change the colors.
  //Comparing the user ID to the currently logged user
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    {/*Adding CSS depending on 'sent' or 'received' msg.*/}
    <div className={`message ${messageClass}`}>

      {/*The Profile Picture*/}
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="profile" />

      {/*The actual Text Message*/}
      <p>{text}</p>

    </div>
  </>)
}


export default App;