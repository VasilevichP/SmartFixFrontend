import {BrowserRouter, Route, Routes} from "react-router-dom";
import {LoginPage} from "./pages/LoginPage.tsx";
import {RegisterPage} from "./pages/RegisterPage.tsx";
import {ManagerRequestsPage} from "./pages/ManagerRequestsPage.tsx";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/manager/requests" element={<ManagerRequestsPage/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App
