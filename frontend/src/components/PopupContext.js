import React, { createContext, useContext, useState, useCallback } from 'react';
import { Info, X, HelpCircle } from 'lucide-react';

const PopupContext = createContext();

export const usePopup = () => useContext(PopupContext);

export const PopupProvider = ({ children }) => {
    const [popup, setPopup] = useState({ isOpen: false, message: '', isConfirm: false, onResolve: null });

    const showPopup = useCallback((message) => {
        setPopup({ isOpen: true, message, isConfirm: false, onResolve: null });
    }, []);

    const showConfirm = useCallback((message) => {
        return new Promise((resolve) => {
            setPopup({ isOpen: true, message, isConfirm: true, onResolve: resolve });
        });
    }, []);

    const closePopup = useCallback(() => {
        setPopup(prev => {
            if (prev.isConfirm && prev.onResolve) prev.onResolve(false);
            return { isOpen: false, message: '', isConfirm: false, onResolve: null };
        });
    }, []);

    const handleConfirmYes = useCallback(() => {
        if (popup.onResolve) popup.onResolve(true);
        setPopup({ isOpen: false, message: '', isConfirm: false, onResolve: null });
    }, [popup]);

    return (
        <PopupContext.Provider value={{ showPopup, showConfirm }}>
            {children}
            {popup.isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        width: '400px',
                        maxWidth: '90%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative'
                    }}>
                        <button 
                            onClick={closePopup}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <X size={20} color="#666" />
                        </button>
                        
                        {popup.isConfirm ? (
                            <HelpCircle size={40} color="#1800ad" style={{ marginBottom: '16px' }} />
                        ) : (
                            <Info size={40} color="#1800ad" style={{ marginBottom: '16px' }} />
                        )}
                        
                        <p style={{ margin: 0, textAlign: 'center', fontSize: '16px', color: '#333', marginBottom: '20px', wordWrap: 'break-word', width: '100%' }}>
                            {popup.message}
                        </p>
                        
                        {popup.isConfirm ? (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={closePopup}
                                    style={{
                                        padding: '8px 24px',
                                        backgroundColor: 'transparent',
                                        color: '#1800ad',
                                        border: '1px solid #1800ad',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleConfirmYes}
                                    style={{
                                        padding: '8px 24px',
                                        backgroundColor: '#1800ad',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Ya
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={closePopup}
                                style={{
                                    padding: '8px 24px',
                                    backgroundColor: '#1800ad',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Tutup
                            </button>
                        )}
                    </div>
                </div>
            )}
        </PopupContext.Provider>
    );
};
