
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import LandingPage from "./pages/landing";
import GetStartedPage from "./pages/get_started";
import Home from "./pages/home";
import TweetMiningPage from "./pages/tweet_mining";
import GenerateMeme from "./pages/meme_generation";
import PatronFrameworkPage from "./pages/patron";
import TokensPage from "./pages/patron/tokens";
import ApplicationPage from "./pages/patron/application";
import OTCPage from "./pages/patron/otc";
import OTCTrading from "./pages/otc";
import ClaimPage from "./pages/claim";
import Profile from "./pages/profile"
import { WalletContextProvider } from "./contexts/WalletContext";
import { AuthContextProvider } from "./contexts/AuthContext";
import { AppContextProvider } from "./contexts/AppContext";
import { ToastProvider } from "./contexts/ToastContext";
import ToastContainer from "./components/ToastContainer";

function App() {
  return (
    <AuthContextProvider>
      <WalletContextProvider>
        <AppContextProvider>
          <ToastProvider>
            <Router>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/get-started" element={<GetStartedPage />} />
                <Route path="/home" element={<Home />} />

                <Route path="/tweet-mining" element={<TweetMiningPage />} />
                <Route path="/tweet-mining/page1" element={<TweetMiningPage page_number={1} />} />
                <Route path="/tweet-mining/page2" element={<TweetMiningPage page_number={2} />} />
                <Route path="/tweet-mining/page3" element={<TweetMiningPage page_number={3} />} />

                <Route path="/meme-generation" element={<GenerateMeme />} />
                <Route path="/meme-generation/page1" element={<GenerateMeme page_number={1} />} />
                <Route path="/meme-generation/page2" element={<GenerateMeme page_number={2} />} />
                <Route path="/meme-generation/page3" element={<GenerateMeme page_number={3} />} />

                <Route path="/patron-framework" element={<PatronFrameworkPage />} />
                <Route path="/patron-framework/tokens" element={<TokensPage />} />
                <Route path="/patron-framework/application" element={<ApplicationPage />} />
                <Route path="/patron-framework/otc" element={<OTCPage />} />

                <Route path="/claim/:id" element={<ClaimPage />} />
                <Route path="/claim" element={<ClaimPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/staking" element={<TokensPage />} />
                <Route path="/swap" element={<OTCTrading />} />
                <Route path="/dao" element={<>dao</>} />

              </Routes>
            </Router>
            <ToastContainer />
          </ToastProvider>
        </AppContextProvider>
      </WalletContextProvider>
    </AuthContextProvider>
  );
}

export default App;
