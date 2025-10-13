import {BrowserRouter, Route, Routes} from "react-router-dom";
import {LoginPage} from "./pages/LoginPage.tsx";
import {RegisterPage} from "./pages/RegisterPage.tsx";
import {ManagerRequestsPage} from "./pages/ManagerRequestsPage.tsx";
import {ManagerServicesPage} from "./pages/ManagerServicesPage.tsx";
import {CreateServicePage} from "./pages/CreateServicePage.tsx";
import {ManagersServiceDetailsPage} from "./pages/ManagerServiceDetailsPage.tsx";
import {ManagerRequestDetailsPage} from "./pages/ManagerRequestDetailsPage.tsx";
import {ManagerDictionariesPage} from "./pages/ManagerDictionariesPage.tsx";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/manager/requests" element={<ManagerRequestsPage/>}/>
                <Route path="/manager/requests/details" element={<ManagerRequestDetailsPage/>}/>
                <Route path="/manager/services" element={<ManagerServicesPage/>}/>
                <Route path="/manager/services/create" element={<CreateServicePage/>}/>
                <Route path="/manager/services/details" element={<ManagersServiceDetailsPage/>}/>
                <Route path="/manager/dictionaries" element={<ManagerDictionariesPage/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App
