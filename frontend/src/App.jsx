import { useState } from "react";
import SignInPage from "./pages/SignInPage";
import ChangePassword from "./pages/ChangePassword";
import "./style.css";

function App() {
  const [currentPage, setCurrentPage] = useState("signIn");
  const [signInBanner, setSignInBanner] = useState("");

  return (
    <main>
      {currentPage === "signIn" ? (
        <SignInPage
          initialMessage={signInBanner}
          onGoToChangePassword={() => {
            setSignInBanner("");
            setCurrentPage("changePassword");
          }}
        />
      ) : (
        <ChangePassword
          onBackToSignIn={(msg = "") => {
            setSignInBanner(msg);
            setCurrentPage("signIn");
          }}
        />
      )}
    </main>
  );
}

export default App;