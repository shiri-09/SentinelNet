import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'sentinelnet_emergency_contacts';
const MAX_CONTACTS = 5;

/**
 * Custom hook for managing emergency contacts
 * 
 * Features:
 * - Persists contacts to localStorage
 * - Limits to 5 contacts maximum
 * - Provides CRUD operations for contacts
 */
export const useContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load contacts from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setContacts(parsed.slice(0, MAX_CONTACTS));
                }
            }
        } catch (e) {
            console.error('[useContacts] Failed to load contacts:', e);
        }
        setIsLoaded(true);
    }, []);

    // Save contacts to localStorage when they change
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
            } catch (e) {
                console.error('[useContacts] Failed to save contacts:', e);
            }
        }
    }, [contacts, isLoaded]);

    /**
     * Add a new emergency contact
     * @param {string} name - Contact name
     * @param {string} phone - Contact phone number
     * @returns {boolean} - Success status
     */
    const addContact = useCallback((name, phone) => {
        if (contacts.length >= MAX_CONTACTS) {
            console.warn('[useContacts] Maximum contacts reached');
            return false;
        }

        if (!name?.trim() || !phone?.trim()) {
            console.warn('[useContacts] Invalid contact data');
            return false;
        }

        const newContact = {
            id: Date.now().toString(),
            name: name.trim(),
            phone: phone.trim(),
            createdAt: new Date().toISOString()
        };

        setContacts(prev => [...prev, newContact]);
        console.log('[useContacts] Added contact:', newContact.name);
        return true;
    }, [contacts.length]);

    /**
     * Remove an emergency contact
     * @param {string} id - Contact ID to remove
     */
    const removeContact = useCallback((id) => {
        setContacts(prev => {
            const filtered = prev.filter(c => c.id !== id);
            console.log('[useContacts] Removed contact, remaining:', filtered.length);
            return filtered;
        });
    }, []);

    /**
     * Update an existing contact
     * @param {string} id - Contact ID to update
     * @param {Object} data - New data { name?, phone? }
     */
    const updateContact = useCallback((id, data) => {
        setContacts(prev => prev.map(contact => {
            if (contact.id === id) {
                return {
                    ...contact,
                    name: data.name?.trim() || contact.name,
                    phone: data.phone?.trim() || contact.phone
                };
            }
            return contact;
        }));
    }, []);

    /**
     * Check if we can add more contacts
     */
    const canAddMore = contacts.length < MAX_CONTACTS;

    return {
        contacts,
        addContact,
        removeContact,
        updateContact,
        canAddMore,
        maxContacts: MAX_CONTACTS,
        contactCount: contacts.length
    };
};

export default useContacts;
