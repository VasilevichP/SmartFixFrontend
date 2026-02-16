import {BrowserRouter, Route, Routes} from "react-router-dom";
import {LoginPage} from "./pages/LoginPage.tsx";
import {RegisterPage} from "./pages/RegisterPage.tsx";
import {ManagerRequestsPage} from "./pages/ManagerRequestsPage.tsx";
import {ManagerServicesPage} from "./pages/ManagerServicesPage.tsx";
import {ManagerCreateServicePage} from "./pages/ManagerCreateServicePage.tsx";
import {ManagersServiceDetailsPage} from "./pages/ManagerServiceDetailsPage.tsx";
import {ManagerRequestDetailsPage} from "./pages/ManagerRequestDetailsPage.tsx";
import {ManagerDictionariesPage} from "./pages/ManagerDictionariesPage.tsx";
import {ManagerStatisticsPage} from "./pages/ManagerStatisticsPage.tsx";
import {ClientCatalogPage} from "./pages/ClientCatalogPage.tsx";
import {ClientServiceDetailsPage} from "./pages/ClientServiceDetailsPage.tsx";
import {ClientProfilePage} from "./pages/ClientProfilePage.tsx";
import {ClientRequestDetailsPage} from "./pages/ClientRequestDetailsPage.tsx";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/manager/requests" element={<ManagerRequestsPage/>}/>
                <Route path="/manager/requests/:id" element={<ManagerRequestDetailsPage/>}/>
                <Route path="/manager/services" element={<ManagerServicesPage/>}/>
                <Route path="/manager/services/create" element={<ManagerCreateServicePage/>}/>
                <Route path="/manager/services/:id" element={<ManagersServiceDetailsPage/>}/>
                <Route path="/manager/dictionaries" element={<ManagerDictionariesPage/>}/>
                <Route path="/manager/statistics" element={<ManagerStatisticsPage/>}/>
                <Route path="/catalog" element={<ClientCatalogPage/>}/>
                <Route path="/catalog/:id" element={<ClientServiceDetailsPage/>}/>
                <Route path="/profile" element={<ClientProfilePage/>}/>
                <Route path="/profile/requests/:id" element={<ClientRequestDetailsPage/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App
