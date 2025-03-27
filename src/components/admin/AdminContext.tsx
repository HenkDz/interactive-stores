import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Store, FooterLink, Admin } from './types';
// Import for fallback only
import db from '../../data/db.json';

interface AdminContextType {
  isAuthenticated: boolean;
  currentAdmin: Admin | null;
  stores: Record<string, Store>;
  footerLinks: Record<string, FooterLink[]>;
  admins: Admin[];
  loading: boolean;
  login: (usernameOrAdmin: string | Admin, password?: string) => Promise<boolean>;
  logout: () => void;
  updateStore: (storeId: string, store: Store) => void;
  addStore: (storeId: string, store: Store) => void;
  deleteStore: (storeId: string) => void;
  updateFooterLinks: (section: string, links: FooterLink[]) => void;
  saveChanges: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [stores, setStores] = useState<Record<string, Store>>({});
  const [footerLinks, setFooterLinks] = useState<Record<string, FooterLink[]>>({});
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from KV store
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        
        // If we have data from the KV store, use it
        if (data.stores && Object.keys(data.stores).length > 0) {
          setStores(data.stores);
        } else {
          // Fallback to local JSON
          setStores(db.stores as Record<string, Store>);
        }
        
        if (data.footerLinks && Object.keys(data.footerLinks).length > 0) {
          setFooterLinks(data.footerLinks);
        } else {
          setFooterLinks(db.footerLinks as Record<string, FooterLink[]>);
        }
        
        if (data.admins && data.admins.length > 0) {
          setAdmins(data.admins);
        } else {
          setAdmins(db.admins as Admin[]);
        }
      } catch (error) {
        console.error('Error fetching data from KV:', error);
        // Fallback to local JSON
        setStores(db.stores as Record<string, Store>);
        setFooterLinks(db.footerLinks as Record<string, FooterLink[]>);
        setAdmins(db.admins as Admin[]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const login = async (usernameOrAdmin: string | Admin, password?: string) => {
    // If an admin object was passed directly
    if (typeof usernameOrAdmin !== 'string') {
      setIsAuthenticated(true);
      setCurrentAdmin({
        id: usernameOrAdmin.id,
        username: usernameOrAdmin.username,
        role: usernameOrAdmin.role,
      });
      return true;
    }
    
    // Otherwise, try to find the admin by username and password
    const username = usernameOrAdmin;
    const admin = admins.find(
      (a) => a.username === username && a.password === password
    );

    if (admin) {
      setIsAuthenticated(true);
      setCurrentAdmin({
        id: admin.id,
        username: admin.username,
        role: admin.role,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentAdmin(null);
  };

  const updateStore = (storeId: string, store: Store) => {
    setStores((prev) => ({
      ...prev,
      [storeId]: store,
    }));
  };

  const addStore = (storeId: string, store: Store) => {
    setStores((prev) => ({
      ...prev,
      [storeId]: store,
    }));
  };

  const deleteStore = (storeId: string) => {
    setStores((prev) => {
      const newStores = { ...prev };
      delete newStores[storeId];
      return newStores;
    });
  };

  const updateFooterLinks = (section: string, links: FooterLink[]) => {
    setFooterLinks((prev) => ({
      ...prev,
      [section]: links,
    }));
  };

  const saveChanges = async () => {
    try {
      const response = await fetch('/api/admin/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stores,
          footerLinks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving changes:', error);
      throw error;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        currentAdmin,
        stores,
        footerLinks,
        admins,
        loading,
        login,
        logout,
        updateStore,
        addStore,
        deleteStore,
        updateFooterLinks,
        saveChanges,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}; 