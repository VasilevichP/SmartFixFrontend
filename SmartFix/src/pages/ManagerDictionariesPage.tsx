import ManagerHeader from "../components/ManagerHeader";
import {type Specialist, specialistsApi} from "../api/specialistsApi.ts";
import {categoriesApi, type Category} from "../api/categoriesApi.ts";
import {type DeviceType, deviceTypesApi} from "../api/deviceTypesApi.ts";
import {type Manufacturer, manufacturersApi} from "../api/manufacturersApi.ts";
import {type DeviceModelDetails, deviceModelsApi} from "../api/deviceModelsApi.ts";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {SimpleDictionaryCard} from "../components/SimpleDictionaryCard.tsx";
import {ModelsDictionaryCard} from "../components/ModelDictionaryCard.tsx";
import '../styles/DictionaryPage.css';
import {EditDictionaryModal, type EditingItemState} from "../components/EditDictionaryWindow.tsx";

export const ManagerDictionariesPage: React.FC = () => {
    // State
    const [specialists, setSpecialists] = useState<Specialist[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [types, setTypes] = useState<DeviceType[]>([]);
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [models, setModels] = useState<DeviceModelDetails[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EditingItemState | null>(null);

    const token = localStorage.getItem("token") || "";
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Загрузка данных
    const loadAll = async () => {
        if (!token) {
            navigate("/");
            return;
        }
        try {
            const [specs, cats, typs, manufs, mods] = await Promise.all([
                specialistsApi.getAllSpecialists(token),
                categoriesApi.getAllServiceCategories(token),
                deviceTypesApi.getAllDeviceTypes(token),
                manufacturersApi.getAllManufacturers(token),
                deviceModelsApi.getDeviceModels(token),
            ]);
            setSpecialists(specs);
            setCategories(cats);
            setTypes(typs);
            setManufacturers(manufs);
            setModels(mods);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    //---------------------------------------
    const handleAddCategory = async (name: string) => {
        await categoriesApi.CreateServiceCategory(token, {name});
        const updated = await categoriesApi.getAllServiceCategories(token);
        setCategories(updated);
    };
    const handleDeleteCategory = async (id: string) => {
        await categoriesApi.deleteServiceCategory(token, {id});
        setCategories(prev => prev.filter(c => c.id !== id));
    };

    //---------------------------------------
    const handleAddType = async (name: string) => {
        await deviceTypesApi.CreateDeviceType(token, {name});
        const updated = await deviceTypesApi.getAllDeviceTypes(token);
        setTypes(updated);
    };
    const handleDeleteType = async (id: string) => {
        await deviceTypesApi.DeleteDeviceType(token, {id});
        setTypes(prev => prev.filter(c => c.id !== id));
    };

    //---------------------------------------
    const handleAddManufacturer = async (name: string) => {
        await manufacturersApi.CreateManufacturer(token, {name});
        const updated = await manufacturersApi.getAllManufacturers(token);
        setManufacturers(updated);
    };

    const handleDeleteManufacturer = async (id: string) => {
        await manufacturersApi.DeleteManufacturer(token, {id});
        setManufacturers(prev => prev.filter(c => c.id !== id));
    };
    //---------------------------------------
    const handleAddSpecialist = async (name: string) => {
        await specialistsApi.CreateSpecialist(token, {name});
        const updated = await specialistsApi.getAllSpecialists(token);
        setSpecialists(updated);
    };

    const handleDeleteSpecialist = async (id: string) => {
        await specialistsApi.DeleteSpecialist(token, {id});
        setSpecialists(prev => prev.filter(c => c.id !== id));
    };
    //---------------------------------------
    const handleAddModel = async (name: string, deviceTypeId: string, manufacturerId: string) => {
        await deviceModelsApi.CreateDeviceModel(token, {
            name, deviceTypeId, manufacturerId
        });
        const updated = await deviceModelsApi.getDeviceModels(token);
        setModels(updated);
    };

    const handleDeleteModel = async (id: string) => {
        await deviceModelsApi.DeleteDeviceModels(token, {id});
        setModels(prev => prev.filter(m => m.id !== id));
    };

    const openEditSpecialist = (id: string, name: string) => {
        setEditingItem({type: 'specialist', data: {id, name}});
        setIsModalOpen(true);
    };
    const openEditCategory = (id: string, name: string) => {
        setEditingItem({type: 'category', data: {id, name}});
        setIsModalOpen(true);
    };
    const openEditType = (id: string, name: string) => {
        setEditingItem({type: 'type', data: {id, name}});
        setIsModalOpen(true);
    };
    const openEditManufacturer = (id: string, name: string) => {
        setEditingItem({type: 'manufacturer', data: {id, name}});
        setIsModalOpen(true);
    };
    const openEditModel = (id: string, name: string, deviceTypeId: string, manufacturerId: string) => {
        setEditingItem({type: 'model', data: {id, name, deviceTypeId, manufacturerId}});
        setIsModalOpen(true);
    };
    // --- СОХРАНЕНИЕ ИЗ МОДАЛКИ ---
    const handleSaveChanges = async (newData: any) => {
        if (!editingItem || !token) return;
        console.log(editingItem.type);
        try {
            switch (editingItem.type) {
                case 'category':
                    await categoriesApi.UpdateServiceCategory(token, {id: newData.id, name: newData.name});
                    setCategories(prev => prev.map(i => i.id === newData.id ? {...i, name: newData.name} : i));
                    break;
                case 'specialist':
                    await specialistsApi.UpdateSpecialist(token, {id: newData.id, name: newData.name});
                    setSpecialists(prev => prev.map(i => i.id === newData.id ? {...i, name: newData.name} : i));
                    break;
                case 'type':
                    await deviceTypesApi.UpdateDeviceType(token, {id: newData.id, name: newData.name});
                    setTypes(prev => prev.map(i => i.id === newData.id ? {...i, name: newData.name} : i));
                    break;
                case 'manufacturer':
                    await manufacturersApi.UpdateManufacturer(token, {id: newData.id, name: newData.name});
                    setManufacturers(prev => prev.map(i => i.id === newData.id ? {...i, name: newData.name} : i));
                    break;

                case 'model':
                    await deviceModelsApi.UpdateDeviceModel(token, {
                        id: newData.id,
                        name: newData.name,
                        deviceTypeId: newData.deviceTypeId,
                        manufacturerId: newData.manufacturerId
                    });
                    const updatedModels = await deviceModelsApi.getDeviceModels(token);
                    setModels(updatedModels);
                    break;
            }
        } catch (e) {
            alert("Ошибка при сохранении");
            console.error(e);
        }
    };

    if (loading) return <div>Загрузка справочников...</div>;

    return (
        <div>
            <ManagerHeader/>
            <div className="dictionaries-page-container">
                <h1 className="page-title">Справочники</h1>

                <div className="dictionaries-grid">

                    <SimpleDictionaryCard
                        title="Специалисты"
                        items={specialists}
                        onAdd={handleAddSpecialist}
                        onEdit={openEditSpecialist}
                        onDelete={handleDeleteSpecialist}
                    />
                    <SimpleDictionaryCard
                        title="Категории услуг"
                        items={categories}
                        onAdd={handleAddCategory}
                        onEdit={openEditCategory}
                        onDelete={handleDeleteCategory}
                    />
                    <SimpleDictionaryCard
                        title="Типы устройств"
                        items={types}
                        onAdd={handleAddType}
                        onEdit={openEditType}
                        onDelete={handleDeleteType}
                    />
                    <SimpleDictionaryCard
                        title="Производители"
                        items={manufacturers}
                        onAdd={handleAddManufacturer}
                        onEdit={openEditManufacturer}
                        onDelete={handleDeleteManufacturer}
                    />
                </div>

                <div style={{marginTop: '30px'}}>
                    <ModelsDictionaryCard
                        models={models}
                        types={types}
                        manufacturers={manufacturers}
                        onAdd={handleAddModel}
                        onEdit={openEditModel}
                        onDelete={handleDeleteModel}
                    />
                </div>
            </div>
            {editingItem && (
                <EditDictionaryModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveChanges}
                    title={editingItem.type === 'model' ? 'Редактирование модели' : 'Редактирование'}
                    mode={editingItem.type === 'model' ? 'model' : 'simple'}
                    initialData={editingItem.data}
                    types={types}
                    manufacturers={manufacturers}
                />
            )}
        </div>
    );
};