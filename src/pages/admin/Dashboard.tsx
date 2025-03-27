import React, { useState } from 'react';
import { useAdmin } from '../../components/admin/AdminContext';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Save, Trash2, LogOut } from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { 
    currentAdmin, 
    stores, 
    footerLinks, 
    logout,
    updateStore,
    addStore,
    deleteStore,
    updateFooterLinks,
    saveChanges
  } = useAdmin();

  const [newStore, setNewStore] = useState({
    id: '',
    name: '',
    logo: '',
    bgColor: '',
    color: '',
    active: true,
    deals: []
  });

  const [activeTab, setActiveTab] = useState<'stores' | 'footer'>('stores');

  const handleLogout = () => {
    logout();
    navigate({ to: '/' });
  };

  const handleAddStore = async () => {
    if (newStore.id && newStore.name) {
      addStore(newStore.id, {
        name: newStore.name,
        logo: newStore.logo,
        bgColor: newStore.bgColor,
        color: newStore.color,
        active: true,
        deals: []
      });
      setNewStore({
        id: '',
        name: '',
        logo: '',
        bgColor: '',
        color: '',
        active: true,
        deals: []
      });
      await handleSave();
    }
  };

  const handleSave = async () => {
    await saveChanges();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400">Welcome, {currentAdmin?.username}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Save size={18} />
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            type="button"
            className={`px-4 py-2 rounded-md ${
              activeTab === 'stores'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('stores')}
          >
            Stores
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md ${
              activeTab === 'footer'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('footer')}
          >
            Footer Links
          </button>
        </div>

        {/* Stores Management */}
        {activeTab === 'stores' && (
          <div className="space-y-8">
            {/* Add New Store */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Add New Store</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Store ID (e.g., amazon)"
                  value={newStore.id}
                  onChange={(e) => setNewStore({ ...newStore, id: e.target.value })}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Store Name"
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Logo URL"
                  value={newStore.logo}
                  onChange={(e) => setNewStore({ ...newStore, logo: e.target.value })}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Background Color (Tailwind class)"
                  value={newStore.bgColor}
                  onChange={(e) => setNewStore({ ...newStore, bgColor: e.target.value })}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Color (Tailwind class)"
                  value={newStore.color}
                  onChange={(e) => setNewStore({ ...newStore, color: e.target.value })}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md"
                />
                <button
                  type="button"
                  onClick={handleAddStore}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  <Plus size={18} />
                  Add Store
                </button>
              </div>
            </div>

            {/* Existing Stores */}
            <div className="space-y-4">
              {Object.entries(stores).map(([storeId, store]) => (
                <div key={storeId} className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <input
                      type="text"
                      value={store.name}
                      onChange={(e) =>
                        updateStore(storeId, { ...store, name: e.target.value })
                      }
                      placeholder="Store Name"
                      className="bg-gray-700 text-white px-4 py-2 rounded-md text-lg font-semibold flex-grow mr-4"
                    />
                    <button
                      type="button"
                      onClick={() => deleteStore(storeId)}
                      className="text-red-500 hover:text-red-400 flex-shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={store.logo}
                      onChange={(e) =>
                        updateStore(storeId, { ...store, logo: e.target.value })
                      }
                      placeholder="Logo URL"
                      className="bg-gray-700 text-white px-4 py-2 rounded-md"
                    />
                    <input
                      type="text"
                      value={store.bgColor}
                      onChange={(e) =>
                        updateStore(storeId, { ...store, bgColor: e.target.value })
                      }
                      placeholder="Background Color"
                      className="bg-gray-700 text-white px-4 py-2 rounded-md"
                    />
                    <input
                      type="text"
                      value={store.color}
                      onChange={(e) =>
                        updateStore(storeId, { ...store, color: e.target.value })
                      }
                      placeholder="Color"
                      className="bg-gray-700 text-white px-4 py-2 rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Links Management */}
        {activeTab === 'footer' && (
          <div className="space-y-8">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section} className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4 capitalize">
                  {section} Links
                </h3>
                <div className="space-y-4">
                  {links.map((link, index) => (
                    <div key={link.id} className="flex items-center gap-4">
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => {
                          const newLinks = [...links];
                          newLinks[index] = { ...link, title: e.target.value };
                          updateFooterLinks(section, newLinks);
                        }}
                        placeholder="Link Title"
                        className="bg-gray-700 text-white px-4 py-2 rounded-md flex-1"
                      />
                      <input
                        type="text"
                        value={link.link}
                        onChange={(e) => {
                          const newLinks = [...links];
                          newLinks[index] = { ...link, link: e.target.value };
                          updateFooterLinks(section, newLinks);
                        }}
                        placeholder="URL"
                        className="bg-gray-700 text-white px-4 py-2 rounded-md flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newLinks = links.filter((_, i) => i !== index);
                          updateFooterLinks(section, newLinks);
                        }}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newLinks = [
                        ...links,
                        {
                          id: `${section}-${Date.now()}`,
                          title: '',
                          link: '',
                          active: true
                        }
                      ];
                      updateFooterLinks(section, newLinks);
                    }}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-400"
                  >
                    <Plus size={18} />
                    Add Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 